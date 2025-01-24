# AdminPanel/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from User.models import Product, ProductVariant

@receiver(post_save, sender=ProductVariant)
@receiver(post_delete, sender=ProductVariant)
def update_available_quantity(sender, instance, **kwargs):
    product = instance.product
    total_stock = product.variants.filter(is_active=True).aggregate(
        total_stock=Sum('stock')
    )['total_stock'] or 0
    product.available_quantity = total_stock
    product.save()
