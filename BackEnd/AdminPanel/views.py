from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from User.models import CustomUser,Category,Product,ProductVariant,Cart,Order,OrderItem,Wallet,WalletTransaction,Coupon,Offer
from django.utils.timezone import now
from django.contrib.auth.hashers import make_password
from rest_framework import status
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from .serializer import CategorySerializer,ProductSerializer,ProductVariantSerializer,CouponSerializer,OfferSerializer
from User.serializer import CartSerializer,OrderSerializer
from rest_framework.exceptions import ErrorDetail,ValidationError
from django.http import HttpResponse
from django.db.models.signals import post_save, post_delete
from django.db.models import Prefetch
from django.db.models import F,Sum,Count,ExpressionWrapper, DecimalField
from django.db import transaction

from django.dispatch import receiver
from datetime import datetime
from openpyxl import Workbook
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
        print(request.data)
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
        
class CouponManage(APIView):
    def get(self, request):
        """Fetch all coupons."""
        coupons = Coupon.objects.all()
        serializer = CouponSerializer(coupons, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Add or edit a coupon."""
        coupon_id = request.data.get('id')  # Check if this is an update
        if coupon_id:
            # Update existing coupon
            coupon = get_object_or_404(Coupon, id=int(coupon_id))
            serializer = CouponSerializer(coupon, data=request.data)
            if serializer.is_valid():
                coupon = serializer.save()
                return Response(
                    {"id": coupon.id, "status": "success"},
                    status=status.HTTP_200_OK
                )
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # Create new coupon
            serializer = CouponSerializer(data=request.data)
            if serializer.is_valid():
                coupon = serializer.save()
                return Response(
                    {"id": coupon.id, "status": "success"},
                    status=status.HTTP_201_CREATED
                )
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

    def patch(self, request, id):
        """Toggle the active status of a coupon."""
        coupon = get_object_or_404(Coupon, id=id)
        coupon.is_active = not coupon.is_active
        coupon.save()
        data = {
            "id": coupon.id,
            "is_active": coupon.is_active
        }
        return Response(data, status=status.HTTP_200_OK)
        
class OfferManage(APIView):
    def get(self, request):
        """Fetch all offers."""
        offers = Offer.objects.select_related("product").all()
        serializer = OfferSerializer(offers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Add or edit an offer."""
        offer_id = request.data.get('id')  # Check if this is an update
        if offer_id:
            # Update existing offer
            offer = get_object_or_404(Offer, id=int(offer_id))
            serializer = OfferSerializer(offer, data=request.data, partial=True)
            if serializer.is_valid():
                offer = serializer.save()
                return Response(
                    {"id": offer.id, "status": "success"},
                    status=status.HTTP_200_OK
                )
            print(serializer.errors)
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # Create new offer
            serializer = OfferSerializer(data=request.data)
            if serializer.is_valid():
                offer = serializer.save()
                return Response(
                    {"id": offer.id, "status": "success"},
                    status=status.HTTP_201_CREATED
                )
            print(serializer.errors)
            return Response(
                {"error": serializer.errors},
                
                status=status.HTTP_400_BAD_REQUEST
            )

    def patch(self, request, id):
        try:
            offer = get_object_or_404(Offer, id=id)
            offer.is_active = not offer.is_active  # Ensure the 'is_active' field exists in the model
            offer.save()
            data = {
                "id": offer.id,
                "is_active": offer.is_active
            }
            return Response(data, status=status.HTTP_200_OK)
        except Offer.DoesNotExist:
            return Response({'error': 'Offer not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            
        

    def delete(self, request, id):
        """Delete an offer."""
        offer = get_object_or_404(Offer, id=id)
        offer.delete()
        return Response(
            {"message": "Offer deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
        
class SalesReportView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get date range from request query parameters
            start_date = request.query_params.get('startDate')
            end_date = request.query_params.get('endDate')
            
            if not start_date or not end_date:
                raise ValidationError("Both startDate and endDate are required.")

            start_date = datetime.fromisoformat(start_date)
            end_date = datetime.fromisoformat(end_date)

            # Fetch orders within the date range
            orders = Order.objects.filter(order_date__range=(start_date, end_date))

            # Calculate total revenue
            total_revenue = orders.aggregate(total=Sum('order_items__total_amount'))['total'] or 0

            # Calculate total orders
            total_orders = orders.count()

            # Calculate average order value
            average_order_value = (
                total_revenue / total_orders if total_orders > 0 else 0
            )

            # Get daily sales data
            daily_sales = (
                orders.values(date=F('order_date'))
                .annotate(
                    revenue=Sum('order_items__total_amount'),
                    orders=Count('id')
                )
                .order_by('date')
            )

           # Get top-selling products
            top_products = (
                OrderItem.objects.filter(order__in=orders)
                .annotate(
                    total_revenue=ExpressionWrapper(
                        F('quantity') * F('total_amount'),
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
                .values(name=F('product_variant__product__title'))
                .annotate(
                    quantity=Sum('quantity'),
                    revenue=Sum('total_revenue'),
                    discount=Sum(F('product_variant__variant_price')-F('total_amount'))
                )
                .order_by('-quantity')[:10]
            )

            # Prepare response data
            data = {
                'totalRevenue': total_revenue,
                'totalOrders': total_orders,
                'averageOrderValue': average_order_value,
                'dailySales': list(daily_sales),
                'topSellingProducts': list(top_products),
            }

            return Response(data, status=status.HTTP_200_OK)
        except ValidationError as ve:
            return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'An error occurred while processing the request.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class ExportSalesReportView(APIView):
#     # permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             # Get date range from request query parameters
#             start_date = request.query_params.get('startDate')
#             end_date = request.query_params.get('endDate')

#             if not start_date or not end_date:
#                 raise ValidationError("Both startDate and endDate are required.")

#             start_date = datetime.fromisoformat(start_date)
#             end_date = datetime.fromisoformat(end_date)

#             # Fetch orders within the date range
#             orders = (
#         Order.objects.filter(order_date__range=(start_date, end_date))
#         .prefetch_related(
#             Prefetch(
#                 'order_items',
#                 queryset=OrderItem.objects.select_related('product_variant')
#             )
#         )
#     )

#             # Create an Excel workbook
#             workbook = Workbook()
#             sheet = workbook.active
#             sheet.title = 'Sales Report'

#             # Add headers
#             headers = [
#                 'Order ID', 'Order Date', 'Customer', 'Total Price', 
#                 'Discount Applied', 'Net Revenue'
#             ]
#             sheet.append(headers)

#             # Add order data
#             for order in orders:
#                 sheet.append([
#                     order.id,
#                     order.order_date.strftime('%Y-%m-%d'),
#                     order.user.first_name,
#                     order.total_amount,
#                     order.variant_price -order.total_amount,
#                     order.total_amount - (order.variant_price -order.total_amount)
#                 ])

#             # Add totals row
#             sheet.append([])
#             sheet.append([
#                 'Total',
#                 '',
#                 '',
#                 orders.aggregate(Sum('total_price'))['total_price__sum'] or 0,
#                 orders.aggregate(Sum('discount'))['discount__sum'] or 0,
#                 orders.aggregate(Sum('total_price'))['total_price__sum'] -
#                 (orders.aggregate(Sum('discount'))['discount__sum'] or 0),
#             ])

#             # Create a response for downloading the file
#             response = HttpResponse(
#                 content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
#             )
#             response['Content-Disposition'] = 'attachment; filename=sales_report.xlsx'
#             workbook.save(response)

#             return response
#         except ValidationError as ve:
#             return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             print(e)
#             return Response({'error': 'An error occurred while exporting the report.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
