from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CustomUser,Product,Review,Address,Order,OrderItem,Cart,ProductVariant,CartItem,Payment
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework_simplejwt.exceptions import TokenError,InvalidToken
from rest_framework import status
from django.core.files.storage import default_storage
from .serializer import LoginSerializer,CustomUserSerializer,ReviewAndRatingSerializer,AddressSerializer,OrderSerializer,CartSerializer
from rest_framework.exceptions import ErrorDetail
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.db import transaction
import random
import string
from django.db.models import Avg
from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework.decorators import api_view
from jwt import decode, ExpiredSignatureError, InvalidTokenError,DecodeError


# Create your views here.
@api_view(['GET'])
def getUserDetailsAgainWhenRefreshing(request):
    token = request.COOKIES.get('access_token')
        
    if not token:
        return Response({'error': 'Token missing'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        # Decode and verify the token
        payload = decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        
        user_id = payload['user_id']
        
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
        return Response({
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_admin': user.is_superuser,
            'profile_picture': user.profile_picture.url if user.profile_picture else None
        }, status=status.HTTP_200_OK)
        
    except ExpiredSignatureError:
        return Response({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except (InvalidTokenError, DecodeError):
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': f'Authentication error: {str(e)}'}, status=status.HTTP_401_UNAUTHORIZED)

class UserHome(APIView):
    def get (self,request):
        token = request.COOKIES.get('access_token')
 
        products = Product.objects.select_related('category')
        print(products.query)
        return Response(products.values(),200)


class UserLogin(APIView):
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
                        'access_token': access_token,  # Send access token in response body
                        'user': {
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
    def post(self,request):
        email=request.data.get('email')
        
        data=[{'status':'success'}]
        return Response(data)
    
class ResetPassword(APIView):
    def post(self,request):
        otp=request.data.get('otp')
        password=request.data.get('password')
        print(otp,password)
        data=[{'status':'success'}]
        return Response(data)


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
                        'access_token': access_token,  # Send access token in response body
                        'user': {
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
            print(request.data)
            serializer=AddressSerializer(user,data=request.data,partial=True)
            if serializer.is_valid():
                serializer.save()
                print(serializer.data)
                
                return Response(serializer.data,status=status.HTTP_200_OK)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        except Address.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def post(self, request):
        print(request.data)
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
    def get(self, request, id):
        try:
            # Change prefetch_related to match your model relationship
            orders = Order.objects.filter(user_id=id).prefetch_related(
                'order_items__product_variant',  # Changed from productvariant to product
                'order_items__product_variant__product',  # Changed from productvariant to product
                'payment',
                'address'
            )
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
        quantity = request.data.get('quantity', 1)  # Default to 1 if not provided

        # Validate product variant
        product_variant = get_object_or_404(ProductVariant, id=product_variant_id)

        # Validate quantity
        if quantity < 1 or quantity > product_variant.stock:
            return Response({'error': 'Invalid quantity. Check stock availability.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create a cart for the user
        cart, created = Cart.objects.get_or_create(user=user)

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
        
        


class UserPlaceOrder(APIView):
    def post(self, request):
        user = request.user
        data = request.data

        try:
            # Validate required fields
            if not data.get('addressId') or not data.get('cart') or not data.get('totalAmount'):
                return Response({"error": "Missing required fields (addressId, cart, totalAmount)."}, status=status.HTTP_400_BAD_REQUEST)

            # Extract payment method (default to 'cod' if not provided)
            payment_method = data.get('paymentMethod', 'cod')

            # Use a database transaction to ensure atomicity
            with transaction.atomic():
                # Create Payment instance
                payment = Payment.objects.create(
                    user=user,
                    pay_method=payment_method,
                    status='pending'
                )

                # Create Order instance
                order = Order.objects.create(
                    user=user,
                    payment=payment,
                    address_id=data['addressId'],  # Address_ID from the frontend
                    status='pending',
                    shipping_charge=99,  # Example shipping charge
                    net_amount=data['totalAmount']
                )

                # Add OrderItems from Cart
                cart_data = data['cart']  # Cart passed from frontend
                for cart in cart_data:
                    cart_items = cart.get('cart_items', [])
                    for item in cart_items:
                        # Ensure necessary product_variant data is present
                        if 'product_variant' not in item or 'id' not in item['product_variant']:
                            raise ValueError("Invalid cart item: Missing product_variant details.")

                        product_variant_id = item['product_variant']['id']
                        quantity = item.get('quantity', 1)
                        variant_price = item['product_variant']['variant_price']

                        # Create OrderItem instance
                        OrderItem.objects.create(
                            order=order,
                            product_variant_id=product_variant_id,
                            quantity=quantity,
                            total_amount=quantity * variant_price
                        )

                # Clear the cart after placing the order
                Cart.objects.filter(user=user).delete()

                # Serialize and return response
                serializer = OrderSerializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
