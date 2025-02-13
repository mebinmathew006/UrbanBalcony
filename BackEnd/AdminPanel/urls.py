from django.contrib import admin
from django.urls import path,include
from .views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('usermanage',UserManage.as_view(),name='usermanage'),
    path('usermanage/<int:id>',UserManage.as_view(),name='userSignup'),
    path('categorymanage',CategoryManage.as_view(),name='getAllCategory'),
    path('categorymanage/<int:id>',CategoryManage.as_view(),name='categorystatus'),
    path('productmanage',ProductManage.as_view(),name='categorymanage'),
    path('productmanage/<int:id>',ProductManage.as_view(),name='categorystatus'),
    path('admineditProduct',AdmineditProduct.as_view(),name='admineditProduct'),
    path('adminaddProduct',AdminaddProduct.as_view(),name='adminaddProduct'),
    path('adminaddCategory',AdminaddCategory.as_view(),name='adminaddCategory'),
    path('adminUpdateCategory',AdminUpdateCategory.as_view(),name='adminUpdateCategory'),
    path('admingetuserOrders',AdmingetuserOrders.as_view(),name='AdmingetuserOrders'),
    path('admingetuserOrders/<int:id>',AdmingetuserOrders.as_view(),name='AdmingetuserOrders'),
    path('couponManage',CouponManage.as_view(),name='couponManage'),
    path('couponManage/<int:id>',CouponManage.as_view(),name='couponManage'),
    path('offerManage',OfferManage.as_view(),name='offerManage'),
    path('offerManage/<int:id>',OfferManage.as_view(),name='offerManage'),
    path('salesReportView',SalesReportView.as_view(),name='SalesReportView'),
    path('productVarientmanage',Varientmanage.as_view(),name='productVarientadd'),
    path('chatUserDetails',ChatUserDetails.as_view(),name='chatUserDetails'),
    path('productVarientmanage/<int:id>',Varientmanage.as_view(),name='productVarientmanage'),  
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)