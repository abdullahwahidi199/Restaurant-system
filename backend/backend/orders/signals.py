from .models import Order
from django.db.models.signals import post_save
from django.dispatch import receiver
from reports.models import Notification 

@receiver(post_save,sender=Order)
def order_created_notification(sender,instance,created,**kwargs):
    if created:
        Notification.objects.create(type="order"
                                    ,message=f"New order placed by {instance.name}")