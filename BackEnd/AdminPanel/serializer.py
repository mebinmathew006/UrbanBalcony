from rest_framework import serializers
from User.models import Category,Product,ProductVariant,Coupon,Offer,Banner
import re


def validate_image(value):
    if value and not value.name.endswith(('.jpg', '.jpeg', '.png')):
        raise serializers.ValidationError("Only .jpg, .jpeg, and .png file types are allowed.")
    if value.size > 5 * 1024 * 1024:  # 5 MB limit
        raise serializers.ValidationError("Image file size must be less than 5 MB.")
    return value

# Category serializer
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name']
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


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    
    # Make image fields optional
    product_img1 = serializers.ImageField(required=False, allow_null=True)
    product_img2 = serializers.ImageField(required=False, allow_null=True)
    product_img3 = serializers.ImageField(required=False, allow_null=True)
    available_quantity=serializers.IntegerField(required=False)
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'category', 'category_id', 'available_quantity', 
            'description', 'shelf_life', 'product_img1', 'product_img2', 
            'product_img3', 'price', 'is_active'
        ]
    
    def validate_title(self, value):
        return value.strip().capitalize()
    
    def validate_product_img1(self, value):
        if not value:
            return None
        return validate_image(value)
    
    def validate_product_img2(self, value):
        if not value:
            return None
        return validate_image(value)
    
    def validate_product_img3(self, value): 
        if not value:
            return None
        return validate_image(value)

  
class ProductSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'title','product_img1']
        
class ProductVariantSerializer(serializers.ModelSerializer):
    price_after_offer = serializers.FloatField(read_only=True)
    product = ProductSimpleSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'product_id', 'weight', 'variant_price', 'is_active', 'stock','price_after_offer']
    def validate_weight(self, value):
        if not value.strip():
            raise serializers.ValidationError("Weight cannot be empty")
        return value

    def validate_variant_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Variant price must be a positive integer")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock must be a positive integer")
        return value
    
    # def get_price_after_offer(self, obj):
    #     # Use the discount percentage if it exists; otherwise, return the original price
    #     discount = getattr(obj, 'product__offer__discount_percentage', 0) or 0
    #     return obj.variant_price - (obj.variant_price * discount / 100)
    
class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id',  # Primary key
            'code',  # Unique coupon code
            'coupon_percent',  # Discount percentage
            'expire_date',  # Expiry date of the coupon
            'is_active',  # Status to check if the coupon is active
        ]
        
class OfferSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Offer
        fields = [
            "id",
            "product",
            "discount_percentage",
            "created_at",
            'product_name',
            'is_active'
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_discount_percentage(self, value):
        """Ensure the discount percentage is between 1 and 100."""
        if value < 1 or value > 100:
            raise serializers.ValidationError("Discount percentage must be between 1 and 100.")
        return value
    
    def get_product_name(self, obj):
        """Retrieve the name of the related product."""
        return obj.product.title
    
class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = "__all__"