from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Customer
from django.contrib.auth import authenticate


class CustomerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    

    class Meta:
        model = Customer
        fields = ['username', 'phone', 'joined_at']
class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'phone']

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        password = validated_data.pop('password')
        user = User.objects.create(username=validated_data['username'])
        user.set_password(password)
        user.save()
        Customer.objects.create(user=user, phone=phone)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user and hasattr(user, 'customer'):
            data['user'] = user
            return data
        raise serializers.ValidationError("Invalid credentials or no customer profile")    