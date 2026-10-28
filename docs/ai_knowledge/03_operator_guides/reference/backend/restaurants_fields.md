---
id: "operator_reference_backend_restaurants_fields"
title: "Restaurants — backend fields reference"
module: "branches"
description: "Static restaurants implementation evidence for model and serializer field types, defaults, choices and read-only constraints; use linked operating guides for supported UI procedures."
keywords: ["restaurants", "backend", "fields", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_branches_branches", "operator_modules_settings_restaurant_branch_settings", "operator_modules_administration_platform", "operator_navigation_application_navigation"]
frontend_routes: []
source_references: ["backend/backend/restaurants/branching.py", "backend/backend/restaurants/data_migration.py", "backend/backend/restaurants/models.py", "backend/backend/restaurants/permissions.py", "backend/backend/restaurants/serializers.py", "backend/backend/restaurants/views.py"]
status: "source_verified"
---

# Restaurants — backend fields reference

Static implementation reference for `restaurants`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/restaurants/models.py`

### Restaurant

Accepted choice values: `DATA_MODE_CHOICES = [ ("separate", "Separate"), ]`; `PRICING_MODE_CHOICES = [ ("branch", "Branch Pricing"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `name` | `models.CharField(max_length=255)` |
| `slug` | `models.SlugField(unique=True, blank=True)` |
| `email` | `models.EmailField(unique=True)` |
| `phone` | `models.CharField(max_length=20)` |
| `address` | `models.TextField()` |
| `logo` | `models.ImageField(upload_to='restaurant_logos/', null=True, blank=True)` |
| `cover_image` | `models.ImageField( upload_to='restaurant_covers/', null=True, blank=True, )` |
| `slogan` | `models.TextField(blank=True, null=True)` |
| `is_active` | `models.BooleanField(default=True)` |
| `show_on_landing` | `models.BooleanField(default=False)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `min_order_amount` | `models.DecimalField( max_digits=10, decimal_places=2, default=0 )` |
| `manager_discount_limit` | `models.DecimalField( max_digits=5, decimal_places=2, default=10 )` |
| `admin_discount_limit` | `models.DecimalField( max_digits=5, decimal_places=2, default=100 )` |
| `menu_mode` | `models.CharField( max_length=20, choices=DATA_MODE_CHOICES, default="separate", )` |
| `ingredient_mode` | `models.CharField( max_length=20, choices=DATA_MODE_CHOICES, default="separate", )` |
| `recipe_mode` | `models.CharField( max_length=20, choices=DATA_MODE_CHOICES, default="separate", )` |
| `pricing_mode` | `models.CharField( max_length=20, choices=PRICING_MODE_CHOICES, default="branch", )` |
| `delivery_radius_km` | `models.DecimalField( max_digits=5, decimal_places=2, default=5 )` |
| `base_delivery_fee` | `models.DecimalField( max_digits=6, decimal_places=2, default=0 )` |
| `price_per_km` | `models.DecimalField( max_digits=6, decimal_places=2, default=0 )` |
| `latitude` | `models.FloatField(null=True, blank=True)` |
| `longitude` | `models.FloatField(null=True, blank=True)` |
| `website` | `models.URLField(blank=True, null=True)` |
| `opening_hours` | `models.CharField(max_length=100, blank=True, null=True)` |
| `facebook` | `models.URLField(blank=True, null=True)` |
| `instagram` | `models.URLField(blank=True, null=True)` |
| `x` | `models.URLField(blank=True, null=True)` |
| `delivery_available` | `models.BooleanField(default=True)` |
| `qr_code` | `models.ImageField(upload_to='qr_codes/', blank=True, null=True)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

### Subscription

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.OneToOneField( Restaurant, on_delete=models.CASCADE, related_name="subscription" )` |
| `starts_at` | `models.DateField()` |
| `expires_at` | `models.DateField()` |
| `max_branches` | `models.PositiveIntegerField(default=1)` |
| `is_active` | `models.BooleanField(default=True)` |

### Branch

Serializer/model rules: `unique_together = ("restaurant", "code")`; `constraints = [ models.UniqueConstraint( fields=["restaurant"], condition=models.Q(is_main_branch=True), name="unique_main_branch_per_restaurant", ), models.UniqueConstraint( fields=["restaurant", "slug"], name="unique_branch_slug_per_restaurant", ) ]`; `ordering = ["-is_main_branch", "name"]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="branches" )` |
| `name` | `models.CharField(max_length=255)` |
| `code` | `models.CharField(max_length=50)` |
| `slug` | `models.SlugField(max_length=255, blank=True)` |
| `address` | `models.TextField(blank=True)` |
| `phone` | `models.CharField(max_length=20, blank=True)` |
| `email` | `models.EmailField(blank=True)` |
| `latitude` | `models.FloatField(null=True, blank=True)` |
| `longitude` | `models.FloatField(null=True, blank=True)` |
| `receipt_header` | `models.CharField(max_length=255, blank=True)` |
| `receipt_footer` | `models.TextField(blank=True)` |
| `receipt_template` | `models.TextField(blank=True)` |
| `tax_rate` | `models.DecimalField( max_digits=6, decimal_places=3, null=True, blank=True, )` |
| `service_charge_rate` | `models.DecimalField( max_digits=6, decimal_places=3, null=True, blank=True, )` |
| `kitchen_printer` | `models.CharField(max_length=120, blank=True)` |
| `opening_hours` | `models.CharField(max_length=120, blank=True)` |
| `delivery_available` | `models.BooleanField(null=True, blank=True)` |
| `delivery_radius_km` | `models.DecimalField( max_digits=5, decimal_places=2, null=True, blank=True, )` |
| `base_delivery_fee` | `models.DecimalField( max_digits=6, decimal_places=2, null=True, blank=True, )` |
| `price_per_km` | `models.DecimalField( max_digits=6, decimal_places=2, null=True, blank=True, )` |
| `min_order_amount` | `models.DecimalField( max_digits=10, decimal_places=2, null=True, blank=True, )` |
| `cash_drawer_enabled` | `models.BooleanField(default=True)` |
| `cash_drawer_name` | `models.CharField(max_length=120, blank=True)` |
| `logo` | `models.ImageField(upload_to="branch_logos/", null=True, blank=True)` |
| `qr_code` | `models.ImageField(upload_to="branch_qr_codes/", blank=True, null=True)` |
| `settings` | `models.JSONField(default=dict, blank=True)` |
| `is_main_branch` | `models.BooleanField(default=False)` |
| `is_active` | `models.BooleanField(default=True)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

### BranchDataMigrationLog

Accepted choice values: `STATUS_CHOICES = [ ("running", "Running"), ("completed", "Completed"), ("failed", "Failed"), ]`; `MIGRATION_TYPE_CHOICES = [ ("ingredients", "Ingredients"), ("categories", "Menu Categories"), ("menu_items", "Menu Items"), ("platters", "Platters"), ("modifiers", "Modifiers"), ("everything", "Everything"), ]`.

Serializer/model rules: `ordering = ["-started_at"]`; `indexes = [ models.Index(fields=["restaurant", "started_at"], name="bdm_rest_started_idx"), models.Index(fields=["destination_branch", "status"], name="bdm_dest_status_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="branch_data_migrations", )` |
| `source_branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="outgoing_data_migrations", )` |
| `destination_branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="incoming_data_migrations", )` |
| `migration_type` | `models.CharField(max_length=30, choices=MIGRATION_TYPE_CHOICES)` |
| `status` | `models.CharField(max_length=20, choices=STATUS_CHOICES, default="running")` |
| `created_by` | `models.ForeignKey( "users.Staff", on_delete=models.SET_NULL, null=True, blank=True, related_name="branch_data_migrations", )` |
| `started_at` | `models.DateTimeField(default=timezone.now)` |
| `finished_at` | `models.DateTimeField(null=True, blank=True)` |
| `imported_count` | `models.PositiveIntegerField(default=0)` |
| `skipped_count` | `models.PositiveIntegerField(default=0)` |
| `failed_count` | `models.PositiveIntegerField(default=0)` |
| `summary` | `models.JSONField(default=dict, blank=True)` |
| `error_message` | `models.TextField(blank=True)` |

## `backend/backend/restaurants/serializers.py`

### BranchSerializer

Serializer/model rules: `model = Branch`; `fields = [ "id", "restaurant", "name", "code", "slug", "address", "phone", "email", "latitude", "longitude", "receipt_header", "receipt_footer", "receipt_template", "tax_rate", "service_charge_rate", "kitchen_printer", "opening_hours", "delivery_available", "delivery_radius_km", "base_delivery_fee", "price_per_km", "min_order_amount", "cash_drawer_enabled", "cash_drawer_name", "logo", "qr_code", "public_url", "settings", "is_main_branch", "is_active", "staff_count", "can_delete", "created_at", "updated_at", ]`; `read_only_fields = [ "restaurant", "slug", "qr_code", "public_url", "created_at", "updated_at", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `staff_count` | `serializers.SerializerMethodField()` |
| `can_delete` | `serializers.SerializerMethodField()` |
| `public_url` | `serializers.SerializerMethodField()` |
| `qr_code` | `serializers.ImageField(read_only=True)` |

### SubscriptionSerializer

Serializer/model rules: `model = Subscription`; `fields = ['id', 'restaurant', 'starts_at', 'expires_at', 'is_active', 'is_valid','days_left','is_expiring_soon', 'max_branches','branches_used','branches_remaining' ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `is_valid` | `serializers.BooleanField(read_only=True)` |
| `days_left` | `serializers.ReadOnlyField()` |
| `is_expiring_soon` | `serializers.ReadOnlyField()` |

### BranchDataMigrationLogSerializer

Serializer/model rules: `model = BranchDataMigrationLog`; `fields = [ "id", "restaurant", "source_branch", "source_branch_name", "destination_branch", "destination_branch_name", "migration_type", "status", "created_by", "created_by_name", "started_at", "finished_at", "duration_seconds", "imported_count", "skipped_count", "failed_count", "summary", "error_message", ]`; `read_only_fields = fields`.

| Field | Actual type, defaults and constraints |
|---|---|
| `source_branch_name` | `serializers.ReadOnlyField(source="source_branch.name")` |
| `destination_branch_name` | `serializers.ReadOnlyField(source="destination_branch.name")` |
| `created_by_name` | `serializers.ReadOnlyField(source="created_by.name")` |
| `duration_seconds` | `serializers.ReadOnlyField()` |

### RestaurantSerializer

Serializer/model rules: `model = Restaurant`; `fields = [ 'id', 'name', 'slug', 'email', 'phone', 'address', 'logo', 'cover_image', 'slogan', 'qr_code', 'public_url', 'is_active', 'show_on_landing', 'manager_discount_limit', 'admin_discount_limit', # extra fields 'website', 'opening_hours', 'facebook', 'instagram', 'x', 'delivery_available', 'base_delivery_fee', 'price_per_km', 'min_order_amount', 'latitude', 'longitude', 'delivery_radius_km', 'created_at', 'updated_at', 'subscription', # admin fields 'admin_name', 'admin_email', 'admin_phone', 'admin_password', ]`; `read_only_fields = ['created_at', 'updated_at', 'slug', 'public_url']`.

| Field | Actual type, defaults and constraints |
|---|---|
| `admin_name` | `serializers.CharField( write_only=True, max_length=150, validators=[UnicodeUsernameValidator()], )` |
| `admin_email` | `serializers.EmailField(write_only=True)` |
| `admin_phone` | `serializers.CharField(write_only=True)` |
| `admin_password` | `serializers.CharField( write_only=True, required=False, allow_blank=True, )` |
| `qr_code` | `serializers.ImageField(read_only=True)` |
| `public_url` | `serializers.SerializerMethodField()` |

### PublicBranchSerializer

Serializer/model rules: `model = Branch`; `fields = [ "id", "name", "slug", "address", "phone", "email", "latitude", "longitude", "logo", "qr_code", "public_url", "opening_hours", "delivery_available", "effective_delivery_available", "effective_min_order_amount", "base_delivery_fee", "price_per_km", "delivery_radius_km", "is_main_branch", "is_open", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `public_url` | `serializers.SerializerMethodField()` |
| `effective_delivery_available` | `serializers.SerializerMethodField()` |
| `effective_min_order_amount` | `serializers.SerializerMethodField()` |
| `base_delivery_fee` | `serializers.SerializerMethodField()` |
| `price_per_km` | `serializers.SerializerMethodField()` |
| `delivery_radius_km` | `serializers.SerializerMethodField()` |
| `is_open` | `serializers.SerializerMethodField()` |
| `qr_code` | `serializers.ImageField(read_only=True)` |

### PublicRestaurantSerializer

Serializer/model rules: `model = Restaurant`; `fields = [ "id", "name", "slug", "email", "phone", "address", "logo", "cover_image", "slogan", "description", "qr_code", "public_url", "website", "opening_hours", "facebook", "instagram", "x", "delivery_available", "min_order_amount", "base_delivery_fee", "price_per_km", "delivery_radius_km", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `public_url` | `serializers.SerializerMethodField()` |
| `description` | `serializers.SerializerMethodField()` |
| `qr_code` | `serializers.ImageField(read_only=True)` |

### DiscoveryBranchSerializer

Serializer/model rules: `model = Branch`; `fields = [ "id", "name", "slug", "address", "phone", "latitude", "longitude", "logo", "public_url", "opening_hours", "is_main_branch", "delivery_available", "delivery_radius_km", "base_delivery_fee", "price_per_km", "min_order_amount", "is_open", "distance_km", "delivers_to_location", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `public_url` | `serializers.SerializerMethodField()` |
| `delivery_available` | `serializers.SerializerMethodField()` |
| `delivery_radius_km` | `serializers.SerializerMethodField()` |
| `base_delivery_fee` | `serializers.SerializerMethodField()` |
| `price_per_km` | `serializers.SerializerMethodField()` |
| `min_order_amount` | `serializers.SerializerMethodField()` |
| `is_open` | `serializers.SerializerMethodField()` |
| `distance_km` | `serializers.SerializerMethodField()` |
| `delivers_to_location` | `serializers.SerializerMethodField()` |

### DiscoveryMenuItemSerializer

Serializer/model rules: `model = MenuItem`; `fields = [ "id", "type", "name", "name_dari", "name_pashto", "description", "description_dari", "description_pashto", "price", "image", "category", "category_dari", "category_pashto", "restaurant_id", "restaurant_name", "restaurant_slug", "branch_id", "is_available", "order_count", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `type` | `serializers.SerializerMethodField()` |
| `category` | `serializers.CharField(source="category.name", allow_null=True)` |
| `category_dari` | `serializers.CharField( source="category.name_dari", allow_null=True, )` |
| `category_pashto` | `serializers.CharField( source="category.name_pashto", allow_null=True, )` |
| `restaurant_name` | `serializers.CharField(source="restaurant.name")` |
| `restaurant_slug` | `serializers.CharField(source="restaurant.slug")` |
| `is_available` | `serializers.SerializerMethodField()` |
| `order_count` | `serializers.SerializerMethodField()` |

### DiscoveryPlatterSerializer

Serializer/model rules: `model = Platter`; `fields = [ "id", "type", "name", "name_dari", "name_pashto", "description", "description_dari", "description_pashto", "price", "image", "category", "category_dari", "category_pashto", "restaurant_id", "restaurant_name", "restaurant_slug", "branch_id", "is_available", "order_count", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `type` | `serializers.SerializerMethodField()` |
| `category` | `serializers.CharField(source="category.name", allow_null=True)` |
| `category_dari` | `serializers.CharField( source="category.name_dari", allow_null=True, )` |
| `category_pashto` | `serializers.CharField( source="category.name_pashto", allow_null=True, )` |
| `restaurant_name` | `serializers.CharField(source="restaurant.name")` |
| `restaurant_slug` | `serializers.CharField(source="restaurant.slug")` |
| `is_available` | `serializers.SerializerMethodField()` |
| `order_count` | `serializers.SerializerMethodField()` |

### DiscoveryRestaurantSerializer

Serializer/model rules: `model = Restaurant`; `fields = [ "id", "name", "slug", "slogan", "address", "phone", "logo", "cover_image", "public_url", "opening_hours", "delivery_available", "delivery_radius_km", "base_delivery_fee", "price_per_km", "min_order_amount", "rating", "review_count", "is_open", "distance_km", "delivers_to_location", "branches", "cuisines", "cuisine_details", "dishes", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `public_url` | `serializers.SerializerMethodField()` |
| `rating` | `serializers.FloatField(read_only=True, allow_null=True)` |
| `review_count` | `serializers.IntegerField(read_only=True)` |
| `is_open` | `serializers.SerializerMethodField()` |
| `distance_km` | `serializers.SerializerMethodField()` |
| `delivers_to_location` | `serializers.SerializerMethodField()` |
| `branches` | `serializers.SerializerMethodField()` |
| `cuisines` | `serializers.SerializerMethodField()` |
| `cuisine_details` | `serializers.SerializerMethodField()` |
| `dishes` | `serializers.SerializerMethodField()` |


A model default does not necessarily make a UI field optional. `blank=True` permits an empty model-form/serializer value; `null=True` permits database null; explicit serializer `required`, `read_only_fields`, validators, and create services can change the API requirement. Model fields without blank/null/default are ordinarily required by an automatic ModelSerializer field unless overridden. `SerializerMethodField`, `ReadOnlyField`, auto timestamps and explicitly read-only fields are calculated/server-owned. Dynamic querysets restrict choices to the current restaurant/branch. A model `clean()` method is not automatically a DRF validator.

## Related operating procedures

- [Manage branches, public links, and configuration migration](../../modules/branches/branches.md)
- [Restaurant settings, delivery defaults, branding, and branch overrides](../../modules/settings/restaurant_branch_settings.md)
- [Platform restaurant, subscription, and login-security administration](../../modules/administration/platform.md)
- [Sign in, choose a branch, and navigate](../../navigation/application_navigation.md)
