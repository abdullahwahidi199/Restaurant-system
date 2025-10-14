from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from .models import Shift,Staff,Attendance
from django.utils import timezone

from reports.models import Notification 


@receiver(post_save,sender=Shift)
def shift_created_notification(sender,instance,created,**kwargs):
    if created:
        Notification.objects.create(type="system",
                                    message=f"New Shift added : {instance.shift_type} ({instance.start_time} - {instance.end_time})")


@receiver(post_delete,sender=Shift)
def shift_deleted_notification(sender,instance,**kwargs):
    
    Notification.objects.create(type="system",
                                    message=f" Shift deleted : {instance.shift_type} ({instance.start_time} - {instance.end_time})")

@receiver(post_save,sender=Staff)
def staff_created_updated_notification(sender,instance,created,**kwargs):
    if created:
        Notification.objects.create(type="systme",
                                    message=f"New Staff added : {instance.name}({instance.role})")
    else:
        Notification.objects.create(type="system",
                                    message=f"{instance.name} updated")
        
@receiver(post_delete,sender=Staff)
def staff_deleted_notification(sender,instance,**kwargs):
    Notification.objects.create(type='system',
                                message=f"Staff deleted : {instance.name}({instance.role})")
    
@receiver(post_save,sender=Attendance)
def attendance_notification(sender,created,instance,**kwargs):
    today= timezone.now().date()
    def absent_staff():
        absents=Attendance.object.filter(status="status")
        absent_staff=absents.filter(date=today)
        return absent_staff.count()
    if created:
        Notification.objects.create(type='attendance',
                                    message=f"Today's Attendance take | {absent_staff}")
    else:
        Notification.objects.create(type='attendance',
                                    message=f"Today's Attendance updated | {absent_staff}")