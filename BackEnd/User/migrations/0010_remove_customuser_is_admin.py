# Generated by Django 5.1.4 on 2025-01-04 06:56

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('User', '0009_customuser_is_staff'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='is_admin',
        ),
    ]
