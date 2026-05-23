from urllib import request
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Q
from django.db import transaction
from django_ratelimit.core import is_ratelimited
from restaurants.models import Restaurant
from menu.serializers import CategorySerializer,MenuItemSerializer
from datetime import timedelta
from .models import Order, Table, OrderItem,Reservation,DiscountRequest
from .seriailizers import OrderSerializer, TableSerializer,ReservationSerializer,DiscountRequestSerializer
from menu.models import Category, MenuItem
from users.models import Staff
from inventory.services import deduct_stock_for_order_item
from rest_framework.pagination import PageNumberPagination
from restaurants.permissions import IsCashier,IsKitchenManager,IsRestaurantAdmin
from restaurants.permissions import IsSameRestaurant,IsWaiter,IsRestaurantAdmin,IsRestaurantActive,IsManager
from rest_framework.exceptions import NotFound
from django.utils import timezone
from decimal import Decimal
from rest_framework.exceptions import ValidationError
from menu.models import Platter

from django.db.models import Sum, F, DecimalField, ExpressionWrapper

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

class OrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

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

        serializer = OrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    elif request.method == 'POST':

        serializer = OrderSerializer(data=request.data, context={'request': request,'restaurant': restaurant,})
        if serializer.is_valid():
            # 2. Save with Restaurant
            try:
                staff = None

            

            # If authenticated user is staff
                if request.user.is_authenticated and hasattr(request.user, "staff_profile"):
                    staff = request.user.staff_profile

                serializer.save(
                    restaurant=restaurant,
                    created_by=staff  
                )
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
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
        order = Order.objects.select_related("table").get(
            pk=pk,
            restaurant=restaurant
        )
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
        new_table = Table.objects.get(
            id=new_table_id,
            restaurant=restaurant
        )
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
@permission_classes([IsAuthenticated,IsManager| IsCashier | IsRestaurantAdmin,IsRestaurantActive])
def reservation_list_create(request):
    restaurant = get_restaurant_from_user(request)

    if not restaurant:
        return Response({"error": "Restaurant not found"}, status=403)


    if request.method == "GET":
        reservations = Reservation.objects.filter(
            restaurant=restaurant
        ).select_related("table", "created_by").order_by("-start_time", "id")

        status_filter = request.query_params.get("status")
        if status_filter:
            reservations = reservations.filter(status=status_filter)

        date_filter = request.query_params.get("date")
        if date_filter:
            reservations = reservations.filter(reservation_date=date_filter)

        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)

    # ---------------- POST ----------------
    serializer = ReservationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(
            restaurant=restaurant,
            created_by=request.user.staff_profile
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

        return Reservation.objects.filter(
            restaurant=restaurant
        ).select_related(
            "table", "created_by"
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def create_online_order(request,slug):
    restaurant = get_object_or_404(Restaurant, slug=slug)

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
    limited=is_ratelimited(
        request=request,
        group=f"online_orders_{slug}",
        fn=None,
                key="ip",
                rate="5/20m",
                method="POST",
                increment=True,
    )
    if limited:
        return Response({"error": "Too many online orders."}, status=429)
    serializer = OrderSerializer(data=request.data, context={"request": request, "restaurant": restaurant})
    if serializer.is_valid():
        try:
            serializer.save(restaurant=restaurant)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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

    active_items = OrderItem.objects.filter(
        order=OuterRef("pk"),
        status__in=ACTIVE_STATUSES
    )

    orders = (
        Order.objects.filter(
            restaurant=restaurant,
            order_type__in=["dine-in", "takeaway", "delivery"],
        )
        .exclude(status__in=["completed", "cancelled"])  # 🔥 KEY FIX
        .annotate(has_active_items=Exists(active_items))
        .filter(has_active_items=True)
        .select_related("table")
        .prefetch_related("items__menu_item", "customer")
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


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive,IsManager| IsWaiter  | IsRestaurantAdmin])
def cancel_order(request, pk):
    restaurant = get_restaurant_from_user(request)
    
    try:
        # Ensure order belongs to user's restaurant
        order = Order.objects.select_related("table").get(pk=pk, restaurant=restaurant)
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
    elif role == "Admin":
        if order.status in ["completed"]:
            return Response({"error":"Order is already completed"}, status=status.HTTP_403_FORBIDDEN)
    else:
         pass

    order.status = "cancelled"
    order.save()

    return Response({"message": "Order cancelled", "order_id": order.id}, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([AllowAny])
def cancel_online_order(request, slug, pk):
    restaurant = get_object_or_404(Restaurant, slug=slug)
    
    try:
        order = Order.objects.get(pk=pk, restaurant=restaurant)
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
def update_order_status(request, pk):
    restaurant = get_restaurant_from_user(request)

    try:
        order = Order.objects.get(pk=pk, restaurant=restaurant)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    validated_statuses = [s[0] for s in Order.STATUS_CHOICES]

    if new_status not in validated_statuses:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    order.status = new_status

    # ✅ Capture completion payment info
    if new_status in ["completed", "delivered"]:
        staff = getattr(request.user, "staff_profile", None)

        order.received_by = staff
        order.paid_at = timezone.now()

        reservation = order.reservation

        if not reservation and order.table:
            now = timezone.now()
            reservation = Reservation.objects.filter(
                restaurant=restaurant,
                table=order.table,
                status__in=["reserved", "arrived"],
                start_time__lte=now
            ).order_by("-start_time").first()

            if reservation and not reservation.matches_customer(order.name, order.phone):
                reservation = None

        if reservation and reservation.status != "completed":
            reservation.status = "completed"
            reservation.save(update_fields=["status"])
    if new_status == "in_progress":

        order.items.exclude(
            status="cancelled"
        ).update(
            status="approved"
        )
    if new_status == "ready":

        order.items.exclude(
            status="cancelled"
        ).update(
            status="ready"
        )
    order.save()

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)


class OrderRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter queryset based on restaurant
        restaurant = get_restaurant_from_user(self.request)
        return Order.objects.filter(restaurant=restaurant).prefetch_related('items__menu_item', 'customer')


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def add_items_to_order(request, pk):
    restaurant = get_restaurant_from_user(request)
    
    try:
        order = Order.objects.get(pk=pk, restaurant=restaurant)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    items_data = request.data.get('items', [])
    new_items = []

    
    staff = request.user.staff_profile
    with transaction.atomic():

        for item in items_data:

            menu_item_id = item.get("menu_item")
            platter_id = item.get("platter")
            quantity = item.get("quantity", 1)

            # must have one
            if not menu_item_id and not platter_id:
                continue

            # cannot have both
            if menu_item_id and platter_id:
                continue

            # ─── MENU ITEM ───
            if menu_item_id:

                try:
                    menu_item = MenuItem.objects.get(
                        pk=menu_item_id,
                        restaurant=restaurant
                    )
                except MenuItem.DoesNotExist:
                    continue

                order_item = OrderItem.objects.create(
                    order=order,
                    menu_item=menu_item,
                    quantity=quantity,
                    is_new=True,
                    description=item.get("description", ""),
                    added_by=staff

                )

                deduct_stock_for_order_item(order_item, order)

                new_items.append({
                    "id": order_item.id,
                    "name": menu_item.name,
                    "quantity": order_item.quantity
                })

            # ─── PLATTER ───
            elif platter_id:

                try:
                    platter = Platter.objects.get(
                        pk=platter_id,
                        restaurant=restaurant
                    )
                except Platter.DoesNotExist:
                    continue

                order_item = OrderItem.objects.create(
                    order=order,
                    platter=platter,
                    quantity=quantity,
                    is_new=True,
                    description=item.get("description", ""),
                    added_by=staff
                )

                deduct_stock_for_order_item(order_item, order)

                new_items.append({
                    "id": order_item.id,
                    "name": platter.name,
                    "quantity": order_item.quantity
                })

    return Response({"new_items": new_items}, status=status.HTTP_200_OK)

@api_view(["PATCH"])
@permission_classes([
    IsAuthenticated,
    IsRestaurantActive
])
def update_order_item_status(request, pk):

    restaurant = get_restaurant_from_user(request)

    try:
        item = OrderItem.objects.select_related(
            "order"
        ).get(
            pk=pk,
            order__restaurant=restaurant
        )

    except OrderItem.DoesNotExist:
        return Response(
            {"error": "Item not found"},
            status=status.HTTP_404_NOT_FOUND
        )

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
                "error":
                "Cancelled items cannot be changed"
            },
            status=400
        )

    item.status = new_status

    item.save(update_fields=["status"])

    return Response({
        "message": f"Item marked as {new_status}"
    })


@api_view(['GET', "POST"])
@permission_classes([IsAuthenticated,IsSameRestaurant,IsRestaurantActive])
def table_list_create(request):
    restaurant = get_restaurant_from_user(request)
    if not restaurant:
        return Response({"error": "Restaurant not found"}, status=403)

    if request.method == 'GET':
        # Filter tables by restaurant
        tables = Table.objects.filter(restaurant=restaurant).prefetch_related('orders')
        serializer = TableSerializer(tables, many=True,context={"request": request})
        return Response(serializer.data)
    
    elif request.method == "POST":
        if request.user.staff_profile.is_demo:
            return Response({"detail": "Action restricted in demo mode"}, status=403)
        
        serializer = TableSerializer(data=request.data)
        if serializer.is_valid():
            # Save with restaurant
            serializer.save(restaurant=restaurant)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.response import Response
from rest_framework import status

class TableRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticated, IsSameRestaurant, IsRestaurantActive]

    def get_queryset(self):
        restaurant = get_restaurant_from_user(self.request)
        return Table.objects.filter(restaurant=restaurant)

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

        return super().delete(request, *args, **kwargs)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsCashier, IsRestaurantActive])
def assign_delivery(request, pk):
    restaurant = get_restaurant_from_user(request)

    try:
        order = Order.objects.get(pk=pk, restaurant=restaurant)
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

    orders = Order.objects.filter(
        restaurant=restaurant 
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
    order = get_object_or_404(Order, id=pk, restaurant=restaurant)

    

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

    reservations = Reservation.objects.filter(
        restaurant=restaurant,
        status__in=["reserved", "arrived"]
    ).select_related("table").order_by("start_time")

    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)
@api_view(["POST"])
@permission_classes([IsAuthenticated,IsRestaurantActive,IsManager| IsCashier | IsRestaurantAdmin])
def mark_reservation_arrived(request, pk):
    restaurant = get_restaurant_from_user(request)

    reservation = get_object_or_404(
        Reservation,
        pk=pk,
        restaurant=restaurant
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
        Reservation,
        pk=pk,
        restaurant=restaurant
    )

    if reservation.status != "reserved":
        return Response(
            {"error": "Only reserved reservations can be marked no show"},
            status=400
        )

    reservation.status = "no_show"
    reservation.save(update_fields=["status"])

    return Response({"message": "Customer marked as no shoiw"})
@api_view(["PATCH"])
@permission_classes([IsAuthenticated,IsRestaurantActive, IsManager|IsCashier | IsRestaurantAdmin])
def cancel_reservation(request,pk):
    restaurant = get_restaurant_from_user(request)

    reservation = get_object_or_404(
        Reservation,
        pk=pk,
        restaurant=restaurant
    )

    if reservation.status!="reserved":
        return Response(
            {"error": "Cannot cancel reservation now"},
            status=400
        )
    reservation.status="cancelled"
    reservation.save(update_fields=["status"])

    return Response({"message": "Reservation ancelled successfully"})



@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def bulk_update_order_items(request, pk):

    order = get_object_or_404(Order, pk=pk)
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
            order__restaurant=restaurant
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
        order__restaurant=request.user.staff_profile.restaurant
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

    serializer = DiscountRequestSerializer(discounts, many=True)

    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsCashier])
def request_discount(request, order_id):
    order = get_object_or_404(Order, id=order_id)
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
    discount = get_object_or_404(DiscountRequest, id=pk)

    staff = request.user.staff_profile
    restaurant = staff.restaurant
    percent = discount.discount_percent

    manager_limit = restaurant.manager_discount_limit
    admin_limit = restaurant.admin_discount_limit
    restaurant = staff.restaurant
    if percent <= manager_limit:
        if staff.role not in ["Manager", "Admin"]:
            return Response(
                {"error": "Only Manager/Admin can approve"},
                status=403
            )

    elif percent <= admin_limit:
        if staff.role != "Admin":
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
        status="pending"
    ).select_related(
        "order",
        "requested_by",
        "order__table"
    ).order_by("-created_at")

    # MANAGER CAN ONLY SEE <20%
    if staff.role == "Manager":
        qs = qs.filter(discount_percent__lte=manager_limit)

    serializer = DiscountRequestSerializer(qs, many=True)

    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated,IsSameRestaurant,IsRestaurantAdmin])
def admin_pending_discount_requests(request):
    restaurant=get_restaurant_from_user(request)
    staff=request.user.staff_profile

    qs=DiscountRequest.objects.filter(
        order__restaurant=restaurant,
        status="pending"
    ).select_related(
        "order",
        "requested_by",
        "order__table"
    ).order_by("-created_at")
    serializer = DiscountRequestSerializer(qs, many=True)
    return Response(serializer.data)