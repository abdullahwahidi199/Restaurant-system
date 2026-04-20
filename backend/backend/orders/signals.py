from .models import Order
from django.db.models.signals import  post_save, post_delete
from django.dispatch import receiver
from reports.models import Notification 
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Order,OrderItem,Table
from .seriailizers import OrderSerializer ,TableSerializer

@receiver(post_save,sender=Order)
def order_created_notification(sender,instance,created,**kwargs):
    if created:
        Notification.objects.create(type="order"
                                    ,message=f"New order placed by {instance.name}")
        

channel_layer = get_channel_layer()
print(channel_layer) 

def broadcast_order(order):
    # Make sure items are prefetched
    order = Order.objects.prefetch_related('items__menu_item').get(pk=order.pk)
    serialized_order = OrderSerializer(order).data
    async_to_sync(channel_layer.group_send)(
        "orders",
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

    async_to_sync(channel_layer.group_send)(
        "orders",
        {
            "type": "table_message",
            "message": {
                "type": "TABLE_UPDATED",
                "table": serialized,
            },
        },
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