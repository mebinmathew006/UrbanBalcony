from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from User.models import CustomUser,Category,Product,ProductVariant
from django.utils.timezone import now
from django.contrib.auth.hashers import make_password
from rest_framework import status
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from .serializer import CategorySerializer,ProductSerializer,ProductVariantSerializer
from rest_framework.exceptions import ErrorDetail
from django.shortcuts import get_object_or_404
# Create your views here.

class UserManage(APIView):
    def get (self,request):
        customuser = CustomUser.objects.all()
        
        return Response(customuser.values(),200)
    
    def patch(self,request,id):
        customuser = CustomUser.objects.get(id=id)
        customuser.is_active = not customuser.is_active
        customuser.save()
        data = {
            'id': customuser.id,
            'is_active': customuser.is_active
        }
        return Response(data,200) 
    
class CategoryManage(APIView):
    def get (self,request):
        category = Category.objects.all()
        return Response(category.values(),200)
    
    def patch(self,request,id):
        category = Category.objects.get(id=id)
        category.is_active = not category.is_active
        category.save()
        data = {
            'id': category.id,
            'is_active': category.is_active
        }
        return Response(data,200)   
    
class ProductManage(APIView):
    def get (self,request):
        product = Product.objects.select_related('category')
        serializer=ProductSerializer(product,many=True)
        return Response(serializer.data,status.HTTP_200_OK)
    
    def patch(self,request,id):
        product = Product.objects.get(id=id)
        product.is_active = not product.is_active
        product.save()
        data = {
            'id': product.id,
            'is_active': product.is_active
        }
        return Response(data,200)
    
class AdmineditProduct(APIView):
    def post(self, request):
        product_id = request.data.get('id')
        print(request.data.get('category'))
        if not product_id:
            return Response(
                {"error": "Product ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        product = get_object_or_404(Product, id=int(product_id))
        
        serializer = ProductSerializer(product, data=request.data)
        print("Initial Data:", serializer.initial_data)  # For debugging (remove in production)

        if serializer.is_valid():
            product = serializer.save()
            data = {
                'id': product.id,
                'status': "success"
            }
            return Response(data, status=status.HTTP_200_OK)

        # Log errors for debugging
        print("Validation Errors:", serializer.errors)
        return Response(
            {"error": serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    
class AdminaddProduct(APIView):
    def post(self, request):
        
        serializer=ProductSerializer(data=request.data)
        if serializer.is_valid():
            product=serializer.save()
            data = {
            'id': product.id,
            'status': "success"
}
            return Response(data, status=status.HTTP_201_CREATED)
            
        return Response({'error': serializer.error_messages}, 
                            status=status.HTTP_400_BAD_REQUEST)
    
class AdminaddCategory(APIView):
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            category=serializer.save()

            data = {
                'id': category.id,
                'name': category.name,
                'status': "success"
            }
            return Response(data, status=status.HTTP_201_CREATED)
        
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    
class AdminUpdateCategory(APIView):
    def post(self, request):
        id = request.data.get('id')
        try:
            category = Category.objects.get(id=id)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CategorySerializer(category, data=request.data)
        if serializer.is_valid():
            updated_category = serializer.save()  # Calls the `update` method in the serializer
            data = {
                'id': updated_category.id,
                'name': updated_category.name,
                'status': "success",
            }
            return Response(data, status=status.HTTP_200_OK)

        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
class Varientmanage(APIView):
        
    def get (self,request,id):
        product = ProductVariant.objects.select_related('product').filter(product_id=id)
        if product.exists():
            serializer=ProductVariantSerializer(product,many=True)
            return Response(serializer.data,status.HTTP_200_OK)
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post (self,request):
        serializer=ProductVariantSerializer(data=request.data)
        if serializer.is_valid():
            product=serializer.save()
            data = {
            'id': product.id,
            'status': "success"
                }
            return Response(data, status=status.HTTP_201_CREATED)
        return Response({'error': serializer.error_messages}, 
                            status=status.HTTP_400_BAD_REQUEST)

    def patch(self,request,id):
        productVariant = ProductVariant.objects.get(id=id)
        productVariant.is_active = not productVariant.is_active
        productVariant.save()
        data = {
            'id': productVariant.id,
            'is_active': productVariant.is_active
        }
        return Response(data,200)
    
    def put (self,request):
        variant=get_object_or_404(ProductVariant,id=request.data.get('id'))
        
        serializer=ProductVariantSerializer(variant,data=request.data)
        print(serializer.initial_data)
        if serializer.is_valid():
            product=serializer.save()
            data = {
            'id': product.id,
            'status': "success"
                }
            return Response(data, status=status.HTTP_201_CREATED)
        print(serializer.error_messages)
        return Response({'error': serializer.error_messages}, 
                            status=status.HTTP_400_BAD_REQUEST)