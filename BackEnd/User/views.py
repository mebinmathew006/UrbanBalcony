from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CustomUser,Product,Review,Address,Order,OrderItem,Cart,ProductVariant,CartItem,Payment,OTP,Transaction,Razorpay,Wishlist,WishlistProduct
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework_simplejwt.exceptions import TokenError,InvalidToken
from rest_framework import status
from django.core.files.storage import default_storage
from .serializer import LoginSerializer,CustomUserSerializer,ReviewAndRatingSerializer,AddressSerializer,OrderSerializer,CartSerializer,PaymentsSerializer,TransactionSerializer,OrderItemSerializer,WishlistSerilaizer
from rest_framework.exceptions import ErrorDetail
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.db import transaction
import random
import string
from django.db.models import Avg,F
from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework.decorators import api_view
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
import os


# Create your views here.
@api_view(['GET'])
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
                'profile_picture': user.profile_picture.url if user.profile_picture else None
            }
        }, status=status.HTTP_200_OK)
        
        # Keep refresh token in cookie
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,  # Keep existing refresh token
            httponly=True,
            secure=True,
            samesite=None,
            max_age=60 * 60 * 24 * 7  # 7 days
        )
        
        return response
            
    except (ExpiredSignatureError, InvalidTokenError, DecodeError):
        return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)



class UserHome(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        products = Product.objects.select_related('category')
        return Response(products.values(), status.HTTP_200_OK)


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
                            'is_admin': user.is_superuser,
                            'profile_picture': user.profile_picture.url if user.profile_picture else None
                        }
                    }, status=status.HTTP_200_OK)

                    # Set only the refresh token in HTTP-only cookie
                    response.set_cookie(
                        key='refresh_token',
                        value=refresh_token,
                        httponly=True, # Prevent access via JavaScript
                        secure=True,  # Use HTTPS only in production
                        samesite=None,  # Restrict cross-site cookie usage
                        max_age=60 * 60 * 24 * 7  # 7 days for refresh token
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
                return Response({'message': 'User registered successfully.'}, status=status.HTTP_201_CREATED)
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
            
            # Save OTP to database
            OTP.objects.filter(email=email).delete()  # Delete existing OTPs
            otp_obj = OTP.objects.create(email=email, otp=otp)
            
            # Send email
            try:
                send_mail(
                    'Your OTP for Verification',
                    f'Your OTP is: {otp}. Valid for 10 minutes.',
                    'urbanbalcony@ub.com',  # FROM
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

    
class ResetPassword(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        otp = request.data.get('otp')
        password = request.data.get('password')
        email = request.data.get('email')
        
        print(otp,password,email)

        if not otp or not password or not email:
            return Response({'error': 'OTP, email, and password are required'}, status=status.HTTP_400_BAD_REQUEST)

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

            # Verify the Google token
            id_info = id_token.verify_oauth2_token(
                credential,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID  # Add this to your Django settings
            )

            # Extract user information from the verified token
            email = id_info.get('email')
            first_name = id_info.get('given_name', '')
            last_name = id_info.get('family_name', '')

            # Check if user exists
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                # Create new user if doesn't exist
                with transaction.atomic():
                    user = CustomUser.objects.create(
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        is_active=True
                    )
                    # Set a random password for the user
                    random_password = self.generate_random_password()
                    user.set_password(random_password)
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
                            'profile_picture': user.profile_picture.url if user.profile_picture else None
                        }
                    }, status=status.HTTP_200_OK)
            print(response)
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
            # Handle other exceptions
            return Response(
                {'error': {'commonError': str(e)}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReviewAndRating(APIView):
    def get(self, request, id):
        # Fetch the product
        product = Review.objects.filter(product_id=id)
        if product.exists():
            serializer=ReviewAndRatingSerializer(product,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        
    
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
            orderitem = Address.objects.get(id=id)
            orderitem.delete()
            data = {
                'status': 'Deleted Successfully',
            }
            return Response(data, status=status.HTTP_200_OK)
        except Address.DoesNotExist:
            # Handle the case where the object does not exist
            raise Http404("Address not found")
        except Exception as e:
            # Handle unexpected errors
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserOrder(APIView):
    def patch(self,request,id):
        try:
            orderItem = OrderItem.objects.get(id=id)
            
            orderItem.status = request.data.get('action')
            orderItem.save()
            data = {
                'id': orderItem.id,
            }
            return Response(data,status.HTTP_200_OK)
        except:
            data = {
                'status': 'failed',
            }
            return Response(data,status.HTTP_400_BAD_REQUEST)
            
    def get(self, request, id):
        try:
            # Change prefetch_related to match your model relationship
            orders = Order.objects.filter(user_id=id).prefetch_related(
                'order_items__product_variant', 
                'order_items__product_variant__product',  
                'payment',
                'address'
            )
            serializer = OrderSerializer(orders, many=True)
            print(serializer.data)
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
    def post(self, request):
        user_id = request.data.get('user_id')
        address_id = request.data.get('addressId')
        payment_method = request.data.get('paymentMethod')
        total_amount = request.data.get('totalAmount')

        if not user_id or not address_id or not payment_method or not total_amount:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                payment_status = "pending"

                # Handle card payments
                if payment_method == 'card':
                    razorpay_payment_id = request.data.get('razorpay_payment_id')
                    razorpay_order_id = request.data.get('razorpay_order_id')
                    razorpay_signature = request.data.get('razorpay_signature')

                    try:
                        razor = Razorpay.objects.get(razorpay_order_id=razorpay_order_id)
                        razor.razorpay_payment_id = razorpay_payment_id
                        razor.razorpay_signature = razorpay_signature
                        razor.save()
                        payment_status = "paid"
                    except Razorpay.DoesNotExist:
                        return Response({"error": "Invalid Razorpay order ID"}, status=status.HTTP_400_BAD_REQUEST)

                # Create payment
                payment_data = {'user': user_id, 'pay_method': payment_method}
                payment_serializer = PaymentsSerializer(data=payment_data)
                payment_serializer.is_valid(raise_exception=True)
                payment = payment_serializer.save()

                # Create transaction
                transaction_data = {'payment': payment.id, 'status': payment_status, 'amount': total_amount}
                transaction_serializer = TransactionSerializer(data=transaction_data)
                transaction_serializer.is_valid(raise_exception=True)
                transaction_serializer.save()

                # Create order
                order_data = {
                    'user': user_id,
                    'payment': payment.id,
                    'address': address_id,
                    'shipping_charge': 100,
                    'net_amount': total_amount,
                    'delivery_date': (datetime.now() + timedelta(days=10)).date(),
                }
                order_serializer = OrderSerializer(data=order_data)
                order_serializer.is_valid(raise_exception=True)
                order = order_serializer.save()

                # Handle cart items
                cart_items = CartItem.objects.filter(cart__user_id=user_id).select_related('product_variant')
                if not cart_items.exists():
                    raise ValueError("Cart is empty")

                # Prepare data for bulk update and validation
                variant_ids = [item.product_variant.id for item in cart_items]
                quantity_mapping = {item.product_variant.id: item.quantity for item in cart_items}

                # Fetch all product variants in a single query
                product_variants = ProductVariant.objects.filter(id__in=variant_ids)

                order_items = []
                for variant in product_variants:
                    ordered_quantity = quantity_mapping[variant.id]
                    if variant.stock < ordered_quantity:
                        raise ValueError(f"Not enough stock for variant {variant.id}")

                    # Reduce stock using F expressions
                    ProductVariant.objects.filter(id=variant.id).update(stock=F('stock') - ordered_quantity)

                    order_items.append({
                        'order': order.id,
                        'product_variant': variant.id,
                        'quantity': ordered_quantity,
                        'total_amount': ordered_quantity * variant.variant_price,
                    })

                # Create order items in bulk
                order_item_serializer = OrderItemSerializer(data=order_items, many=True)
                order_item_serializer.is_valid(raise_exception=True)
                order_item_serializer.save()

                # Clear the cart
                cart_items.delete()

                return Response({"message": "Order placed successfully", "order_id": order.id}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
class UserLogout(APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=200)
        response.delete_cookie('refresh_token')  
        return response
    
class TokenRefreshFromCookieView(APIView):
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

            return Response(
                {"access": access_token},
                status=status.HTTP_200_OK,
            )

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
                'product_variant__product',
                'order__address'
            ).get(id=id)
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