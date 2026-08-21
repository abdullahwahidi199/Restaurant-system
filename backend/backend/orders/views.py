from urllib import request
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Q,Prefetch
from django.db import transaction
from django_ratelimit.core import is_ratelimited
from orders.signals import broadcast_order_item_update, broadcast_table_items_update
from restaurants.branching import (
    filter_queryset_for_request,
    get_active_branch,
    get_main_branch,
)
from restaurants.models import Branch, Restaurant
from menu.serializers import CategorySerializer,MenuItemSerializer
from datetime import timedelta
from .models import Order, Table, OrderItem,Reservation,DiscountRequest,DiscountCard
from .seriailizers import OrderSerializer, TableSerializer, TablePanelSerializer,ReservationSerializer,DiscountRequestSerializer,DiscountCardSerializer,OrderListSerializer, scope_order_menu_queryset
from menu.models import Category, MenuItem
from users.models import Staff
from inventory.services import deduct_stock_for_order_item,deduct_batch_stock_for_order_items,recalc_batch_menu_availability
from rest_framework.pagination import PageNumberPagination
from restaurants.permissions import IsCashier,IsKitchenManager,IsRestaurantAdmin,IsCallOperator,IsOperationsManager
from restaurants.permissions import IsSameRestaurant,IsWaiter,IsRestaurantAdmin,IsRestaurantActive,IsManager
from rest_framework.exceptions import NotFound
from django.utils import timezone
from decimal import Decimal
from rest_framework.exceptions import ValidationError
from django.db import transaction
from menu.models import Platter
from menu.production_utils import consume_production

from django.db.models import Sum, F, DecimalField, ExpressionWrapper
from audit.constants import AuditAction, AuditModule
from audit.services import (
    actor_name,
    create_audit_log,
    record_instance_create,
    record_instance_delete,
    record_instance_update,
    snapshot_instance,
)

TABLE_AUDIT_FIELDS = [
    "name",
    "capacity",
    "price_per_hour",
    "allow_free_reservation",
    "note",
    "branch",
]

RESERVATION_AUDIT_FIELDS = [
    "table",
    "reservation_number",
    "customer_name",
    "phone",
    "guests",
    "reservation_date",
    "start_time",
    "duration_minutes",
    "reservation_type",
    "amount",
    "paid_amount",
    "status",
    "notes",
    "branch",
]


class OrdersListPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


def paginated_response(request, queryset, serializer_class, *, context=None):
    paginator = OrdersListPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = serializer_class(page, many=True, context=context or {})
    return paginator.get_paginated_response(serializer.data)


def numeric_search_value(value):
    value = str(value or "").strip()
    return int(value) if value.isdigit() else None


FINALIZED_ORDER_STATUSES = {"completed", "delivered", "cancelled"}


def finalized_order_response(order):
    return Response(
        {"error": f"Order already {order.status}"},
        status=status.HTTP_400_BAD_REQUEST,
    )


# def recalc_order_total(order):
#     total = order.items.aggregate(
#         total=Sum(
#             ExpressionWrapper(
#                 F("quantity") * F("menu_item__price"),
#                 output_field=DecimalField(max_digits=10, decimal_places=2)
#             )
#         )
#     )["total"] or 0

#     order.total = total
#     order.save(update_fields=["total"])
# --- Helper Function ---
def get_restaurant_from_user(request):
    """
    Helper to safely get the restaurant from the logged-in user's staff profile.
    """
    if not request.user.is_authenticated:
        return None
    
    # Check if user is superadOmin (they might not have a staff profile)
    if request.user.is_superuser:
        # For superadmin, you might allow seeing everything, 
        # or require a header/param to select restaurant. 
        # For now, we return None so they see nothing unless logic is added.
        # Alternatively: return Restaurant.objects.first() 
        pass
        
    if hasattr(request.user, 'staff_profile'):
        return request.user.staff_profile.restaurant
    
    return None


def get_staff_assigned_stations(user):
    """
    Returns queryset of Stations assigned to user if they are a Kitchen_manager.
    Returns None if user can see all stations.
    """
    staff = getattr(user, "staff_profile", None)
    if not staff:
        return None
    if staff.role == "Kitchen_manager":
        stations = staff.stations.filter(is_active=True)
        if not stations.exists():
            return None
        return stations
    return None

def branch_scoped(request, queryset, branch_field="branch", *, allow_all=False):
    return filter_queryset_for_request(
        request,
        queryset,
        branch_field,
        allow_all_for_admin=allow_all,
    )


def get_branch_or_response(request):
    try:
        return get_active_branch(request)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_403_FORBIDDEN)

def validate_production_availability(items_data, menu_items, branch):
    for item in items_data:

        # FIX: normalize menu_item
        menu_item = item.get("menu_item")

        if isinstance(menu_item, dict):
            menu_item_id = menu_item.get("id")
        elif hasattr(menu_item, "id"):
            menu_item_id = menu_item.id
        else:
            menu_item_id = menu_item

        if not menu_item_id:
            continue

        menu_item_obj = menu_items.get(menu_item_id)
        if not menu_item_obj:
            continue

        qty = item.get("quantity") or 1

        if menu_item_obj.uses_daily_production:
            prod = menu_item_obj.get_production(branch=branch)

            remaining = prod.quantity_remaining if prod else 0

            if int(qty) > int(remaining):
                raise ValueError(
                    f"Only {remaining} {menu_item_obj.name} remaining"
                )

class OrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


@api_view(["GET", "POST"])
@permission_classes([
    IsAuthenticated,
    IsRestaurantActive,
    IsManager | IsCashier | IsRestaurantAdmin,
])
def discount_cards(request):
    restaurant = get_restaurant_from_user(request)

    if not restaurant:
        return Response(
            {"error": "Restaurant not found"},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == "GET":
        cards = branch_scoped(
            request,
            DiscountCard.objects.filter(restaurant=restaurant),
            allow_all=True,
        ).order_by("-created_at")

        serializer = DiscountCardSerializer(cards, many=True)
        return Response(serializer.data)

    serializer = DiscountCardSerializer(data=request.data)

    if serializer.is_valid():
        branch = get_branch_or_response(request)
        if isinstance(branch, Response):
            return branch
        serializer.save(
            restaurant=restaurant,
            branch=branch,
        )
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    IsAuthenticated,
    IsRestaurantActive,
    IsManager | IsCashier | IsRestaurantAdmin,
])
def discount_card_actions(request, pk):
    restaurant = get_restaurant_from_user(request)

    try:
        card = branch_scoped(
            request,
            DiscountCard.objects.filter(pk=pk, restaurant=restaurant),
            allow_all=True,
        ).get()
    except DiscountCard.DoesNotExist:
        return Response(
            {"error": "Discount card not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        serializer = DiscountCardSerializer(card)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        serializer = DiscountCardSerializer(
            card,
            data=request.data,
            partial=request.method == "PATCH"
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    card.delete()

    return Response(
        {"message": "Discount card deleted successfully"},
        status=status.HTTP_204_NO_CONTENT
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsCashier])
def apply_discount_card(request, pk):
    order = get_object_or_404(
        branch_scoped(request, Order.objects.filter(id=pk))
    )

    card_number = request.data.get("card_number")
    customer_phone = request.data.get("customer_phone")

    card = DiscountCard.objects.filter(
        card_number=card_number,
        restaurant=order.restaurant,
        branch=order.branch,
    ).first()

    if not card:
        return Response(
    {"error": "Invalid card number"},
    status=status.HTTP_400_BAD_REQUEST
)

    if card.customer_phone != customer_phone:
        return Response(
            {"error": "Phone number does not match"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if card.status != "active":
        return Response(
            {"error": "Card is not active"},
            status=status.HTTP_400_BAD_REQUEST
        )

    today = timezone.now().date()

    if card.valid_until < today:
        return Response(
            {"error": "Card expired"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if (
        card.usage_limit is not None and
        card.used_count >= card.usage_limit
    ):
        return Response(
    {"error": "Usage limit reached"},
    status=status.HTTP_400_BAD_REQUEST
)

    if order.get_total() < card.minimum_order_amount:
        return Response(
            {"error": f"Minimum order amount is {card.minimum_order_amount}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if order.discount_percent > 0:
        return Response(
            {"error": "Order already discounted"},
            status=status.HTTP_400_BAD_REQUEST
        )
    order.discount_percent = card.discount_percentage
    order.discount_card = card
    order.save()

    card.used_count += 1
    card.save(update_fields=["used_count"])

    return Response({
        "message": "Discount card applied successfully",
        "discount_percent": card.discount_percentage
    })

@api_view(["GET"])
@permission_classes([
    IsAuthenticated,
    IsRestaurantActive,
    IsManager | IsCashier | IsRestaurantAdmin,
])
def discount_card_details(request, pk):
    restaurant = get_restaurant_from_user(request)

    card = get_object_or_404(
        branch_scoped(
            request,
            DiscountCard.objects.filter(id=pk, restaurant=restaurant),
            allow_all=True,
        )
    )

    orders = card.orders.select_related(
        "table"
    ).order_by("-created_at")

    return Response({
        "card": DiscountCardSerializer(card).data,
        "orders_used": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "total": o.get_total(),
                "discount_percent": o.discount_percent,
                "created_at": o.created_at,
            }
            for o in orders
        ]
    })

@api_view(['GET', 'POST'])
@permission_classes([AllowAny,IsRestaurantActive])
def order_list_create(request):
    # 1. Get Restaurant
    restaurant = get_restaurant_from_user(request)
    if not restaurant:
        return Response({"error": "User not associated with a restaurant"}, status=403)

    if request.method == 'GET':
        orders = (
            Order.objects
            .filter(restaurant=restaurant) # FILTER HERE
            .prefetch_related('items__menu_item', 'customer', 'review')
            .select_related('table')
            .order_by('-created_at')
        )
        orders = branch_scoped(request, orders, allow_all=True)
      
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = orders.filter(status=status_filter)

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date and end_date:
            orders = orders.filter(created_at__date__range=[start_date, end_date])

        search = request.query_params.get('search')
        if search:
            orders = orders.filter(Q(name__icontains=search) | Q(phone__icontains=search))

        paginator = OrderPagination()
        page = paginator.paginate_queryset(orders, request)

        serializer = OrderListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    elif request.method == 'POST':
        branch = get_branch_or_response(request)
        if isinstance(branch, Response):
            return branch

        serializer = OrderSerializer(
            data=request.data,
            context={'request': request, 'restaurant': restaurant, 'branch': branch}
        )

        if serializer.is_valid():

            try:
                with transaction.atomic():

                    staff = None
                    if request.user.is_authenticated and hasattr(request.user, "staff_profile"):
                        staff = request.user.staff_profile

                    # ✅ USE VALIDATED DATA (NOT request.data)
                    items_data = request.data.get("items", [])


                    menu_item_ids = [
                        item.get("menu_item").id if hasattr(item.get("menu_item"), "id")
                        else item.get("menu_item")
                        for item in items_data
                        if item.get("menu_item")
                    ]

                    menu_items = {
                        m.id: m for m in scope_order_menu_queryset(
                            MenuItem.objects.filter(
                                id__in=menu_item_ids,
                                restaurant=restaurant
                            ),
                            restaurant,
                            branch,
                        )
                    }

                    validate_production_availability(items_data, menu_items, branch)

                    order = serializer.save(
                        restaurant=restaurant,
                        branch=branch,
                        created_by=staff
                    )

            except ValueError as e:
                return Response({'error': str(e)}, status=400)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(["PATCH"])
@permission_classes([
    IsAuthenticated,
    IsRestaurantActive,
    IsManager | IsWaiter | IsRestaurantAdmin
])
def change_order_table(request, pk):

    restaurant = get_restaurant_from_user(request)

    try:
        order = branch_scoped(
            request,
            Order.objects.select_related("table").filter(pk=pk, restaurant=restaurant),
        ).get()
    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found"},
            status=404
        )

    if order.order_type != "dine-in":
        return Response(
            {"error": "Only dine-in orders can change tables"},
            status=400
        )

    if order.status in ["completed", "cancelled"]:
        return Response(
            {"error": "Cannot change table for this order"},
            status=400
        )

    new_table_id = request.data.get("table")

    if not new_table_id:
        return Response(
            {"error": "Table is required"},
            status=400
        )

    try:
        new_table = branch_scoped(
            request,
            Table.objects.filter(
            id=new_table_id,
            restaurant=restaurant
            ),
        ).get()
    except Table.DoesNotExist:
        return Response(
            {"error": "Table not found"},
            status=404
        )

    # prevent same table
    if order.table_id == new_table.id:
        return Response(
            {"error": "Order already assigned to this table"},
            status=400
        )

    # check active order on target table
    occupied = Order.objects.filter(
        table=new_table,
        status__in=[
            "pending",
            "in_progress",
            "ready",
            "served"
        ]
    ).exclude(id=order.id).exists()

    if occupied:
        return Response(
            {"error": "Target table is occupied"},
            status=400
        )

    old_table = order.table

    # assign new table
    order.table = new_table
    order.save()

    # free old table
    if old_table:
        has_active_orders = Order.objects.filter(
            table=old_table,
            status__in=[
                "pending",
                "in_progress",
                "ready",
                "served"
            ]
        ).exclude(id=order.id).exists()

        if not has_active_orders:
            old_table.status = "available"
            old_table.save(update_fields=["status"])

    # occupy new table
    new_table.status = "occupied"
    new_table.save(update_fields=["status"])

    serializer = OrderSerializer(order)

    return Response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated,IsManager| IsCashier |IsCallOperator| IsRestaurantAdmin,IsRestaurantActive])
def reservation_list_create(request):
    restaurant = get_restaurant_from_user(request)

    if not restaurant:
        return Response({"error": "Restaurant not found"}, status=403)


    if request.method == "GET":
        reservations = branch_scoped(
            request,
            Reservation.objects.filter(restaurant=restaurant),
            allow_all=True,
        ).select_related("table", "created_by").order_by("-start_time", "id")

        status_filter = request.query_params.get("status")
        if status_filter:
            reservations = reservations.filter(status=status_filter)

        date_filter = request.query_params.get("date")
        if date_filter:
            reservations = reservations.filter(reservation_date=date_filter)

        table_filter = request.query_params.get("table")
        if table_filter:
            reservations = reservations.filter(table_id=table_filter)

        search = request.query_params.get("search")
        if search:
            search_filter = (
                Q(customer_name__icontains=search)
                | Q(phone__icontains=search)
                | Q(table__name__icontains=search)
            )
            numeric_search = numeric_search_value(search)
            if numeric_search is not None:
                search_filter |= Q(reservation_number=numeric_search)
            reservations = reservations.filter(search_filter)

        start_date = request.query_params.get("start")
        end_date = request.query_params.get("end")
        if start_date:
            reservations = reservations.filter(reservation_date__gte=start_date)
        if end_date:
            reservations = reservations.filter(reservation_date__lte=end_date)

        if request.query_params.get("paginate") == "false":
            serializer = ReservationSerializer(reservations, many=True)
            return Response(serializer.data)

        return paginated_response(request, reservations, ReservationSerializer)

    # ---------------- POST ----------------
    branch = get_branch_or_response(request)
    if isinstance(branch, Response):
        return branch

    serializer = ReservationSerializer(
        data=request.data,
        context={"request": request, "restaurant": restaurant, "branch": branch},
    )
    if serializer.is_valid():
        reservation = serializer.save(
            restaurant=restaurant,
            branch=branch,
            created_by=request.user.staff_profile
        )
        record_instance_create(
            request=request,
            instance=reservation,
            module=AuditModule.RESERVATIONS,
            fields=RESERVATION_AUDIT_FIELDS,
            description=(
                f"{actor_name(request)} created reservation "
                f"#{reservation.reservation_number} for {reservation.customer_name}."
            ),
        )
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)
    
class ReservationRetrieveUpdateDestroyView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated, IsManager|IsCashier | IsRestaurantAdmin,IsRestaurantActive]

    def get_queryset(self):
        restaurant = get_restaurant_from_user(self.request)

        return branch_scoped(
            self.request,
            Reservation.objects.filter(restaurant=restaurant),
            allow_all=True,
        ).select_related(
            "table", "created_by"
        )

    def update(self, request, *args, **kwargs):
        reservation = self.get_object()
        old_values = snapshot_instance(reservation, fields=RESERVATION_AUDIT_FIELDS)
        response = super().update(request, *args, **kwargs)
        reservation.refresh_from_db()
        record_instance_update(
            request=request,
            instance=reservation,
            old_values=old_values,
            module=AuditModule.RESERVATIONS,
            fields=RESERVATION_AUDIT_FIELDS,
            description=(
                f"{actor_name(request)} updated reservation "
                f"#{reservation.reservation_number}."
            ),
            severity="WARNING",
        )
        return response

    def destroy(self, request, *args, **kwargs):
        reservation = self.get_object()
        record_instance_delete(
            request=request,
            instance=reservation,
            module=AuditModule.RESERVATIONS,
            fields=RESERVATION_AUDIT_FIELDS,
            description=(
                f"{actor_name(request)} deleted reservation "
                f"#{reservation.reservation_number}."
            ),
            severity="WARNING",
        )
        return super().destroy(request, *args, **kwargs)

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q

def get_public_order_context(restaurant_slug, branch_slug=None):
    restaurant = get_object_or_404(
        Restaurant.objects.select_related("subscription"),
        slug=restaurant_slug,
    )

    subscription = getattr(restaurant, "subscription", None)
    today = timezone.now().date()

    is_active = (
        restaurant.is_active and
        subscription and
        subscription.is_active and
        subscription.starts_at <= today <= subscription.expires_at
    )

    if not is_active:
        raise NotFound("Restaurant not found")

    active_branches = Branch.objects.filter(
        restaurant=restaurant,
        is_active=True,
    )
    if branch_slug:
        branch = get_object_or_404(active_branches, slug=branch_slug)
    else:
        branch = (
            active_branches.filter(is_main_branch=True).first()
            or active_branches.order_by("-is_main_branch", "name").first()
        )

    if not branch:
        raise NotFound("Branch not found")

    return restaurant, branch


@api_view(['POST'])
@permission_classes([AllowAny])
def create_online_order(request, slug=None, restaurant_slug=None, branch_slug=None):

    restaurant, branch = get_public_order_context(restaurant_slug or slug, branch_slug)

    def clean_ip(request):
        ip = (
            request.META.get("HTTP_CF_CONNECTING_IP")
            or request.META.get("HTTP_X_FORWARDED_FOR")
            or request.META.get("REMOTE_ADDR")
        )
        if not ip:
            return "0.0.0.0"
        return ip.split(",")[0].split("/")[0].strip()

    def rate_limit_key(group, request):
        return clean_ip(request)

    limited = is_ratelimited(
        request=request,
        group=f"online_orders_{restaurant.slug}_{branch.slug}",
        fn=None,
        key=rate_limit_key,
        rate="5/20m",
        method="POST",
        increment=True,
    )

    if limited:
        return Response({"error": "Too many online orders."}, status=429)

    serializer = OrderSerializer(
        data=request.data,
        context={"request": request, "restaurant": restaurant, "branch": branch}
    )

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():

            
            items_data = request.data.get("items", [])

            menu_item_ids = [
                item.get("menu_item").id
                if hasattr(item.get("menu_item"), "id")
                else item.get("menu_item")
                for item in items_data
                if item.get("menu_item")
            ]

            menu_items = {
                m.id: m for m in scope_order_menu_queryset(
                    MenuItem.objects.filter(
                        id__in=menu_item_ids,
                        restaurant=restaurant
                    ),
                    restaurant,
                    branch,
                )
            }

            # 🔥 IMPORTANT: production validation BEFORE saving
            validate_production_availability(items_data, menu_items, branch)

            order = serializer.save(restaurant=restaurant, branch=branch)

    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    return Response(
        OrderSerializer(
            order,
            context={"request": request, "restaurant": restaurant, "branch": branch},
        ).data,
        status=status.HTTP_201_CREATED
    )
from django.db.models import Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Exists, OuterRef

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsRestaurantActive, IsKitchenManager | IsRestaurantAdmin])


def kitchen_orders(request):
    from django.utils import timezone
    from datetime import timedelta

    cutoff = timezone.now() - timedelta(days=2) 
    restaurant = get_restaurant_from_user(request)
    if not restaurant:
        return Response({"error": "Restaurant not found"}, status=403)

    ACTIVE_STATUSES = ["pending", "approved", "in_progress"]
    assigned_stations = get_staff_assigned_stations(request.user)
    item_filter = Q(status__in=ACTIVE_STATUSES)
    if assigned_stations is not None:
        station_filter = (
            Q(menu_item__station__in=assigned_stations) |
            Q(platter__station__in=assigned_stations)
        )
        item_filter = item_filter & station_filter

    active_items = OrderItem.objects.filter(
        order=OuterRef("pk")
    ).filter(item_filter)
    
    items_queryset = OrderItem.objects.all()
    if assigned_stations is not None:
        items_queryset = items_queryset.filter(
            Q(menu_item__station__in=assigned_stations) |
            Q(platter__station__in=assigned_stations)
        )

    orders = (
        branch_scoped(
            request,
            Order.objects.filter(
                restaurant=restaurant,
                order_type__in=["dine-in", "takeaway", "delivery"],
            ),
        )
        .exclude(status__in=["completed", "cancelled", "delivered"])
        .annotate(has_active_items=Exists(active_items))
        .filter(has_active_items=True)
        .select_related("table")
        .prefetch_related(
            Prefetch(
                "items",
                queryset=items_queryset.select_related("menu_item__station", "platter__station")
            ),
            "customer",
        )
        .order_by("-created_at")
    )
            # optional filters
    order_type = request.query_params.get("order_type")
    status = request.query_params.get("status")

    if order_type and order_type != "all":
        orders = orders.filter(order_type=order_type)

    if status and status != "all":
        orders = orders.filter(status=status)

    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


from datetime import timedelta
from django.utils import timezone
from django.db.models import Q

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsRestaurantActive, IsKitchenManager | IsRestaurantAdmin])
def ready_kitchen_orders(request):
    restaurant = get_restaurant_from_user(request)
    assigned_stations = get_staff_assigned_stations(request.user)

    if not restaurant:
        return Response({"error": "Restaurant not found"}, status=403)

    recent_time = timezone.now() - timedelta(minutes=30)

    # 🔥 CRITICAL: MUST DEFINE items_queryset BEFORE USING .filter():
    items_queryset = OrderItem.objects.all()
    if assigned_stations is not None:
        items_queryset = items_queryset.filter(
            Q(menu_item__station__in=assigned_stations) |
            Q(platter__station__in=assigned_stations)
        )

    orders_query = Order.objects.filter(restaurant=restaurant)
    if assigned_stations is not None:
        station_items = OrderItem.objects.filter(
            order=OuterRef("pk"),
            menu_item__station__in=assigned_stations
        ) | OrderItem.objects.filter(
            order=OuterRef("pk"),
            platter__station__in=assigned_stations
        )
        orders_query = orders_query.annotate(has_station_items=Exists(station_items)).filter(has_station_items=True)

    orders = (
        branch_scoped(request, orders_query)
        .filter(
            Q(status="ready") |
            Q(status="served", updated_at__gte=recent_time) |
            Q(status="out_for_delivery", updated_at__gte=recent_time)
        )
        .select_related("table")
        .prefetch_related(
            Prefetch(
                "items",
                queryset=items_queryset.select_related("menu_item__station", "platter__station")
            ),
            "customer",
        )
        .order_by("-updated_at")
    )

    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)
@api_view(["POST"])
@permission_classes([
    IsAuthenticated,
    IsRestaurantActive,
    IsKitchenManager | IsRestaurantAdmin,
])
def mark_items_printed_to_kitchen(request, order_id):
    restaurant = get_restaurant_from_user(request)

    try:
        order = branch_scoped(
            request,
            Order.objects.filter(
            id=order_id,
            restaurant=restaurant
            ),
        ).get()
    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found"},
            status=404
        )

    updated_count = order.items.filter(
        is_printed_to_kitchen=False
    ).update(
        is_printed_to_kitchen=True
    )

    return Response({
        "printed_items": updated_count
    })

@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive,IsManager| IsWaiter|IsCashier  | IsRestaurantAdmin])
def cancel_order(request, pk):
    restaurant = get_restaurant_from_user(request)
    
    try:
        # Ensure order belongs to user's restaurant
        order = branch_scoped(
            request,
            Order.objects.select_related("table").filter(pk=pk, restaurant=restaurant),
        ).get()
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
    
    blocked_statuses = ["completed", "cancelled"]
    if order.status in blocked_statuses:
        return Response({"error": f"Order already {order.status}"}, status=status.HTTP_400_BAD_REQUEST)

    # ... (Your existing permission logic for roles remains the same) ...
    role = None
    if request.user.is_superuser:
        role = "Admin"
    elif hasattr(request.user, "staff_profile"):
        role = request.user.staff_profile.role

    now = timezone.now()
    minutes_passed = (now - order.created_at).total_seconds() / 60

    if role == "Customer":
         # logic...
         pass
    elif role == "Waiter":
        if order.status not in ["pending"]:
            return Response({"error": "Waiter cannot cancel this order now"}, status=status.HTTP_403_FORBIDDEN)
    elif role=='Manager':
        if order.status not in ["pending"]:
            return Response({"error": "Manager cannot cancel this order now"}, status=status.HTTP_403_FORBIDDEN)
    elif role in ["Admin", "BranchAdmin"]:
        if order.status in ["completed"]:
            return Response({"error":"Order is already completed"}, status=status.HTTP_403_FORBIDDEN)
    else:
         pass

    order.status = "cancelled"
    order.save()

    return Response({"message": "Order cancelled", "order_id": order.id}, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([AllowAny])
def cancel_online_order(request, pk, slug=None, restaurant_slug=None, branch_slug=None):
    restaurant, branch = get_public_order_context(restaurant_slug or slug, branch_slug)
    
    try:
        order = Order.objects.get(pk=pk, restaurant=restaurant, branch=branch)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if order.order_type != "delivery":
        return Response({'error': 'Only delivery orders can be cancelled online'}, status=status.HTTP_400_BAD_REQUEST)

    if order.status in ["in_progress","out_for_delivery","completed", "cancelled"]:
        return Response({'error': f'Order already {order.status}'}, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    minutes_passed = (now - order.created_at).total_seconds() / 60
    if minutes_passed >2:
        return Response({'error': 'Cancellation window has expired'}, status=status.HTTP_403_FORBIDDEN)

    order.status = "cancelled"
    order.save()

    return Response({'message': 'Order cancelled successfully'}, status=status.HTTP_200_OK)

from django.utils import timezone

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def update_order_status(request, pk):
    restaurant = get_restaurant_from_user(request)
    try:
        order = branch_scoped(
            request,
            Order.objects.select_for_update().filter(pk=pk, restaurant=restaurant),
        ).get()
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    validated_statuses = [s[0] for s in Order.STATUS_CHOICES]

    if new_status not in validated_statuses:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    if order.status in FINALIZED_ORDER_STATUSES and new_status != order.status:
        return finalized_order_response(order)

    # 1️⃣ Get logged-in user's assigned stations (if they are a Kitchen Manager)
    assigned_stations = get_staff_assigned_stations(request.user)

    # 2️⃣ Build queryset of non-cancelled order items targeted by this user's stations
    target_items = order.items.exclude(status="cancelled")
    if assigned_stations is not None:
        target_items = target_items.filter(
            Q(menu_item__station__in=assigned_stations) |
            Q(platter__station__in=assigned_stations)
        )

    # 3️⃣ If "in_progress" (Start button clicked):
    if new_status == "in_progress":
        # Only update items belonging to this station to "approved"
        target_items.filter(status="pending").update(status="approved")
        # Ensure overall order status is in_progress
        order.status = "in_progress"

    # 4️⃣ If "ready" (Mark Ready button clicked):
    elif new_status == "ready":
        # Only update items belonging to this station to "ready"
        target_items.filter(status__in=["pending", "approved"]).update(status="ready")

        # Check if ANY non-cancelled items across ANY station on this order are still not ready
        remaining_not_ready = order.items.exclude(
            status__in=["ready", "cancelled", "served", "completed", "delivered"]
        ).exists()

        if remaining_not_ready:
            # Other stations are still working on their items! Keep overall status active:
            order.status = "in_progress"
        else:
            # All items across all stations are finished! Order is 100% ready:
            order.status = "ready"

    # 5️⃣ Other statuses (completed, delivered, etc.):
    else:
        order.status = new_status

    # ✅ Capture completion payment info
    if order.status in ["completed", "delivered"]:
        staff = getattr(request.user, "staff_profile", None)
        order.received_by = staff
        order.paid_at = timezone.now()

        reservation = order.reservation
        if not reservation and order.table:
            now = timezone.now()
            reservation = Reservation.objects.filter(
                restaurant=restaurant,
                branch=order.branch,
                table=order.table,
                status__in=["reserved", "arrived"],
                start_time__lte=now
            ).order_by("-start_time").first()

            if reservation and not reservation.matches_customer(order.name, order.phone):
                reservation = None

        if reservation and reservation.status != "completed":
            reservation.status = "completed"
            reservation.save(update_fields=["status"])

    order.save()

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)


class OrderRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter queryset based on restaurant
        restaurant = get_restaurant_from_user(self.request)
        return branch_scoped(
            self.request,
            Order.objects.filter(restaurant=restaurant),
            allow_all=True,
        ).prefetch_related('items__menu_item', 'customer')


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def add_items_to_order(request, pk):
    restaurant = get_restaurant_from_user(request)

    try:
        order = branch_scoped(
            request,
            Order.objects.select_for_update().select_related("restaurant").filter(
                pk=pk,
                restaurant=restaurant,
            ),
        ).get()
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)

    if order.status in FINALIZED_ORDER_STATUSES:
        return finalized_order_response(order)

    items_data = request.data.get('items', [])
    staff = request.user.staff_profile

    if not items_data:
        return Response({"new_items": []}, status=200)

    menu_item_ids = [
        item.get("menu_item")
        for item in items_data
        if item.get("menu_item")
    ]

    platter_ids = [
        item.get("platter")
        for item in items_data
        if item.get("platter")
    ]

    # Fetch all at once
    menu_items = {
        m.id: m for m in
        scope_order_menu_queryset(
            MenuItem.objects.filter(
                id__in=menu_item_ids,
                restaurant=restaurant
            ),
            restaurant,
            order.branch,
        )
    }

    platters = {
        p.id: p for p in
        scope_order_menu_queryset(
            Platter.objects.filter(
                id__in=platter_ids,
                restaurant=restaurant
            ),
            restaurant,
            order.branch,
        ).prefetch_related("items__menu_item")
    }

    order_items_to_create = []
    response_items = []

    with transaction.atomic():
        for item in items_data:
            quantity = item.get("quantity", 1)

            if item.get("menu_item") and item["menu_item"] in menu_items:
                menu_item = menu_items[item["menu_item"]]

                if menu_item.uses_daily_production:
                    prod = menu_item.get_production(branch=order.branch)

                    if not prod or prod.quantity_remaining < quantity:
                        return Response({
                            "error": f"Only {prod.quantity_remaining if prod else 0} {menu_item.name} remaining"
                        }, status=400)
        # Prepare objects (no DB hit yet)
        for item in items_data:
            quantity = item.get("quantity", 1)
            description = item.get("description", "")

            if item.get("menu_item") and item["menu_item"] in menu_items:
                menu_item = menu_items[item["menu_item"]]
                order_items_to_create.append(
                    OrderItem(
                        order=order,
                        menu_item=menu_item,
                        quantity=quantity,
                        is_new=True,
                        description=description,
                        added_by=staff,
                        price_at_order=menu_item.get_effective_price(order.branch),
                    )
                )
            elif item.get("platter") and item["platter"] in platters:
                platter = platters[item["platter"]]
                order_items_to_create.append(
                    OrderItem(
                        order=order,
                        platter=platter,
                        quantity=quantity,
                        is_new=True,
                        description=description,
                        added_by=staff,
                        price_at_order=platter.get_effective_price(order.branch),
                    )
                )

        # ✅ Bulk create (ONE query)
        
        created_items = OrderItem.objects.bulk_create(order_items_to_create)
        
        # ✅ BATCH stock deduction (instead of per-item)
        ingredient_ids = deduct_batch_stock_for_order_items(created_items, order)
        
        # ✅ Batch recalculation (once for all affected menu items)
        recalc_batch_menu_availability(ingredient_ids)
        
        def _broadcast():
            # Send individual item broadcasts
            for item in created_items:
                broadcast_order_item_update(item, "ITEM_CREATED")
            
            # One table update for all items
            broadcast_table_items_update(order)

        transaction.on_commit(_broadcast)

        # Prepare response
        for order_item in created_items:
            name = (
                order_item.menu_item.name
                if order_item.menu_item
                else order_item.platter.name
            )
            response_items.append({
                "id": order_item.id,
                "name": name,
                "quantity": order_item.quantity
            })

    return Response({"new_items": response_items}, status=200)
@api_view(["PATCH"])
@permission_classes([
    IsAuthenticated,
    IsRestaurantActive
])
@transaction.atomic
def update_order_item_status(request, pk):

    restaurant = get_restaurant_from_user(request)

    try:
        item = OrderItem.objects.select_related(
            "order"
        ).select_for_update(
        ).get(
            pk=pk,
            order__restaurant=restaurant,
            order__branch=get_active_branch(request),
        )

    except OrderItem.DoesNotExist:
        return Response(
            {"error": "Item not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    order = Order.objects.select_for_update().get(pk=item.order_id)
    if order.status in FINALIZED_ORDER_STATUSES:
        return finalized_order_response(order)

    new_status = request.data.get("status")

    allowed_statuses = [
        "pending",
        "approved",
        "ready",
        "cancelled",
    ]

    if new_status not in allowed_statuses:
        return Response(
            {"error": "Invalid status"},
            status=400
        )

    if item.status == "cancelled":
        return Response(
            {
                "error": "Cancelled items cannot be changed"
            },
            status=400
        )

    item.status = new_status
    item.save(update_fields=["status"])

    # =========================================
    # AUTO UPDATE ORDER STATUS
    # =========================================

    active_items = order.items.exclude(status="cancelled")

    total_items = active_items.count()

    approved_count = active_items.filter(
        status__in=["approved", "ready"]
    ).count()

    ready_count = active_items.filter(
        status="ready"
    ).count()

    

    
    if total_items == 0:
        order.status = "cancelled"

    if total_items > 0 and ready_count == total_items:
        order.status = "ready"

    elif approved_count > 0:
        order.status = "in_progress"

    else:
        order.status = "pending"

    order.save(update_fields=["status"])

    return Response({
        "message": f"Item marked as {new_status}",
        "order_status": order.status
    })


@api_view(['GET', "POST"])
@permission_classes([IsAuthenticated,IsSameRestaurant,IsRestaurantActive,IsRestaurantAdmin | IsManager | IsWaiter | IsCashier | IsOperationsManager])
def table_list_create(request):
    restaurant = get_restaurant_from_user(request)
    if not restaurant:
        return Response({"error": "Restaurant not found"}, status=403)

    if request.method == 'GET':
        branch = get_active_branch(request, raise_exception=False)
        tables = branch_scoped(
            request,
            Table.objects.filter(restaurant=restaurant),
            allow_all=True,
        )

        if request.query_params.get("view") == "panel":
            active_orders = Order.objects.filter(
                restaurant=restaurant,
                status__in=["pending", "in_progress", "ready", "served"],
            ).order_by("-created_at")
            reservations = Reservation.objects.filter(
                restaurant=restaurant,
                status__in=["arrived", "reserved"],
            ).order_by("start_time")

            if branch:
                active_orders = active_orders.filter(branch=branch)
                reservations = reservations.filter(branch=branch)

            tables = tables.prefetch_related(
                Prefetch(
                    "orders",
                    queryset=active_orders.prefetch_related(
                        Prefetch(
                            "items",
                            queryset=OrderItem.objects.select_related(
                                "menu_item",
                                "platter",
                                "added_by",
                            ),
                        ),
                    ),
                    to_attr="prefetched_active_orders",
                ),
                Prefetch(
                    "reservations",
                    queryset=reservations,
                    to_attr="prefetched_panel_reservations",
                ),
            )
            serializer = TablePanelSerializer(
                tables,
                many=True,
                context={"request": request},
            )
            return Response(serializer.data)

        # Filter tables by restaurant
        tables = tables.prefetch_related('orders')
        serializer = TableSerializer(tables, many=True,context={"request": request})
        return Response(serializer.data)
    
    elif request.method == "POST":
        if request.user.staff_profile.is_demo:
            return Response({"detail": "Action restricted in demo mode"}, status=403)
        
        branch = get_branch_or_response(request)
        if isinstance(branch, Response):
            return branch

        serializer = TableSerializer(
            data=request.data,
            context={"request": request, "restaurant": restaurant, "branch": branch},
        )
        if serializer.is_valid():
            # Save with restaurant
            table = serializer.save(restaurant=restaurant, branch=branch)
            record_instance_create(
                request=request,
                instance=table,
                module=AuditModule.TABLES,
                fields=TABLE_AUDIT_FIELDS,
                description=f"{actor_name(request)} created table {table.name}.",
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.response import Response
from rest_framework import status

class TableRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin | IsManager | IsWaiter | IsCashier | IsOperationsManager]

    def get_queryset(self):
        restaurant = get_restaurant_from_user(self.request)
        return branch_scoped(
            self.request,
            Table.objects.filter(restaurant=restaurant),
            allow_all=True,
        )

    def update(self, request, *args, **kwargs):
        table = self.get_object()
        old_values = snapshot_instance(table, fields=TABLE_AUDIT_FIELDS)
        response = super().update(request, *args, **kwargs)
        table.refresh_from_db()
        record_instance_update(
            request=request,
            instance=table,
            old_values=old_values,
            module=AuditModule.TABLES,
            fields=TABLE_AUDIT_FIELDS,
            description=f"{actor_name(request)} updated table {table.name}.",
        )
        return response

    def delete(self, request, *args, **kwargs):
        table = self.get_object()

        has_active_reservations = table.reservations.filter(
            status__in=['reserved', 'arrived']  # ACTIVE states only
        ).exists()

        if has_active_reservations:
            return Response(
                {"error": "Cannot delete table with active reservations."},
                status=status.HTTP_400_BAD_REQUEST
            )

        record_instance_delete(
            request=request,
            instance=table,
            module=AuditModule.TABLES,
            fields=TABLE_AUDIT_FIELDS,
            description=f"{actor_name(request)} deleted table {table.name}.",
        )
        return super().delete(request, *args, **kwargs)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsCashier, IsRestaurantActive])
def assign_delivery(request, pk):
    restaurant = get_restaurant_from_user(request)

    try:
        order = branch_scoped(
            request,
            Order.objects.filter(pk=pk, restaurant=restaurant),
        ).get()
    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Prevent changing after delivered/cancelled
    if order.status in ["delivered", "cancelled"]:
        return Response(
            {"error": f"Cannot assign delivery for {order.status} orders"},
            status=status.HTTP_400_BAD_REQUEST
        )

    delivery_boy_id = request.data.get("delivery_person_id")

    if not delivery_boy_id:
        return Response(
            {"error": "Delivery person ID required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        delivery_boy = Staff.objects.get(
            pk=delivery_boy_id,
            role="DeliveryBoy",
            restaurant=restaurant,
            branches=order.branch,
        )
    except Staff.DoesNotExist:
        return Response(
            {"error": "Delivery person not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    

    # Detect reassignment
    was_reassigned = (
        order.delivery_boy
        and order.delivery_boy.id != delivery_boy.id
    )

    old_delivery_boy = order.delivery_boy

    order.delivery_boy = delivery_boy

    
    if order.status == "ready":
        order.status = "out_for_delivery"
    order.save(
        update_fields=[
            "delivery_boy",
            "status",
            "updated_at"
        ]
    )

    serializer = OrderSerializer(order)

    return Response(
        {
            "message": (
                f"Order reassigned from "
                f"{old_delivery_boy.name} to {delivery_boy.name}"
                if was_reassigned
                else "Delivery assigned successfully"
            ),
            "order": serializer.data,
        },
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated,IsRestaurantActive, IsCashier|IsRestaurantAdmin])
def cashier_orders(request):
    restaurant = get_restaurant_from_user(request)
    if not restaurant:
        return Response({"error": "Restaurant not found"}, status=403)

    orders = branch_scoped(
        request,
        Order.objects.filter(restaurant=restaurant),
        allow_all=True,
    ).filter(
        Q(order_type='dine-in', status__in=['served','ready']) |
        (Q(order_type='takeaway') & ~Q(status='completed')) |
        Q(order_type='delivery', status__in=['ready', 'out_for_delivery'])
    ).order_by('-created_at')

    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsRestaurantActive, IsCashier | IsRestaurantAdmin])
def handle_order_bill_print(request, pk):
    restaurant = get_restaurant_from_user(request)
    if not restaurant:
        return Response({"error": "Restaurant not found"}, status=403)

    # get order using pk (NOT query_params)
    order = get_object_or_404(
        branch_scoped(request, Order.objects.filter(id=pk, restaurant=restaurant))
    )

    

    # mark as printed
    order.is_printed = True
    order.save(update_fields=["is_printed"])
    

    return Response({
        "message": "Bill printed successfully",
        "order_id": order.id,
        "is_printed": order.is_printed,
        "status": order.status,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated,IsRestaurantActive, IsCashier | IsRestaurantAdmin])
def cashier_reservations(request):
    restaurant = get_restaurant_from_user(request)

    if not restaurant:
        return Response({"error": "Restaurant not found"}, status=403)

    now = timezone.now()

    reservations = branch_scoped(
        request,
        Reservation.objects.filter(
            restaurant=restaurant,
        status__in=["reserved", "arrived"]
        ),
    ).select_related("table").order_by("start_time")

    search = request.query_params.get("search")
    if search:
        search_filter = (
            Q(customer_name__icontains=search)
            | Q(phone__icontains=search)
            | Q(table__name__icontains=search)
        )
        numeric_search = numeric_search_value(search)
        if numeric_search is not None:
            search_filter |= Q(reservation_number=numeric_search)
        reservations = reservations.filter(search_filter)

    status_filter = request.query_params.get("status")
    if status_filter and status_filter.lower() != "all":
        reservations = reservations.filter(status=status_filter)

    start_date = request.query_params.get("start")
    end_date = request.query_params.get("end")
    if start_date:
        reservations = reservations.filter(reservation_date__gte=start_date)
    if end_date:
        reservations = reservations.filter(reservation_date__lte=end_date)

    return paginated_response(request, reservations, ReservationSerializer)
@api_view(["POST"])
@permission_classes([IsAuthenticated,IsRestaurantActive,IsManager| IsCashier | IsRestaurantAdmin])
def mark_reservation_arrived(request, pk):
    restaurant = get_restaurant_from_user(request)

    reservation = get_object_or_404(
        branch_scoped(
            request,
            Reservation.objects.filter(pk=pk, restaurant=restaurant),
        )
    )

    if reservation.status != "reserved":
        return Response(
            {"error": "Only reserved reservations can be marked arrived"},
            status=400
        )

    reservation.status = "arrived"
    reservation.save(update_fields=["status"])

    return Response({"message": "Customer marked as arrived"})

@api_view(["POST"])
@permission_classes([IsAuthenticated,IsRestaurantActive,IsManager | IsRestaurantAdmin])
def mark_reservation_no_show(request, pk):
    restaurant = get_restaurant_from_user(request)

    reservation = get_object_or_404(
        branch_scoped(
            request,
            Reservation.objects.filter(pk=pk, restaurant=restaurant),
        )
    )

    if reservation.status != "reserved":
        return Response(
            {"error": "Only reserved reservations can be marked no show"},
            status=400
        )

    old_values = snapshot_instance(reservation, fields=RESERVATION_AUDIT_FIELDS)
    reservation.status = "no_show"
    reservation.save(update_fields=["status"])
    record_instance_update(
        request=request,
        instance=reservation,
        old_values=old_values,
        module=AuditModule.RESERVATIONS,
        fields=RESERVATION_AUDIT_FIELDS,
        action=AuditAction.STATUS_CHANGE,
        description=(
            f"{actor_name(request)} marked reservation "
            f"#{reservation.reservation_number} as no-show."
        ),
        severity="WARNING",
    )

    return Response({"message": "Customer marked as no shoiw"})
@api_view(["PATCH"])
@permission_classes([IsAuthenticated,IsRestaurantActive, IsManager|IsCashier | IsRestaurantAdmin])
def cancel_reservation(request,pk):
    restaurant = get_restaurant_from_user(request)

    reservation = get_object_or_404(
        branch_scoped(
            request,
            Reservation.objects.filter(pk=pk, restaurant=restaurant),
        )
    )

    if reservation.status!="reserved":
        return Response(
            {"error": "Cannot cancel reservation now"},
            status=400
        )
    old_values = snapshot_instance(reservation, fields=RESERVATION_AUDIT_FIELDS)
    reservation.status="cancelled"
    reservation.save(update_fields=["status"])
    record_instance_update(
        request=request,
        instance=reservation,
        old_values=old_values,
        module=AuditModule.RESERVATIONS,
        fields=RESERVATION_AUDIT_FIELDS,
        action=AuditAction.CANCEL,
        description=(
            f"{actor_name(request)} cancelled reservation "
            f"#{reservation.reservation_number}."
        ),
        severity="WARNING",
    )

    return Response({"message": "Reservation ancelled successfully"})



@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def bulk_update_order_items(request, pk):

    order = get_object_or_404(
        branch_scoped(request, Order.objects.select_for_update().filter(pk=pk))
    )
    if order.status in FINALIZED_ORDER_STATUSES:
        return finalized_order_response(order)

    items_data = request.data.get("items", [])

    for i in items_data:
        try:
            item = OrderItem.objects.get(id=i["id"], order=order)
        except OrderItem.DoesNotExist:
            continue

        if item.status != "pending":
            continue

        item.quantity = i["quantity"]
        item.save(update_fields=["quantity"])

    # ✅ FIX: use order, not item
    remaining = order.items.exclude(
        status__in=["ready", "cancelled"]
    ).exists()

    if not remaining:
        order.status = "ready"
        order.save(update_fields=["status"])

    return Response({"message": "Items updated"})
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def cancel_order_item(request, pk):

    restaurant = get_restaurant_from_user(request)

    try:
        item = OrderItem.objects.select_related(
            "order"
        ).get(
            pk=pk,
            order__restaurant=restaurant,
            order__branch=get_active_branch(request),
        )

    except OrderItem.DoesNotExist:
        return Response(
            {"error": "Item not found"},
            status=404
        )

    # only pending items cancellable
    if item.status != "pending":
        return Response(
            {
                "error":
                "Only pending items can be cancelled"
            },
            status=400
        )

    item.status = "cancelled"
    item.cancelled_by = request.user.staff_profile
    item.cancelled_at = timezone.now()

    item.save(update_fields=["status","cancelled_by","cancelled_at"])

    return Response({
        "message": "Item cancelled successfully"
    })
from django.utils.dateparse import parse_date
from django.db.models import Q

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantAdmin])
def all_discount_requests(request):

    discounts = DiscountRequest.objects.filter(
        order__restaurant=request.user.staff_profile.restaurant,
        order__branch=get_active_branch(request),
    ).select_related(
        "order",
        "requested_by",
        "approved_by",
        "order__table"
    ).order_by("-created_at")

    # status filter
    status_filter = request.GET.get("status")

    if status_filter and status_filter.lower() != "all":
        discounts = discounts.filter(status=status_filter.lower())

    search = request.GET.get("search")
    if search:
        search_filter = (
            Q(reason__icontains=search)
            | Q(order__name__icontains=search)
            | Q(order__phone__icontains=search)
            | Q(order__table__name__icontains=search)
            | Q(requested_by__name__icontains=search)
            | Q(approved_by__name__icontains=search)
        )
        numeric_search = numeric_search_value(search)
        if numeric_search is not None:
            search_filter |= Q(order__order_number=numeric_search)
        discounts = discounts.filter(search_filter)

    # start and end date filter
    start_date = request.GET.get("start")
    end_date = request.GET.get("end")

    if start_date:
        parsed_start = parse_date(start_date)
        if parsed_start:
            discounts = discounts.filter(created_at__date__gte=parsed_start)

    if end_date:
        parsed_end = parse_date(end_date)
        if parsed_end:
            discounts = discounts.filter(created_at__date__lte=parsed_end)

    return paginated_response(request, discounts, DiscountRequestSerializer)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsCashier])
def request_discount(request, order_id):
    order = get_object_or_404(
        branch_scoped(request, Order.objects.filter(id=order_id))
    )
    percent = Decimal(request.data.get("discount_percent", 0))
    reason = request.data.get("reason", "")

    if DiscountRequest.objects.filter(order=order, status="approved").exists():
        return Response({"error": "Discount already applied"}, status=400)
    if order.discount_percent>0:
        raise ValidationError("Order already discounted")
    if percent<=0:
        return Response({"error": "Invalid discount"}, status=400)
    if percent>100:
        return Response({"error": "Invalid discount"}, status=400)
    discount = DiscountRequest.objects.create(
        order=order,
        requested_by=request.user.staff_profile,
        discount_percent=percent,
        reason=reason
    )
    return Response({"message": "Discount request submitted", "id": discount.id})

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def approve_discount_or_reject(request, pk):
    discount = get_object_or_404(
        DiscountRequest,
        id=pk,
        order__branch=get_active_branch(request),
    )

    staff = request.user.staff_profile
    restaurant = staff.restaurant
    percent = discount.discount_percent

    manager_limit = restaurant.manager_discount_limit
    admin_limit = restaurant.admin_discount_limit
    restaurant = staff.restaurant
    if percent <= manager_limit:
        if staff.role not in ["Manager", "Admin", "BranchAdmin"]:
            return Response(
                {"error": "Only Manager/Admin can approve"},
                status=403
            )

    elif percent <= admin_limit:
        if staff.role not in ["Admin", "BranchAdmin"]:
            return Response(
                {"error": "Only Admin can approve"},
                status=403
            )
    else:
        return Response(
            {"error": "Discount exceeds allowed limit"},
            status=400
        )

    action = request.data.get("action")  # approve / reject

    if action == "reject":
        discount.status = "rejected"
        discount.approved_by = staff
        discount.approved_at = timezone.now()
        discount.save()
        return Response({"message": "Rejected"})

    if action == "approve":
        discount.status = "approved"
        discount.approved_by = staff
        discount.approved_at = timezone.now()
        discount.save()

        
        order = discount.order
        order.discount_percent = discount.discount_percent
        order.save()

        return Response({"message": "Approved and applied"})

    return Response({"error": "Invalid action"}, status=400)



@api_view(["GET"])
@permission_classes([IsAuthenticated,IsSameRestaurant,IsManager])
def manager_pending_discount_requests(request):
    restaurant = get_restaurant_from_user(request)
    manager_limit = restaurant.manager_discount_limit

    staff = request.user.staff_profile

    qs = DiscountRequest.objects.filter(
        order__restaurant=restaurant,
        order__branch=get_active_branch(request),
        status="pending"
    ).select_related(
        "order",
        "requested_by",
        "order__table"
    ).order_by("-created_at")

    # MANAGER CAN ONLY SEE <20%
    if staff.role == "Manager":
        qs = qs.filter(discount_percent__lte=manager_limit)

    search = request.query_params.get("search")
    if search:
        search_filter = (
            Q(reason__icontains=search)
            | Q(order__name__icontains=search)
            | Q(order__phone__icontains=search)
            | Q(order__table__name__icontains=search)
            | Q(requested_by__name__icontains=search)
        )
        numeric_search = numeric_search_value(search)
        if numeric_search is not None:
            search_filter |= Q(order__order_number=numeric_search)
        qs = qs.filter(search_filter)

    return paginated_response(request, qs, DiscountRequestSerializer)

@api_view(['GET'])
@permission_classes([IsAuthenticated,IsSameRestaurant,IsRestaurantAdmin])
def admin_pending_discount_requests(request):
    restaurant=get_restaurant_from_user(request)
    staff=request.user.staff_profile

    qs=DiscountRequest.objects.filter(
        order__restaurant=restaurant,
        order__branch=get_active_branch(request),
        status="pending"
    ).select_related(
        "order",
        "requested_by",
        "order__table"
    ).order_by("-created_at")
    search = request.query_params.get("search")
    if search:
        search_filter = (
            Q(reason__icontains=search)
            | Q(order__name__icontains=search)
            | Q(order__phone__icontains=search)
            | Q(order__table__name__icontains=search)
            | Q(requested_by__name__icontains=search)
        )
        numeric_search = numeric_search_value(search)
        if numeric_search is not None:
            search_filter |= Q(order__order_number=numeric_search)
        qs = qs.filter(search_filter)
    return paginated_response(request, qs, DiscountRequestSerializer)
