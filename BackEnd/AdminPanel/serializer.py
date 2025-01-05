from rest_framework import serializers
from User.models import Category,Product
import re

# Category serializer
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name']
        extra_kwargs = {
            'name': {
                'required': True,
                'error_messages': {
                    'required': 'Category name is required',
                    'max_length': 'Category name cannot exceed 255 characters.',
                }
            }
        }
        
    def validate_name(self, value):
        # Check if the name contains invalid characters like asterisks
        if not re.match("^[A-Za-z\s]*$", value):  # Only allows letters and spaces
            raise serializers.ValidationError("Category name can only contain letters and spaces.")
        
        # Return the cleaned value (strip and capitalize)
        return value.strip().capitalize()
    
    def create(self, validated_data):
        # Capitalize the name before saving
        validated_data['name'] = validated_data['name'].strip().capitalize()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Strip and capitalize the name
        instance.name = validated_data['name'].strip().capitalize()
        instance.save()
        return instance
    
#Product serializer

class ProdutSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product
        fields=['title','category','available_quantity','description','shelf_life','product_img1','product_img2','product_img3','price','created_at','updated_at','is_active']
        