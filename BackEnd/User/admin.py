from django.contrib import admin
from User.models import CustomUser,Product,ProductVariant,Category
# Register your models here.

admin.site.register(CustomUser)
admin.site.register(Product)
admin.site.register(ProductVariant)
admin.site.register(Category)
