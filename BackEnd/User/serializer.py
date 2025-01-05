from rest_framework import serializers
from .models import CustomUser
import re

class LoginSerializer(serializers.Serializer):
    email=serializers.EmailField(max_length=255,required=True)
    password=serializers.CharField(required=True, min_length=8, write_only=True, error_messages={'required':'password is required',})


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model=CustomUser
        fields=['first_name','last_name','email','phone_number','profile_picture','password'] #__all__ if all fields are needed
        
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



        
        