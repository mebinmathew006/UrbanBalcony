from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CustomUser,Product,Review,Address,Order,OrderItem,Cart,ProductVariant,CartItem,Payment,OTP,Transaction,Razorpay,Wishlist,WishlistProduct,Coupon,Wallet,Category
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework_simplejwt.exceptions import TokenError,InvalidToken
from rest_framework import status
from django.core.files.storage import default_storage
from .serializer import LoginSerializer,CustomUserSerializer,ReviewAndRatingSerializer,AddressSerializer,OrderSerializer,CartSerializer,PaymentsSerializer,TransactionSerializer,OrderItemSerializer,WishlistSerilaizer
from AdminPanel.serializer import ProductVariantSerializer
from rest_framework.exceptions import ErrorDetail
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.db import transaction
from django.db.models import Q
import random
import string
from django.db.models import Avg,F,ExpressionWrapper, FloatField, Value,Sum,Min,Count
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework.decorators import api_view,permission_classes
from jwt import decode, ExpiredSignatureError, InvalidTokenError,DecodeError
from jwt import encode as jwt_encode
from datetime import datetime, timedelta
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
import random
import string
from django.core.mail import send_mail
from django.core.exceptions import ObjectDoesNotExist
import razorpay
from rest_framework.pagination import PageNumberPagination
import logging
logger = logging.getLogger(__name__)
from django.core.files.base import ContentFile
from google.auth.transport import requests as google_requests 
# Create your views here.
@api_view(['GET'])
@permission_classes([AllowAny])
def getUserDetailsAgainWhenRefreshing(request):
    # We only need refresh_token from cookies since access_token is in response body
    refresh_token = request.COOKIES.get('refresh_token')
    print(refresh_token)
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
                'is_verified': user.is_staff,#uses this field to know whther the user is verified or not
                'profile_picture': user.profile_picture.url if user.profile_picture else None
            }
        }, status=status.HTTP_200_OK)
        
        # Keep refresh token in cookie
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,  # Keep existing refresh token
            httponly=True,
            secure=False,
            samesite=None,
            max_age=60 * 60 * 24   # 1 days
        )
        
        return response
            
    except (ExpiredSignatureError, InvalidTokenError, DecodeError):
        return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)




class ProductPagination(PageNumberPagination):
    page_size = 12  # Number of items per page
    page_size_query_param = 'page_size'
    max_page_size = 100

class UserHome(APIView):
    permission_classes = [AllowAny]
    pagination_class = ProductPagination

    def get(self, request):
        products = Product.objects.select_related('category').annotate(starting_price=Min('variants__variant_price'),total_stock=Sum('variants__stock')).filter(
            is_active=True,
            category__is_active=True
        ).order_by('id') 
        
        # Apply pagination
        paginator = self.pagination_class()
        paginated_products = paginator.paginate_queryset(products.values(), request)
        
        return paginator.get_paginated_response(paginated_products)
    
class CategoryBasedProductData(APIView):
    permission_classes=[AllowAny]
    pagination_class = ProductPagination
    def get(self, request,id):
        products = Product.objects.select_related('category').annotate(starting_price=Min('variants__variant_price'),total_stock=Sum('variants__stock')).filter(is_active=True,category__is_active=True,category__id=id)
         # Apply pagination
        paginator = self.pagination_class()
        paginated_products = paginator.paginate_queryset(products.values(), request)
        
        return paginator.get_paginated_response(paginated_products)
    
class RelatedProductData(APIView):
    def get(self, request,id):
        products = Product.objects.filter(is_active=True, category__is_active=True,category_id=Product.objects.filter(id=id)
                                          .values("category_id")[:1]).select_related("category").annotate(starting_price=Min("variants__variant_price")
                                                                                                          ,total_stock=Sum("variants__stock")).exclude(id=id)[:8]

        return Response(products.values(),status.HTTP_200_OK)
    
class SearchBasedProductData(APIView):
    permission_classes=[AllowAny]
    pagination_class = ProductPagination
    def get(self, request,search):
        products = Product.objects.select_related('category').annotate(starting_price=Min('variants__variant_price'),total_stock=Sum('variants__stock')).filter(is_active=True,category__is_active=True,title__istartswith=search)
         # Apply pagination
        paginator = self.pagination_class()
        paginated_products = paginator.paginate_queryset(products.values(), request)
        
        return paginator.get_paginated_response(paginated_products)
    
class FilterBasedProductData(APIView):
    permission_classes=[AllowAny]
    pagination_class = ProductPagination
    def get(self, request,types):
        if types == 'rating':
            products=Product.objects.select_related('category').filter(is_active=True,category__is_active=True).annotate(average_rating=Avg('reviews__rating'),starting_price=Min('variants__variant_price'),total_stock=Sum('variants__stock')).order_by('average_rating')
        elif types == 'price-desc':
            products=Product.objects.select_related('category').annotate(starting_price=Min('variants__variant_price'),total_stock=Sum('variants__stock')).filter(is_active=True,category__is_active=True).order_by('-price')
        elif types == 'price':
            products=Product.objects.select_related('category').annotate(starting_price=Min('variants__variant_price'),total_stock=Sum('variants__stock')).filter(is_active=True,category__is_active=True).order_by('price')
        elif types == 'date':
            products=Product.objects.select_related('category').annotate(starting_price=Min('variants__variant_price'),total_stock=Sum('variants__stock')).filter(is_active=True,category__is_active=True).order_by('-created_at')
        elif types == 'popularity':
            products=Product.objects.select_related('category').annotate(starting_price=Min('variants__variant_price'),total_stock=Sum('variants__stock')).filter(is_active=True,category__is_active=True).annotate(total_order=Coalesce(Sum('variants__productvariants__quantity'), 0) ).order_by('-total_order')
        else:
            products = Product.objects.select_related('category').annotate(starting_price=Min('variants__variant_price'),total_stock=Sum('variants__stock')).filter(is_active=True,category__is_active=True)
         # Apply pagination
        paginator = self.pagination_class()
        paginated_products = paginator.paginate_queryset(products.values(), request)
        
        return paginator.get_paginated_response(paginated_products)

    
class IndexPage(APIView):
    permission_classes = [AllowAny]
    pagination_class = ProductPagination

    def get(self, request):
        products = Product.objects.select_related('category').annotate(starting_price=Min('variants__variant_price'),total_stock=Sum('variants__stock')).filter(
            is_active=True,
            category__is_active=True
        ).order_by('id') 
        
        # Apply pagination
        paginator = self.pagination_class()
        paginated_products = paginator.paginate_queryset(products.values(), request)
        
        return paginator.get_paginated_response(paginated_products)
    
class GetCategories(APIView):
    # permission_classes=[AllowAny]
    def get(self, request):
        categories = Category.objects.order_by('id')[:5]
        return Response(categories.values(), status.HTTP_200_OK)


class UserLogin(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        print(request.data)
        
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
                        httponly=False, # Prevent access via JavaScript
                        secure=False,  # Use HTTPS only in production
                        samesite=None,  # Restrict cross-site cookie usage
                        max_age=60 * 60 * 24  # 7 days for refresh token
                    )
                    print('sssssssssssssssssssssssssssssssssssssssss',response.headers)
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
   
    
    # user details
    def get(self,request,id):
        try:
            user=CustomUser.objects.get(id=id)
            serializer=CustomUserSerializer(user)
            return Response(serializer.data,status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        # user update
        
    def put(self,request,id):
        try:
            user=CustomUser.objects.get(id=id)
            print(request.data)
            serializer=CustomUserSerializer(user,data=request.data,partial=True)
            if serializer.is_valid():
                serializer.save()
                print(serializer.data)
                
                return Response(serializer.data,status=status.HTTP_200_OK)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
class UserSignup(APIView):
    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)  # Correct instantiation

        if serializer.is_valid():
            # Check for email uniqueness
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
    
class ForgetPassword(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        print(email)
        if not email:
            return Response({'error': 'Email is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(email=email)
            
            # Generate OTP only if user exists
            otp = ''.join(random.choices(string.digits, k=6))
            print(otp)
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
        print(otp,email)
        
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
                            print(f"Profile picture error: {str(e)}")
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
                    httponly=True, # Prevent access via JavaScript
                    secure=False,  # Use HTTPS only in production
                    samesite=None,  # Restrict cross-site cookie usage
                    max_age=60 * 60 * 24 * 7  # 7 days for refresh token
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
            print("Detailed error:", str(e))
            print("Full traceback:", traceback.format_exc())
            # Handle other exceptions
            return Response(
                {'error': {'commonError': str(e)}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReviewAndRating(APIView):
    permission_classes = [AllowAny]
    def get(self, request, id):
        # Fetch the product
        product = Review.objects.filter(product_id=id)
        if product.exists():
            serializer=ReviewAndRatingSerializer(product,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        print(request.data)
        serializer = ReviewAndRatingSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        

        
    
class UserAddress(APIView):
    def get(self,request,id):
        try:
            address=Address.objects.filter(user_id=id)
            serializer=AddressSerializer(address,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            print("no data")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def put(self,request,id):
        try:
            user=Address.objects.get(id=id)
            serializer=AddressSerializer(user,data=request.data,partial=True)
            if serializer.is_valid():
                serializer.save()
                print(serializer.data)
                
                return Response(serializer.data,status=status.HTTP_200_OK)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        except Address.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def post(self, request):
        serializer = AddressSerializer(data=request.data)  # Correct instantiation
        if serializer.is_valid():
            try:
                serializer.save()  # Save the validated data to the database
                return Response({'message': 'Address registered successfully.'}, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(e)
                return Response({'error': f'Failed to create user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    
    def patch(self, request, id):
        try:
            # Check if the address exists first
            if not Address.objects.filter(id=id).exists():
                raise Http404("Address not found")

            # Check if there are pending or dispatched orders linked to the address
            has_orders = Order.objects.filter(
                address__id=id, 
                order_items__status__in=['pending', 'Dispatched']
            ).exists()

            if has_orders:
                return Response(
                    {'status': 'Unable to delete the address'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Now safely delete the address
            Address.objects.filter(id=id).delete()

            return Response(
                {'status': 'Deleted Successfully'},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ChangePaymentstatus(APIView):
        
    def patch(self, request):
        try:
            payment_id =request.data.get('payment_id')
            orderitem = Payment.objects.get(id=payment_id)
            orderitem.status='paid'
            orderitem.save()
            data = {
                'status': 'Paid Successfully',
            }
            return Response(data, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            # Handle the case where the object does not exist
            raise Http404("Payment not found")
        except Exception as e:
            # Handle unexpected errors
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserOrder(APIView):
    def patch(self, request, id):
        try:
            # Retrieve the order item
            orderItem = OrderItem.objects.get(id=id)
            orderItem.status = request.data.get('action')
            orderItem.save()

            # Check if the order was cancelled and handle refund
            if request.data.get('action') == 'Cancelled':
                payment_status = orderItem.order.payment.status  # Access related field
                if payment_status == 'success':
                    wallet = Wallet.objects.get(user=orderItem.order.user)
                    wallet.balance = F('balance') + orderItem.shipping_price_per_order + orderItem.total_amount
                    wallet.save()

            # Successful response
            return Response({'id': orderItem.id}, status=status.HTTP_200_OK)

        except OrderItem.DoesNotExist:
            return Response({'error': 'Order item not found'}, status=status.HTTP_404_NOT_FOUND)

        except Wallet.DoesNotExist:
            return Response({'error': 'Wallet not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print(e)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    def get(self, request, id):
        try:
            # Change prefetch_related to match your model relationship
            orders = Order.objects.filter(user_id=id).prefetch_related(
                'order_items__product_variant', 
                'order_items__product_variant__product',  
                'payment',
                'address'
            ).order_by('created_at')  
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({'error': 'Orders not found'}, status=status.HTTP_404_NOT_FOUND)
    
class UserCart(APIView):
    def get(self, request, id):
        try:
            # Change to cart_items__product_variant
            orders = Cart.objects.filter(user_id=id).prefetch_related(
                'cart_items__product_variant',
                'cart_items__product_variant__product'  # To get product details
            )
            serializer = CartSerializer(orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def post(self, request):
        user = request.data.get('user_id')
        product_variant_id = request.data.get('id')
        quantity = int(request.data.get('quantitiy'))  

        # Validate product variant
        product_variant = get_object_or_404(ProductVariant, id=product_variant_id)

        # Validate quantity
        if quantity < 1 or quantity > product_variant.stock:
            return Response({'error': 'Invalid quantity. Check stock availability.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create a cart for the user
        cart, created = Cart.objects.get_or_create(user_id=user)

        # Check if the item already exists in the cart
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product_variant=product_variant)
        if not created:
            # Update the quantity if the item already exists
            new_quantity = cart_item.quantity + quantity
            if new_quantity > product_variant.stock:
                return Response({'error': 'Quantity exceeds available stock.'}, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity = new_quantity
        else:
            cart_item.quantity = quantity

        cart_item.save()

        return Response({'message': 'Item added to cart successfully.'}, status=status.HTTP_201_CREATED)
    
    def delete(self, request, id):
        try:
            cartitem = CartItem.objects.get(id=id)
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
        # for updating cart quantitiy
        

    def patch(self, request, id):
        try:
            # Get the cart item
            cart_item = CartItem.objects.get(id=id)

            # Get the action from the request
            action =request.data.get('action')
            if action == 'increase':
                cart_item.quantity += 1
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
    def validate_input(self, data):
        required_fields = ['user_id', 'addressId', 'paymentMethod', 'totalAmount']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
        return True

    def process_wallet_payment(self, total, user_id):
        try:
            wallet = Wallet.objects.get(user_id=user_id)  # Fetch the Wallet instance
            if total > wallet.balance:
                raise ValueError("Insufficient balance")
            wallet.balance -= total
            wallet.save()  # Save the updated balance
        except Wallet.DoesNotExist:
            raise ValueError("Wallet not found")  # Handle case where user has no wallet


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

    def create_order(self, user_id, payment_id, address_id, total_amount,discoutPercentage):
        order_data = {
            'user': user_id,
            'payment': payment_id,
            'address': address_id,
            'shipping_charge': 100,  # Consider making this configurable
            'net_amount': total_amount,
            'discout_percentage': discoutPercentage,
            'delivery_date': (datetime.now() + timedelta(days=10)).date(),
        }
        order_serializer = OrderSerializer(data=order_data)
        order_serializer.is_valid(raise_exception=True)
        return order_serializer.save()

    def process_cart_order(self, user_id, order_id,shipping_charge):
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

            price = self.calculate_price_with_offer(variant)*item.quantity
            
            product_image=Product.objects.values_list('product_img1',flat=True).get(variants__id=variant.id)
            
            shipping_price_per_order=(int(shipping_charge)*(int(item.quantity)/int(total_quantity)))
            
            # Update stock
            ProductVariant.objects.filter(id=variant.id).update(
                stock=F('stock') - item.quantity
            )

            order_items.append({
                'order': order_id,
                'product_variant': variant.id,
                'quantity': item.quantity,
                'image_url': product_image,
                'total_amount': price,
                'shipping_price_per_order': shipping_price_per_order,
            })

        # Create order items
        order_item_serializer = OrderItemSerializer(data=order_items, many=True)
        order_item_serializer.is_valid(raise_exception=True)
        order_item_serializer.save()

        # Clear cart
        cart_items.delete()

    def process_direct_order(self, order_id, product_id, quantity,shipping_charge):
        variant = ProductVariant.objects.get(id=product_id)
        if variant.stock < quantity:
            raise ValueError(f"Insufficient stock for product variant {variant.id}")

        price = self.calculate_price_with_offer(variant)
        
        # Update stock
        ProductVariant.objects.filter(id=variant.id).update(
            stock=F('stock') - quantity
        )
        product_image=Product.objects.values_list('product_img1',flat=True).get(variants__id=variant.id)
        order_item = {
            'order': order_id,
            'product_variant': variant.id,
            'quantity': quantity,
            'image_url': product_image,
            'total_amount': (quantity * price),
            'shipping_price_per_order': shipping_charge,
        }

        order_item_serializer = OrderItemSerializer(data=order_item)
        order_item_serializer.is_valid(raise_exception=True)
        order_item_serializer.save()

    @staticmethod
    def calculate_price_with_offer(variant):
        offer = variant.product.offers.filter(is_active=True).first()
        if offer:
            return variant.variant_price * (1 - offer.discount_percentage / 100)
        return variant.variant_price

    def post(self, request):
        try:
            self.validate_input(request.data)
            
            with transaction.atomic():
                # Process payment
                payment_status =request.data.get('status')
                paymentMethod =request.data.get('paymentMethod')       
                
                if paymentMethod=='wallet':
                    self.process_wallet_payment(request.data.get('totalAmount'),request.data.get('user_id'))
                
                # Create payment record
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
                    request.data.get('discoutPercentage')
                )
                # Process order items based on type
                if request.data.get('type') == 'cart':
                    self.process_cart_order(request.data.get('user_id'), order.id,order.shipping_charge)
                else:
                    self.process_direct_order(
                        order.id,
                        request.data.get('productId'),
                        request.data.get('quantity')
                        ,order.shipping_charge
                    )

                return Response(
                    {"message": "Order placed successfully", "order_id": order.id},
                    status=status.HTTP_201_CREATED
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
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            
            
class CreateRazorpayOrder(APIView):
    def post(self, request):

        try:
            razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            
            # Extract user details and payment amount from the request
            user_id = request.data.get("user_id")
            total_amount = request.data.get("totalAmount")
            currency = request.data.get("currency", "INR")  # Default to INR if not provided
            print(user_id,total_amount)
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
            print(f"Error creating Razorpay order: {str(e)}")
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
            # print(order_item_details.query)
            
            serializer=OrderItemSerializer(order_item_details, context={'include_address_details': True})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except OrderItem.DoesNotExist:
            return Response({'error': 'Orders not found'}, status=status.HTTP_404_NOT_FOUND)
            
class UserWishlist(APIView):
    def post(self, request):
        user = request.data.get('user_id')
        product_variant_id = request.data.get('id')
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
            # Change to cart_items__product_variant
            wishlist = Wishlist.objects.filter(user_id=id).prefetch_related(
                'wishlist_products__product_variant',
                'wishlist_products__product_variant__product'
            )
            serializer = WishlistSerilaizer(wishlist, many=True)
            print(serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Wishlist.DoesNotExist:
            return Response({'error': 'wishlist not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, id):
        try:
            wishlist = WishlistProduct.objects.get(id=id)
            wishlist.delete()
            data = {
                'status': 'Deleted Successfully',
            }
            return Response(data, status=status.HTTP_200_OK)
        except WishlistProduct.DoesNotExist:
            # Handle the case where the object does not exist
            raise Http404("WishlistProduct not found")
        except Exception as e:
            # Handle unexpected errors
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class VarientForUser(APIView):
    def get(self, request, id):
        product_variants = ProductVariant.objects.select_related('product').prefetch_related('product__offers').filter(product_id=id).annotate(
    price_after_offer=ExpressionWrapper(
        F('variant_price') - (F('variant_price') * Coalesce(F('product__offers__discount_percentage'), Value(0)) / 100),
        output_field=FloatField()
    )
)
        
        if product_variants.exists():
            serializer = ProductVariantSerializer(product_variants, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
class ValidateCoupon(APIView):
    def post(self, request):
        try:
            coupon_code = request.data.get('code')
            user_id = request.data.get('user_id')
            
            # Fetch the coupon object
            coupon = get_object_or_404(Coupon, code=coupon_code)
            
            # Check if a payment exists for the user and coupon
            try:
                payment = Payment.objects.get(user=user_id, coupon=coupon)
                # If a payment exists, the coupon is already used
                return Response({'error': 'Coupon is already used'}, status=status.HTTP_400_BAD_REQUEST)
            except Payment.DoesNotExist:
                # If no payment exists, return coupon details
                return Response({
                    'code': coupon_code,
                    'value': coupon.coupon_percent,
                    'type': "percentage",
                    'id': coupon.id
                }, status=status.HTTP_200_OK)

        except Coupon.DoesNotExist:
            return Response({'error': 'Coupon not found'}, status=status.HTTP_404_NOT_FOUND)
            
        
class UserWallet(APIView):
    def get(self,request, id):
        try:
            # Fetch wallet for the given user_id
            wallet,created = Wallet.objects.get_or_create(user_id=id)
            data = {
                'balance': str(wallet.balance),
                'id': wallet.id,
                'updated_at': wallet.updated_at,
            }
            return Response(data, status.HTTP_200_OK)

        except Wallet.DoesNotExist:
            return Response({'error': 'Wallet not found'}, status=404)
        
    def patch(self,request,id):
        try:
            wallet = Wallet.objects.get(id=id)
            
            wallet.balance += request.data.get('totalAmount')
            wallet.save()
            data = {
                'id': wallet.id,
            }
            return Response(data,status.HTTP_200_OK)
        except:
            data = {
                'status': 'failed',
            }
            return Response(data,status.HTTP_400_BAD_REQUEST)
        
        
        
        
