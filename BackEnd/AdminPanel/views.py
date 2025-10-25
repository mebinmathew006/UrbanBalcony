from rest_framework.views import APIView
from rest_framework.response import Response
from User.models import (CustomUser,Category,Product,ProductVariant,Order,
                         OrderItem,Wallet,WalletTransaction,Coupon,Offer,Banner)
from rest_framework import status
from .serializer import (CategorySerializer,ProductSerializer,ProductVariantSerializer,
                         CouponSerializer,OfferSerializer,BannerSerializer)
from User.serializer import OrderSerializer
from rest_framework.exceptions import ValidationError
from django.db.models import F,Sum,Count,ExpressionWrapper, DecimalField,FloatField,Q
from django.db import transaction
from rest_framework.pagination import PageNumberPagination
from datetime import datetime
from rest_framework.permissions import IsAuthenticated
from User.serializer import CustomUserSerializer
from django.shortcuts import get_object_or_404
import logging

logger = logging.getLogger(__name__)

class PaginationClass(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserManage(APIView):
    permission_classes =[IsAuthenticated]
    pagination_class = PaginationClass
    def get(self, request):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        users = CustomUser.objects.filter(is_staff=True, is_superuser=False)
        paginator = self.pagination_class()
        paginated_users = paginator.paginate_queryset(users, request)

        serializer = CustomUserSerializer(paginated_users, many=True)

        return paginator.get_paginated_response(serializer.data)
    
    def patch(self,request,id):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        customuser = CustomUser.objects.get(id=id)
        customuser.is_active = not customuser.is_active
        customuser.save()
        data = {
            'id': customuser.id,
            'is_active': customuser.is_active
        }
        return Response(data,200) 
    
class CategoryManage(APIView):
    permission_classes =[IsAuthenticated]
    pagination_class = PaginationClass

    def get (self,request):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        category = Category.objects.all()
        paginator = self.pagination_class()
        paginated_categories = paginator.paginate_queryset(category, request)
        serializer = CategorySerializer(paginated_categories, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    def patch(self,request,id):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        category = Category.objects.get(id=id)
        category.is_active = not category.is_active
        category.save()
        data = {
            'id': category.id,
            'is_active': category.is_active
        }
        return Response(data,200)   
    
class ProductManage(APIView):
    permission_classes =[IsAuthenticated]
    pagination_class = PaginationClass
    def get (self,request):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        product = Product.objects.select_related('category')
        
        paginator = self.pagination_class()
        paginated_products = paginator.paginate_queryset(product, request)
        serializer = ProductSerializer(paginated_products, many=True)
        return paginator.get_paginated_response(serializer.data)
        
    def patch(self,request,id):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        product = Product.objects.get(id=id)
        product.is_active = not product.is_active
        product.save()
        data = {
            'id': product.id,
            'is_active': product.is_active
        }
        return Response(data,200)
    
class Products(APIView):
    permission_classes =[IsAuthenticated]
    def get (self,request):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
   
    
class AdmineditProduct(APIView):
    permission_classes =[IsAuthenticated]
    def post(self, request):
        try:
            print(request.data)
            if not (request.user.is_superuser):
                    return Response(
                        {"error": "You are not authorized"},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            product_id = request.data.get('id')
            logger.info(request.data.get('category_id'))
            if not product_id:
                return Response(
                    {"error": "Product ID is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            product = get_object_or_404(Product, id=int(product_id))
            
            serializer = ProductSerializer(product, data=request.data)

            if serializer.is_valid():
                product = serializer.save()
                data = {
                    'id': product.id,
                    'status': "success"
                }
                return Response(data, status=status.HTTP_200_OK)

            # Log errors for debugging
            logger.info(f"Validation Errors: {serializer.errors}")
            return Response(
                {"error": serializer.errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(e)
    
class AdminaddProduct(APIView):
    permission_classes =[IsAuthenticated]
    def post(self, request):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        logger.info(request.data)
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
    permission_classes =[IsAuthenticated]
    def post(self, request):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
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
    permission_classes =[IsAuthenticated]
    
    def post(self, request):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
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
    permission_classes =[IsAuthenticated]
    pagination_class = PaginationClass
    
    def get(self, request, id):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        varients = ProductVariant.objects.select_related('product').filter(product_id=id)
        if varients.exists():
            paginator = self.pagination_class()
            paginated_varients = paginator.paginate_queryset(varients, request)
            serializer = ProductVariantSerializer(paginated_varients, many=True)
            return paginator.get_paginated_response(serializer.data)
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, **kwargs):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
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
        if not (request.user.is_superuser):
                return Response({"error": "You are not authorized"},status=status.HTTP_403_FORBIDDEN)
        product_variant = ProductVariant.objects.get(id=id)
        product_variant.is_active = not product_variant.is_active
        product_variant.save()
        data = {
            'id': product_variant.id,
            'is_active': product_variant.is_active
        }
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, **kwargs):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
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
    permission_classes =[IsAuthenticated]
    pagination_class = PaginationClass
    
    def get(self, request):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        try:
            if request.query_params.get('action') == 'return':
                # Filter orders that have at least one return request
                orders = Order.objects.prefetch_related(
                    'order_items__product_variant',  
                    'order_items__product_variant__product',  
                    'payment',
                    'address'
                ).filter(
                    order_items__status='Requested for Return'
                ).distinct().order_by('-created_at')
            else:
                orders = Order.objects.prefetch_related(
                    'order_items__product_variant',  
                    'order_items__product_variant__product',  
                    'payment',
                    'address'
                ).exclude(
                    order_items__status='Requested for Return'
                ).distinct().order_by('-created_at')  # IMPORTANT: Remove duplicates
            
            paginator = self.pagination_class()
            paginated_orders = paginator.paginate_queryset(orders, request)
            serializer = OrderSerializer(paginated_orders, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        except Order.DoesNotExist:
            return Response({'error': 'Orders not found'}, status=status.HTTP_404_NOT_FOUND)
        
    def patch(self, request, id):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        try:
            action = request.data.get('action')
            user_id = request.data.get('userId')
            amount = request.data.get('amount')
            order_id = request.data.get('orderId')

            orderitem = OrderItem.objects.get(id=id)
            old_status = orderitem.status
        except OrderItem.DoesNotExist:
            return Response({'error': 'OrderItem not found'}, status=status.HTTP_404_NOT_FOUND)

        if action not in ['Delivered', 'Returned','Cancelled','Dispatched']:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'Returned' and (not user_id or not amount or not order_id):
            return Response({'error': 'Missing required fields for Returned action'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                if action == 'Delivered' and old_status =='Requested for Return':
                    orderitem.status = 'Delivered Return not Approved'
                elif action == 'Returned':
                    orderitem.status = 'Returned'
                    
                    # Update wallet balance
                    wallet, created = Wallet.objects.get_or_create(user_id=user_id)
                    if not created:
                        wallet.balance = F('balance') + amount
                        wallet.save()
                    WalletTransaction.objects.create(wallet=wallet, amount=amount, order_id=order_id)

                    # Update product variant stock
                    orderitem.product_variant.stock = F('stock') + orderitem.quantity
                    orderitem.product_variant.save()
                
                elif  action == 'Delivered' and old_status == 'Dispatched':
                    orderitem.status = 'Delivered'
                elif  action == 'Cancelled' and (old_status =='pending' or old_status =='Dispatched'):
                    orderitem.status = 'Cancelled'
                elif  action == 'Dispatched' and old_status =='pending' :
                    orderitem.status = 'Dispatched'
                    
                else:
                    return Response({'status': 'Failed', 'updated_status': f'You cant change the status from {old_status} to {action}'}, status=status.HTTP_400_BAD_REQUEST)
                    
                orderitem.save()
            return Response({'status': 'success', 'updated_status': orderitem.status}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CouponManage(APIView):
    permission_classes =[IsAuthenticated]
    pagination_class = PaginationClass
    
    def get(self, request):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        """Fetch all coupons."""
        coupons = Coupon.objects.all()
        paginator = self.pagination_class()
        paginated_coupons = paginator.paginate_queryset(coupons, request)
        serializer = CouponSerializer(paginated_coupons, many=True)
        return paginator.get_paginated_response(serializer.data)
        
    def post(self, request):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
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
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
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
    permission_classes =[IsAuthenticated]
    pagination_class = PaginationClass
    
    def get(self, request):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        offers = Offer.objects.select_related("product").all()

        paginator = self.pagination_class()
        paginated_offers = paginator.paginate_queryset(offers, request)
        serializer = OfferSerializer(paginated_offers, many=True)
        return paginator.get_paginated_response(serializer.data)
       

    def post(self, request):
        
        """Add or edit an offer."""
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
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
            logger.info(serializer.errors)
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
            logger.info(serializer.errors)
            return Response(
                {"error": serializer.errors},
                
                status=status.HTTP_400_BAD_REQUEST
            )

    def patch(self, request, id):
        try:
            if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
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
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        offer = get_object_or_404(Offer, id=id)
        offer.delete()
        return Response(
            {"message": "Offer deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
        
class SalesReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            # Get date range from request query parameters
            start_date = request.query_params.get('startDate')
            end_date = request.query_params.get('endDate')
            
            if not start_date or not end_date:
                raise ValidationError("Both startDate and endDate are required.")

            start_date = datetime.fromisoformat(start_date)
            end_date = datetime.fromisoformat(end_date)

            # Fetch orders within the date range
            orders = Order.objects.filter(order_date__range=(start_date,end_date))

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
            # sales report
           
            sales_details=OrderItem.objects.filter(Q(status='Delivered') | Q(status='Delivered Return not Approved'
                                                                             ),order__in=orders).values() 
           # Get top-selling categories
           
            top_categories = (
                    OrderItem.objects.filter(order__in=orders)
                    .annotate(
                        total_revenue=ExpressionWrapper(
                            F('quantity') * F('total_amount'),
                            output_field=DecimalField(max_digits=10, decimal_places=2)
                        )
                    )
                    .values(category=F('product_variant__product__category__name'))  # Group by category name
                    .annotate(
                        total_quantity=Sum('quantity'),
                        total_price=ExpressionWrapper(
                            Sum(F('product_variant__variant_price') * F('quantity')),
                            output_field=FloatField()
                        ),
                        total_revenue=Sum('total_revenue'),
                        total_discount=ExpressionWrapper(
                            Sum(F('product_variant__variant_price') * F('quantity')) - Sum('total_amount'),
                            output_field=FloatField()
                        )
                    )
                    .order_by('-total_quantity')[:10]  # Get top 10 selling categories
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
                    price=ExpressionWrapper(F('product_variant__variant_price') * F('quantity'),output_field=FloatField()),
                    revenue=Sum('total_revenue'),
                     discount=F('order__discout_percentage')
                )
                .order_by('-quantity')
            )

            # Prepare response data
            data = {
                'totalRevenue': total_revenue,
                'totalOrders': total_orders,
                'averageOrderValue': average_order_value,
                'dailySales': list(daily_sales),
                'topSellingProducts': list(top_products),
                'sales_details':sales_details,
                'top_categories':list(top_categories)
            }
            return Response(data, status=status.HTTP_200_OK)
        except ValidationError as ve:
            return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.info(e)
            return Response({'error': 'An error occurred while processing the request.' 
                             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChatUserDetails(APIView):
    def get (self,request):
        
        customuser = CustomUser.objects.select_related  ('user_chatroom').exclude(id=12)
        return Response(customuser.values(),200)
    
class BannerManagementView(APIView):
    permission_classes =[IsAuthenticated]
    """
    API view for managing banners: fetching, adding, and updating.
    """

    def get(self, request, banner_id=None):
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        """Retrieve all banners or a single banner by ID."""
        if banner_id:
            try:
                banner = Banner.objects.get(id=banner_id)
                serializer = BannerSerializer(banner)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Banner.DoesNotExist:
                return Response({"error": "Banner not found"}, status=status.HTTP_404_NOT_FOUND)
        
        banners = Banner.objects.all()
        serializer = BannerSerializer(banners, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new banner."""
        if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        serializer = BannerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, banner_id):
        """Update an existing banner."""
        try:
            if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            banner = Banner.objects.get(id=banner_id)
        except Banner.DoesNotExist:
            return Response({"error": "Banner not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BannerSerializer(banner, data=request.data, partial=False)  # Full update
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, banner_id):
        """Partially update an existing banner."""
        try:
            if not (request.user.is_superuser):
                return Response(
                    {"error": "You are not authorized"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            banner = Banner.objects.get(id=banner_id)
        except Banner.DoesNotExist:
            return Response({"error": "Banner not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BannerSerializer(banner, data=request.data, partial=True)  # Partial update
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)