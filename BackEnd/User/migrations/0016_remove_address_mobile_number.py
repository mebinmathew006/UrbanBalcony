# Generated by Django 5.1.4 on 2025-01-10 05:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('User', '0015_coupon_address_cart_cartitem_order_orderitem_payment_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='address',
            name='mobile_number',
        ),
    ]
