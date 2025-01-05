from django.contrib import admin
from django.urls import path,include
from .views import *


urlpatterns = [
    # path('',UserHome.as_view(),name='userHome'),
    path('usermanage',UserManage.as_view(),name='usermanage'),
    path('userstatus/<int:id>',Userstatus.as_view(),name='userSignup'),
    path('categorymanage',CategoryManage.as_view(),name='categorymanage'),
    path('categorystatus/<int:id>',Categorystatus.as_view(),name='categorystatus'),
    path('productmanage',ProductManage.as_view(),name='categorymanage'),
    path('productstatus/<int:id>',Productstatus.as_view(),name='categorystatus'),
    path('admineditProduct',AdmineditProduct.as_view(),name='admineditProduct'),
    path('adminaddProduct',AdminaddProduct.as_view(),name='adminaddProduct'),
    path('adminaddCategory',AdminaddCategory.as_view(),name='adminaddCategory'),
    path('adminUpdateCategory',AdminUpdateCategory.as_view(),name='adminUpdateCategory'),
    # path('forgetPassword',ForgetPassword.as_view(),name='ForgetPassword'),
    # path('resetPassword',ResetPassword.as_view(),name='ResetPassword'),
]
