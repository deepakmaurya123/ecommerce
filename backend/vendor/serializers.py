from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


class VendorLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if not user:
            raise serializers.ValidationError('Invalid username or password.')
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')
        if not user.userprofile.isVendor:
            raise serializers.ValidationError('User is not a vendor.')
        data['user'] = user
        return data