---
id: "operator_reference_backend_orders_fields"
title: "Orders — backend fields reference"
module: "orders"
description: "Static orders implementation evidence for model and serializer field types, defaults, choices and read-only constraints; use linked operating guides for supported UI procedures."
keywords: ["orders", "backend", "fields", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_orders_order_lists", "operator_forms_order_entry", "operator_modules_billing_cashier", "operator_modules_reservations_reservations", "operator_modules_discounts_requests"]
frontend_routes: []
source_references: ["backend/backend/orders/models.py", "backend/backend/orders/seriailizers.py", "backend/backend/orders/signals.py", "backend/backend/orders/views.py"]
status: "source_verified"
---

# Orders — backend fields reference

Static implementation reference for `orders`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/orders/models.py`

### Table

Accepted choice values: `STATUS_CHOICES = [ ('available', 'Available'), ('occupied', 'Occupied'), ('unavailable', 'Unavailable'), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="tables", null=True, blank=True )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="tables", null=True, blank=True, )` |
| `price_per_hour` | `models.DecimalField(max_digits=10, decimal_places=2, default=0)` |
| `allow_free_reservation` | `models.BooleanField(default=True)` |
| `name` | `models.CharField(max_length=50,null=True,blank=True)` |
| `capacity` | `models.PositiveIntegerField(default=4)` |
| `status` | `models.CharField(max_length=20, choices=STATUS_CHOICES, default="available")` |
| `note` | `models.TextField(blank=True, null=True)` |

### Reservation

Accepted choice values: `TYPE_CHOICES = [ ('free', 'Free'), ('fee', 'Reservation Fee'), ('prepaid', 'Prepaid'), ]`; `STATUS_CHOICES = [ ('reserved', 'Reserved'), ('arrived', 'Arrived'), ('cancelled', 'Cancelled'), ('completed', 'Completed'), ('no_show','No Show') ]`.

Serializer/model rules: `constraints = [ models.UniqueConstraint( fields=['restaurant', 'reservation_number'], name='unique_reservation_number_per_restaurant' ) ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reservations')` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="reservations", null=True, blank=True, )` |
| `table` | `models.ForeignKey( Table, on_delete=models.CASCADE, related_name='reservations' )` |
| `reservation_number` | `models.PositiveIntegerField( null=True, blank=True )` |
| `customer_name` | `models.CharField(max_length=120)` |
| `phone` | `models.CharField(max_length=20, blank=True)` |
| `guests` | `models.PositiveIntegerField(default=1)` |
| `reservation_date` | `models.DateField()` |
| `start_time` | `models.DateTimeField(null=True, blank=True)` |
| `duration_minutes` | `models.PositiveIntegerField(default=60)` |
| `reservation_type` | `models.CharField(max_length=20, choices=TYPE_CHOICES, default='free')` |
| `amount` | `models.DecimalField(max_digits=10, decimal_places=2, default=0)` |
| `paid_amount` | `models.DecimalField(max_digits=10, decimal_places=2, default=0)` |
| `status` | `models.CharField(max_length=20, choices=STATUS_CHOICES, default='reserved')` |
| `created_by` | `models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True,related_name='reservations')` |
| `notes` | `models.TextField(blank=True, null=True)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |

### DiscountCard

Accepted choice values: `STATUS_CHOICES = [ ("active", "Active"), ("inactive", "Inactive"), ("expired", "Expired"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="discount_cards" )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="discount_cards", null=True, blank=True, )` |
| `card_name` | `models.CharField(max_length=100)` |
| `card_number` | `models.CharField(max_length=50, unique=True)` |
| `customer_name` | `models.CharField(max_length=100)` |
| `customer_phone` | `models.CharField(max_length=20)` |
| `discount_percentage` | `models.DecimalField( max_digits=5, decimal_places=2 )` |
| `minimum_order_amount` | `models.DecimalField( max_digits=10, decimal_places=2, default=0 )` |
| `valid_from` | `models.DateField()` |
| `valid_until` | `models.DateField()` |
| `usage_limit` | `models.PositiveIntegerField( null=True, blank=True )` |
| `used_count` | `models.PositiveIntegerField(default=0)` |
| `status` | `models.CharField( max_length=20, choices=STATUS_CHOICES, default="active" )` |
| `notes` | `models.TextField(blank=True)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |

### Order

Accepted choice values: `ORDER_TYPE_CHOICES = [ ('dine-in', 'Dine-In'), ('takeaway', 'Takeaway'), ('delivery', 'Delivery'), ]`; `STATUS_CHOICES = [ # Common ('pending', 'Pending'), ('in_progress', 'In Progress'), ('ready', 'Ready'), ('completed', 'Completed'), ('cancelled', 'Cancelled'), # Dine-in specific ('served', 'Served'), # Takeaway specific ('picked_up', 'Picked Up'), # Delivery specific ('out_for_delivery', 'Out for Delivery'), ('delivered', 'Delivered'), ]`.

Serializer/model rules: `constraints = [ models.UniqueConstraint( fields=['restaurant', 'order_number'], name='unique_order_number_per_restaurant' ) ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `order_number` | `models.PositiveIntegerField(null=True, blank=True)` |
| `client_order_id` | `models.CharField( max_length=64, null=True, blank=True, unique=True, help_text="Client-generated idempotency key for marketplace orders.", )` |
| `customer` | `models.ForeignKey( 'customers.Customer', on_delete=models.SET_NULL, related_name='orders', null=True, blank=True )` |
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="orders", null=True, blank=True )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.CASCADE, related_name="orders", null=True, blank=True, )` |
| `reservation` | `models.ForeignKey( "Reservation", on_delete=models.SET_NULL, null=True, blank=True, related_name="orders" )` |
| `discount_card` | `models.ForeignKey( "DiscountCard", on_delete=models.SET_NULL, null=True, blank=True, related_name="orders" )` |
| `order_type` | `models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES)` |
| `name` | `models.CharField(max_length=100)` |
| `phone` | `models.CharField(max_length=15,null=True,blank=True)` |
| `preparation_start` | `models.DateTimeField(null=True, blank=True)` |
| `preparation_end` | `models.DateTimeField(null=True, blank=True)` |
| `discount_percent` | `models.DecimalField(max_digits=5, decimal_places=2, default=0)` |
| `discount_amount` | `models.DecimalField(max_digits=10, decimal_places=2, default=0)` |
| `stock_deducted` | `models.BooleanField(default=False)` |
| `address` | `models.TextField(blank=True)` |
| `table` | `models.ForeignKey( 'Table', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders' )` |
| `status` | `models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')` |
| `note` | `models.TextField(blank=True, null=True)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `latitude` | `models.FloatField(null=True, blank=True)` |
| `longitude` | `models.FloatField(null=True, blank=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |
| `is_printed` | `models.BooleanField(default=False)` |
| `created_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_orders' )` |
| `received_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name='paid_orders')` |
| `paid_at` | `models.DateTimeField(null=True, blank=True)` |
| `delivery_boy` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'DeliveryBoy'}, related_name='deliveries' )` |
| `delivery_fee` | `models.DecimalField( max_digits=6, decimal_places=2, default=0 )` |

### OrderItem

Accepted choice values: `ITEM_STATUS_CHOICES = [ ('pending', 'Pending'), ('approved', 'Approved'), ('in_progress', 'In Progress'), ('ready', 'Ready'), ('cancelled', 'Cancelled'), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `status` | `models.CharField( max_length=20, choices=ITEM_STATUS_CHOICES, default='pending' )` |
| `order` | `models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')` |
| `menu_item` | `models.ForeignKey( MenuItem, on_delete=models.CASCADE, null=True, blank=True )` |
| `platter` | `models.ForeignKey( Platter, on_delete=models.CASCADE, null=True, blank=True )` |
| `added_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="added_order_items" )` |
| `approved_at` | `models.DateTimeField(null=True, blank=True)` |
| `started_at` | `models.DateTimeField(null=True, blank=True)` |
| `ready_at` | `models.DateTimeField(null=True, blank=True)` |
| `cancelled_at` | `models.DateTimeField(null=True, blank=True)` |
| `cancelled_by` | `models.ForeignKey( Staff, null=True, blank=True, on_delete=models.SET_NULL, related_name="cancelled_items" )` |
| `price_at_order` | `models.DecimalField( max_digits=8, decimal_places=2, null=True, blank=True, help_text="Price of the item/platter when this order was placed" )` |
| `quantity` | `models.PositiveIntegerField(default=1)` |
| `is_new` | `models.BooleanField(default=False)` |
| `is_printed_to_kitchen` | `models.BooleanField(default=False)` |
| `description` | `models.TextField(blank=True, null=True)` |

### DiscountRequest

Accepted choice values: `STATUS_CHOICES = [ ("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `order` | `models.ForeignKey(Order, on_delete=models.CASCADE, related_name="discount_requests")` |
| `requested_by` | `models.ForeignKey(Staff, on_delete=models.CASCADE, related_name="discount_requests")` |
| `discount_percent` | `models.DecimalField(max_digits=5, decimal_places=2)` |
| `reason` | `models.TextField()` |
| `status` | `models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")` |
| `approved_by` | `models.ForeignKey( Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_discounts" )` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `approved_at` | `models.DateTimeField(null=True, blank=True)` |

## `backend/backend/orders/seriailizers.py`

### DiscountCardSerializer

Serializer/model rules: `model = DiscountCard`; `fields = "__all__"`; `read_only_fields = ( "id", "used_count", "created_at", "restaurant", "branch", )`.


### OrderItemSerializer

Serializer/model rules: `model = OrderItem`; `fields = [ 'id', 'menu_item', 'platter', 'menu_item_details', 'platter_details', "station_id", "station_name", 'item_name', 'item_price', 'price_at_order', 'status', 'quantity', 'subtotal', 'added_by_name', 'table_name', 'is_new', 'is_printed_to_kitchen', # 'is_prepared', 'description', ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `item_name` | `serializers.SerializerMethodField()` |
| `item_price` | `serializers.SerializerMethodField()` |
| `subtotal` | `serializers.SerializerMethodField()` |
| `station_id` | `serializers.SerializerMethodField()` |
| `station_name` | `serializers.SerializerMethodField()` |
| `added_by_name` | `serializers.SerializerMethodField()` |
| `table_name` | `serializers.ReadOnlyField( source="order.table.name" )` |

### OrderMiniSerializer

Serializer/model rules: `model = Order`; `fields = ['id','name', 'phone', 'items', 'total', 'order_number', 'status','created_at','status']`.

| Field | Actual type, defaults and constraints |
|---|---|
| `total` | `serializers.SerializerMethodField()` |

### DeliveryBoyMiniSerializer

Serializer/model rules: `model = Staff`; `fields = ['id', 'name', 'vehicle_number']`.


### TableSerializer

Serializer/model rules: `model=Table`; `fields=['id','name','capacity','note','status','branch','orders','current_order',"price_per_hour", "allow_free_reservation", "current_reservation", "upcoming_reservation", ]`; `read_only_fields = ["branch"]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `orders` | `serializers.SerializerMethodField()` |
| `current_order` | `serializers.SerializerMethodField()` |
| `current_reservation` | `serializers.SerializerMethodField()` |
| `upcoming_reservation` | `serializers.SerializerMethodField()` |

### TablePanelOrderItemSerializer

Serializer/model rules: `model = OrderItem`; `fields = [ "id", "item_name", "status", "quantity", "is_new", "added_by_name", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `item_name` | `serializers.SerializerMethodField()` |
| `added_by_name` | `serializers.SerializerMethodField()` |

### TablePanelOrderSerializer

Serializer/model rules: `model = Order`; `fields = [ "id", "name", "phone", "items", "item_count", "total", "order_number", "status", "created_at", "updated_at", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `total` | `serializers.SerializerMethodField()` |
| `item_count` | `serializers.SerializerMethodField()` |

### TablePanelSerializer

Serializer/model rules: `model = Table`; `fields = [ "id", "name", "capacity", "note", "status", "branch", "current_order", "price_per_hour", "allow_free_reservation", "current_reservation", "upcoming_reservation", ]`; `read_only_fields = ["branch"]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `current_order` | `serializers.SerializerMethodField()` |
| `current_reservation` | `serializers.SerializerMethodField()` |
| `upcoming_reservation` | `serializers.SerializerMethodField()` |

### ReservationMiniSerializer

Serializer/model rules: `model = Reservation`; `fields = [ "id", "table", "table_name", "customer_name","reservation_number", "guests", "reservation_date", "start_time", "duration_minutes","end_time", "amount", "paid_amount", "total_price", "created_at", ]`; `read_only_fields = ["amount", "created_at", "end_time", "total_price"]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `table_name` | `serializers.ReadOnlyField(source="table.name")` |
| `total_price` | `serializers.ReadOnlyField()` |
| `end_time` | `serializers.ReadOnlyField()` |

### ReservationSerializer

Serializer/model rules: `model = Reservation`; `fields = [ "id", "table", "table_name", "customer_name", "phone","reservation_number", "branch", "guests", "reservation_date", "start_time", "duration_minutes", "end_time", "reservation_type", "amount", "paid_amount", "total_price", "status", "created_by", "created_by_name", "notes", "created_at", ]`; `read_only_fields = [ "amount", "created_at", "end_time", "total_price", "branch", "created_by", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `table_name` | `serializers.ReadOnlyField(source="table.name")` |
| `created_by_name` | `serializers.ReadOnlyField(source="created_by.name")` |
| `end_time` | `serializers.SerializerMethodField()` |
| `total_price` | `serializers.SerializerMethodField()` |

### TableMiniSerializer

Serializer/model rules: `model=Table`; `fields=['number']`.


### DiscountRequestSerializer

Serializer/model rules: `model = DiscountRequest`; `fields = [ "id", "order", "discount_percent", "reason", "status", "requested_by_name", "approved_by_name", "created_at", "approved_at", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `requested_by_name` | `serializers.CharField(source="requested_by.user.get_full_name", read_only=True)` |
| `approved_by_name` | `serializers.CharField(source="approved_by.user.get_full_name", read_only=True)` |

### OrderSerializer

Serializer/model rules: `model = Order`; `fields = [ 'id', 'customer', 'name', 'phone', 'address','longitude','latitude', 'note','tableName','reservation_payment','remaining_total',"manager_discount_limit", "admin_discount_limit",'distance_km', 'order_type','table', 'branch', 'order_type_display', 'status', 'status_display','is_printed','order_number','discount_percent','discount_requests', 'created_at','created_by','paid_at','received_by','created_by_name','received_by_name', 'updated_at','delivery_boy','delivery_fee','delivery_boy_details', 'items', 'total','preparation_time', ]`; `read_only_fields = [ 'created_at', 'updated_at', 'total', 'branch', 'status', 'created_by', 'paid_at', 'received_by', ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `total` | `serializers.SerializerMethodField()` |
| `order_type_display` | `serializers.CharField(source='get_order_type_display', read_only=True)` |
| `status_display` | `serializers.CharField(source='get_status_display', read_only=True)` |
| `table` | `serializers.PrimaryKeyRelatedField(queryset=Table.objects.all(), required=False)` |
| `tableName` | `serializers.CharField(source="table.name", read_only=True)` |
| `manager_discount_limit` | `serializers.SerializerMethodField()` |
| `admin_discount_limit` | `serializers.SerializerMethodField()` |
| `delivery_boy` | `serializers.PrimaryKeyRelatedField( queryset=Staff.objects.filter(role='DeliveryBoy'), required=False, allow_null=True )` |
| `distance_km` | `serializers.FloatField( required=False, write_only=True )` |
| `reservation_payment` | `serializers.SerializerMethodField()` |
| `preparation_time` | `serializers.ReadOnlyField()` |
| `created_by_name` | `serializers.CharField(source='created_by.user.get_full_name', read_only=True)` |
| `received_by_name` | `serializers.CharField(source='received_by.user.get_full_name', read_only=True)` |
| `remaining_total` | `serializers.SerializerMethodField()` |
| `discount_percent` | `serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)` |

### OrderListSerializer

Serializer/model rules: `model = Order`; `fields = [ "id", "order_number", "name", "total", "tableName", "order_type", "status", "status_display", "created_by_name", "received_by_name", "created_at", "updated_at", "paid_at", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `total` | `serializers.SerializerMethodField()` |
| `status_display` | `serializers.CharField( source='get_status_display', read_only=True )` |
| `tableName` | `serializers.CharField( source='table.name', read_only=True )` |
| `created_by_name` | `serializers.CharField( source='created_by.user.get_full_name', read_only=True )` |
| `received_by_name` | `serializers.CharField( source='received_by.user.get_full_name', read_only=True )` |

### DiscountRequestSerializer

Serializer/model rules: `model = DiscountRequest`; `fields = [ "id", "order", "order_number", "table_name", "customer_name", "discount_percent", "reason", "status", "original_total", "final_total", "requested_by", "requested_by_name", "approved_by", "approved_by_name", "created_at", "approved_at", ]`; `read_only_fields = [ "status", "requested_by", "approved_by", "approved_at", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `requested_by_name` | `serializers.CharField( source="requested_by.name", read_only=True )` |
| `approved_by_name` | `serializers.CharField( source="approved_by.name", read_only=True )` |
| `order_number` | `serializers.IntegerField( source="order.order_number", read_only=True )` |
| `table_name` | `serializers.CharField( source="order.table.name", read_only=True )` |
| `customer_name` | `serializers.CharField( source="order.name", read_only=True )` |
| `original_total` | `serializers.SerializerMethodField()` |
| `final_total` | `serializers.SerializerMethodField()` |

### OrderItemMiniSerializer

Serializer/model rules: `model = OrderItem`; `fields = [ 'id', 'menu_item', 'platter', 'item_name', 'item_price', 'price_at_order', 'status', 'quantity', 'description', 'is_new', 'added_by_name', "station_id", "station_name", ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `item_name` | `serializers.SerializerMethodField()` |
| `item_price` | `serializers.SerializerMethodField()` |
| `added_by_name` | `serializers.SerializerMethodField()` |
| `station_id` | `serializers.SerializerMethodField()` |
| `station_name` | `serializers.SerializerMethodField()` |


A model default does not necessarily make a UI field optional. `blank=True` permits an empty model-form/serializer value; `null=True` permits database null; explicit serializer `required`, `read_only_fields`, validators, and create services can change the API requirement. Model fields without blank/null/default are ordinarily required by an automatic ModelSerializer field unless overridden. `SerializerMethodField`, `ReadOnlyField`, auto timestamps and explicitly read-only fields are calculated/server-owned. Dynamic querysets restrict choices to the current restaurant/branch. A model `clean()` method is not automatically a DRF validator.

## Related operating procedures

- [Browse order history, details, and cancellation](../../modules/orders/order_lists.md)
- [Create dine-in, takeaway, and staff delivery orders](../../forms/order_entry.md)
- [Cashier queue, receipts, payment completion, and delivery settlement](../../modules/billing/cashier.md)
- [Book tables, record arrival, and handle reservations](../../modules/reservations/reservations.md)
- [Request, approve, or reject a manual discount](../../modules/discounts/requests.md)
