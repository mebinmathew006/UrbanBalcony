from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CustomUser,Product,Ingredient,ProductVariant,Category
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils.timezone import now
from django.contrib.auth.hashers import make_password
from .serializer import LoginSerializer,CustomUserSerializer
from rest_framework.exceptions import ErrorDetail
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

        

        # Check for duplicate email
        

        # Handle profile picture upload
        
        # print(profile_picture_path)
        # # Create user
        # try:
        #     user = CustomUser.objects.create(
        #         first_name=first_name,
        #         last_name=last_name,
        #         email=email,
        #         phone_number=phone_number,
        #         profile_picture=profile_picture_path,
        #         password=make_password(password),  # Securely hash the password
        #         date_joined=now(),
        #     )
        #     user.save()

            
        
    
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