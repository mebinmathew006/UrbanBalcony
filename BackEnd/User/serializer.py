from rest_framework import serializers
from .models import CustomUser,Review,Address,Order,OrderItem,Payment,Transaction,Cart,CartItem,Wishlist,WishlistProduct
import re
from AdminPanel.serializer import ProductSimpleSerializer,ProductVariantSerializer

class LoginSerializer(serializers.Serializer):
    email=serializers.EmailField(max_length=255,required=True)
    password=serializers.CharField(required=True, min_length=8, write_only=True, error_messages={'required':'password is required',})


class CustomUserSerializer(serializers.ModelSerializer):
    profile_picture=serializers.ImageField()
    
    class Meta:
        model=CustomUser
        fields=['id','first_name','last_name','email','phone_number','profile_picture','password','is_active'] 
        extra_kwargs = {
            'password': {'write_only': True}  # Ensure password isn't returned in the response
        }
        
    def validate_first_name(self,value):
        if not re.match("^[A-Za-z\s]", value):  # Only allows letters and spaces
            raise serializers.ValidationError("first name can only contain letters")
        # Return the cleaned value (strip and capitalize)
        return value.strip().capitalize()
    
    def validate_last_name(self, value):
        if not re.match(r"^[A-Za-z\s]+$", value):
            raise serializers.ValidationError("Last name can only contain letters and spaces.")
        return value.strip() 

    def validate_profile_picture(self, value):
        if value and not value.name.endswith(('.jpg', '.jpeg', '.png')):
            raise serializers.ValidationError("Only .jpg, .jpeg, and .png file types are allowed.")
        if value.size > 5 * 1024 * 1024:  # 5 MB limit
            raise serializers.ValidationError("Image file size must be less than 5 MB.")
        return value
    
    def validate_phone_number(self, value):
        if not re.match(r"^\d{10}$", value):
            raise serializers.ValidationError("Phone number must be 10 digits.")
        return value
    
    def validate_password(self, value):
        if not len(value)>=8:
            raise serializers.ValidationError("Password length must be atlest 8.")
        return value
    # SerializerMethodField: get_<field_name>
    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url  
        return None
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        instance.is_active = True 
        if password:
            instance.set_password(password)  # Encrypt the password
        instance.save()
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)  # Encrypt the password
        instance.save()
        return instance
class ReviewAndRatingSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    class Meta:
        model=Review
        fields=['rating','description','product','user']
        
    def validate_rating(self,value):
        if value<1 or value>5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate_review(self,value):
        if len(value)<10:
            raise serializers.ValidationError("Review must be atleast 10 characters long")
        return value
    
class AddressSerializer(serializers.ModelSerializer):
    # user_id = serializers.IntegerField(write_only=True)
    class Meta:
        model=Address
        fields=['id','address_type','city','state','pin_code','land_mark','alternate_number']
    
        
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model=Payment
        fields = ['id' ,'pay_method', 'status']
        
        
class OrderItemSerializer(serializers.ModelSerializer):
    variant=ProductVariantSerializer(source='product_variant',read_only=True)
    address_details = AddressSerializer(source='order.address', read_only=True)
    payment_details = PaymentSerializer(source='order.payment', read_only=True) 
    item_amount = serializers.SerializerMethodField(read_only=True)
    
    
    class Meta:
        model = OrderItem
        fields = ['id', 'quantity', 'total_amount', 'status','product_variant','order','variant','address_details','payment_details','image_url','shipping_price_per_order','item_amount']  
    
    def get_item_amount(self, obj):
        discount = getattr(obj.order, 'discout_percentage', 0) or 0
        discounted_amount = obj.total_amount - (obj.total_amount * discount / 100)
        return round(discounted_amount, 2)  
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not self.context.get('include_address_details', False):
            data.pop('address_details', None)  
        return data

        
class OrderSerializer(serializers.ModelSerializer):
    address_details = AddressSerializer(source='address', read_only=True)
    order_items = OrderItemSerializer(many=True, read_only=True, context={'include_address_details': False})  
    payment_details = PaymentSerializer(source='payment', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'payment', 'address_details','address', 'shipping_charge', 
                  'net_amount', 'order_items', 'payment_details', 'order_date', 
                  'delivery_date', 'status','discout_percentage']

class CartItemSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSerializer(read_only=True)
    price_after_offer = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'quantity','product_variant','cart','price_after_offer']
        
    def get_price_after_offer(self, obj):
        variant_price = obj.product_variant.variant_price
        
        # Check if an active offer exists for the product
        try:
            offer = obj.product_variant.product.offers.first()
            if offer and offer.is_active:
                discount = offer.discount_percentage
                return round(variant_price - (variant_price * discount / 100), 2)
        except:
            pass
        
        return variant_price
        

class CartSerializer(serializers.ModelSerializer):
    
    cart_items = CartItemSerializer( many=True, read_only=True)  # Changed to handle multiple items
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'cart_items']  # Added id field
   
class PaymentsSerializer(serializers.ModelSerializer):
    class Meta:
        model=Payment
        fields=['user','coupon','wallet','status','pay_method']
        
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model=Transaction
        fields=['payment','status','amount']
        
        
class WishlistProductSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSerializer(read_only=True)
    class Meta:
        model=WishlistProduct
        fields = ['id','product_variant','wishlist']
class WishlistSerilaizer(serializers.ModelSerializer):
    wishlist_products = WishlistProductSerializer(many=True, read_only=True)
    class Meta:
        model=Wishlist
        fields = ['id', 'user', 'wishlist_products']

