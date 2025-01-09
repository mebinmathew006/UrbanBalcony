from django.contrib import admin
from django.urls import path,include
from .views import *


urlpatterns = [
    # path('',UserHome.as_view(),name='userHome'),
    path('usermanage',UserManage.as_view(),name='usermanage'),
    path('usermanage/<int:id>',UserManage.as_view(),name='userSignup'),
    path('categorymanage',CategoryManage.as_view(),name='categorymanage'),
    path('categorymanage',CategoryManage.as_view(),name='getAllCategory'),
    path('categorymanage/<int:id>',CategoryManage.as_view(),name='categorystatus'),
    path('productmanage',ProductManage.as_view(),name='categorymanage'),
    path('productmanage/<int:id>',ProductManage.as_view(),name='categorystatus'),
    path('admineditProduct',AdmineditProduct.as_view(),name='admineditProduct'),
    path('adminaddProduct',AdminaddProduct.as_view(),name='adminaddProduct'),
    path('adminaddCategory',AdminaddCategory.as_view(),name='adminaddCategory'),
    path('adminUpdateCategory',AdminUpdateCategory.as_view(),name='adminUpdateCategory'),
    path('productVarientmanage',Varientmanage.as_view(),name='productVarientadd'),
    path('productVarientmanage/<int:id>',Varientmanage.as_view(),name='productVarientmanage'),  
   
]
