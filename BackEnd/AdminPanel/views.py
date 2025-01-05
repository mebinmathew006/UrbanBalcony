from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from User.models import CustomUser,Category,Product
from django.utils.timezone import now
from django.contrib.auth.hashers import make_password
from rest_framework import status
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from .serializer import CategorySerializer
from rest_framework.exceptions import ErrorDetail
# Create your views here.

class UserManage(APIView):
    def get (self,request):
        customuser = CustomUser.objects.all()
        print(customuser.values())
        return Response(customuser.values(),200)
    
class Userstatus(APIView):
    def post(self,request,id):
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
    
class Categorystatus(APIView):
    def post(self,request,id):
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
        product = Product.objects.select_related('category').all()
        print(product.values())
        return Response(product.values(),200)
    
class Productstatus(APIView):
    def post(self,request,id):
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
        product_id = int(request.data.get('id'))  # Use for update if provided
        title = request.data.get('title')
        category_id = request.data.get('category')
        available_quantity = request.data.get('available_quantity')
        description = request.data.get('description')
        ingredient_ids = request.data.getlist('ingredients')  # Multiple values
        shelf_life = request.data.get('shelf_life')
        price = request.data.get('price')
        print(price)

        product_img1 = request.FILES.get('product_img1')
        product_img2 = request.FILES.get('product_img2')
        product_img3 = request.FILES.get('product_img3')

        # Validate required fields
        if not (title and category_id and price and shelf_life):
            return Response({'error': 'Add every fields are required.'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        # Handle profile picture upload
        product_picture_path1 = None
        product_picture_path2 = None
        product_picture_path3 = None
        if product_picture_path1:
            product_picture_path1 = default_storage.save(
                f'user/product_pic/image1{product_id}_product.jpg',
                ContentFile(product_img1.read())
            )
        if product_picture_path2:
            product_picture_path2 = default_storage.save(
                f'user/product_pic/image2{product_id}_product.jpg',
                ContentFile(product_img2.read())
            )
        if product_picture_path3:
            product_picture_path3 = default_storage.save(
                f'user/product_pic/image3{product_id}_product.jpg',
                ContentFile(product_img3.read())
            )
            
        product = Product.objects.get(id=product_id)
        product.title = title
        # product.category = product.category
        product.available_quantity = available_quantity
        product.description = description
        product.shelf_life = shelf_life
        product.price = price
        # product.ingredients = ingredient_ids

        # Update product images
        if product_img1:
            product.product_img1 = product_img1
        if product_img2:
            product.product_img2 = product_img2
        if product_img3:
            product.product_img3 = product_img3
        product.save()
        data = {
            'id': product.id,
            'status': "success"
        }
        return Response(data,200) 
    
    
class AdminaddProduct(APIView):
    def post(self, request):
        title = request.data.get('title')
        category_id = request.data.get('category')
        available_quantity = request.data.get('available_quantity')
        description = request.data.get('description')
        ingredient_ids = request.data.getlist('ingredients')  # Multiple values
        shelf_life = request.data.get('shelf_life')
        price = request.data.get('price')

        product_img1 = request.FILES.get('product_img1')
        product_img2 = request.FILES.get('product_img2')
        product_img3 = request.FILES.get('product_img3')

        # Validate required fields
        if not (title and category_id and price and shelf_life):
            return Response({'error': 'Add every fields are required.'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        # Handle profile picture upload
        product_picture_path1 = None
        product_picture_path2 = None
        product_picture_path3 = None
        if product_picture_path1:
            product_picture_path1 = default_storage.save(
                f'user/product_pic/image1{now}_product.jpg',
                ContentFile(product_img1.read())
            )
        if product_picture_path2:
            product_picture_path2 = default_storage.save(
                f'user/product_pic/image2{now}_product.jpg',
                ContentFile(product_img2.read())
            )
        if product_picture_path3:
            product_picture_path3 = default_storage.save(
                f'user/product_pic/image3{now}_product.jpg',
                ContentFile(product_img3.read())
            )
            
        # Retrieve category instance
        category = get_object_or_404(Category, id=1)

        # Create the product instance
        product = Product.objects.create(
            title=title,
            category=category,
            # ingredients=ingredient_ids,
            available_quantity=available_quantity,
            description=description,
            shelf_life=shelf_life,
            price=price,
            product_img1=product_img1,
            product_img2=product_img2,
            product_img3=product_img3
        )

        # # Add ingredients to the product
        # ingredients = Ingredient.objects.filter(id__in=ingredient_ids)
        # product.ingredients.set(ingredients)

    # Save the product
        product.save()
        data = {
            'id': product.id,
            'status': "success"
        }
        return Response(data,200) 
    
    
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
 