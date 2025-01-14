from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.utils import timezone
from django.core.validators import MinValueValidator
from django.conf import settings
# Create your models here.

from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email) 
        user = self.model(email=email, first_name=first_name, last_name=last_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name=None, last_name=None, password=None, **extra_fields):
        """
        Creates and returns a superuser with the given email and password.
        """
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if not first_name or not last_name:
            raise ValueError('Superuser must have a first name and last name.')

        return self.create_user(email, first_name, last_name, password, **extra_fields)



class CustomUser(AbstractBaseUser): 
    first_name      = models.CharField(max_length=50)
    last_name       = models.CharField(max_length=50)
    email           = models.EmailField(max_length=100, unique=True)
    phone_number    = models.CharField(max_length=50, blank=True)
    profile_picture = models.ImageField(upload_to='user/profile_pic/', null=True, blank=True)
    date_joined     = models.DateTimeField(auto_now_add=True)
    last_login      = models.DateTimeField(default=timezone.now)
    is_active       = models.BooleanField(default=True)
    is_superuser   = models.BooleanField(default=False)
    is_social_user = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False) 


    USERNAME_FIELD  = 'email'
    objects = CustomUserManager()
    REQUIRED_FIELDS = ['first_name', 'last_name']   
    
    def has_module_perms(self, app_label):
        """
        Returns True if the user has permissions to view the app `app_label`.
        """
        return self.is_superuser
    
    def has_perm(self, perm, obj=None):
        """
        Returns True if the user has the specified permission.
        """
        return self.is_superuser
    
    def __str__(self):
        return self.email
    
class Product(models.Model):
    title = models.CharField(max_length=255)
    category = models.ForeignKey(
        'Category',  # Reference the Category model
        on_delete=models.CASCADE,
        related_name='products'
    )
    
    available_quantity = models.IntegerField(validators=[MinValueValidator(0)])
    description = models.TextField()
    shelf_life = models.CharField(max_length=50)
    product_img1 = models.ImageField(upload_to='user/product_pic/', null=False, blank=False)  
    product_img2 = models.ImageField(upload_to='user/product_pic/', null=False, blank=False)  
    product_img3 = models.ImageField(upload_to='user/product_pic/', null=False, blank=False)  
    price = models.IntegerField(validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)    
    is_active   = models.BooleanField(default=True)
    

    def __str__(self):
        return self.title



class ProductVariant(models.Model):
    product = models.ForeignKey(
        'Product',  # Reference the Product model
        on_delete=models.CASCADE,
        related_name='variants'
    )
    weight = models.CharField(max_length=50)
    variant_price = models.IntegerField(validators=[MinValueValidator(0)])
    stock = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    
    def save(self, *args, **kwargs):
        # Calculate the total amount
        if self.product_variant:
            self.total_amount = self.quantity * self.product_variant.variant_price
        super().save(*args, **kwargs)

class Category(models.Model):
    name = models.CharField(max_length=255,unique=True)
    created_at=models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    def __str__(self):
        return self.name
    
class Review(models.Model):
    product = models.ForeignKey(
        Product,  
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    description = models.TextField()
    rating = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.title} - {self.user.email}"
    
    



class Order(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='orders')
    payment = models.ForeignKey('Payment', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    address = models.ForeignKey('Address', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    order_date = models.DateField(default=timezone.now)
    delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default='pending')
    shipping_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='order_items')
    quantity = models.PositiveIntegerField(default=1)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='pending')
    
    def save(self, *args, **kwargs):
        # Calculate the total amount
        if self.product:
            self.total_amount = self.quantity * self.product.price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Item #{self.id} - Order #{self.order.id} - {self.product}"


class Payment(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='payments')
    coupon = models.ForeignKey('Coupon', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    wallet = models.ForeignKey('Wallet', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    status = models.CharField(max_length=50, default='pending')
    date = models.DateField(default=timezone.now)
    pay_method = models.CharField(max_length=50)

    def __str__(self):
        return f"Payment #{self.id} - {self.user}"


class Transaction(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='transactions')
    status = models.CharField(max_length=255, default='pending')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Transaction #{self.id} - {self.payment}"


class Cart(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart #{self.id} - {self.user}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='cart_items')
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"CartItem #{self.id} - Cart #{self.cart.id} - {self.product}"

class Address(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='addresses')
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    pin_code = models.CharField(max_length=10)
    address_type = models.CharField(max_length=50, default='home')
    land_mark = models.CharField(max_length=255, blank=True, null=True)
    alternate_number = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.address_type} Address - {self.city}, {self.state}"
    
class Wallet(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
            return f"Wallet #{self.id} - {self.user}"
class Coupon(models.Model):
    is_active = models.BooleanField(default=True)
    code = models.CharField(max_length=50, unique=True)
    coupon_percent = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)
    limit = models.PositiveIntegerField(default=1)
    expire_date = models.DateField()

    def __str__(self):
        return f"Coupon {self.code} - {self.coupon_percent}%"

class WalletTransaction(models.Model):
    wallet = models.ForeignKey('Wallet', on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='wallet_transactions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction #{self.id} - Wallet #{self.wallet.id}"
