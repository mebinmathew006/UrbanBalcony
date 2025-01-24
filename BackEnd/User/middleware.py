from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
from django.conf import settings
from django.urls import resolve

class TokenAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # List of paths that don't need authentication
        exempt_paths = [
            '/api/login/',
            '/api/home/',  # Add your loading page path
            # Add other exempt paths
        ]

        # Check if current path is exempt
        if request.path in exempt_paths:
            return self.get_response(request)

        try:
            # Extract access token from header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse({'error': 'No valid authorization header'}, status=401)
            
            access_token = auth_header.split(' ')[1]

            try:
                # Verify access token
                payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=['HS256'])
                # Add user info to request for views to use
                request.user_id = payload.get('user_id')
                return self.get_response(request)

            except jwt.ExpiredSignatureError:
                # Access token expired, try refresh token
                refresh_token = request.COOKIES.get('refresh_token')
                if not refresh_token:
                    return JsonResponse({'error': 'No refresh token'}, status=401)

                try:
                    # Verify refresh token and generate new access token
                    refresh = RefreshToken(refresh_token)
                    new_access_token = str(refresh.access_token)
                    
                    # Create response with new access token
                    response = JsonResponse({'access_token': new_access_token})
                    return response

                except Exception as e:
                    return JsonResponse({'error': 'Invalid refresh token'}, status=401)

            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=401)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)