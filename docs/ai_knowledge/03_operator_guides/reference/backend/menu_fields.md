---
id: "operator_reference_backend_menu_fields"
title: "Menu — backend fields reference"
module: "menu"
description: "Static menu implementation evidence for model and serializer field types, defaults, choices and read-only constraints; use linked operating guides for supported UI procedures."
keywords: ["menu", "backend", "fields", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_menu_menu", "operator_modules_menu_stations", "operator_modules_production_daily_production", "operator_modules_customers_feedback"]
frontend_routes: []
source_references: ["backend/backend/menu/models.py", "backend/backend/menu/permissions.py", "backend/backend/menu/production_utils.py", "backend/backend/menu/serializers.py", "backend/backend/menu/services.py", "backend/backend/menu/signals.py", "backend/backend/menu/views.py"]
status: "source_verified"
---

# Menu — backend fields reference

Static implementation reference for `menu`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/menu/models.py`

### Station

Serializer/model rules: `ordering = ["-is_default", "name"]`; `indexes = [ models.Index(fields=["restaurant", "is_active"], name="station_rest_act_idx"), models.Index(fields=["restaurant", "is_default"], name="station_rest_def_idx"), ]`; `unique_together = [["restaurant", "name", "branch"]]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( "restaurants.Restaurant", on_delete=models.CASCADE, related_name="stations" )` |
| `branch` | `models.ForeignKey( "restaurants.Branch", on_delete=models.CASCADE, null=True, blank=True, related_name="stations", help_text="Optional: If null, the station applies to all branches of the restaurant." )` |
| `name` | `models.CharField(max_length=100)` |
| `name_dari` | `models.CharField(max_length=100, blank=True, null=True)` |
| `name_pashto` | `models.CharField(max_length=100, blank=True, null=True)` |
| `description` | `models.TextField(blank=True, null=True)` |
| `is_default` | `models.BooleanField( default=False, help_text="True if this is the default station (Main Kitchen) for the restaurant." )` |
| `is_active` | `models.BooleanField(default=True)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

### Category

Serializer/model rules: `ordering = [F("rank").asc(nulls_last=True), "id"]`; `constraints = [ models.UniqueConstraint( fields=['restaurant', 'rank'], condition=models.Q(branch__isnull=True), name='uniq_shared_category_rank' ), models.UniqueConstraint( fields=['restaurant', 'branch', 'rank'], condition=models.Q(branch__isnull=False), name='uniq_branch_category_rank' ) ]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="cat_rest_branch_idx"), models.Index(fields=["restaurant", "rank"], name="cat_rest_rank_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name='categories', null=True, blank=True )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="categories", null=True, blank=True, )` |
| `name` | `models.CharField(max_length=100)` |
| `description` | `models.TextField(blank=True, null=True)` |
| `name_dari` | `models.CharField(max_length=100, blank=True, null=True)` |
| `name_pashto` | `models.CharField(max_length=100, blank=True, null=True)` |
| `image` | `models.ImageField( upload_to='categories/', blank=True, null=True )` |
| `rank` | `models.PositiveIntegerField(blank=True, null=True)` |

### MenuItem

Serializer/model rules: `ordering = [ F("category__rank").asc(nulls_last=True), "category_id", "display_order", "id", ]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="item_rest_branch_idx"), models.Index(fields=["restaurant", "category"], name="item_rest_cat_idx"), models.Index(fields=["restaurant", "is_available"], name="item_rest_avail_idx"), models.Index(fields=["restaurant", "category", "display_order"], name="item_rest_cat_order_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `name` | `models.CharField(max_length=150)` |
| `name_dari` | `models.CharField(max_length=150, blank=True, null=True)` |
| `name_pashto` | `models.CharField(max_length=150, blank=True, null=True)` |
| `description` | `models.TextField(blank=True, null=True)` |
| `description_dari` | `models.TextField(blank=True, null=True)` |
| `description_pashto` | `models.TextField(blank=True, null=True)` |
| `restaurant` | `models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items', null=True, blank=True)` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="menu_items", null=True, blank=True, )` |
| `station` | `models.ForeignKey( Station, on_delete=models.SET_NULL, null=True, blank=True, related_name="menu_items", help_text="The kitchen station responsible for preparing this item." )` |
| `price` | `models.DecimalField(max_digits=8, decimal_places=2)` |
| `image` | `models.ImageField(upload_to='menu_items/', blank=True, null=True)` |
| `is_available` | `models.BooleanField(default=True)` |
| `is_manually_available` | `models.BooleanField(default=True)` |
| `category` | `models.ForeignKey(Category, on_delete=models.CASCADE, null=True, related_name='menu_items')` |
| `display_order` | `models.PositiveIntegerField(default=0)` |
| `uses_daily_production` | `models.BooleanField( default=False )` |

### Production

Serializer/model rules: `ordering = ['-created_at']`; `constraints = [ models.UniqueConstraint( fields=['menu_item', 'branch'], name='unique_production_per_menu_item_branch' ) ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `menu_item` | `models.ForeignKey( MenuItem, on_delete=models.CASCADE, related_name='productions' )` |
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name='productions' )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="productions", null=True, blank=True, )` |
| `quantity_produced` | `models.PositiveIntegerField( help_text="Total portions cooked in this batch" )` |
| `quantity_remaining` | `models.PositiveIntegerField( help_text="Portions still available to sell" )` |
| `notes` | `models.TextField(blank=True, null=True)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |
| `created_by` | `models.ForeignKey( 'users.Staff', # adjust to your Staff model path on_delete=models.SET_NULL, null=True, blank=True )` |

### Review

| Field | Actual type, defaults and constraints |
|---|---|
| `customer` | `models.ForeignKey(Customer,on_delete=models.CASCADE,related_name='reviews')` |
| `menu_item` | `models.ForeignKey(MenuItem,on_delete=models.CASCADE,related_name='reviews',null=True,blank=True)` |
| `restaurant` | `models.ForeignKey(Restaurant,on_delete=models.CASCADE,related_name='reviews',null=True,blank=True)` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="reviews", null=True, blank=True, )` |
| `delivery` | `models.ForeignKey('orders.Order', on_delete=models.SET_NULL, related_name='review', null=True, blank=True)` |
| `rating` | `models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])` |
| `comment` | `models.TextField(blank=True, null=True)` |
| `response` | `models.TextField(blank=True, null=True)` |
| `responded_at` | `models.DateTimeField(null=True, blank=True)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |

### Platter

Serializer/model rules: `ordering = [ F("category__rank").asc(nulls_last=True), "category_id", "display_order", "id", ]`; `indexes = [ models.Index(fields=["restaurant", "branch"], name="plat_rest_branch_idx"), models.Index(fields=["restaurant", "category"], name="plat_rest_cat_idx"), models.Index(fields=["restaurant", "is_available"], name="plat_rest_avail_idx"), models.Index(fields=["restaurant", "category", "display_order"], name="plat_rest_cat_order_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name='platters' )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="platters", null=True, blank=True, )` |
| `station` | `models.ForeignKey( Station, on_delete=models.SET_NULL, null=True, blank=True, related_name="platters", help_text="The kitchen station responsible for preparing this platter." )` |
| `name` | `models.CharField(max_length=150)` |
| `name_dari` | `models.CharField(max_length=150, blank=True, null=True)` |
| `name_pashto` | `models.CharField(max_length=150, blank=True, null=True)` |
| `description` | `models.TextField(blank=True, null=True)` |
| `description_dari` | `models.TextField(blank=True, null=True)` |
| `description_pashto` | `models.TextField(blank=True, null=True)` |
| `price` | `models.DecimalField( max_digits=8, decimal_places=2 )` |
| `image` | `models.ImageField( upload_to='platters/', blank=True, null=True )` |
| `is_available` | `models.BooleanField(default=True)` |
| `is_manually_available` | `models.BooleanField(default=True)` |
| `display_order` | `models.PositiveIntegerField(default=0)` |
| `category` | `models.ForeignKey( Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='platters' )` |

### PlatterItem

| Field | Actual type, defaults and constraints |
|---|---|
| `platter` | `models.ForeignKey( Platter, on_delete=models.CASCADE, related_name='items' )` |
| `menu_item` | `models.ForeignKey( MenuItem, on_delete=models.CASCADE, related_name='platter_items' )` |
| `quantity` | `models.DecimalField( max_digits=8, decimal_places=3, default=Decimal('1.000'), help_text="Quantity of the menu item included in this platter (supports fractional amounts like 0.5 or 0.2)." )` |

## `backend/backend/menu/serializers.py`

### StationSerializer

Serializer/model rules: `model = Station`; `fields = [ "id", "restaurant", "branch", "name", "name_dari", "name_pashto", "description", "is_default", "is_active", ]`; `read_only_fields = ["id", "restaurant"]`.


### ReveiwMiniSerializer

Serializer/model rules: `model=Review`; `fields=['id','customer','comment','rating']`.

| Field | Actual type, defaults and constraints |
|---|---|
| `customer` | `serializers.CharField(source="customer.user.username",read_only=True)` |

### MenuItemMiniSerializer

Serializer/model rules: `model = MenuItem`; `fields = ['id', 'name','name_dari','name_pashto', 'price','image','is_available', 'is_manually_available', 'final_availability','category','display_order','reviews','uses_daily_production', 'production_remaining','station','station_name']`.

| Field | Actual type, defaults and constraints |
|---|---|
| `image` | `serializers.SerializerMethodField()` |
| `production_remaining` | `serializers.SerializerMethodField()` |
| `final_availability` | `serializers.SerializerMethodField()` |
| `station` | `serializers.PrimaryKeyRelatedField( queryset=Station.objects.all(), required=False, allow_null=True )` |
| `station_name` | `serializers.CharField(source="station.name", read_only=True)` |

### CustomerMiniSerializer

Serializer/model rules: `model = Customer`; `fields = ['id', 'username']`.

| Field | Actual type, defaults and constraints |
|---|---|
| `username` | `serializers.CharField(source="user.username",read_only=True)` |

### PlatterItemSerializer

Serializer/model rules: `model = PlatterItem`; `fields = [ 'id', 'menu_item', 'menu_item_name', 'quantity' ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `menu_item_name` | `serializers.ReadOnlyField( source='menu_item.name' )` |
| `quantity` | `serializers.DecimalField( max_digits=8, decimal_places=3, coerce_to_string=False, help_text="Supports float quantities like 0.2 or 0.5." )` |

### PlatterSerializer

Serializer/model rules: `model = Platter`; `fields = [ 'id', 'restaurant', 'branch', 'category', 'category_name', 'name', 'name_dari', 'name_pashto', 'description', 'description_dari', 'description_pashto', 'price', 'image', 'is_available', 'is_manually_available', 'display_order', 'final_availability', 'unavailable_reasons', 'items', 'total_cost', 'station', 'station_name', ]`; `read_only_fields = [ 'restaurant', 'branch', ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `unavailable_reasons` | `serializers.SerializerMethodField()` |
| `category_name` | `serializers.ReadOnlyField( source='category.name' )` |
| `total_cost` | `serializers.SerializerMethodField()` |
| `station` | `serializers.PrimaryKeyRelatedField( queryset=Station.objects.all(), required=False, allow_null=True )` |
| `station_name` | `serializers.CharField(source="station.name", read_only=True)` |

### CategorySerializer

Serializer/model rules: `model = Category`; `fields = ['id','rank', 'image','name','name_dari','name_pashto', 'description','branch','menu_items','platters' ]`; `read_only_fields = ['branch']`.


### ReveiwSerializer

Serializer/model rules: `model=Review`; `fields=['id','customer','menu_item','delivery','branch','comment','rating','response','created_at','responded_at','menu_item_name','customerName']`; `read_only_fields = ['branch']`.

| Field | Actual type, defaults and constraints |
|---|---|
| `menu_item_name` | `serializers.CharField(source="menu_item.name",read_only=True)` |
| `customerName` | `serializers.CharField(source='customer.user.username',read_only=True)` |

### MenuItemSerializer

Serializer/model rules: `model = MenuItem`; `fields = ['id', 'branch', 'name','name_dari','name_pashto', 'description','description_dari','description_pashto', 'price', 'image', 'is_available', 'is_manually_available','unavailable_reasons', 'final_availability','category','display_order','reviews','ingredients','cost_per_unit','profit_per_unit', 'uses_daily_production', # 🆕 'production_remaining', # 🆕 'production_produced', 'station','station_name' ]`; `read_only_fields = ['branch']`.

| Field | Actual type, defaults and constraints |
|---|---|
| `unavailable_reasons` | `serializers.SerializerMethodField()` |
| `ingredients` | `serializers.SerializerMethodField()` |
| `image` | `serializers.ImageField(required=False, allow_null=True)` |
| `cost_per_unit` | `serializers.SerializerMethodField()` |
| `profit_per_unit` | `serializers.SerializerMethodField()` |
| `final_availability` | `serializers.SerializerMethodField()` |
| `production_remaining` | `serializers.SerializerMethodField()` |
| `production_produced` | `serializers.SerializerMethodField()` |
| `station` | `serializers.PrimaryKeyRelatedField( queryset=Station.objects.all(), required=False, allow_null=True )` |
| `station_name` | `serializers.CharField(source="station.name", read_only=True)` |

### MenuItemPrintSerializer

Serializer/model rules: `model = MenuItem`; `fields = ["name", "ingredients", "price"]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `ingredients` | `serializers.SerializerMethodField()` |

### PlatterPrintSerializer

Serializer/model rules: `model = Platter`; `fields = ["name", "items", "price"]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `items` | `serializers.SerializerMethodField()` |

### ProductionSerializer

Serializer/model rules: `model = Production`; `fields = [ 'id', 'menu_item', 'menu_item_name', 'quantity_produced', 'quantity_remaining', 'is_sold_out', 'notes', 'created_at', 'updated_at' ]`; `read_only_fields = ['quantity_remaining', 'created_at', 'updated_at']`.

| Field | Actual type, defaults and constraints |
|---|---|
| `menu_item_name` | `serializers.CharField(source='menu_item.name', read_only=True)` |
| `is_sold_out` | `serializers.BooleanField(read_only=True)` |


A model default does not necessarily make a UI field optional. `blank=True` permits an empty model-form/serializer value; `null=True` permits database null; explicit serializer `required`, `read_only_fields`, validators, and create services can change the API requirement. Model fields without blank/null/default are ordinarily required by an automatic ModelSerializer field unless overridden. `SerializerMethodField`, `ReadOnlyField`, auto timestamps and explicitly read-only fields are calculated/server-owned. Dynamic querysets restrict choices to the current restaurant/branch. A model `clean()` method is not automatically a DRF validator.

## Related operating procedures

- [Manage categories, menu items, recipes, and platters](../../modules/menu/menu.md)
- [Configure preparation stations and kitchen assignments](../../modules/menu/stations.md)
- [Cook, adjust, clear, and inspect daily production](../../modules/production/daily_production.md)
- [Review customer feedback and respond](../../modules/customers/feedback.md)
