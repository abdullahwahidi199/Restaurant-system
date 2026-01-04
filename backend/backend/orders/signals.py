from .models import Order
from django.db.models.signals import  post_save, post_delete
from django.dispatch import receiver
from reports.models import Notification 
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Order
from .seriailizers import OrderSerializer 
@receiver(post_save,sender=Order)
def order_created_notification(sender,instance,created,**kwargs):
    if created:
        Notification.objects.create(type="order"
                                    ,message=f"New order placed by {instance.name}")
        

channel_layer = get_channel_layer()
print(channel_layer) 

def broadcast_order(event_type, order):
    channel_layer = get_channel_layer()
    if not channel_layer:
        # Channel layer not configured, skip broadcasting
        return

    serializer = OrderSerializer(order)
    data = {
        "type": event_type,
        "action": event_type,
        "order": serializer.data,
    }
    async_to_sync(channel_layer.group_send)("orders", {"type": "order_update", **data})
    
    if getattr(order, "table", None):
        table_group = f"table_{order.table.id}"
        async_to_sync(channel_layer.group_send)(table_group, {"type": "order_update", **data})



@receiver(post_save, sender=Order)
def order_post_save(sender, instance, created, **kwargs):
    if created:
        # created
        broadcast_order("order_created", instance)
    else:
        broadcast_order("order_updated", instance)


@receiver(post_delete, sender=Order)
def order_post_delete(sender, instance, **kwargs):
    broadcast_order("order_deleted", instance)