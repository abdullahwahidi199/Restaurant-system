from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from .models import Order,Table,OrderItem
from .seriailizers import OrderSerializer,TableSerializer
from menu.models import MenuItem
from users.models import Staff
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .seriailizers import OrderSerializer
from inventory.services import deduct_stock_for_order_item
from rest_framework.pagination import PageNumberPagination
from django_ratelimit.core import is_ratelimited
from django.utils.decorators import method_decorator

class OrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def order_list_create(request):
    if request.method == 'GET':
        orders = Order.objects.prefetch_related('items__menu_item', 'customer','review').select_related('table').order_by('-created_at')


      
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
        if order_type=="delivery":
            limited = is_ratelimited(
                request=request,
                group='online_orders',
                fn=None,
                key='ip',
                rate='5/20m',
                method='POST',
                increment=True
        )
            if limited:
                return Response(
                    {"error": "Too many online orders. Please try again later."},
                    status=429
                )

        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                serializer.save()
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def kitchen_orders(request):
    KITCHEN_ALLOWED_STATUSES = ["pending", "in_progress", "ready"]
    KITCHEN_ORDER_TYPES = ["dine-in", "takeaway", "delivery"]
    orders = (
        Order.objects
        .prefetch_related('items__menu_item', 'customer')
        .select_related('table')
        .order_by('-created_at')
        .filter(order_type__in=["dine-in", "takeaway", "delivery"])
        .filter(status__in=["pending", "in_progress", "ready"])
    )

    order_type = request.query_params.get("order_type")
    status = request.query_params.get("status")

    if order_type and order_type!='all':
        orders = orders.filter(order_type=order_type)
    if status and status!='all':
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
@permission_classes([AllowAny])
def cancel_order(request, pk):
    try:
        order = Order.objects.select_related("table").get(pk=pk)
    
    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    blocked_statuses = ["completed", "cancelled"]

    if order.status in blocked_statuses:
        return Response(
            {"error": f"Order already {order.status}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not request.user.is_authenticated:
        return Response(
            {"error": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    role=None
    if request.user.is_superuser:
        role = "Admin"

    elif hasattr(request.user, "staff_profile"):
        role = request.user.staff_profile.role

    elif hasattr(request.user, "customer"):
        role = "Customer"
    
    now =timezone.now()
    minutes_passed=(now-order.created_at).total_seconds()/60

    
    if role == "Customer":
        customer=request.user.customer
        if order.customer_id != customer.id:
            return Response(
                {"error": "You can cancel only your own orders"},
                status=status.HTTP_403_FORBIDDEN
            )
        if order.status != "pending":
            return Response(
                {"error": "You can cancel only pending orders"},
                status=status.HTTP_403_FORBIDDEN
            )

        if minutes_passed > 2:
            return Response(
                {"error": "Cancellation time expired"},
                status=status.HTTP_403_FORBIDDEN
            )
    elif role == "Waiter":
        if order.status not in ["pending"]:
            return Response(
                {"error": "Waiter cannot cancel this order now"},
                status=status.HTTP_403_FORBIDDEN
            )
    elif role == "Admin":
        if order.status in ["completed"]:
            return Response(
                {"error":"Order is already completed, cannot cancel!"},
                status=status.HTTP_403_FORBIDDEN
            )
    else:
        return Response(
            {"error": "Permission denied"},
            status=status.HTTP_403_FORBIDDEN
        )

    order.status="cancelled"
    order.save()

    return Response(
        {
            "message": "Order cancelled successfully",
            "order_id": order.id,
            "status": order.status
        },
        status=status.HTTP_200_OK
    )


@api_view(['PATCH'])
def update_order_status(request,pk):
    try:
        order=Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    new_status=request.data.get('status')
    validated_statuses=[s[0] for s in Order.STATUS_CHOICES]

    if new_status not in validated_statuses:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    order.status=new_status
    order.save()
    
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)


class OrderRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    queryset = Order.objects.prefetch_related('items__menu_item', 'customer')
    serializer_class = OrderSerializer
from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from menu.models import MenuItem
from .models import Order, OrderItem
from inventory.services import deduct_stock_for_order_item


@api_view(["PATCH"])
def add_items_to_order(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    items_data = request.data.get('items', [])

    new_items = []

    with transaction.atomic():
        for item in items_data:
            menu_item = MenuItem.objects.get(pk=item['menu_item'])

            order_item = OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=item.get('quantity', 1),
                is_new=True,
                description=item.get("description", "")
            )

            # 🔥 IMPORTANT: deduct stock immediately for this item
            deduct_stock_for_order_item(order_item, order)

            new_items.append({
                "id": order_item.id,
                "name": menu_item.name,
                "quantity": order_item.quantity,
                "is_new": True,
            })

    return Response({"new_items": new_items}, status=status.HTTP_200_OK)


@api_view(['GET',"POST"])
def table_list_create(request):
    if request.method=='GET':
        tables=Table.objects.prefetch_related('orders').all()
        serializer=TableSerializer(tables,many=True)
        return Response(serializer.data)
    elif request.method=="POST":
        if request.user.staff_profile.is_demo:
            return Response({"detail":"Action restricted in demo mode"},status=403)
        serializer=TableSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TableRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Table.objects.prefetch_related('orders')
    serializer_class = TableSerializer

@api_view(["PATCH"])
def assign_delivery(request, pk):
    
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    delivery_boy_id = request.data.get("delivery_person_id")
    if not delivery_boy_id:
        return Response({'error': 'Delivery person name is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        delivery_boy = Staff.objects.get(pk=delivery_boy_id, role='DeliveryBoy')
    except Staff.DoesNotExist:
        return Response({'error': 'Delivery person not found or not a DeliveryBoy'}, status=status.HTTP_404_NOT_FOUND)
    order.delivery_boy = delivery_boy
    order.status = "out_for_delivery"
    order.save(update_fields=["delivery_boy", "status", "updated_at"])

    # You could optionally have a DeliveryBoy model instead of storing the name only.
    
   

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def cashier_orders(request):
    orders = Order.objects.filter(
        Q(order_type='dine-in', status='served') |
        (Q(order_type='takeaway') & ~Q(status='completed')) |
        Q(order_type='delivery', status__in=['ready', 'out_for_delivery'])
    ).order_by('-created_at')

    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)