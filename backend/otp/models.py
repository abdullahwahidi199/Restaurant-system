from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone
from datetime import timedelta


class OTPVerification(models.Model):
    PURPOSE_CHOICES = [
        ('signup', 'Signup'),
        ('checkout', 'Checkout'),
    ]

    phone = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    is_verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone', 'purpose', 'is_verified']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        status_label = 'Verified' if self.is_verified else 'Pending'
        return f"{self.phone} - {self.purpose} - {status_label}"

    @property
    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)

    @property
    def max_attempts(self):
        return 3

    @property
    def can_attempt(self):
        return self.attempts < self.max_attempts