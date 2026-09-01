from django.contrib.auth.models import User
from django.db.models import Count
from rest_framework import serializers
from menu.models import MenuItem, Platter
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
            'show_on_landing',
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


def _branch_is_open(branch):
    if not branch.is_active:
        return False
    opening_hours = " ".join((
        branch.opening_hours
        or branch.restaurant.opening_hours
        or ""
    ).lower().split())
    if opening_hours in {"open", "open now", "always open", "24/7", "24 hours"}:
        return True
    if opening_hours in {"closed", "closed today"}:
        return False
    # Opening hours are currently free text and restaurants have no configured
    # timezone, so guessing from a range or weekly schedule can mislabel them.
    return None


def _effective_branch_value(branch, field_name):
    value = getattr(branch, field_name)
    if value is not None:
        return value
    return getattr(branch.restaurant, field_name)


class DiscoveryBranchSerializer(serializers.ModelSerializer):
    public_url = serializers.SerializerMethodField()
    delivery_available = serializers.SerializerMethodField()
    delivery_radius_km = serializers.SerializerMethodField()
    base_delivery_fee = serializers.SerializerMethodField()
    price_per_km = serializers.SerializerMethodField()
    min_order_amount = serializers.SerializerMethodField()
    is_open = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField()
    delivers_to_location = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = [
            "id",
            "name",
            "slug",
            "address",
            "phone",
            "latitude",
            "longitude",
            "logo",
            "public_url",
            "opening_hours",
            "is_main_branch",
            "delivery_available",
            "delivery_radius_km",
            "base_delivery_fee",
            "price_per_km",
            "min_order_amount",
            "is_open",
            "distance_km",
            "delivers_to_location",
        ]

    def get_public_url(self, obj):
        return obj.get_public_url()

    def get_delivery_available(self, obj):
        return _effective_branch_value(obj, "delivery_available")

    def get_delivery_radius_km(self, obj):
        return _effective_branch_value(obj, "delivery_radius_km")

    def get_base_delivery_fee(self, obj):
        return _effective_branch_value(obj, "base_delivery_fee")

    def get_price_per_km(self, obj):
        return _effective_branch_value(obj, "price_per_km")

    def get_min_order_amount(self, obj):
        return _effective_branch_value(obj, "min_order_amount")

    def get_is_open(self, obj):
        return _branch_is_open(obj)

    def get_distance_km(self, obj):
        return getattr(obj, "_discovery_distance_km", None)

    def get_delivers_to_location(self, obj):
        return getattr(obj, "_discovery_delivers_to_location", None)


class DiscoveryMenuItemSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    category = serializers.CharField(source="category.name", allow_null=True)
    category_dari = serializers.CharField(
        source="category.name_dari",
        allow_null=True,
    )
    category_pashto = serializers.CharField(
        source="category.name_pashto",
        allow_null=True,
    )
    restaurant_name = serializers.CharField(source="restaurant.name")
    restaurant_slug = serializers.CharField(source="restaurant.slug")
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "type",
            "name",
            "name_dari",
            "name_pashto",
            "description",
            "description_dari",
            "description_pashto",
            "price",
            "image",
            "category",
            "category_dari",
            "category_pashto",
            "restaurant_id",
            "restaurant_name",
            "restaurant_slug",
            "branch_id",
            "is_available",
        ]

    def get_type(self, obj):
        return "menu_item"

    def get_is_available(self, obj):
        return bool(obj.is_available and obj.is_manually_available)


class DiscoveryPlatterSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    category = serializers.CharField(source="category.name", allow_null=True)
    category_dari = serializers.CharField(
        source="category.name_dari",
        allow_null=True,
    )
    category_pashto = serializers.CharField(
        source="category.name_pashto",
        allow_null=True,
    )
    restaurant_name = serializers.CharField(source="restaurant.name")
    restaurant_slug = serializers.CharField(source="restaurant.slug")
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = Platter
        fields = [
            "id",
            "type",
            "name",
            "name_dari",
            "name_pashto",
            "description",
            "description_dari",
            "description_pashto",
            "price",
            "image",
            "category",
            "category_dari",
            "category_pashto",
            "restaurant_id",
            "restaurant_name",
            "restaurant_slug",
            "branch_id",
            "is_available",
        ]

    def get_type(self, obj):
        return "platter"

    def get_is_available(self, obj):
        return bool(obj.is_available and obj.is_manually_available)


def _discovery_dish_sort_key(dish):
    return (
        not bool(dish.image),
        dish.display_order,
        dish.name.casefold(),
        dish.pk,
    )


def serialize_discovery_dish(dish, context):
    serializer_class = (
        DiscoveryPlatterSerializer
        if isinstance(dish, Platter)
        else DiscoveryMenuItemSerializer
    )
    return serializer_class(dish, context=context).data


def serialize_discovery_cuisine(category, context):
    image_url = None
    if category.image:
        try:
            image_url = category.image.url
            request = context.get("request")
            if request:
                image_url = request.build_absolute_uri(image_url)
        except ValueError:
            image_url = None

    return {
        "id": category.id,
        "name": category.name.strip(),
        "name_dari": category.name_dari,
        "name_pashto": category.name_pashto,
        "image": image_url,
    }


class DiscoveryRestaurantSerializer(serializers.ModelSerializer):
    public_url = serializers.SerializerMethodField()
    rating = serializers.FloatField(read_only=True, allow_null=True)
    review_count = serializers.IntegerField(read_only=True)
    is_open = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField()
    delivers_to_location = serializers.SerializerMethodField()
    branches = serializers.SerializerMethodField()
    cuisines = serializers.SerializerMethodField()
    cuisine_details = serializers.SerializerMethodField()
    dishes = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = [
            "id",
            "name",
            "slug",
            "slogan",
            "address",
            "phone",
            "logo",
            "cover_image",
            "public_url",
            "opening_hours",
            "delivery_available",
            "delivery_radius_km",
            "base_delivery_fee",
            "price_per_km",
            "min_order_amount",
            "rating",
            "review_count",
            "is_open",
            "distance_km",
            "delivers_to_location",
            "branches",
            "cuisines",
            "cuisine_details",
            "dishes",
        ]

    def get_public_url(self, obj):
        return obj.get_public_url()

    def get_is_open(self, obj):
        branches = getattr(obj, "_discovery_branches", ())
        states = [_branch_is_open(branch) for branch in branches]
        if any(state is True for state in states):
            return True
        if states and all(state is False for state in states):
            return False
        return None

    def get_distance_km(self, obj):
        return getattr(obj, "_discovery_distance_km", None)

    def get_delivers_to_location(self, obj):
        return getattr(obj, "_discovery_delivers_to_location", None)

    def get_branches(self, obj):
        branches = getattr(obj, "_discovery_branches", ())
        return DiscoveryBranchSerializer(
            branches,
            many=True,
            context=self.context,
        ).data

    def get_cuisines(self, obj):
        categories = getattr(obj, "_discovery_categories", ())
        seen = set()
        names = []
        for category in categories:
            key = category.name.strip().casefold()
            if key and key not in seen:
                seen.add(key)
                names.append(category.name.strip())
        return names

    def get_cuisine_details(self, obj):
        categories = getattr(obj, "_discovery_categories", ())
        seen = set()
        details = []
        for category in categories:
            key = category.name.strip().casefold()
            if key and key not in seen:
                seen.add(key)
                details.append(serialize_discovery_cuisine(category, self.context))
        return details

    def get_dishes(self, obj):
        dishes = [
            *getattr(obj, "_discovery_menu_items", ()),
            *getattr(obj, "_discovery_platters", ()),
        ]
        dishes.sort(key=_discovery_dish_sort_key)
        return [
            serialize_discovery_dish(dish, self.context)
            for dish in dishes[:8]
        ]


def build_discovery_cuisines(restaurants, context):
    cuisines = {}

    for restaurant in restaurants:
        seen_for_restaurant = set()
        for category in getattr(restaurant, "_discovery_categories", ()):
            name = category.name.strip()
            key = name.casefold()
            if not key:
                continue

            if key not in cuisines:
                cuisines[key] = serialize_discovery_cuisine(category, context)
                cuisines[key]["restaurant_count"] = 0

            if key not in seen_for_restaurant:
                cuisines[key]["restaurant_count"] += 1
                seen_for_restaurant.add(key)

    return sorted(
        cuisines.values(),
        key=lambda cuisine: (-cuisine["restaurant_count"], cuisine["name"].casefold()),
    )


def build_discovery_dishes(restaurants, context, limit=30):
    dishes = []
    for restaurant in restaurants:
        restaurant_dishes = [
            *getattr(restaurant, "_discovery_menu_items", ()),
            *getattr(restaurant, "_discovery_platters", ()),
        ]
        restaurant_dishes.sort(key=_discovery_dish_sort_key)
        dishes.extend(restaurant_dishes)

    dishes.sort(key=_discovery_dish_sort_key)
    return [
        serialize_discovery_dish(dish, context)
        for dish in dishes[:limit]
    ]
