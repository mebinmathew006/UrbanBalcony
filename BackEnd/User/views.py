from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CustomUser,Product,Review
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.core.files.storage import default_storage
from .serializer import LoginSerializer,CustomUserSerializer,ReviewAndRatingSerializer
from rest_framework.exceptions import ErrorDetail
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.db import transaction
import random
import string
from django.db.models import Avg
# Create your views here.


class UserHome(APIView):
    def get (self,request):
        products = Product.objects.select_related('category')
        print(products.query)
        return Response(products.values(),200)


class UserLogin(APIView):
    def post(self,request):
        serializer=LoginSerializer(data=request.data)
        if serializer.is_valid():
            email=serializer.validated_data['email']
            password=serializer.validated_data['password']
            try:
                user = CustomUser.objects.get(email=email)
                if user.check_password(password):
                    if not user.is_active:
                        return Response({'error':{'commonError': [ErrorDetail(string='Your account has been blocked.')]} },status=status.HTTP_403_FORBIDDEN)
                    
                    refresh = RefreshToken.for_user(user)
                    access_token = str(refresh.access_token)
                    response = Response({
                        'user': {
                            'id': user.id,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'email': user.email,
                            'is_admin': user.is_superuser,
                        }
                    }, status=status.HTTP_200_OK)

                    # Set the access token in an HTTP-only cookie
                    response.set_cookie(
                        key='access_token',
                        value=access_token,
                        httponly=True,  # Prevent access via JavaScript
                        secure=True,    # Use HTTPS only in production
                        samesite='Lax', # Restrict cross-site cookie usage
                        max_age=60 * 60 * 24  # Optional: Set expiration time (1 day here)
                    )
                    return response
                else:
                    return Response({'error':{'commonError': [ErrorDetail(string='Invalid credentials.')]} }, status=status.HTTP_400_BAD_REQUEST)
                
            except CustomUser.DoesNotExist:
                return Response({'error':{'commonError': [ErrorDetail(string='Invalid credentials.')]} }, status=status.HTTP_400_BAD_REQUEST)
        error_messages = serializer.errors
        print(error_messages)
        return Response({'error': error_messages}, status=status.HTTP_400_BAD_REQUEST)
    
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

            # Create response with user data
            response = Response({
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'is_admin': user.is_superuser,
                }
            }, status=status.HTTP_200_OK)

            # Set the access token in an HTTP-only cookie
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='Lax',
                max_age=60 * 60 * 24
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
        print(id,'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')
        product = Review.objects.filter(product_id=id)
        if product.exists():
            serializer=ReviewAndRatingSerializer(product,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        
    
    
    
# class ratingAndVarients(APIView):
#     def get(self, request, product_id):
#         # Fetch the product
#         product = Product.objects.filter(id=product_id).annotate(average_rating=Avg('reviews__rating')).first()

#         if not product:
#             return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

#         # Fetch variants of the product
#         product_variants = product.variants.values('id', 'name')

#         # Prepare the response
#         response_data = {
#             "product_name": product.name,
#             "average_rating": product.average_rating,
#             "variants": list(product_variants),
#         }

#         return Response(response_data, status=status.HTTP_200_OK)
    
    
