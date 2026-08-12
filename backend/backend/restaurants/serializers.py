from django.contrib.auth.models import User
from django.db.models import Count
from rest_framework import serializers
from .branching import get_main_branch, sync_all_branch_access_staff
from .models import Branch, BranchDataMigrationLog, Restaurant, Subscription
from users.models import Staff


class BranchSerializer(serializers.ModelSerializer):
    staff_count = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    public_url = serializers.SerializerMethodField()
    qr_code = serializers.ImageField(read_only=True)

    class Meta:
        model = Branch
        fields = [
            "id",
            "restaurant",
            "name",
            "code",
            "slug",
            "address",
            "phone",
            "email",
            "latitude",
            "longitude",
            "receipt_header",
            "receipt_footer",
            "receipt_template",
            "tax_rate",
            "service_charge_rate",
            "kitchen_printer",
            "opening_hours",
            "delivery_available",
            "delivery_radius_km",
            "base_delivery_fee",
            "price_per_km",
            "min_order_amount",
            "cash_drawer_enabled",
            "cash_drawer_name",
            "logo",
            "qr_code",
            "public_url",
            "settings",
            "is_main_branch",
            "is_active",
            "staff_count",
            "can_delete",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "restaurant",
            "slug",
            "qr_code",
            "public_url",
            "created_at",
            "updated_at",
        ]

    def get_public_url(self, obj):
        return obj.get_public_url()

    def get_staff_count(self, obj):
        return obj.staff_members.count()

    def get_can_delete(self, obj):
        has_exclusive_staff = obj.staff_members.annotate(
            branch_count=Count("branches")
        ).filter(branch_count__lte=1).exists()
        return (
            not obj.is_main_branch
            and not obj.has_operational_data()
            and not has_exclusive_staff
        )

    def validate_code(self, value):
        return value.strip().upper()

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        restaurant = self.context.get("restaurant")
        is_main_branch = attrs.get(
            "is_main_branch",
            instance.is_main_branch if instance else False,
        )
        is_active = attrs.get(
            "is_active",
            instance.is_active if instance else True,
        )

        if is_main_branch and not is_active:
            raise serializers.ValidationError(
                {"is_active": "Main branch must remain active."}
            )

        if is_main_branch and restaurant:
            existing = Branch.objects.filter(
                restaurant=restaurant,
                is_main_branch=True,
            )
            if instance:
                existing = existing.exclude(pk=instance.pk)
            if existing.exists():
                raise serializers.ValidationError(
                    {"is_main_branch": "A restaurant can only have one main branch."}
                )

        if instance and instance.is_active and not is_active:
            branchless_staff = instance.staff_members.exclude(
                role__in=["Admin", "SuperAdmin"]
            ).filter(branches__is_active=True).distinct()
            branchless_staff = [
                staff for staff in branchless_staff
                if staff.branches.filter(is_active=True).count() <= 1
            ]
            if branchless_staff:
                raise serializers.ValidationError(
                    {
                        "is_active": (
                            "This branch is the only active branch for one or more "
                            "staff members."
                        )
                    }
                )

        return attrs

    def create(self, validated_data):
        restaurant = self.context["restaurant"]
        branch = Branch.objects.create(restaurant=restaurant, **validated_data)
        sync_all_branch_access_staff(restaurant)
        return branch

    def update(self, instance, validated_data):
        branch = super().update(instance, validated_data)
        sync_all_branch_access_staff(branch.restaurant)
        for staff in branch.active_staff.all():
            if not staff.can_access_branch(branch) or not branch.is_active:
                replacement = staff.get_or_set_active_branch()
                if replacement and replacement.id != staff.active_branch_id:
                    staff.active_branch = replacement
                    staff.save(update_fields=["active_branch"])
        return branch


class SubscriptionSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)
    days_left = serializers.ReadOnlyField()
    is_expiring_soon = serializers.ReadOnlyField()
    class Meta:
        model = Subscription
        fields = ['id', 'restaurant', 'starts_at', 'expires_at', 'is_active', 'is_valid','days_left','is_expiring_soon',
                  'max_branches','branches_used','branches_remaining'

                  ]

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


class BranchDataMigrationLogSerializer(serializers.ModelSerializer):
    source_branch_name = serializers.ReadOnlyField(source="source_branch.name")
    destination_branch_name = serializers.ReadOnlyField(source="destination_branch.name")
    created_by_name = serializers.ReadOnlyField(source="created_by.name")
    duration_seconds = serializers.ReadOnlyField()

    class Meta:
        model = BranchDataMigrationLog
        fields = [
            "id",
            "restaurant",
            "source_branch",
            "source_branch_name",
            "destination_branch",
            "destination_branch_name",
            "migration_type",
            "status",
            "created_by",
            "created_by_name",
            "started_at",
            "finished_at",
            "duration_seconds",
            "imported_count",
            "skipped_count",
            "failed_count",
            "summary",
            "error_message",
        ]
        read_only_fields = fields


class RestaurantSerializer(serializers.ModelSerializer):

    # admin creation fields (write-only)
    admin_name = serializers.CharField(write_only=True)
    admin_email = serializers.EmailField(write_only=True)
    admin_phone = serializers.CharField(write_only=True)
    admin_password = serializers.CharField(write_only=True, required=False)

    subscription = SubscriptionSerializer(read_only=True)
    qr_code = serializers.ImageField(read_only=True)
    public_url = serializers.SerializerMethodField()

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
            'cover_image',
            'slogan',
            'qr_code',
            'public_url',
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
        read_only_fields = ['created_at', 'updated_at', 'slug', 'public_url']

    def get_public_url(self, obj):
        return obj.get_public_url()

    def create(self, validated_data):
        admin_name = validated_data.pop("admin_name")
        admin_email = validated_data.pop("admin_email")
        admin_phone = validated_data.pop("admin_phone")
        admin_password = validated_data.pop("admin_password", None)

        validated_data.pop("menu_mode", None)
        validated_data.pop("ingredient_mode", None)
        validated_data.pop("recipe_mode", None)
        validated_data.pop("pricing_mode", None)
        restaurant = Restaurant.objects.create(
            **validated_data,
            menu_mode="separate",
            ingredient_mode="separate",
            recipe_mode="separate",
            pricing_mode="branch",
        )
        main_branch = get_main_branch(restaurant)

        if not admin_password:
            admin_password = "12345678"

        user = User.objects.create_user(
            username=admin_name,
            email=admin_email,
            password=admin_password
        )

        staff = Staff.objects.create(
            user=user,
            name=admin_name,
            email=admin_email,
            phone=admin_phone,
            role="Admin",
            restaurant=restaurant
        )
        staff.branches.add(main_branch)
        staff.active_branch = main_branch
        staff.save(update_fields=["active_branch"])
        sync_all_branch_access_staff(restaurant)

        return restaurant
    
    def update(self, instance, validated_data):
        # 🔥 Remove admin fields if present (don't update them)
        validated_data.pop('admin_name', None)
        validated_data.pop('admin_email', None)
        validated_data.pop('admin_phone', None)
        validated_data.pop('admin_password', None)
        validated_data.pop("menu_mode", None)
        validated_data.pop("ingredient_mode", None)
        validated_data.pop("recipe_mode", None)
        validated_data.pop("pricing_mode", None)

        # Update restaurant fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()  # This will auto-update slug based on name

        return instance


class PublicBranchSerializer(serializers.ModelSerializer):
    public_url = serializers.SerializerMethodField()
    effective_delivery_available = serializers.SerializerMethodField()
    effective_min_order_amount = serializers.SerializerMethodField()
    is_open = serializers.SerializerMethodField()
    qr_code = serializers.ImageField(read_only=True)

    class Meta:
        model = Branch
        fields = [
            "id",
            "name",
            "slug",
            "address",
            "phone",
            "email",
            "latitude",
            "longitude",
            "logo",
            "qr_code",
            "public_url",
            "opening_hours",
            "delivery_available",
            "effective_delivery_available",
            "effective_min_order_amount",
            "is_open",
        ]

    def get_public_url(self, obj):
        return obj.get_public_url()

    def get_effective_delivery_available(self, obj):
        if obj.delivery_available is not None:
            return obj.delivery_available
        return obj.restaurant.delivery_available

    def get_effective_min_order_amount(self, obj):
        if obj.min_order_amount is not None:
            return obj.min_order_amount
        return obj.restaurant.min_order_amount

    def get_is_open(self, obj):
        if not obj.is_active:
            return False
        opening_hours = (obj.opening_hours or obj.restaurant.opening_hours or "").lower()
        if "closed" in opening_hours:
            return False
        return True


class PublicRestaurantSerializer(serializers.ModelSerializer):
    public_url = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    qr_code = serializers.ImageField(read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            "id",
            "name",
            "slug",
            "email",
            "phone",
            "address",
            "logo",
            "cover_image",
            "slogan",
            "description",
            "qr_code",
            "public_url",
            "website",
            "opening_hours",
            "facebook",
            "instagram",
            "x",
            "delivery_available",
            "min_order_amount",
        ]

    def get_public_url(self, obj):
        return obj.get_public_url()

    def get_description(self, obj):
        return getattr(obj, "description", None) or obj.address or ""
