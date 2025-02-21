"""
URL configuration for UrbanBalcony project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('',UserHome.as_view(),name='userHome'),
    path('categoryBasedProductData/<int:id>',CategoryBasedProductData.as_view(),name='categoryBasedProductData'),
    path('relatedProductData/<int:id>',RelatedProductData.as_view(),name='relatedProductData'),
    path('filterBasedProductData/<str:types>',FilterBasedProductData.as_view(),name='filterBasedProductData'),
    path('searchBasedProductData/<str:search>',SearchBasedProductData.as_view(),name='searchBasedProductData'),
    path('userLogin',UserLogin.as_view(),name='userLogin'),
    path('userDetails/<int:id>',UserLogin.as_view(),name='userDetails'),
    path('userAddress/<int:id>',UserAddress.as_view(),name='userAddress'),
    path('userOrders/<int:id>',UserOrder.as_view(),name='userOrders'),
    path('singleOrderDetails/<int:id>',SingleOrderDetails.as_view(),name='singleOrderDetails'),
    path('userAddress',UserAddress.as_view(),name='userAddressUpdate'),
    path('userSignup',UserSignup.as_view(),name='userSignup'),
    path('google_login',GoogleAuth.as_view(),name='google_login'),
    path('forgetPassword',ForgetPassword.as_view(),name='ForgetPassword'),
    path('resetPassword',ResetPassword.as_view(),name='ResetPassword'),
    path('confirmOtp',ConfirmOtp.as_view(),name='confirmOtp'),
    path('reviewAndRating/<int:id>',ReviewAndRating.as_view(),name='ReviewAndRating'),
    path('userCart/<int:id>',UserCart.as_view(),name='userCart'),
    path('userCart',UserCart.as_view(),name='userCart'),
    path('userWishlist',UserWishlist.as_view(),name='userWishlist'),
    path('userWishlist/<int:id>',UserWishlist.as_view(),name='userWishlist'),
    path('userPlaceOrder',UserPlaceOrder.as_view(),name='userPlaceOrder'),
    path('userLogout',UserLogout.as_view(),name='userLogout'),
    path('getUserDetailsForAuthentication',getUserDetailsAgainWhenRefreshing,name='getUserDetailsForAuthentication'),
    path('refresh_token', TokenRefreshFromCookieView.as_view(), name='refresh_token'),
    path('createRazorpayOrder', CreateRazorpayOrder.as_view(), name='createRazorpayOrder'),
    path('validate_coupon', ValidateCoupon.as_view(), name='validate_coupon'),
    path('indexPage', IndexPage.as_view(), name='IndexPage'),
    path('getCategories', GetCategories.as_view(), name='getCategories'),
    path('changePaymentstatus', ChangePaymentstatus.as_view(), name='changePaymentstatus'),
    path('varientForUser/<int:id>', VarientForUser.as_view(), name='VarientForUser'),
    path('varientForUser/<int:id>', VarientForUser.as_view(), name='VarientForUser'),
    path('userWallet/<int:id>', UserWallet.as_view(), name='userWallet'),
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)