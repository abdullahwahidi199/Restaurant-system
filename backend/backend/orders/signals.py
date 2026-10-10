from .models import Order
from django.db.models.signals import  post_save, post_delete
from django.dispatch import receiver
from reports.models import Notification 
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Order,OrderItem,Table,Reservation,DiscountRequest
from .seriailizers import OrderSerializer ,TableSerializer,TablePanelSerializer,DiscountRequestSerializer

from django.db import transaction
from django.db.models import Prefetch


import json
import logging
from django.core.serializers.json import DjangoJSONEncoder


logger = logging.getLogger(__name__)

def make_json_safe(data):
    return json.loads(
        json.dumps(data, cls=DjangoJSONEncoder)
    )
@receiver(post_save, sender=Order)
def order_created_notification(sender, instance, created, **kwargs):
    if created and instance.restaurant:
        transaction.on_commit(lambda: Notification.objects.create(
            restaurant=instance.restaurant,
            branch=instance.branch,
            type="order",
            message=f"New order placed by {instance.name}"
        ))

channel_layer = get_channel_layer()
print(channel_layer) 

def broadcast_order(order):
    if not order or not order.restaurant:
        return

    order = (
        Order.objects
        .prefetch_related(
            "items__menu_item__station",
            "items__platter__station"
        )
        .get(pk=order.pk)
    )

    serialized_order = make_json_safe(
    OrderSerializer(order).data
)

    group_name = f"orders_{order.restaurant.id}"

    logger.info(
        "order_websocket_broadcast order_id=%s status=%s paid_at_set=%s "
        "updated_at=%s group=%s",
        order.pk,
        order.status,
        bool(order.paid_at),
        order.updated_at.isoformat() if order.updated_at else None,
        group_name,
    )

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "order_message",
            "message": {
                "type": "NEW_ORDER",
                "order": serialized_order
            },
        }
    )


def broadcast_customer_order(order):
    """Notify only the customer that owns this order, without staff payloads."""
    if not order or not order.pk or not order.customer_id:
        return
    current = Order.objects.only(
        "id",
        "customer_id",
        "status",
        "updated_at",
    ).filter(pk=order.pk).first()
    if not current or not current.customer_id:
        return
    async_to_sync(channel_layer.group_send)(
        f"customer_order_{current.id}",
        {
            "type": "customer_order_message",
            "message": {
                "type": "ORDER_UPDATED",
                "order_id": current.id,
                "status": current.status,
                "updated_at": (
                    current.updated_at.isoformat() if current.updated_at else None
                ),
            },
        },
    )

def broadcast_table(table):
    if not table:
        return

    active_orders = Order.objects.filter(
        status__in=["pending", "in_progress", "ready", "served"],
    ).order_by("-created_at")
    reservations = Reservation.objects.filter(
        status__in=["arrived", "reserved"],
    ).order_by("start_time")

    table = Table.objects.prefetch_related(
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
    ).get(pk=table.pk)
    serialized = make_json_safe(
    TablePanelSerializer(table).data
)

    group_name = f"orders_{table.restaurant.id}"

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "table_message",
            "message": {
                "type": "TABLE_UPDATED",
                "table": serialized,
            },
        }
    )
# signals.py - Replace the order item signals

from .models import Order, OrderItem, Table, Reservation, DiscountRequest
from .seriailizers import OrderSerializer, TableSerializer, OrderItemMiniSerializer

# ✅ ADD: Lightweight broadcast functions for item changes

def broadcast_order_item_update(instance, action="ITEM_UPDATED"):
    """Broadcast ONLY the changed item, not the whole order"""
    if not instance or not instance.order_id:
        return
    
    try:
        # Fetch only the specific item with needed relations
        item = OrderItem.objects.select_related(
            'menu_item', 'platter', 'added_by', 'order__restaurant'
        ).get(pk=instance.pk)
        if not item.order.restaurant_id:
            return
        
        serialized_item = make_json_safe(
            OrderItemMiniSerializer(item).data
        )
        
        group_name = f"orders_{item.order.restaurant_id}"
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "order_message",
                "message": {
                    "type": action,  # "ITEM_UPDATED", "ITEM_CREATED", "ITEM_DELETED"
                    "order_id": instance.order_id,
                    "item": serialized_item,
                    "order_updated_at": (
                        item.order.updated_at.isoformat()
                        if item.order.updated_at else None
                    ),
                },
            }
        )
    except OrderItem.DoesNotExist:
        pass


def broadcast_order_item_delete(instance):
    """Broadcast item deletion (just need the ID and order_id)"""
    if not instance or not instance.order_id:
        return
    
    try:
        order = Order.objects.only("restaurant_id", "updated_at").filter(
            pk=instance.order_id
        ).first()
        if not order:
            return
            
        group_name = f"orders_{order.restaurant_id}"
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "order_message",
                "message": {
                    "type": "ITEM_DELETED",
                    "order_id": instance.order_id,
                    "item_id": instance.pk,
                    "order_updated_at": (
                        order.updated_at.isoformat() if order.updated_at else None
                    ),
                },
            }
        )
    except Exception:
        pass

from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from django.db.models import ExpressionWrapper

def broadcast_table_items_update(order):
    """Broadcast only item count and total for table updates - MUCH lighter"""
    if not order or not order.pk:
        return

    # Signal callbacks can hold a model snapshot loaded before another request
    # committed payment. Always publish the post-commit database truth.
    order = Order.objects.select_related("table", "restaurant").filter(
        pk=order.pk
    ).first()
    if not order or not order.table or not order.restaurant:
        return

    group_name = f"orders_{order.restaurant_id}"
    line_total = ExpressionWrapper(
    F('quantity') * F('menu_item__price'),
    output_field=DecimalField(
        max_digits=12,
        decimal_places=2
    )
    )

    total = order.items.exclude(
        status='cancelled'
    ).aggregate(
        total=Coalesce(
            Sum(line_total),
            0,
            output_field=DecimalField(
                max_digits=12,
                decimal_places=2
            )
        )
    )["total"]
    
    # Only send what the table view needs
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "table_message",
            "message": {
                "type": "TABLE_ITEMS_UPDATED",
                "table_id": order.table_id,
                "order_id": order.id,
                "item_count": order.items.exclude(status='cancelled').count(),
                "order_total": str(total),
                "order_status": order.status,
                "order_updated_at": (
                    order.updated_at.isoformat() if order.updated_at else None
                ),
            },
        }
    )


# ✅ REPLACE these signal handlers

@receiver(post_save, sender=OrderItem)
def order_item_updated(sender, instance, created, **kwargs):
    transaction.on_commit(
        lambda: broadcast_order_item_update(
            instance,
            "ITEM_CREATED" if created else "ITEM_UPDATED"
        ),
        robust=True,
    )

    if instance.order_id:
        try:
            order = Order.objects.only(
                'id',
                'table_id',
                'restaurant_id',
                'status'
            ).get(pk=instance.order_id)

            transaction.on_commit(
                lambda: broadcast_table_items_update(order),
                robust=True,
            )
            transaction.on_commit(lambda: broadcast_customer_order(order), robust=True)

        except Order.DoesNotExist:
            pass


@receiver(post_delete, sender=OrderItem)
def order_item_deleted(sender, instance, **kwargs):
    # Store order info before deletion
    order_id = instance.order_id
    restaurant_id = instance.order.restaurant_id if hasattr(instance, 'order') and instance.order else None
    
    def _broadcast():
        if order_id:
            # Send item deletion message
            broadcast_order_item_delete(instance)
            
            # Update table with lightweight message
            order = Order.objects.only('id', 'table_id', 'restaurant_id', 'status').filter(pk=order_id).first()
            if order:
                broadcast_table_items_update(order)
                broadcast_customer_order(order)
    
    transaction.on_commit(_broadcast, robust=True)
# Keep this for actual Order changes (status, details, etc.)
@receiver(post_save, sender=Order)
def order_post_save(sender, instance, created, **kwargs):
    if created:
        # New order - full broadcast is appropriate
        transaction.on_commit(lambda: broadcast_order(instance), robust=True)
    else:
        # Order details changed (status, address, etc.)
        # Only broadcast if it's NOT just an item change
        transaction.on_commit(lambda: broadcast_order(instance), robust=True)
    transaction.on_commit(lambda: broadcast_customer_order(instance), robust=True)


@receiver(post_delete, sender=Order)
def order_post_delete(sender, instance, **kwargs):
    transaction.on_commit(lambda: broadcast_order(instance))

@receiver(post_save, sender=Table)
def table_post_save(sender, instance, **kwargs):
    # Realtime delivery is best-effort. A temporary Redis/channel-layer failure
    # must never roll back the table/order change that triggered the broadcast.
    transaction.on_commit(lambda: broadcast_table(instance), robust=True)





def broadcast_discount(discount, event_type="NEW_DISCOUNT_REQUEST"):

    if not discount or not discount.order.restaurant:
        return

    discount = DiscountRequest.objects.select_related(
        "order",
        "requested_by",
        "approved_by",
        "order__table"
    ).get(pk=discount.pk)

    serialized = make_json_safe(
    DiscountRequestSerializer(discount).data
)

    group_name = f"discounts_{discount.order.restaurant.id}"

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "discount_message",
            "message": {
                "type": event_type,
                "discount": serialized,
            },
        }
    )
@receiver(post_save, sender=DiscountRequest)
def discount_post_save(sender, instance, created, **kwargs):
    event_type = None
    if created:
        event_type = "NEW_DISCOUNT_REQUEST"
    elif instance.status == "approved":
        event_type = "DISCOUNT_APPROVED"
    elif instance.status == "rejected":
        event_type = "DISCOUNT_REJECTED"

    def _broadcast():
        if event_type:
            broadcast_discount(instance, event_type)
        # Keep order clients synchronized after the transaction has committed,
        # so they never observe a discount state that later rolls back.
        broadcast_order(instance.order)
        broadcast_customer_order(instance.order)

    transaction.on_commit(_broadcast, robust=True)
