from rest_framework.views import APIView
from rest_framework.response import Response
from .models import (CustomUser,Product,Review,Address,Order,OrderItem,Cart,
                     ProductVariant,CartItem,Payment,OTP,Razorpay,Wishlist,
                     WishlistProduct,Coupon,Wallet,Category,WalletTransaction)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import status
from .serializer import (LoginSerializer,CustomUserSerializer,ReviewAndRatingSerializer,
                         AddressSerializer,OrderSerializer,CartSerializer,PaymentsSerializer,
                         TransactionSerializer,OrderItemSerializer,WishlistSerilaizer)
from AdminPanel.serializer import ProductVariantSerializer
from rest_framework.exceptions import ErrorDetail,ValidationError
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.db import transaction
import random
import string
from django.db.models import F,ExpressionWrapper, FloatField, Value,Sum,Min, Exists, OuterRef,Q,Value, BooleanField
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework.decorators import api_view,permission_classes
from jwt import decode, ExpiredSignatureError, InvalidTokenError,DecodeError
from jwt import encode as jwt_encode
from datetime import datetime, timedelta
from rest_framework.permissions import IsAuthenticated,AllowAny
import random
import string
from django.core.mail import send_mail
from django.core.exceptions import ObjectDoesNotExist
import razorpay
from rest_framework.pagination import PageNumberPagination
import logging
from django.core.files.base import ContentFile
from google.auth.transport import requests as google_requests 
from decimal import Decimal, ROUND_HALF_UP
import math
from .permissions import IsActiveUser
from django.core.paginator import Paginator
logger = logging.getLogger(__name__)


class ProductPagination(PageNumberPagination):
    page_size = 12 
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    
@api_view(['GET'])
@permission_classes([AllowAny])
def getUserDetailsAgainWhenRefreshing(request):
    # We only need refresh_token from cookies since access_token is in response body
    refresh_token = request.COOKIES.get('refresh_token')
    
    if not refresh_token:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        # Decode refresh token
        refresh_payload = decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = refresh_payload['user_id']
        
        # Generate new access token
        new_access_token = jwt_encode({
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(minutes=15),
        }, settings.SECRET_KEY, algorithm='HS256')
        
        # Get user details
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Create response with access token and user details in body
        response = Response({
            'user': {
                'access_token': new_access_token,
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_admin': user.is_superuser,
                'is_verified': user.is_staff,
                'profile_picture': user.profile_picture.url if user.profile_picture else None
            }
        }, status=status.HTTP_200_OK)
        
        # Keep refresh token in cookie
        response.set_cookie(
            key='refresh_token',
            value=refresh_token, 
            httponly=True,
            secure=True,
            samesite=None,
            max_age=60 * 60 * 24 
        )
        
        return response
            
    except (ExpiredSignatureError, InvalidTokenError, DecodeError):
        return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)


class UserHome(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser]
    pagination_class = ProductPagination

    def get(self, request):
        user = request.user
        
        products = (
            Product.objects.select_related('category')
            .annotate(
                starting_price=Min('variants__variant_price'),
                total_stock=Sum('variants__stock'),
                in_wishlist=Exists(
                    WishlistProduct.objects.filter(
                        wishlist__user_id=user.id,
                        product_variant__product_id=OuterRef('id')
                    )
                )
            )
            .filter(
                is_active=True,
                category__is_active=True
            )
            .order_by('id')
        )
        paginator = self.pagination_class()
        paginated_products = paginator.paginate_queryset(products.values(), request)
        return paginator.get_paginated_response(paginated_products)



    
    
class RelatedProductData(APIView):
    permission_classes=[AllowAny]
    pagination_class = ProductPagination
    def get(self, request,id):
        user=request.user
        products = Product.objects.filter(is_active=True, category__is_active=True,category_id=Product.objects.filter(id=id)
                                          .values("category_id")[:1]).select_related("category").annotate(
        starting_price=Min('variants__variant_price'),
        total_stock=Sum('variants__stock'),
        in_wishlist=Exists(
            Wishlist.objects.filter(
                user_id=user.id,
                wishlist_products__id=OuterRef('id') 
            )
        )
    ).exclude(id=id)[:8]
                                          
        paginator = self.pagination_class()
        paginated_products = paginator.paginate_queryset(products.values(), request)
        return paginator.get_paginated_response(paginated_products)




    
class IndexPage(APIView):
    permission_classes = [AllowAny]
    pagination_class = ProductPagination

    def get(self, request):
        products = (
            Product.objects.select_related('category')
            .annotate(
                starting_price=Min('variants__variant_price'),
                total_stock=Sum('variants__stock'),
            )
            .filter(
                is_active=True,
                category__is_active=True
            )
            .order_by('id')
        )
        
        paginator = self.pagination_class()
        paginated_products = paginator.paginate_queryset(products.values(), request)
        return paginator.get_paginated_response(paginated_products)



    
class GetCategories(APIView):
    def get(self, request):
        categories = Category.objects.order_by('id')[:5]
        return Response(categories.values(), status.HTTP_200_OK)


class UserLogin(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            try:
                user = CustomUser.objects.get(email=email)
                if user.check_password(password):
                    if not user.is_active:
                        return Response(
                            {'error': {'commonError': [ErrorDetail(string='Your account has been blocked.')]}},
                            status=status.HTTP_403_FORBIDDEN
                        )
                    # Generate tokens
                    refresh = RefreshToken.for_user(user)
                    access_token = str(refresh.access_token)
                    refresh_token = str(refresh)

                    response = Response({
                          # Send access token in response body
                        'user': {
                            'access_token': access_token,
                            'id': user.id,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'email': user.email,
                            'is_admin': user.is_superuser,
                            'is_verified': user.is_staff,#uses this field to know whther the user is verified or not
                            'profile_picture': user.profile_picture.url if user.profile_picture else None
                        }
                    }, status=status.HTTP_200_OK)
                    # Set only the refresh token in HTTP-only cookie
                    response.set_cookie(
                        key='refresh_token',
                        value=refresh_token,
                        httponly=False, 
                        secure=True,  
                        samesite=None,  
                        max_age=60 * 60 * 24  
                    )
                    return response
                else:
                    return Response(
                        {'error': {'commonError': [ErrorDetail(string='Invalid credentials.')]}},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
            except CustomUser.DoesNotExist:
                return Response(
                    {'error': {'commonError': [ErrorDetail(string='Invalid credentials.')]}},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
   
class UserDetails(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request, id):
        try:
            if request.user.id != id:
                return Response(
                    {"error": "You are not authorized to view this user."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            user = CustomUser.objects.get(id=id)
            serializer = CustomUserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': 'An Unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def put(self,request,id):
        try:
            if request.user.id != id:
                return Response(
                    {"error": "You are not authorized to edit this user."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            user=CustomUser.objects.get(id=id)
            serializer=CustomUserSerializer(user,data=request.data,partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data,status=status.HTTP_200_OK)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
class UserSignup(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)  

        if serializer.is_valid():
            
            if CustomUser.objects.filter(email=serializer.validated_data['email']).exists():
                return Response({'error': 'Email is already in use.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                serializer.save()  # Save the validated data to the database
                
                 # Generate OTP only if user exists
                otp = ''.join(random.choices(string.digits, k=6))
                
                # Save OTP to database
                OTP.objects.filter(email=serializer.validated_data['email']).delete()  # Delete existing OTPs
                otp_obj = OTP.objects.create(email=serializer.validated_data['email'], otp=otp)
                
                # Send email
                try:
                    send_mail(
                        'Your OTP for Verification',
                        f'Your OTP is: {otp}. Valid for 10 minutes.',
                        'care@spicelush.com',  # FROM
                        [serializer.validated_data['email']],  # TO
                        fail_silently=False,
                    )
                    return Response({'message': 'OTP sent successfully','email':serializer.validated_data['email']}, 
                                status=status.HTTP_200_OK)
                except Exception as e:
                    otp_obj.delete()
                    return Response({'error': str(e)}, 
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # return Response({'message': 'User registered successfully.'}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': f'Failed to create user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class ResendOTP(APIView):
    permission_classes = [AllowAny]
    def post (self,request):
        try:
            email = request.data.get('email')
            otp = ''.join(random.choices(string.digits, k=6))
                    
            # Save OTP to database
            OTP.objects.filter(email=email).delete()  
            otp_obj = OTP.objects.create(email=email, otp=otp)
            
            # Send email
            try:
                send_mail(
                    'Your OTP for Verification',
                    f'Your OTP is: {otp}. Valid for 10 minutes.',
                    'care@spicelush.com',  # FROM
                    [email],  # TO
                    fail_silently=False,
                )
                return Response({'message': 'OTP sent successfully','email':email}, 
                            status=status.HTTP_200_OK)
            except Exception as e:
                otp_obj.delete()
                return Response({'error': str(e)}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            return Response({'error': f'Failed to create user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ForgetPassword(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        logger.info(email)
        if not email:
            return Response({'error': 'Email is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(email=email)
            
            # Generate OTP only if user exists
            otp = ''.join(random.choices(string.digits, k=6))
            logger.info(otp)
            # Save OTP to database
            OTP.objects.filter(email=email).delete()  # Delete existing OTPs
            otp_obj = OTP.objects.create(email=email, otp=otp)
            
            # Send email
            try:
                send_mail(
                    'Your OTP for Verification',
                    f'Your OTP is: {otp}. Valid for 10 minutes.',
                    'care@spicelush.com',  # FROM
                    [email],  # TO
                    fail_silently=False,
                )
                return Response({'message': 'OTP sent successfully'}, 
                              status=status.HTTP_200_OK)
            except Exception as e:
                otp_obj.delete()
                return Response({'error': str(e)}, 
                              status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except CustomUser.DoesNotExist:
            # Don't reveal that the email doesn't exist (for security)
            return Response({'message': 'If this email exists, an OTP will be sent.'}, 
                          status=status.HTTP_200_OK)

class ConfirmOtp(APIView):
    permission_classes = [AllowAny]
    
    def post(self,request):
        otp = request.data.get('otp')
        email = request.data.get('email')
        logger.info(otp,email)
        
        try:
            otp_obj = OTP.objects.get(email=email, otp=otp)
        except OTP.DoesNotExist:
            return Response({'error': 'Invalid OTP or email'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(email=email)
            user.is_staff=True # i uses this field to verify if the user is verified or not
            user.save()
            otp_obj.delete()  # Delete OTP after successful password reset
            return Response({'message': 'user confirmed successfully'}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class ResetPassword(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        otp = request.data.get('otp')
        password = request.data.get('password')
        email = request.data.get('email')
        

        errors = {}
        
        if not email:
            errors['email'] = 'Email is required'
        if not password:
            errors['password'] = 'Password is required'
        if not otp:
            errors['otp'] = 'OTP is required'
            
        if not len(password)>=8:
            errors['password']="Password length must be atlest 8."
            
        if errors:
            return Response({
                'status': 'error',
                'message': 'Validation failed',
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp_obj = OTP.objects.get(email=email, otp=otp)
        except OTP.DoesNotExist:
            return Response({'error': 'Invalid OTP or email'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
            user.set_password(password)
            user.save()
            otp_obj.delete()  # Delete OTP after successful password reset
            return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GoogleAuth(APIView):
    permission_classes = [AllowAny]
    def generate_random_password(self, length=12):
        """Generate a secure random password for Google-authenticated users"""
        characters = string.ascii_letters + string.digits + string.punctuation
        return ''.join(random.choice(characters) for _ in range(length))

    def post(self, request):
        try:
            # Get the credential token from the request
            credential = request.data.get('credential')
            
            if not credential:
                return Response(
                    {'error': {'commonError': 'No credential provided'}},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Use google_requests for token verification
            id_info = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            email = id_info.get('email')
            first_name = id_info.get('given_name', '').capitalize()
            last_name = id_info.get('family_name', '').capitalize()
            profile_pic = id_info.get('picture', '')

            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                with transaction.atomic():
                    user = CustomUser.objects.create(
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        is_staff=True,
                        is_active=True
                    )
                    random_password = self.generate_random_password()
                    user.set_password(random_password)
                    
                    # Use regular requests for profile picture
                    if profile_pic:
                        try:
                            # Use regular requests library here
                            response = requests.get(profile_pic)
                            if response.status_code == 200:
                                image_name = f"{email.split('@')[0]}_profile.jpg"
                                user.profile_picture.save(
                                    image_name, 
                                    ContentFile(response.content), 
                                    save=True
                                )
                        except Exception as e:
                            logger.info(f"Profile picture error: {str(e)}")
                            # Continue without profile picture
                    
                    user.save()

            # Check if user is active
            if not user.is_active:
                return Response(
                    {'error': {'commonError': 'Your account has been blocked.'}},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Generate JWT token
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            # Create response with user data
            response = Response({
                        
                        'user': {
                            'access_token': access_token,  # Send access token in response body
                            'id': user.id,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'is_admin': user.is_superuser,
                            'is_verified': user.is_staff,#uses this field to know whther the user is verified or not
                            'profile_picture': user.profile_picture.url if user.profile_picture else None
                        }
                    }, status=status.HTTP_200_OK)
                    # Set only the refresh token in HTTP-only cookie
            response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True, 
                    secure=True,  
                    samesite=None,  
                    max_age=60 * 60 * 24 * 7  
                )

            return response

        except ValueError as e:
            # Token validation failed
            return Response(
                {'error': {'commonError': 'Invalid Google token'}},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            import traceback 
            logger.info(f"Detailed error: {str(e)}",)
            logger.info(f"Full traceback: {traceback.format_exc()}",)
            # Handle other exceptions
            return Response(
                {'error': {'commonError': str(e)}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReviewAndRating(APIView):
    permission_classes = [AllowAny]
    pagination_class = ProductPagination
    def get(self, request, id):
        # Fetch the product
        reviews = Review.objects.filter(product_id=id).select_related('user')
        if reviews.exists():
            paginator = self.pagination_class()
            paginated_reviews = paginator.paginate_queryset(reviews, request)
            serializer = ReviewAndRatingSerializer(paginated_reviews, many=True)

            return paginator.get_paginated_response(serializer.data)

        return Response({'error': 'reviews not found'}, status=status.HTTP_404_NOT_FOUND)
    
    
class AddReviewAndRating(APIView):
    permission_classes=[IsAuthenticated, IsActiveUser]
    def post(self, request):
        logger.info(request.data)
        serializer = ReviewAndRatingSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.info(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
class UserAddress(APIView):
    pagination_class = ProductPagination
    permission_classes=[IsAuthenticated, IsActiveUser]
    def get(self,request,id):
        if request.user.id != id:
                return Response(
                    {"error": "You are not authorized."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        try:
            address=Address.objects.filter(user_id=id,is_active= True)
            paginator = self.pagination_class()
            paginated_address= paginator.paginate_queryset(address, request)
            serializer = AddressSerializer(paginated_address, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        except CustomUser.DoesNotExist:
            
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def put(self,request,id):
        
        try:
            address=Address.objects.get(id=id)
            if request.user.id != address.user_id:
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            serializer=AddressSerializer(address,data=request.data,partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data,status=status.HTTP_200_OK)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        except Address.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(user=request.user)
                return Response(
                    {'message': 'Address registered successfully.'},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {'error': f'Failed to create address: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, id):
        try:
            try:
                address = Address.objects.get(id=id, is_active=True)
            except Address.DoesNotExist:
                raise Http404("Address not found")
            if request.user.id != address.user_id:
                return Response(
                    {"error": "You are not authorized."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            address.is_active = False
            address.save()
            return Response(    
                {'status': 'Deleted Successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ChangePaymentstatus(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser]
    def patch(self, request):
        try:
            payment_id =request.data.get('payment_id')
            orderitem = Payment.objects.get(id=payment_id)
            if not (request.user.id==orderitem.user.id):
                return Response(
                    {"error": "You are not authorized "},
                    status=status.HTTP_403_FORBIDDEN,
                )
            orderitem.status='paid'
            orderitem.save()
            data = {
                'status': 'Paid Successfully',
            }
            return Response(data, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            raise Http404("Payment not found")
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserOrder(APIView):
    pagination_class = ProductPagination
    permission_classes = [IsAuthenticated, IsActiveUser]
    def patch(self, request, id):
        try:
            orderItem = OrderItem.objects.get(id=id)
            if int(request.user.id) != int(orderItem.order.user.id):
                return Response(
                    {"error": "You are not authorized."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            
            with transaction.atomic():
                
                if request.data.get('action') == 'Cancelled' and (orderItem.status =='pending' or orderItem.status =='Dispatched'):
                    payment_status = orderItem.order.payment.status  
                    if payment_status == 'success':
                        amount = orderItem.shipping_price_per_order + (orderItem.total_amount-(orderItem.total_amount/100*orderItem.order.discout_percentage))
                        wallet = Wallet.objects.get(user=orderItem.order.user)
                        wallet.balance = F('balance') + amount
                        wallet.save()
                        # Create transaction record
                        WalletTransaction.objects.create(
                            wallet=wallet,
                            amount=amount,
                            order=None  # Set order if applicable
                        )
                    orderItem.product_variant.stock = F('stock') + orderItem.quantity
                    orderItem.product_variant.save()
                orderItem.status = request.data.get('action')
                orderItem.save()
                return Response({'id': orderItem.id}, status=status.HTTP_200_OK)

        except OrderItem.DoesNotExist:
            return Response({'error': 'Order item not found'}, status=status.HTTP_404_NOT_FOUND)

        except Wallet.DoesNotExist:
            return Response({'error': 'Wallet not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.info(e)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    def get(self, request, id):
        try:
            if request.user.id !=id:
                return Response(
                    {"error": "You are not authorized."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            # Change prefetch_related to match your model relationship
            orders = Order.objects.filter(user_id=id).prefetch_related(
                'order_items__product_variant', 
                'order_items__product_variant__product',  
                'payment',
                'address'
            ).order_by('-created_at')  
        
            paginator = self.pagination_class()
            paginated_orders = paginator.paginate_queryset(orders, request)
            serializer = OrderSerializer(paginated_orders, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        except Order.DoesNotExist:
            return Response({'error': 'Orders not found'}, status=status.HTTP_404_NOT_FOUND)
    
class UserCart(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser]
    pagination_class = ProductPagination
    def get(self, request, id):
        try:
            print(request.user.id,id)
            if int(request.user.id) != int(id):
                return Response(
                    {"error": "You are not authorized."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            
            cart_items = Cart.objects.filter(user_id=id).prefetch_related(
                'cart_items__product_variant',
                'cart_items__product_variant__product'  
            )
            
            paginator = self.pagination_class()
            paginated_cart_items = paginator.paginate_queryset(cart_items, request)
            serializer = CartSerializer(paginated_cart_items, many=True)
            return paginator.get_paginated_response(serializer.data)

        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def post(self, request):
        try:
            user = request.data.get('user_id')
            
            if int(request.user.id) != int(user):
                    return Response(
                        {"error": "You are not authorized."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            product_variant_id = request.data.get('id')
            quantity = int(request.data.get('quantitiy'))  

            # Validate product variant
            product_variant = get_object_or_404(ProductVariant, id=product_variant_id)

            # Validate quantity
            if int(quantity) < 1 or int(quantity) > int(product_variant.stock):
                return Response({'error': 'Invalid quantity. Check stock availability.'}, status=status.HTTP_400_BAD_REQUEST)

            # Get or create a cart for the user
            cart, created = Cart.objects.get_or_create(user_id=user)

            # Check if the item already exists in the cart
            cart_item, created = CartItem.objects.get_or_create(cart=cart, product_variant=product_variant)
            if not created:
                # Update the quantity if the item already exists
                new_quantity = cart_item.quantity + quantity
                if int(new_quantity) > int(product_variant.stock):
                    return Response({'error': 'Quantity exceeds available stock.'}, status=status.HTTP_400_BAD_REQUEST)
                cart_item.quantity = new_quantity
            else:
                cart_item.quantity = quantity

            cart_item.save()

            return Response({'message': 'Item added to cart successfully.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Handle unexpected errors
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, id):
        try:
            cartitem = CartItem.objects.get(id=id)
            if int(request.user.id) != int(cartitem.cart.user.id):
                    return Response(
                        {"error": "You are not authorized."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            cartitem.delete()
            data = {
                'status': 'Deleted Successfully',
            }
            return Response(data, status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            # Handle the case where the object does not exist
            raise Http404("CartItem not found")
        except Exception as e:
            # Handle unexpected errors
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        

    def patch(self, request, id):
        try:
            # Get the cart item
            cart_item = CartItem.objects.get(id=id)
            if int(request.user.id) != int(cart_item.cart.user.id):
                    return Response(
                        {"error": "You are not authorized."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            product_variant = cart_item.product_variant  

            # Get the action from the request
            action = request.data.get('action')

            if action == 'increase':
                if cart_item.quantity < product_variant.stock:  # Check if stock is available
                    cart_item.quantity += 1
                else:
                    return Response({"error": "Not enough stock available"}, status=400)

            elif action == 'decrease' and cart_item.quantity > 1:
                cart_item.quantity -= 1

            else:
                return Response({"error": "Invalid action or quantity cannot be less than 1"}, status=400)

            # Save the updated cart item
            cart_item.save()

            return Response({"message": "Quantity updated successfully", "quantity": cart_item.quantity}, status=200)

        except ObjectDoesNotExist:
            return Response({"error": "Cart item not found"}, status=404)

        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=500)

            

class UserPlaceOrder(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser]
    def validate_input(self, data):
        required_fields = ['user_id', 'addressId', 'paymentMethod', 'totalAmount']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
        return True

    def process_wallet_payment(self, total, user_id):
        total=Decimal(str(total)) 
        try:
            wallet = Wallet.objects.get(user_id=user_id)  
            if total > int(wallet.balance):
                raise ValueError("Insufficient balance")
            wallet.balance -= total
            wallet.save()  
            # Create transaction record
            WalletTransaction.objects.create(
                wallet=wallet,
                amount=-(total),
                order=None  # Set order if applicable
            )
        except Wallet.DoesNotExist:
            raise ValueError("Wallet not found") 


    def _process_card_payment(self, payment_data):
        try:
            razor = Razorpay.objects.get(
                razorpay_order_id=payment_data.get('razorpay_order_id')
            )
            razor.razorpay_payment_id = payment_data.get('razorpay_payment_id')
            razor.razorpay_signature = payment_data.get('razorpay_signature')
            razor.save()
            return "paid"
        except Razorpay.DoesNotExist:
            raise ValueError("Invalid Razorpay order ID")

    def create_payment(self, user_id, payment_status, payment_method, coupon_id=None):
        if coupon_id:
            try:
                discoutPercentage = Coupon.objects.get(id=coupon_id)
            except Coupon.DoesNotExist:
                raise ValidationError("The coupon is not found")  
            if Payment.objects.filter(user=user_id, coupon=discoutPercentage).exists():
                raise ValidationError("The coupon is already used")  
        payment_data = {
            'user': user_id,
            'status': payment_status,
            'pay_method': payment_method
        }
        if coupon_id and coupon_id != 0:
            payment_data['coupon'] = coupon_id
            
        payment_serializer = PaymentsSerializer(data=payment_data, partial=True)
        payment_serializer.is_valid(raise_exception=True)
        return payment_serializer.save()

    def create_transaction(self, payment_id, payment_status, total_amount):
        transaction_data = {
            'payment': payment_id,
            'status': payment_status,
            'amount': total_amount
        }
        transaction_serializer = TransactionSerializer(data=transaction_data)
        transaction_serializer.is_valid(raise_exception=True)
        return transaction_serializer.save()

    def create_order(self, user_id, payment_id, address_id, total_amount, coupon_id=None):
        discoutPercentage = None
        if coupon_id:
              discoutPercentage = Coupon.objects.get(id=coupon_id)
        order_data = {
            'user': user_id,
            'payment': payment_id,
            'address': address_id,
            'shipping_charge': 100,
            'net_amount': total_amount,
            'discout_percentage': discoutPercentage.coupon_percent if discoutPercentage else 0,
            'delivery_date': (datetime.now() + timedelta(days=10)).date(),
        }
        order_serializer = OrderSerializer(data=order_data)
        order_serializer.is_valid(raise_exception=True)
        return order_serializer.save()


    def process_cart_order(self, user_id, order_id, shipping_charge):
        cart_items = CartItem.objects.filter(
            cart__user_id=user_id
        ).select_related('product_variant')
        
        total_quantity = cart_items.aggregate(total=Sum('quantity'))['total'] or 0
        if not cart_items.exists():
            raise ValueError("Cart is empty")

        order_items = []
        for item in cart_items:
            variant = item.product_variant
            if variant.stock < item.quantity:
                raise ValueError(f"Insufficient stock for product variant {variant.id}")

            price = self.calculate_price_with_offer(variant) * item.quantity
            
            product_image = Product.objects.values_list('product_img1', flat=True).get(
                variants__id=variant.id
            )

            shipping_price_per_order = (
                Decimal(str(shipping_charge))
                * (Decimal(item.quantity) / Decimal(total_quantity))
            ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

            ProductVariant.objects.filter(id=variant.id).update(
                stock=F('stock') - item.quantity
            )

            order_items.append({
                'order': order_id,
                'product_variant': variant.id,
                'quantity': item.quantity,
                'image_url': product_image,
                'total_amount': Decimal(str(price)).quantize(Decimal('0.01')),
                'shipping_price_per_order': shipping_price_per_order,
            })

        order_item_serializer = OrderItemSerializer(data=order_items, many=True)
        order_item_serializer.is_valid(raise_exception=True)
        order_item_serializer.save()

        cart_items.delete()


    def process_direct_order(self, order_id, product_id, quantity,shipping_charge):
        variant = ProductVariant.objects.get(id=product_id)
        if variant.stock < quantity:
            raise ValueError(f"Insufficient stock for product variant {variant.id}")

        price = self.calculate_price_with_offer(variant)
        
        ProductVariant.objects.filter(id=variant.id).update(
            stock=F('stock') - quantity
        )
        product_image=Product.objects.values_list('product_img1',flat=True).get(variants__id=variant.id)
        total_amount = math.ceil(quantity * price)
        order_item = {
            'order': order_id,
            'product_variant': variant.id,
            'quantity': quantity,
            'image_url': product_image,
            'total_amount': total_amount,
            'shipping_price_per_order': shipping_charge,
        }

        order_item_serializer = OrderItemSerializer(data=order_item)
        order_item_serializer.is_valid(raise_exception=True)
        order_item_serializer.save()

    @staticmethod
    def calculate_price_with_offer(variant):
        price = None
        offer = variant.product.offers.filter(is_active=True).first()
        if offer:
            price= variant.variant_price * (1 - offer.discount_percentage / 100)
        else:
            price =variant.variant_price
        return price

    def post(self, request):
        try:
            if int(request.user.id) != int(request.data.get('user_id')):
                    return Response(
                        {"error": "You are not authorized."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            self.validate_input(request.data)
            
            with transaction.atomic():
                payment_status =request.data.get('status')
                paymentMethod =request.data.get('paymentMethod')       
                
                if paymentMethod=='wallet':
                    self.process_wallet_payment(request.data.get('totalAmount'),request.data.get('user_id'))
                
                payment = self.create_payment(
                    request.data.get('user_id'),
                    payment_status,
                    request.data.get('paymentMethod'),
                    request.data.get('coupon_id')
                )

                # Create transaction
                self.create_transaction(
                    payment.id,
                    payment_status,
                    request.data.get('totalAmount')
                )

                # Create order
                order = self.create_order(
                    request.data.get('user_id'),
                    payment.id,
                    request.data.get('addressId'),
                    request.data.get('totalAmount'),
                    request.data.get('coupon_id')
                )
                # Process order items based on type
                if request.data.get('type') == 'cart':
                    self.process_cart_order(request.data.get('user_id'), order.id,order.shipping_charge)
                else:
                    self.process_direct_order(
                        order.id,
                        request.data.get('productId'),
                        request.data.get('quantity'),
                        order.shipping_charge
                    )

                return Response(
                    {"message": "Order placed successfully", "order_id": order.id},
                    status=status.HTTP_201_CREATED
                )
        except ValidationError as ve:
            return Response(
                {"error": str(ve.detail if hasattr(ve, 'detail') else ve)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValueError as e:
            logger.error(f"Validation error in order creation: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except (Razorpay.DoesNotExist, ProductVariant.DoesNotExist) as e:
            logger.error(f"Database record not found: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error in order creation: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        
class UserLogout(APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=200)
        response.delete_cookie('refresh_token')  
        return response
    
class TokenRefreshFromCookieView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        # Extract the refresh token from cookies
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response(
                {"detail": "Refresh token not provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Create a RefreshToken instance and generate a new access token
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            # Decode refresh token
            refresh_payload = decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = refresh_payload['user_id']
           
            try:
                user = CustomUser.objects.get(id=user_id)
            except CustomUser.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            # Create response with access token and user details in body
            response = Response({
                'user': {
                    'access_token': access_token,
                    'id': user_id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_admin': user.is_superuser,
                    'is_verified': user.is_staff,#uses this field to know whther the user is verified or not
                    'profile_picture': user.profile_picture.url if user.profile_picture else None
                }
            }, status=status.HTTP_200_OK)
            return response
        except TokenError as e:
            return Response(
                {"detail": f"Invalid or expired refresh token.{e}"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            
            
class CreateRazorpayOrder(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser]
    def post(self, request):
        try:
            user_id = request.data.get("user_id")
            if int(request.user.id) != int(user_id):
                    return Response(
                        {"error": "You are not authorized."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            total_amount = request.data.get("totalAmount")
            currency = request.data.get("currency", "INR")  
            if not user_id or not total_amount:
                return Response({"error": "user_id and totalAmount are required"}, status=status.HTTP_400_BAD_REQUEST)

            # Convert total amount to paisa (Razorpay requires amount in paisa)
            amount_in_paisa = int(float(total_amount) * 100)

            # Create Razorpay order
            razorpay_order = razorpay_client.order.create({
                "amount": amount_in_paisa,
                "currency": currency,
                "payment_capture": 1,  # Auto-capture payment after successful payment
            })

            # Save the Razorpay order in the Transaction model
            transaction = Razorpay.objects.create(
               
                status=razorpay_order["status"],  # Typically 'created'
                razorpay_order_id=razorpay_order["id"],
                razorpay_payment_id=None,  # This will be updated after payment
                razorpay_signature=None,  # This will be updated after payment verification
            )

            # Return the Razorpay order details to the frontend
            return Response({
                "razorpay_order_id": razorpay_order["id"],
                "currency": currency,
                "key_id": settings.RAZORPAY_KEY_ID,  # Razorpay Key ID to use on the frontend
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.info(f"Error creating Razorpay order: {str(e)}")
            return Response({"error": "Failed to create Razorpay order"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SingleOrderDetails(APIView):
    def get(self,request,id):
        try:
            order_item_details=OrderItem.objects.select_related(
                'product_variant',
                'order',
                'order__payment',
                'product_variant__product',
                'order__address'
            ).get(id=id)
            
            if request.user.id != order_item_details.order.user.id:
                    return Response(
                        {"error": "You are not authorized."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            
            serializer=OrderItemSerializer(order_item_details, context={'include_address_details': True})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except OrderItem.DoesNotExist:
            return Response({'error': 'Orders not found'}, status=status.HTTP_404_NOT_FOUND)
            
class UserWishlist(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser]
    pagination_class = ProductPagination
    def post(self, request):
        user = request.data.get('user_id')
        product_variant_id = request.data.get('id')
        print(user,request.user.id)
        if int(request.user.id) != int(user):
            return Response(
                {"error": "You are not authorized."},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Validate user ID
        if not user:
            return Response({'error': 'User ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate product variant ID
        if not product_variant_id:
            return Response({'error': 'Product Variant ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate product variant
        product_variant = get_object_or_404(ProductVariant, id=product_variant_id)

        # Get or create a wishlist for the user
        wishlist, created = Wishlist.objects.get_or_create(user_id=user)

        # Check if the item already exists in the cart
        wishlistProduct, created = WishlistProduct.objects.get_or_create(wishlist=wishlist, product_variant=product_variant)
        if not created:
            return Response({'error': 'Product is already in Wishlist.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Item added to Wishlist successfully.'}, status=status.HTTP_201_CREATED)
    
    def get(self, request, id):
        try:
            if request.user.id != id:
                return Response(
                {"error": "You are not authorized."},
                status=status.HTTP_403_FORBIDDEN,
                )
                
            wishlist = Wishlist.objects.filter(user_id=id).prefetch_related(
                'wishlist_products__product_variant',
                'wishlist_products__product_variant__product'
            )
            paginator = self.pagination_class()
            paginated_wishlist = paginator.paginate_queryset(wishlist, request)
            serializer = WishlistSerilaizer(paginated_wishlist, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        except Wishlist.DoesNotExist:
            return Response({'error': 'wishlist not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def delete(self, request, id):
        try:
            wishlist = WishlistProduct.objects.get(id=id)
            if request.user.id != wishlist.wishlist.user.id:
                return Response(
                {"error": "You are not authorized."},
                status=status.HTTP_403_FORBIDDEN,
                )
            
            wishlist.delete()
            data = {
                'status': 'Deleted Successfully',
            }
            return Response(data, status=status.HTTP_200_OK)
        except WishlistProduct.DoesNotExist:
            
            raise Http404("WishlistProduct not found")
        except Exception as e:
           
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class VarientForUser(APIView):
    def get(self, request, id):
        try:
            product_variants = ProductVariant.objects.select_related(
                'product').prefetch_related('product__offers').filter(product_id=id).annotate(
                price_after_offer=ExpressionWrapper(F('variant_price') - (F('variant_price'
                ) * Coalesce(F('product__offers__discount_percentage'), Value(0)) / 100),
                output_field=FloatField()
        )
    )
            if product_variants.exists():
                serializer = ProductVariantSerializer(product_variants, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ValidateCoupon(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser]
    def post(self, request):
        try:
            coupon_code = request.data.get('code')
            user_id = request.data.get('user_id')
            if request.user.id != user_id:
                return Response(
                {"error": "You are not authorized."},
                status=status.HTTP_403_FORBIDDEN,
                )
            coupon = get_object_or_404(Coupon, code=coupon_code,is_active=True)
            try:
                pay = Payment.objects.get(user=user_id, coupon=coupon)
                return Response({'error': 'Coupon is already used'}, status=status.HTTP_400_BAD_REQUEST)
            except Payment.DoesNotExist:
                return Response({
                    'code': coupon_code,
                    'value': coupon.coupon_percent,
                    'type': "percentage",
                    'id': coupon.id
                }, status=status.HTTP_200_OK)
        except Coupon.DoesNotExist:
            return Response({'error': 'Coupon not found'}, status=status.HTTP_404_NOT_FOUND)
            
        
class UserWallet(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser]
    def get(self, request, id):
        try:
            if request.user.id != id:
                return Response(
                    {"error": "You are not authorized."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            # Fetch wallet for the given user_id
            wallet, created = Wallet.objects.get_or_create(user_id=id)
            
            # Get pagination parameters
            page = request.query_params.get('page', 1)
            page_size = request.query_params.get('page_size', 10)
            
            # Fetch transactions with pagination
            transactions = WalletTransaction.objects.filter(
                wallet=wallet
            ).order_by('-created_at')
            
            # Paginate transactions
            paginator = Paginator(transactions, page_size)
            page_obj = paginator.get_page(page)
            
            # Serialize transaction data
            transaction_data = [
                {
                    'id': txn.id,
                    'amount': str(txn.amount),
                    'order_id': txn.order.id if txn.order else None,
                    'created_at': txn.created_at,
                    'transaction_type': 'credit' if txn.amount > 0 else 'debit'
                }
                for txn in page_obj
            ]
            
            data = {
                'balance': str(wallet.balance),
                'id': wallet.id,
                'updated_at': wallet.updated_at,
                'transactions': {
                    'results': transaction_data,
                    'count': paginator.count,
                    'total_pages': paginator.num_pages,
                    'current_page': page_obj.number,
                    'page_size': int(page_size),
                }
            }
            return Response(data, status.HTTP_200_OK)
        except Wallet.DoesNotExist:
            return Response({'error': 'Wallet not found'}, status=404)
        
    def patch(self, request, id):
        try:
            wallet = Wallet.objects.get(id=id)
            if request.user.id != wallet.user.id:
                return Response(
                    {"error": "You are not authorized."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            
            amount = request.data.get('totalAmount')
            wallet.balance += amount
            wallet.save()
            
            # Create transaction record
            WalletTransaction.objects.create(
                wallet=wallet,
                amount=amount,
                order=None  # Set order if applicable
            )
            
            data = {
                'id': wallet.id,
            }
            return Response(data, status.HTTP_200_OK)
        except:
            data = {
                'status': 'failed',
            }
            return Response(data, status.HTTP_400_BAD_REQUEST)
        
        
class UserWishlistFromHomePage(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser]

    def post(self, request, product_id):
        try:
            user = request.user  
            product = get_object_or_404(Product, id=product_id, is_active=True)
            cheapest_variant = (
                product.variants.order_by("variant_price").first()
            )
            if not cheapest_variant:
                return Response({'error': 'No variants found for this product.'}, status=status.HTTP_400_BAD_REQUEST)
            wishlist, _ = Wishlist.objects.get_or_create(user=user)
            wishlist_product, created = WishlistProduct.objects.get_or_create(
                wishlist=wishlist,
                product_variant=cheapest_variant
            )
            if not created:
                return Response({'error': 'Product is already in Wishlist.'}, status=status.HTTP_400_BAD_REQUEST)
            return Response(
                {
                    'message': f'Cheapest variant of "{product.title}" added to Wishlist successfully.',
                    'variant_id': cheapest_variant.id,
                    'variant_price': cheapest_variant.variant_price,
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def delete(self, request, product_id):
        try:
            user = request.user
            product = get_object_or_404(Product, id=product_id, is_active=True)

            variants = product.variants.all()
            if not variants.exists():
                return Response({'error': 'No variants found for this product.'}, status=status.HTTP_400_BAD_REQUEST)

            wishlist_entries = WishlistProduct.objects.filter(
                wishlist__user_id=user.id,
                product_variant__in=variants
            )

            if not wishlist_entries.exists():
                return Response({'error': 'Product not found in wishlist.'}, status=status.HTTP_404_NOT_FOUND)

            deleted_count, _ = wishlist_entries.delete()
            return Response(
                {'status': f'{deleted_count} item(s) deleted successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        
        
class CategoryBasedProductData(APIView):
    """
    Category-based filtering - GET /categoryBasedProductData/<id>?page=1
    """
    permission_classes = [AllowAny]
    pagination_class = ProductPagination
    
    def get(self, request, id):
        user = request.user
        
        products = Product.objects.select_related('category').annotate(
            starting_price=Min('variants__variant_price'),
            total_stock=Sum('variants__stock'),
            in_wishlist=Exists(
                Wishlist.objects.filter(
                    user_id=user.id if user.is_authenticated else None,
                    wishlist_products__id=OuterRef('id')
                )
            ) if user.is_authenticated else Value(False, output_field=BooleanField())
        ).filter(
            is_active=True,
            category__is_active=True,
            category__id=id
        ).order_by('id')
        
        paginator = self.pagination_class()
        paginated_products = paginator.paginate_queryset(
            products.values(
                'id',
                'title',
                'category__name',
                'price',
                'starting_price',
                'total_stock',
                'description',
                'shelf_life',
                'available_quantity',
                'product_img1',
                'product_img2',
                'product_img3',
                'created_at',
                'in_wishlist'
            ),
            request
        )
        
        return paginator.get_paginated_response(paginated_products)




class SearchBasedProductData(APIView):
    """
    Search-based filtering - GET /searchBasedProductData/<search_term>?page=1
    """
    permission_classes = [AllowAny]
    pagination_class = ProductPagination
    
    def get(self, request, search_term):
        user = request.user
        
        products = Product.objects.select_related('category').annotate(
            starting_price=Min('variants__variant_price'),
            total_stock=Sum('variants__stock'),
            in_wishlist=Exists(
                Wishlist.objects.filter(
                    user_id=user.id if user.is_authenticated else None,
                    wishlist_products__id=OuterRef('id')
                )
            ) if user.is_authenticated else Value(False, output_field=BooleanField())
        ).filter(
            is_active=True,
            category__is_active=True,
            title__icontains=search_term
        ).order_by('id')
        
        paginator = self.pagination_class()
        paginated_products = paginator.paginate_queryset(
            products.values(
                'id',
                'title',
                'category__name',
                'price',
                'starting_price',
                'total_stock',
                'description',
                'shelf_life',
                'available_quantity',
                'product_img1',
                'product_img2',
                'product_img3',
                'created_at',
                'in_wishlist'
            ),
            request
        )
        
        return paginator.get_paginated_response(paginated_products)



class FilterBasedProductData(APIView):
    """
    Filter-based product listing - POST /filterBasedProductData?page=1
    Request body: {
        "type": "menu_order|popularity|rating|date|price|price-desc",
        "priceRange": [min, max],
        "categories": ["Category1", "Category2"]
    }
    """
    permission_classes = [AllowAny]
    pagination_class = ProductPagination
    
    def post(self, request):
        user = request.user
        data = request.data
        
        # Get filter parameters
        sort_type = data.get('type', 'menu_order')
        price_range = data.get('priceRange', [0, 1000])
        min_price = price_range[0]
        max_price = price_range[1]
        categories = data.get('categories', [])
        
        # Build base queryset
        products = Product.objects.select_related('category').annotate(
            starting_price=Min('variants__variant_price'),
            total_stock=Sum('variants__stock'),
                in_wishlist=Exists(
                Wishlist.objects.filter(
                    user_id=user.id if user.is_authenticated else None,
                    wishlist_products__id=OuterRef('id')
                )
            ) if user.is_authenticated else Value(False, output_field=BooleanField())
        ).filter(
            is_active=True,
            category__is_active=True
        )
        
        # Apply category filter
        if categories:
            products = products.filter(category__name__in=categories)
        
        # Apply price range filter
        products = products.filter(
            starting_price__gte=min_price,
            starting_price__lte=max_price
        )
        
        # Apply sorting
        sort_mapping = {
            'menu_order': 'id',
            'popularity': '-created_at',  # Change to popularity field when added
            'rating': 'title',  # Change to rating field when added
            'date': '-created_at',
            'price': 'starting_price',
            'price-desc': '-starting_price'
        }
        
        order_by = sort_mapping.get(sort_type, 'id')
        products = products.order_by(order_by)
        
        # Apply pagination
        paginator = self.pagination_class()
        paginated_products = paginator.paginate_queryset(
            products.values(
                'id',
                'title',
                'category__name',
                'price',
                'starting_price',
                'total_stock',
                'description',
                'shelf_life',
                'available_quantity',
                'product_img1',
                'product_img2',
                'product_img3',
                'created_at',
                'in_wishlist'
            ),
            request
        )
        
        return paginator.get_paginated_response(paginated_products)



class CheckCartProducts(APIView):
    """
    Validate cart products before checkout
    Checks if all products are active and have sufficient stock
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        try:
            user_id = request.user.id
            
            # Get all cart items for the user
            cart_items = CartItem.objects.filter(
                cart__user_id=user_id
            ).select_related(
                'product_variant',
                'product_variant__product'
            )
            
            if not cart_items.exists():
                return Response({
                    'valid': False,
                    'message': 'Your cart is empty',
                    'invalid_items': []
                }, status=status.HTTP_400_BAD_REQUEST)
            
            
            for item in cart_items:
                variant = item.product_variant
                product = variant.product
                
                # Check if product is active
                if not product.is_active:
                    return Response({
                    'valid': False,
                    'message': f'{product.title} is no longer available ',
                }, status=status.HTTP_400_BAD_REQUEST)
                
                # Check if variant is active
                if not variant.is_active:
                    return Response({
                    'valid': False,
                    'message': f'{product.title}- {variant.weight} is no longer available ',
                }, status=status.HTTP_400_BAD_REQUEST)
                
                # Check stock availability
                if variant.stock < item.quantity:
                    return Response({
                    'valid': False,
                    'message': f'{product.title}- {variant.weight} is out of stock ',
                }, status=status.HTTP_400_BAD_REQUEST)
                
                # Calculate price with offers
               
            
            
            return Response({
                'valid': True,
                'message': 'All cart items are valid',
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error validating cart: {str(e)}")
            return Response({
                'valid': False,
                'message': 'An error occurred while validating your cart',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
 