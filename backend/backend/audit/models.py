from django.conf import settings
from django.db import models

from restaurants.models import Branch, Restaurant

from .constants import AuditAction, AuditModule


class AuditLog(models.Model):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="audit_logs",
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
        null=True,
        blank=True,
    )
    action = models.CharField(max_length=30, choices=AuditAction.choices)
    module = models.CharField(max_length=40, choices=AuditModule.choices)
    object_type = models.CharField(max_length=120)
    object_id = models.CharField(max_length=80)
    object_repr = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    old_values = models.JSONField(default=dict, blank=True)
    new_values = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["restaurant", "created_at"], name="audit_rest_created_idx"),
            models.Index(fields=["restaurant", "branch"], name="audit_rest_branch_idx"),
            models.Index(fields=["restaurant", "user"], name="audit_rest_user_idx"),
            models.Index(fields=["module", "action"], name="audit_module_action_idx"),
            models.Index(fields=["object_type", "object_id"], name="audit_object_idx"),
            models.Index(fields=["created_at"], name="audit_created_idx"),
        ]

    def __str__(self):
        return f"{self.module} {self.action} {self.object_repr or self.object_id}"

    def save(self, *args, **kwargs):
        if self.pk:
            raise ValueError("Audit logs are immutable.")
        return super().save(*args, **kwargs)

