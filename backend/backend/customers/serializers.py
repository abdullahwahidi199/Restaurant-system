from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Customer
from django.contrib.auth import authenticate


class CustomerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Customer
        fields = ['username','email','id', 'phone', 'joined_at','address','date_of_birth','gender']
class CustomerSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    # phone = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)

    phone = serializers.CharField(required=True)
    address = serializers.CharField(required=True)
    date_of_birth = serializers.DateField(required=True)
    gender = serializers.ChoiceField(
        choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')],
        required=True
    )
    class Meta:
        model = User
        fields = ['username', 'password','email','phone', 'address', 'date_of_birth', 'gender']

    def create(self, validated_data):
        phone=validated_data.pop('phone')
        address=validated_data.pop('address')
        date_of_birth=validated_data.pop('date_of_birth')
        gender=validated_data.pop('gender')

        password = validated_data.pop('password')
        email = validated_data.pop('email')
        username = validated_data['username']

        user=User.objects.create(username=username,email=email)
        user.set_password(password)
        user.save()

        Customer.objects.create(
            user=user,
            phone=phone,
            address=address,
            date_of_birth=date_of_birth,
            gender=gender
        )
        return user
        # phone = validated_data.pop('phone')
        # password = validated_data.pop('password')
        # user = User.objects.create(username=validated_data['username'])
        # user.set_password(password)
        # user.save()
        # Customer.objects.create(user=user, phone=phone)
        # return user


class CustomerLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user and hasattr(user, 'customer'):
            data['user'] = user
            return data
        raise serializers.ValidationError("Invalid credentials or no customer profile")    