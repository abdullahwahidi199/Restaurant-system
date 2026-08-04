from .models import Order
from django.db.models.signals import  post_save, post_delete
from django.dispatch import receiver
from reports.models import Notification 
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Order,OrderItem,Table,DiscountRequest
from .seriailizers import OrderSerializer ,TableSerializer,DiscountRequestSerializer

from django.db import transaction


import json
from django.core.serializers.json import DjangoJSONEncoder

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

    order = Order.objects.prefetch_related('items__menu_item').get(pk=order.pk)

    serialized_order = make_json_safe(
    OrderSerializer(order).data
)

    group_name = f"orders_{order.restaurant.id}"

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

def broadcast_table(table):
    if not table:
        return

    table = Table.objects.prefetch_related(
        "orders__items__menu_item"
    ).get(pk=table.pk)
    serialized = make_json_safe(
    TableSerializer(table).data
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

from .models import Order, OrderItem, Table, DiscountRequest
from .seriailizers import OrderSerializer, TableSerializer, OrderItemMiniSerializer

# ✅ ADD: Lightweight broadcast functions for item changes

def broadcast_order_item_update(instance, action="ITEM_UPDATED"):
    """Broadcast ONLY the changed item, not the whole order"""
    if not instance or not instance.order_id or not instance.order.restaurant:
        return
    
    try:
        # Fetch only the specific item with needed relations
        item = OrderItem.objects.select_related(
            'menu_item', 'platter', 'added_by'
        ).get(pk=instance.pk)
        
        serialized_item = make_json_safe(
            OrderItemMiniSerializer(item).data
        )
        
        group_name = f"orders_{instance.order.restaurant.id}"
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "order_message",
                "message": {
                    "type": action,  # "ITEM_UPDATED", "ITEM_CREATED", "ITEM_DELETED"
                    "order_id": instance.order_id,
                    "item": serialized_item
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
        restaurant_id = instance.order.restaurant_id if instance._state.adding == False else None
        if not restaurant_id:
            # Item already deleted, fetch order info from instance
            restaurant_id = Order.objects.filter(pk=instance.order_id).values_list('restaurant_id', flat=True).first()
        
        if not restaurant_id:
            return
            
        group_name = f"orders_{restaurant_id}"
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "order_message",
                "message": {
                    "type": "ITEM_DELETED",
                    "order_id": instance.order_id,
                    "item_id": instance.pk
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
                "item_count": order.items.count(),
                "order_total": str(total),
                "order_status": order.status
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
        )
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
                lambda: broadcast_table_items_update(order)
            )

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
    
    transaction.on_commit(_broadcast)
# Keep this for actual Order changes (status, details, etc.)
@receiver(post_save, sender=Order)
def order_post_save(sender, instance, created, **kwargs):
    if created:
        # New order - full broadcast is appropriate
        transaction.on_commit(lambda: broadcast_order(instance))
    else:
        # Order details changed (status, address, etc.)
        # Only broadcast if it's NOT just an item change
        transaction.on_commit(lambda: broadcast_order(instance))


@receiver(post_delete, sender=Order)
def order_post_delete(sender, instance, **kwargs):
    transaction.on_commit(lambda: broadcast_order(instance))

@receiver(post_save, sender=Table)
def table_post_save(sender, instance, **kwargs):
    broadcast_table(instance)





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

    if created:
        broadcast_discount(instance, "NEW_DISCOUNT_REQUEST")

    else:
        if instance.status == "approved":
            broadcast_discount(instance, "DISCOUNT_APPROVED")

        elif instance.status == "rejected":
            broadcast_discount(instance, "DISCOUNT_REJECTED")

    # ALSO update order realtime
    broadcast_order(instance.order)
