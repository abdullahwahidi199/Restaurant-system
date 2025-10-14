from django.db import models
from django.utils import timezone

# Create your models here.
class Notification(models.Model):
    TYPE_CHOICES = [
        ('order', 'Order'),
        ('menu', 'Menu'),
        ('review', 'Review'),
        ('attendance','Attendance'),
        ('system', 'System'),
    ]
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)