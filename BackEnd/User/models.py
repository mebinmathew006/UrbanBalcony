from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.utils import timezone
from django.core.validators import MinValueValidator

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
    product_img1 = models.ImageField(upload_to='user/product_pic/', null=True, blank=True)  
    product_img2 = models.ImageField(upload_to='user/product_pic/', null=True, blank=True)  
    product_img3 = models.ImageField(upload_to='user/product_pic/', null=True, blank=True)  
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

    def __str__(self):
        return f"{self.product.title} - {self.weight}"

class Category(models.Model):
    name = models.CharField(max_length=255,unique=True)
    created_at=models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    
    

    def __str__(self):
        return self.name