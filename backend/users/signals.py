from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from .models import Shift,Staff,Attendance
from django.utils import timezone

from reports.models import Notification 


@receiver(post_save, sender=Shift)
def shift_created_notification(sender, instance, created, **kwargs):
    if created and instance.restaurant:
        Notification.objects.create(
            restaurant=instance.restaurant,
            type="system",
            message=f"New Shift added: {instance.shift_type} ({instance.start_time} - {instance.end_time})"
        )


@receiver(post_delete, sender=Shift)
def shift_deleted_notification(sender, instance, **kwargs):
    if instance.restaurant:
        Notification.objects.create(
            restaurant=instance.restaurant,
            type="system",
            message=f"Shift deleted: {instance.shift_type} ({instance.start_time} - {instance.end_time})"
        )

@receiver(post_save, sender=Staff)
def staff_created_updated_notification(sender, instance, created, **kwargs):
    if not instance.restaurant:
        return

    if created:
        Notification.objects.create(
            restaurant=instance.restaurant,
            type="system",
            message=f"New Staff added: {instance.name} ({instance.role})"
        )
    else:
        Notification.objects.create(
            restaurant=instance.restaurant,
            type="system",
            message=f"{instance.name} updated"
        )
        
@receiver(post_delete, sender=Staff)
def staff_deleted_notification(sender, instance, **kwargs):
    if instance.restaurant:
        Notification.objects.create(
            restaurant=instance.restaurant,
            type="system",
            message=f"Staff deleted: {instance.name} ({instance.role})"
        )
    
@receiver(post_save, sender=Attendance)
def attendance_notification(sender, instance, created, **kwargs):
    today = timezone.now().date()

    if created and instance.restaurant:
        Notification.objects.create(
            restaurant=instance.restaurant,
            type="attendance",
            message="Today's Attendance taken"
        )
    else:
        Notification.objects.create(
            restaurant=instance.restaurant,
            type="attendance",
            message="Today's Attendance updated"
        )