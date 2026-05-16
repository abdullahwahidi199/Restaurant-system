from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Restaurant, Subscription
from users.models import Staff


class SubscriptionSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)
    days_left = serializers.ReadOnlyField()
    is_expiring_soon = serializers.ReadOnlyField()
    class Meta:
        model = Subscription
        fields = ['id', 'restaurant', 'starts_at', 'expires_at', 'is_active', 'is_valid','days_left','is_expiring_soon']

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)

        restaurant = instance.restaurant

        # sync restaurant status with subscription
        if instance.is_active:
            restaurant.is_active = True
        else:
            restaurant.is_active = False

        restaurant.save()

        return instance

class RestaurantSerializer(serializers.ModelSerializer):

    # admin creation fields (write-only)
    admin_name = serializers.CharField(write_only=True)
    admin_email = serializers.EmailField(write_only=True)
    admin_phone = serializers.CharField(write_only=True)
    admin_password = serializers.CharField(write_only=True, required=False)

    subscription = SubscriptionSerializer(read_only=True)
    qr_code = serializers.ImageField(read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            'id',
            'name',
            'slug',
            'email',
            'phone',
            'address',
            'logo',
            'qr_code',
            'is_active',
            'manager_discount_limit',
            'admin_discount_limit',
            # extra fields
            'website',
            'opening_hours',
            'facebook',
            'instagram',
            'x',
            'delivery_available',
            'base_delivery_fee',
            'price_per_km',
            'min_order_amount',
            'latitude',
            'longitude',
            'delivery_radius_km',
            'created_at',
            'updated_at',

            'subscription',

            # admin fields
            'admin_name',
            'admin_email',
            'admin_phone',
            'admin_password',
        ]
        read_only_fields = ['created_at', 'updated_at', 'slug']

    def create(self, validated_data):
        admin_name = validated_data.pop("admin_name")
        admin_email = validated_data.pop("admin_email")
        admin_phone = validated_data.pop("admin_phone")
        admin_password = validated_data.pop("admin_password", None)

        restaurant = Restaurant.objects.create(**validated_data)

        if not admin_password:
            admin_password = "12345678"

        user = User.objects.create_user(
            username=admin_name,
            email=admin_email,
            password=admin_password
        )

        Staff.objects.create(
            user=user,
            name=admin_name,
            email=admin_email,
            phone=admin_phone,
            role="Admin",
            restaurant=restaurant
        )

        return restaurant
    
    def update(self, instance, validated_data):
        # 🔥 Remove admin fields if present (don't update them)
        validated_data.pop('admin_name', None)
        validated_data.pop('admin_email', None)
        validated_data.pop('admin_phone', None)
        validated_data.pop('admin_password', None)

        # Update restaurant fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()  # This will auto-update slug based on name
        return instance