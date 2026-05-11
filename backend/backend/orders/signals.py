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
    table=Table.objects.prefetch_related("orders__items__menu_item").get(pk=table.pk)
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