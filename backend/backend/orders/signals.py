from .models import Order
from django.db.models.signals import  post_save, post_delete
from django.dispatch import receiver
from reports.models import Notification 
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Order,OrderItem,Table
from .seriailizers import OrderSerializer ,TableSerializer

from django.db import transaction

@receiver(post_save, sender=Order)
def order_created_notification(sender, instance, created, **kwargs):
    if created and instance.restaurant:
        transaction.on_commit(lambda: Notification.objects.create(
            restaurant=instance.restaurant,
            type="order",
            message=f"New order placed by {instance.name}"
        ))

channel_layer = get_channel_layer()
print(channel_layer) 

def broadcast_order(order):
    if not order or not order.restaurant:
        return

    order = Order.objects.prefetch_related('items__menu_item').get(pk=order.pk)

    serialized_order = OrderSerializer(order).data

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
    table=Table.objects.prefetch_related("orders__items__menu_item").get(pk=table.pk)
    serialized=TableSerializer(table).data

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

@receiver(post_save, sender=OrderItem)
def order_item_created(sender, instance, created, **kwargs):
    if created:
        broadcast_order(instance.order)

@receiver(post_delete, sender=Order)
def order_post_delete(sender, instance, **kwargs):
    broadcast_order( instance)

@receiver(post_save, sender=Order)
def order_post_save(sender, instance, **kwargs):
    broadcast_order(instance)

@receiver(post_save, sender=Table)
def table_post_save(sender, instance, **kwargs):
    broadcast_table(instance)