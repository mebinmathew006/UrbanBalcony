from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from User.models import CustomUser,Category,Product,ProductVariant,Cart,Order,OrderItem,Wallet,WalletTransaction
from django.utils.timezone import now
from django.contrib.auth.hashers import make_password
from rest_framework import status
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from .serializer import CategorySerializer,ProductSerializer,ProductVariantSerializer
from User.serializer import CartSerializer,OrderSerializer
from rest_framework.exceptions import ErrorDetail
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import transaction
from django.db.models import F
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

    def get(self, request, id):
        product = ProductVariant.objects.select_related('product').filter(product_id=id)
        if product.exists():
            serializer = ProductVariantSerializer(product, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, **kwargs):
        serializer = ProductVariantSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            data = {
                'id': product.id,
                'status': "success"
            }
            return Response(data, status=status.HTTP_201_CREATED)
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        product_variant = ProductVariant.objects.get(id=id)
        product_variant.is_active = not product_variant.is_active
        product_variant.save()
        data = {
            'id': product_variant.id,
            'is_active': product_variant.is_active
        }
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, **kwargs):
        variant = get_object_or_404(ProductVariant, id=request.data.get('id'))
        serializer = ProductVariantSerializer(variant, data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            data = {
                'id': product.id,
                'status': "success"
            }
            return Response(data, status=status.HTTP_201_CREATED)
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
class AdmingetuserOrders(APIView):
    def get(self, request):
        try:
            if request.query_params.get('action')=='return':
                orders = Order.objects.prefetch_related(
                'order_items__product_variant',  
                'order_items__product_variant__product',  
                'payment',
                'address'
            ).filter(order_items__status='Requested for Return')
            # Change prefetch_related to match your model relationship
            else:
                
                orders = Order.objects.prefetch_related(
                    'order_items__product_variant',  
                    'order_items__product_variant__product',  
                    'payment',
                    'address'
                ).exclude(order_items__status='Requested for Return')
            serializer = OrderSerializer(orders, many=True,partial=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({'error': 'Orders not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def patch(self, request, id):
        try:
            action = request.data.get('action')
            user_id = request.data.get('userId')
            amount = request.data.get('amount')
            order_id = request.data.get('orderId')
            
            orderitem = OrderItem.objects.get(id=id)
        except OrderItem.DoesNotExist:
            return Response({'error': 'OrderItem not found'}, status=status.HTTP_404_NOT_FOUND)
        if action not in ['Delivered', 'Returned']:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'Returned' and (not user_id or not amount or not order_id):
            return Response({'error': 'Missing required fields for Returned action'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                if action == 'Delivered':
                    orderitem.status = 'Delivered Return not Approved'
                elif action == 'Returned':
                    orderitem.status = 'Returned'
                    wallet, created = Wallet.objects.get_or_create(user_id=user_id)
                    if not created:
                        # Update the existing wallet's balance
                        wallet.balance = F('balance') + amount
                        wallet.save()
                    WalletTransaction.objects.create(wallet=wallet, amount=amount, order_id=order_id)

                orderitem.save()

            return Response({'status': 'success', 'updated_status': orderitem.status}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
