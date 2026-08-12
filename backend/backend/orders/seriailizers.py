from rest_framework import serializers
from menu.serializers import MenuItemSerializer,PlatterSerializer
from menu.models import MenuItem, Platter
from customers.serializers import CustomerProfileSerializer
from .models import OrderItem,Order,Table,Reservation,DiscountRequest,DiscountCard
from customers.models import Customer
from users.models import Staff
from django.utils import timezone
from decimal import Decimal
from .utils.distance import calculate_distance_km,calculate_delivery_fee
from restaurants.branching import get_active_branch


def scope_order_menu_queryset(queryset, restaurant, branch):
    return queryset.filter(branch=branch)


def get_branch_decimal(branch, restaurant, field_name):
    branch_value = getattr(branch, field_name, None) if branch else None
    if branch_value is not None:
        return branch_value
    return getattr(restaurant, field_name)







class DiscountCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountCard
        fields = "__all__"
        read_only_fields = (
            "id",
            "used_count",
            "created_at",
            "restaurant",
            "branch",
        )
        
class OrderItemSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()
    item_price = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    station_id = serializers.SerializerMethodField()
    station_name = serializers.SerializerMethodField()

    menu_item_details = MenuItemSerializer(
        source='menu_item',
        read_only=True
    )

    platter_details = PlatterSerializer(
        source='platter',
        read_only=True
    )
    added_by_name = serializers.SerializerMethodField()

    table_name = serializers.ReadOnlyField(
        source="order.table.name"
    )

    class Meta:
        model = OrderItem

        fields = [
            'id',

            'menu_item',
            'platter',

            'menu_item_details',
            'platter_details',
             "station_id", "station_name",
            'item_name',
            'item_price',
            'price_at_order',
            'status',
            'quantity',
            'subtotal',
            'added_by_name',
            'table_name',
            'is_new',
            'is_printed_to_kitchen',
            # 'is_prepared',
            'description',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        restaurant = self.context.get("restaurant")
        branch = self.context.get("branch")
        request = self.context.get("request")
        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)
        if restaurant:
            self.fields["menu_item"].queryset = scope_order_menu_queryset(
                MenuItem.objects.filter(restaurant=restaurant),
                restaurant,
                branch,
            )
            self.fields["platter"].queryset = scope_order_menu_queryset(
                Platter.objects.filter(restaurant=restaurant),
                restaurant,
                branch,
            )

    def get_station_id(self, obj):
        station = getattr(obj, "target_station", None)
        return station.id if station else None

    def get_station_name(self, obj):
        station = getattr(obj, "target_station", None)
        return station.name if station else "Main Kitchen"

    def validate(self, data):
        menu_item = data.get("menu_item")
        platter = data.get("platter")

        if not menu_item and not platter:
            raise serializers.ValidationError(
                "Either menu_item or platter is required."
            )

        if menu_item and platter:
            raise serializers.ValidationError(
                "Cannot have both menu_item and platter."
            )

        return data

    def get_added_by_name(self, obj):
        if obj.is_new and obj.added_by:
            return obj.added_by.name
        return None
    def get_item_name(self, obj):
        if obj.menu_item:
            return obj.menu_item.name

        if obj.platter:
            return obj.platter.name

        return None

    def get_item_price(self, obj):
        branch = getattr(obj.order, "branch", None)

        if obj.menu_item:
            return str(obj.menu_item.get_effective_price(branch))

        if obj.platter:
            return str(obj.platter.get_effective_price(branch))

        return "0"

    def get_subtotal(self, obj):
        return str(obj.get_subtotal())

class OrderMiniSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id','name', 'phone', 'items', 'total', 'order_number', 'status','created_at','status']

    def get_total(self, obj):
        return str(obj.get_total())

class DeliveryBoyMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = ['id', 'name', 'vehicle_number']

class TableSerializer(serializers.ModelSerializer):
    orders = serializers.SerializerMethodField()
    current_order=serializers.SerializerMethodField()
    current_reservation = serializers.SerializerMethodField()
    upcoming_reservation=serializers.SerializerMethodField()
    class Meta:
        model=Table
        fields=['id','name','capacity','note','status','branch','orders','current_order',"price_per_hour",
            "allow_free_reservation",
            "current_reservation",
            "upcoming_reservation",

]   
        read_only_fields = ["branch"]
    def get_current_order(self, obj):
        request = self.context.get("request")
        branch = get_active_branch(request, raise_exception=False) if request else None
        order = obj.orders.filter(
            status__in=['pending', 'in_progress', 'ready', 'served'],
            branch=branch,
        ).first() if branch else obj.current_order
        if order:
            return OrderMiniSerializer(order).data
        return None
    def get_orders(self, obj):
        request = self.context.get("request")
        restaurant = getattr(request, "restaurant", None)

        branch = get_active_branch(request, raise_exception=False) if request else None
        orders = obj.orders.filter(branch=branch) if branch else obj.orders.none()

        return OrderMiniSerializer(orders, many=True).data
    

    def get_current_reservation(self, obj):
        now = timezone.now()
        request = self.context.get("request")
        branch = get_active_branch(request, raise_exception=False) if request else None

        # 1️⃣ Check ARRIVED reservations (but validate time)
        reservation = obj.reservations.filter(
            status="arrived"
        ).order_by("-start_time")
        if branch:
            reservation = reservation.filter(branch=branch)

        for r in reservation:
            if r.end_time and now <= r.end_time:
                return {
                    "id": r.id,
                    "customer_name": r.customer_name,
                    "customer_phone": r.phone,
                    "time": r.start_time,
                    "duration": r.duration_minutes,
                }

        # 2️⃣ Check RESERVED (auto-active)
        reservation = obj.reservations.filter(
            status="reserved",
            start_time__lte=now
        ).order_by("-start_time")
        if branch:
            reservation = reservation.filter(branch=branch)

        for r in reservation:
            if r.end_time and now <= r.end_time:
                return {
                    "id": r.id,
                    "customer_name": r.customer_name,
                    "customer_phone": r.phone,
                    "time": r.start_time,
                    "duration": r.duration_minutes
                }

        return None
    def get_upcoming_reservation(self, obj):
        now = timezone.now()
        request = self.context.get("request")
        branch = get_active_branch(request, raise_exception=False) if request else None

        reservations = obj.reservations.filter(
            status="reserved",
            start_time__gt=now
        )
        if branch:
            reservations = reservations.filter(branch=branch)
        reservation = reservations.order_by("start_time").first()

        if reservation:
            return {
                "customer_name": reservation.customer_name,
                "time": reservation.start_time,
                "time": reservation.start_time,
                "duration":reservation.duration_minutes
            }

        return None


class TablePanelOrderItemSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()
    added_by_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "item_name",
            "status",
            "quantity",
            "is_new",
            "added_by_name",
        ]

    def get_item_name(self, obj):
        if obj.menu_item:
            return obj.menu_item.name
        if obj.platter:
            return obj.platter.name
        return None

    def get_added_by_name(self, obj):
        if obj.is_new and obj.added_by:
            return obj.added_by.name
        return None


class TablePanelOrderSerializer(serializers.ModelSerializer):
    items = TablePanelOrderItemSerializer(many=True)
    total = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "name",
            "phone",
            "items",
            "item_count",
            "total",
            "order_number",
            "status",
            "created_at",
        ]

    def get_total(self, obj):
        return str(obj.get_total())

    def get_item_count(self, obj):
        prefetched_items = getattr(obj, "_prefetched_objects_cache", {}).get("items")
        if prefetched_items is not None:
            return len([item for item in prefetched_items if item.status != "cancelled"])
        return obj.items.exclude(status="cancelled").count()


class TablePanelSerializer(serializers.ModelSerializer):
    current_order = serializers.SerializerMethodField()
    current_reservation = serializers.SerializerMethodField()
    upcoming_reservation = serializers.SerializerMethodField()

    class Meta:
        model = Table
        fields = [
            "id",
            "name",
            "capacity",
            "note",
            "status",
            "branch",
            "current_order",
            "price_per_hour",
            "allow_free_reservation",
            "current_reservation",
            "upcoming_reservation",
        ]
        read_only_fields = ["branch"]

    def get_current_order(self, obj):
        orders = getattr(obj, "prefetched_active_orders", None)
        if orders is None:
            request = self.context.get("request")
            branch = get_active_branch(request, raise_exception=False) if request else None
            query = obj.orders.filter(
                status__in=["pending", "in_progress", "ready", "served"]
            )
            if branch:
                query = query.filter(branch=branch)
            orders = query.prefetch_related(
                "items__menu_item",
                "items__platter",
                "items__added_by",
            )

        order = orders[0] if orders else None
        return TablePanelOrderSerializer(order).data if order else None

    def get_current_reservation(self, obj):
        now = timezone.now()
        reservations = getattr(obj, "prefetched_panel_reservations", None)

        if reservations is None:
            request = self.context.get("request")
            branch = get_active_branch(request, raise_exception=False) if request else None
            reservations = obj.reservations.filter(status__in=["arrived", "reserved"])
            if branch:
                reservations = reservations.filter(branch=branch)
            reservations = reservations.order_by("-start_time")

        arrived = sorted([
            r for r in reservations
            if r.status == "arrived" and r.end_time and now <= r.end_time
        ], key=lambda r: r.start_time or now, reverse=True)
        current_reserved = sorted([
            r for r in reservations
            if (
                r.status == "reserved"
                and r.start_time
                and r.start_time <= now
                and r.end_time
                and now <= r.end_time
            )
        ], key=lambda r: r.start_time or now, reverse=True)
        reservation = arrived[0] if arrived else (current_reserved[0] if current_reserved else None)

        if reservation:
            return {
                "id": reservation.id,
                "customer_name": reservation.customer_name,
                "customer_phone": reservation.phone,
                "time": reservation.start_time,
                "duration": reservation.duration_minutes,
            }
        return None

    def get_upcoming_reservation(self, obj):
        now = timezone.now()
        reservations = getattr(obj, "prefetched_panel_reservations", None)

        if reservations is None:
            request = self.context.get("request")
            branch = get_active_branch(request, raise_exception=False) if request else None
            reservations = obj.reservations.filter(status="reserved", start_time__gt=now)
            if branch:
                reservations = reservations.filter(branch=branch)
            reservation = reservations.order_by("start_time").first()
        else:
            upcoming = [
                r for r in reservations
                if r.status == "reserved" and r.start_time and r.start_time > now
            ]
            reservation = upcoming[0] if upcoming else None

        if reservation:
            return {
                "id": reservation.id,
                "customer_name": reservation.customer_name,
                "time": reservation.start_time,
                "duration": reservation.duration_minutes,
            }
        return None
        

from rest_framework import serializers
from .models import Reservation, Table
from django.utils import timezone
from datetime import timedelta
from math import ceil

class ReservationMiniSerializer(serializers.ModelSerializer):
    table_name = serializers.ReadOnlyField(source="table.name")
    total_price = serializers.ReadOnlyField()
    end_time = serializers.ReadOnlyField()

    class Meta:
        model = Reservation
        fields = [
            "id", "table", "table_name", "customer_name","reservation_number",
            "guests", "reservation_date", "start_time", "duration_minutes","end_time",
 "amount", "paid_amount",
            "total_price", 
           "created_at",
        ]
        read_only_fields = ["amount", "created_at", "end_time", "total_price"]
    def get_end_time(self, obj):
        return obj.end_time

    def get_total_price(self, obj):
        return obj.total_price

class ReservationSerializer(serializers.ModelSerializer):
    table_name = serializers.ReadOnlyField(source="table.name")
    created_by_name = serializers.ReadOnlyField(source="created_by.name")
    end_time = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            "id", "table", "table_name", "customer_name", "phone","reservation_number",
            "branch",
            "guests", "reservation_date", "start_time", "duration_minutes",
            "end_time", "reservation_type", "amount", "paid_amount",
            "total_price", "status", "created_by", "created_by_name",
            "notes", "created_at",
        ]
        read_only_fields = [
            "amount",
            "created_at",
            "end_time",
            "total_price",
            "branch",
            "created_by",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        restaurant = self.context.get("restaurant")
        branch = self.context.get("branch")
        request = self.context.get("request")

        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

        if restaurant:
            tables = Table.objects.filter(restaurant=restaurant)
            if branch:
                tables = tables.filter(branch=branch)
            self.fields["table"].queryset = tables

    def get_end_time(self, obj):
        return obj.end_time

    def get_total_price(self, obj):
        return obj.total_price

    # ─── VALIDATION ───────────────────────────────────────────
    def validate(self, data):
        # Resolve values (support both create & update)
        table = data.get("table") or getattr(self.instance, "table", None)
        start_time = data.get("start_time") or getattr(self.instance, "start_time", None)
        reservation_date = data.get("reservation_date")
        duration_minutes = data.get("duration_minutes") or getattr(self.instance, "duration_minutes", 0)
        reservation_type = data.get("reservation_type") or getattr(self.instance, "reservation_type", None)
        guests = data.get("guests", 1)

        errors = {}
        branch = self.context.get("branch")
        if not branch:
            request = self.context.get("request")
            branch = get_active_branch(request, raise_exception=False) if request else None

        if branch and table and table.branch_id and table.branch_id != branch.id:
            errors["table"] = "This table belongs to another branch."

        # ── 1. Auto-derive reservation_date from start_time ──
        if start_time and not reservation_date:
            data["reservation_date"] = start_time.date()
            reservation_date = data["reservation_date"]

        # ── 2. Date consistency ──
        if start_time and reservation_date:
            if start_time.date() != reservation_date:
                errors["start_time"] = (
                    "Start time date must match reservation date."
                )

        # ── 3. Prevent past reservations ──
        now = timezone.now()
        if start_time and start_time < now and not self.instance:
            errors["start_time"] = "Cannot create a reservation in the past."

        # ── 4. Duration minimum ──
        if duration_minutes and duration_minutes < 30:
            errors["duration_minutes"] = "Duration must be at least 30 minutes."

        # ── 5. Capacity check ──
        if table and guests > table.capacity:
            errors["guests"] = (
                f"Table \"{table.name}\" only seats {table.capacity} guests. "
                f"Please reduce guests or choose a larger table."
            )

        # ── 6. Free reservation rule ──
        if reservation_type == "free" and table and not table.allow_free_reservation:
            errors["reservation_type"] = (
                f"Table \"{table.name}\" does not allow free reservations. "
                f"Rate: {table.price_per_hour}/hr."
            )

        # Raise collected errors before overlap check
        if errors:
            raise serializers.ValidationError(errors)

        # ── 7. Overlap check with detailed conflict info ──
        end_time = None
        if start_time and duration_minutes:
            end_time = start_time + timedelta(minutes=duration_minutes)

        if table and reservation_date and start_time and end_time:
            qs = Reservation.objects.filter(
                table=table,
                branch=branch,
                reservation_date=reservation_date,
                status__in=["reserved", "arrived"],
            )

            if self.instance:
                qs = qs.exclude(id=self.instance.id)

            for r in qs:
                r_end = r.end_time
                if r.start_time and r_end:
                    if r.start_time < end_time and r_end > start_time:
                        conflict_start = timezone.localtime(r.start_time).strftime("%I:%M %p")
                        conflict_end = timezone.localtime(r_end).strftime("%I:%M %p")
                        raise serializers.ValidationError({
                            "start_time": (
                                f"⚠ Time conflict! Table \"{table.name}\" is already booked by "
                                f"\"{r.customer_name}\" from {conflict_start} to {conflict_end}. "
                                f"Please choose a different time slot."
                            )
                        })

        return data

    # ─── CREATE ────────────────────────────────────────────────
    def create(self, validated_data):
        table = validated_data["table"]
        reservation_type = validated_data["reservation_type"]
        duration = validated_data.get("duration_minutes", 0)

        hours = duration / 60
        billed_hours = ceil(hours)
        total = billed_hours * float(table.price_per_hour)

        validated_data["amount"] = 0 if reservation_type == "free" else total

        return super().create(validated_data)

    # ─── UPDATE ────────────────────────────────────────────────
    def update(self, instance, validated_data):
        table = validated_data.get("table", instance.table)
        reservation_type = validated_data.get("reservation_type", instance.reservation_type)
        duration = validated_data.get("duration_minutes", instance.duration_minutes)

        hours = duration / 60
        billed_hours = ceil(hours)
        total = billed_hours * float(table.price_per_hour)

        validated_data["amount"] = 0 if reservation_type == "free" else total

        return super().update(instance, validated_data)

class TableMiniSerializer(serializers.ModelSerializer):
    
    class Meta:
        model=Table
        fields=['number']

class DiscountRequestSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.CharField(source="requested_by.user.get_full_name", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by.user.get_full_name", read_only=True)

    class Meta:
        model = DiscountRequest
        fields = [
            "id",
            "order",
            "discount_percent",
            "reason",
            "status",
            "requested_by_name",
            "approved_by_name",
            "created_at",
            "approved_at",
        ]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    total = serializers.SerializerMethodField()
    order_type_display = serializers.CharField(source='get_order_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    table = serializers.PrimaryKeyRelatedField(queryset=Table.objects.all(), required=False)
    tableName = serializers.CharField(source="table.name", read_only=True)
    manager_discount_limit = serializers.SerializerMethodField()
    admin_discount_limit = serializers.SerializerMethodField()
    delivery_boy = serializers.PrimaryKeyRelatedField(
        queryset=Staff.objects.filter(role='DeliveryBoy'),
        required=False,
        allow_null=True
    )
    distance_km = serializers.FloatField(
    required=False,
    write_only=True
)
    delivery_boy_details = DeliveryBoyMiniSerializer(source='delivery_boy', read_only=True)
    reservation_payment = serializers.SerializerMethodField()
    preparation_time = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.user.get_full_name', read_only=True)
    received_by_name = serializers.CharField(source='received_by.user.get_full_name', read_only=True)
    remaining_total = serializers.SerializerMethodField()
    discount_percent = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    discount_requests = DiscountRequestSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'name', 'phone', 'address','longitude','latitude', 'note','tableName','reservation_payment','remaining_total',"manager_discount_limit",
            "admin_discount_limit",'distance_km',
            'order_type','table', 'branch', 'order_type_display', 'status', 'status_display','is_printed','order_number','discount_percent','discount_requests',
            'created_at','created_by','paid_at','received_by','created_by_name','received_by_name', 'updated_at','delivery_boy','delivery_fee','delivery_boy_details', 'items', 'total','preparation_time',
        ]
        read_only_fields = ['created_at', 'updated_at', 'total', 'branch']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        restaurant = self.context.get("restaurant")
        branch = self.context.get("branch")
        request = self.context.get("request")

        if not restaurant and request and hasattr(request.user, "staff_profile"):
            restaurant = request.user.staff_profile.restaurant

        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

        if restaurant:
            tables = Table.objects.filter(restaurant=restaurant)
            delivery_staff = Staff.objects.filter(
                role="DeliveryBoy",
                restaurant=restaurant,
            )
            menu_items = MenuItem.objects.filter(restaurant=restaurant)
            platters = Platter.objects.filter(restaurant=restaurant)

            if branch:
                tables = tables.filter(branch=branch)
                delivery_staff = delivery_staff.filter(branches=branch)

            menu_items = scope_order_menu_queryset(menu_items, restaurant, branch)
            platters = scope_order_menu_queryset(platters, restaurant, branch)

            self.fields["table"].queryset = tables
            self.fields["delivery_boy"].queryset = delivery_staff
            self.fields["items"].child.fields["menu_item"].queryset = menu_items
            self.fields["items"].child.fields["platter"].queryset = platters

    def validate(self, data):
        # DINE-IN validation
        if data.get('order_type') == 'dine-in' and not data.get('table'):
            raise serializers.ValidationError("A dine-in order must have a table.")

        restaurant = self.context.get("restaurant")
        branch = self.context.get("branch")
        if not branch:
            request = self.context.get("request")
            branch = get_active_branch(request, raise_exception=False) if request else None
        items = data.get("items", [])
        order_type = data.get("order_type")

        table = data.get("table")
        if branch and table and table.branch_id and table.branch_id != branch.id:
            raise serializers.ValidationError(
                {"table": "This table belongs to another branch."}
            )

        delivery_boy = data.get("delivery_boy")
        if branch and delivery_boy and not delivery_boy.can_access_branch(branch):
            raise serializers.ValidationError(
                {"delivery_boy": "This delivery person cannot access this branch."}
            )

        total = 0

        for item in items:

            menu_item = item.get("menu_item")
            platter = item.get("platter")

            quantity = item.get("quantity", 1)

            if not menu_item and not platter:
                raise serializers.ValidationError(
                    "Either menu_item or platter is required"
                )

            if menu_item and platter:
                raise serializers.ValidationError(
                    "Cannot use both menu_item and platter"
                )

            if menu_item:
                if not scope_order_menu_queryset(
                    MenuItem.objects.filter(pk=menu_item.pk, restaurant=restaurant),
                    restaurant,
                    branch,
                ).exists():
                    raise serializers.ValidationError(
                        {"items": "This menu item is not available for the active branch."}
                    )
                total += menu_item.get_effective_price(branch) * quantity

            if platter:
                if not scope_order_menu_queryset(
                    Platter.objects.filter(pk=platter.pk, restaurant=restaurant),
                    restaurant,
                    branch,
                ).exists():
                    raise serializers.ValidationError(
                        {"items": "This platter is not available for the active branch."}
                    )
                total += platter.get_effective_price(branch) * quantity
        # MIN ORDER check
        if order_type == "delivery" and restaurant:
            min_order_amount = get_branch_decimal(
                branch,
                restaurant,
                "min_order_amount",
            )
            if total < min_order_amount:
                raise serializers.ValidationError(
                    f"Minimum order is {min_order_amount} for delivery orders."
                )

        # DELIVERY LOCATION check
        request = self.context.get("request")

        is_staff_order = (
            request
            and request.user.is_authenticated
            and hasattr(request.user, "staff_profile")
        )
        if order_type == "delivery":
            delivery_available = (
                branch.delivery_available
                if branch and branch.delivery_available is not None
                else restaurant.delivery_available
            )
            if not delivery_available:
                raise serializers.ValidationError(
                    "Delivery is not available for this branch."
                )

            if is_staff_order:
                distance = data.get("distance_km")

                if distance is None:
                    raise serializers.ValidationError(
                        "Distance is required for delivery orders"
                    )

                distance = float(distance)

            else:
                customer_lat = data.get("latitude")
                customer_lng = data.get("longitude")
                origin_lat = (
                    branch.latitude
                    if branch and branch.latitude is not None
                    else restaurant.latitude
                )
                origin_lng = (
                    branch.longitude
                    if branch and branch.longitude is not None
                    else restaurant.longitude
                )

                if origin_lat is None or origin_lng is None:
                    raise serializers.ValidationError(
                        "Branch location not set"
                    )

                if customer_lat is None or customer_lng is None:
                    raise serializers.ValidationError(
                        "Customer location is required for delivery"
                    )

                distance = calculate_distance_km(
                    origin_lat,
                    origin_lng,
                    float(customer_lat),
                    float(customer_lng)
                )

            delivery_radius_km = get_branch_decimal(
                branch,
                restaurant,
                "delivery_radius_km",
            )
            if distance > float(delivery_radius_km):
                raise serializers.ValidationError(
                    f"Delivery not available in your area ({distance:.2f} km too far)"
                )

            if branch and (
                branch.base_delivery_fee is not None
                or branch.price_per_km is not None
            ):
                base_fee = get_branch_decimal(branch, restaurant, "base_delivery_fee")
                price_per_km = get_branch_decimal(branch, restaurant, "price_per_km")
                delivery_fee = float(base_fee) + (distance * float(price_per_km))
            else:
                delivery_fee = calculate_delivery_fee(
                    restaurant,
                    distance
                )

            self.context["delivery_fee"] = delivery_fee
            self.context["distance"] = distance

        return data
    
    def get_manager_discount_limit(self, obj):
        return obj.restaurant.manager_discount_limit

    def get_admin_discount_limit(self, obj):
        return obj.restaurant.admin_discount_limit
    from decimal import Decimal

    def get_remaining_total(self, obj):
        total = Decimal(str(obj.get_total()))

        already_paid = Decimal("0.00")

        if obj.reservation:
            already_paid = Decimal(str(obj.reservation.paid_amount or 0))

        remaining = total - already_paid

        return str(max(remaining, Decimal("0.00")))
    def get_reservation_payment(self, obj):
        res = obj.reservation
        if not res:
            return None

        total = float(res.total_price or 0)
        paid = float(res.paid_amount or 0)
        remaining = total - paid

        return {
            "reservation_type": res.reservation_type,
            "total": total,
            "paid": paid,
            "remaining": remaining,
            "is_fully_paid": remaining <= 0,
        }
    def get_reservation_fee(self, obj):
        res = obj.reservation
        if not res:
            return 0

        total = res.total_price or 0
        paid = res.paid_amount or 0  

        # FREE reservation
        if res.reservation_type == "free":
            return 0

        # PREPAID reservation
        if res.reservation_type == "prepaid":
            return float(total) - float(paid)

        # FEE reservation
        if res.reservation_type == "fee":
            return float(total)

        return 0
    def get_total(self, obj):
        return str(obj.get_total())
    
    

    
    from django.db.models import Q

    def create(self, validated_data):
        items = validated_data.pop('items', [])
        request = self.context.get('request')
        branch = self.context.get("branch")
        if not branch and request:
            branch = get_active_branch(request, raise_exception=False)

        # attach customer
        if request and request.user.is_authenticated:
            try:
                customer = request.user.customer
                validated_data['customer'] = customer
                validated_data.setdefault('name', customer.user.username)
                validated_data.setdefault('phone', customer.phone)
            except Customer.DoesNotExist:
                pass
        validated_data.pop("distance_km", None)
        table = validated_data.get("table")
        order_phone = validated_data.get("phone")
        order_name = validated_data.get("name")

        reservation = None

        if table:
            now = timezone.now()

            # ✅ ONLY valid time window
            possible_reservation = Reservation.objects.filter(
                table=table,
                branch=branch,
                status__in=["reserved", "arrived"],
                start_time__lte=now,
            ).order_by("-start_time")

            for r in possible_reservation:
                if r.end_time and now <= r.end_time and r.matches_customer(order_name, order_phone):
                    reservation = r
                    break

            # ✅ mark arrived ONLY when matched
            if reservation and reservation.status == "reserved":
                reservation.status = "arrived"
                reservation.save(update_fields=["status"])
        delivery_fee = 0

        if validated_data.get("order_type") == "delivery":
            delivery_fee = self.context.get("delivery_fee", 0)

        validated_data["delivery_fee"] = delivery_fee
        validated_data["reservation"] = reservation

        order = Order.objects.create(**validated_data)

        for item in items:
            if "price_at_order" not in item or item["price_at_order"] is None:
                menu_item = item.get("menu_item")
                platter = item.get("platter")
                if menu_item:
                    item["price_at_order"] = menu_item.get_effective_price(branch)
                elif platter:
                    item["price_at_order"] = platter.get_effective_price(branch)

            OrderItem.objects.create(order=order, **item)

        return order
    
class OrderListSerializer(serializers.ModelSerializer):
    total = serializers.SerializerMethodField()
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    tableName = serializers.CharField(
        source='table.name',
        read_only=True
    )

    created_by_name = serializers.CharField(
        source='created_by.user.get_full_name',
        read_only=True
    )

    received_by_name = serializers.CharField(
        source='received_by.user.get_full_name',
        read_only=True
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "name",
            "total",
            "tableName",
            "order_type",
            "status",
            "status_display",
            "created_by_name",
            "received_by_name",
            "created_at",
        ]

    def get_total(self, obj):
        return str(obj.get_total())
    
class DiscountRequestSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.CharField(
        source="requested_by.name",
        read_only=True
    )

    approved_by_name = serializers.CharField(
        source="approved_by.name",
        read_only=True
    )

    order_number = serializers.IntegerField(
        source="order.order_number",
        read_only=True
    )

    table_name = serializers.CharField(
        source="order.table.name",
        read_only=True
    )

    customer_name = serializers.CharField(
        source="order.name",
        read_only=True
    )

    original_total = serializers.SerializerMethodField()

    final_total = serializers.SerializerMethodField()

    class Meta:
        model = DiscountRequest

        fields = [
            "id",
            "order",
            "order_number",
            "table_name",
            "customer_name",

            "discount_percent",
            "reason",
            "status",

            "original_total",
            "final_total",

            "requested_by",
            "requested_by_name",
            "approved_by",
            "approved_by_name",

            "created_at",
            "approved_at",
        ]

        read_only_fields = [
            "status",
            "requested_by",
            "approved_by",
            "approved_at",
        ]

    def get_original_total(self, obj):
        order = obj.order

        items_total = sum(
            item.get_subtotal()
            for item in order.items.all()
        )

        reservation_total = Decimal("0.00")

        if order.reservation:
            reservation_total = order.reservation.total_price

        delivery_total = (
            Decimal(str(order.delivery_fee))
            if order.order_type == "delivery"
            else Decimal("0.00")
        )

        subtotal = (
            Decimal(str(items_total))
            + reservation_total
            + delivery_total
        )

        return str(round(subtotal, 2))

    def get_final_total(self, obj):
        original = Decimal(
            self.get_original_total(obj)
        )

        discount = (
            original * obj.discount_percent
        ) / Decimal("100")

        return str(round(original - discount, 2))
    





# serializers.py - Add this lightweight serializer

class OrderItemMiniSerializer(serializers.ModelSerializer):
    """Lightweight serializer for real-time item updates"""
    item_name = serializers.SerializerMethodField()
    item_price = serializers.SerializerMethodField()
    added_by_name = serializers.SerializerMethodField()
    station_id = serializers.SerializerMethodField()
    station_name = serializers.SerializerMethodField()
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'menu_item',
            'platter',
            'item_name',
            'item_price',
            'price_at_order',
            'status',
            'quantity',
            'description',
            'is_new',
            'added_by_name',
            "station_id", "station_name",
        ]
    
    def get_station_id(self, obj):
        station = getattr(obj, "target_station", None)
        return station.id if station else None

    def get_station_name(self, obj):
        station = getattr(obj, "target_station", None)
        return station.name if station else "Main Kitchen"
    def get_added_by_name(self, obj):
        if obj.is_new and obj.added_by:
            return obj.added_by.name
        return None
    def get_item_name(self, obj):
        if obj.menu_item:
            return obj.menu_item.name
        if obj.platter:
            return obj.platter.name
        return None
    
    def get_item_price(self, obj):
        branch = getattr(obj.order, "branch", None)
        if obj.menu_item:
            return str(obj.menu_item.get_effective_price(branch))
        if obj.platter:
            return str(obj.platter.get_effective_price(branch))
        return "0"
