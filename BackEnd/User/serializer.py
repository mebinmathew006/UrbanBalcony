from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'username', 'email', 'phone_number', 'password', 'profile_picture', 'is_active')
        extra_kwargs = {
            'password': {'write_only': True},
            'profile_picture': {'required': False},  # Optional field
        }

    def validate_profile_picture(self, value):
        """
        Validates the profile picture uploaded by the user.
        """
        if value:
            # Ensure the uploaded file is an image
            if not value.content_type.startswith('image/'):
                raise serializers.ValidationError("The uploaded file must be an image.")
        return value

    def create(self, validated_data):
        """
        Overrides the default create method to handle password securely.
        """
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
