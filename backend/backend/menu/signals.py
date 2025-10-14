from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from .models import Category,MenuItem,Review
from reports.models import Notification 


@receiver(post_save,sender=Category)
def category_created_notification(sender,instance,created,**kwargs):
    if created :
        Notification.objects.create(type="menu",message=f"New Category added: {instance.name}")

@receiver(post_delete, sender=Category)
def category_deleted_notification(sender, instance, **kwargs):
    Notification.objects.create(
        type="menu",
        message=f"Category deleted: {instance.name}"
    )

@receiver(post_save,sender=MenuItem)
def menu_item_created_notification(sender,instance,created,**kwargs):
    if created:
        Notification.objects.create(type="menu",message=f"New Item added to {instance.category} Category: {instance.name} ")

    else:
        Notification.objects.create(
            type="menu",
            message=f"Menu item updated: {instance.name}"
        )

@receiver(post_delete,sender=MenuItem)
def Menu_item_deleted_notificatino(sender,instance,**kwarts):
    Notification.objects.create(
        type="menu",
        message=f"{instance.name} deleted from {instance.category} category"
    )

@receiver(post_save,sender=Review)
def Review_given_notification(sender,instance,created,**kwargs):
    Notification.objects.create(type="menu",message=f"New Review Given on {instance.menu_item}: {instance.comment} ")