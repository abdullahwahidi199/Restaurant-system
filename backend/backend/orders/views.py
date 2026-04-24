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
from .models import Order, Table, OrderItem,Reservation
from .seriailizers import OrderSerializer, TableSerializer,ReservationSerializer
from menu.models import Category, MenuItem
from users.models import Staff
from inventory.services import deduct_stock_for_order_item
from rest_framework.pagination import PageNumberPagination
from restaurants.permissions import IsCashier,IsKitchenManager,IsRestaurantAdmin
from restaurants.permissions import IsSameRestaurant,IsWaiter,IsRestaurantAdmin,IsRestaurantActive
from rest_framework.exceptions import NotFound
from django.utils import timezone


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
        order_type = request.data.get("order_type")
        if order_type == "delivery":
            limited = is_ratelimited(
                request=request, group='online_orders', fn=None,
                key='ip', rate='5/20m', method='POST', increment=True
            )
            if limited:
                return Response({"error": "Too many online orders."}, status=429)

        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # 2. Save with Restaurant
            try:
                staff = None

            

            # If authenticated user is staff
                if request.user.is_authenticated and hasattr(request.user, "staff_profile"):
                    staff = request.user.staff_profile

                serializer.save(
                    restaurant=restaurant,
                    created_by=staff   # 👈 THIS IS THE KEY PART
                )
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsCashier | IsRestaurantAdmin,IsRestaurantActive])
def reservation_list_create(request):
    restaurant = get_restaurant_from_user(request)

    if not restaurant:
        return Response({"error": "Restaurant not found"}, status=403)

    # ---------------- GET ----------------
    if request.method == "GET":
        reservations = Reservation.objects.filter(
            restaurant=restaurant
        ).select_related("table", "created_by").order_by("start_time")

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
    permission_classes = [IsAuthenticated, IsCashier | IsRestaurantAdmin,IsRestaurantActive]

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
@api_view(["GET"])
@permission_classes([IsAuthenticated,IsRestaurantActive, IsKitchenManager | IsRestaurantAdmin])
def kitchen_orders(request):
    restaurant = get_restaurant_from_user(request)
    if not restaurant:
        return Response({"error": "Restaurant not found"}, status=403)

    KITCHEN_ALLOWED_STATUSES = ["pending", "in_progress", "ready"]
    
    orders = (
        Order.objects
        .filter(restaurant=restaurant) # FILTER HERE
        .prefetch_related('items__menu_item', 'customer')
        .select_related('table')
        .order_by('-created_at')
        .filter(order_type__in=["dine-in", "takeaway", "delivery"])
        .filter(status__in=["pending", "in_progress", "ready"])
    )

    order_type = request.query_params.get("order_type")
    status = request.query_params.get("status")

    if order_type and order_type != 'all':
        orders = orders.filter(order_type=order_type)
    if status and status != 'all':
        orders = orders.filter(status=status)
    
    now = timezone.now()
    def is_visible(order):
        if order.order_type != "delivery":
            return True
        return (now - order.created_at).total_seconds() / 60 >= 2

    orders = [o for o in orders if is_visible(o)]

    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive, IsWaiter  | IsRestaurantAdmin])
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
    if new_status == "completed":
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

    with transaction.atomic():
        for item in items_data:
            # Ensure Menu Item belongs to the same restaurant (assuming MenuItem has restaurant field)
            try:
                menu_item = MenuItem.objects.get(pk=item['menu_item'], restaurant=restaurant)
            except MenuItem.DoesNotExist:
                # Handle case where menu item doesn't exist or doesn't belong to restaurant
                continue 

            order_item = OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=item.get('quantity', 1),
                is_new=True,
                description=item.get("description", "")
            )
            deduct_stock_for_order_item(order_item, order)
            new_items.append({"id": order_item.id, "name": menu_item.name, "quantity": order_item.quantity})

    return Response({"new_items": new_items}, status=status.HTTP_200_OK)


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
@permission_classes([IsAuthenticated,IsCashier,IsRestaurantActive])
def assign_delivery(request, pk):
    restaurant = get_restaurant_from_user(request)
    
    try:
        order = Order.objects.get(pk=pk, restaurant=restaurant)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    delivery_boy_id = request.data.get("delivery_person_id")
    if not delivery_boy_id:
        return Response({'error': 'Delivery person ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Ensure Delivery Boy belongs to the SAME restaurant
        delivery_boy = Staff.objects.get(pk=delivery_boy_id, role='DeliveryBoy', restaurant=restaurant)
    except Staff.DoesNotExist:
        return Response({'error': 'Delivery person not found in your restaurant'}, status=status.HTTP_404_NOT_FOUND)
        
    order.delivery_boy = delivery_boy
    order.status = "out_for_delivery"
    order.save(update_fields=["delivery_boy", "status", "updated_at"])

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated,IsRestaurantActive, IsCashier|IsRestaurantAdmin])
def cashier_orders(request):
    restaurant = get_restaurant_from_user(request)
    if not restaurant:
        return Response({"error": "Restaurant not found"}, status=403)

    orders = Order.objects.filter(
        restaurant=restaurant 
    ).filter(
        Q(order_type='dine-in', status='served') |
        (Q(order_type='takeaway') & ~Q(status='completed')) |
        Q(order_type='delivery', status__in=['ready', 'out_for_delivery'])
    ).order_by('-created_at')

    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

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
@permission_classes([IsAuthenticated,IsRestaurantActive, IsCashier | IsRestaurantAdmin])
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
@permission_classes([IsAuthenticated,IsRestaurantActive, IsCashier | IsRestaurantAdmin])
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
@permission_classes([IsAuthenticated,IsRestaurantActive, IsCashier | IsRestaurantAdmin])
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