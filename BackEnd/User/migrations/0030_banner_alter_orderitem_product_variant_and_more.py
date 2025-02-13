# Generated by Django 5.1.4 on 2025-02-13 12:28

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('User', '0029_offer_is_active'),
    ]

    operations = [
        migrations.CreateModel(
            name='Banner',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='Title for the banner', max_length=255)),
                ('image', models.ImageField(help_text='Upload a banner image', upload_to='banners/')),
                ('is_active', models.BooleanField(default=True, help_text='Should this banner be displayed?')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.AlterField(
            model_name='orderitem',
            name='product_variant',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='productvariants', to='User.productvariant'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='coupon',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='coupons', to='User.coupon'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='customusers', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='payment',
            name='wallet',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='wallets', to='User.wallet'),
        ),
    ]
