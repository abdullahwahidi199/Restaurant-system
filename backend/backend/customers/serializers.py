from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Customer, CustomerAddress
from django.db import transaction
import math
from django.contrib.auth import authenticate


class CustomerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    orders_count = serializers.SerializerMethodField()


    class Meta:
        model = Customer
        fields = ['username','email','id', 'phone', 'joined_at','address','date_of_birth','orders_count']
    
    def get_orders_count(self, obj):
        return obj.orders.count()

   
class CustomerSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    phone = serializers.CharField(required=True)
    address = serializers.CharField(required=True)
    date_of_birth = serializers.DateField(required=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username',
            'password',
            'email',
            'phone',
            'address',
            'date_of_birth'
        ]
    def create(self, validated_data):

        phone=validated_data.pop('phone')
        address=validated_data.pop('address')
        date_of_birth=validated_data.pop('date_of_birth')
        password = validated_data.pop('password')
        email = validated_data.pop('email', "")
        username = validated_data['username']

        user=User.objects.create(username=username,email=email)
        user.set_password(password)
        user.save()

        Customer.objects.create(
            user=user,
            phone=phone,
            address=address,
            date_of_birth=date_of_birth
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


class CustomerAddressSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(required=False, allow_null=True, min_value=-90, max_value=90)
    longitude = serializers.FloatField(required=False, allow_null=True, min_value=-180, max_value=180)
    class Meta:
        model = CustomerAddress
        fields = [
            "id",
            "label",
            "address_line",
            "area",
            "city",
            "instructions",
            "latitude",
            "longitude",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        latitude = attrs.get("latitude", getattr(self.instance, "latitude", None))
        longitude = attrs.get("longitude", getattr(self.instance, "longitude", None))
        if (latitude is None) != (longitude is None):
            raise serializers.ValidationError(
                {"location": "Latitude and longitude must be provided together."}
            )
        if latitude is not None and not (math.isfinite(latitude) and math.isfinite(longitude)):
            raise serializers.ValidationError({"location": "Enter valid coordinates."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        customer = validated_data["customer"]
        Customer.objects.select_for_update().get(pk=customer.pk)
        if not customer.addresses.exists():
            validated_data["is_default"] = True
        address = super().create(validated_data)
        if address.is_default:
            customer.addresses.exclude(pk=address.pk).update(is_default=False)
        return address

    @transaction.atomic
    def update(self, instance, validated_data):
        Customer.objects.select_for_update().get(pk=instance.customer_id)
        if instance.is_default and validated_data.get("is_default") is False:
            # Clearing the only default would leave checkout without a selection.
            validated_data["is_default"] = True
        address = super().update(instance, validated_data)
        if address.is_default:
            address.customer.addresses.exclude(pk=address.pk).update(is_default=False)
        return address
