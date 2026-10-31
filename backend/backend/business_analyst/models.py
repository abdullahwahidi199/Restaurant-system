import uuid

from django.conf import settings
from django.db import models


class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="business_analyst_conversations")
    restaurant = models.ForeignKey("restaurants.Restaurant", on_delete=models.CASCADE)
    branch = models.ForeignKey("restaurants.Branch", on_delete=models.CASCADE)
    authorization_binding = models.CharField(max_length=128)
    title = models.CharField(max_length=100)
    active_request = models.UUIDField(null=True, editable=False)
    active_until = models.DateTimeField(null=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]
        indexes = [models.Index(fields=["user", "-updated_at"], name="ba_conv_user_updated")]


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    request_id = models.UUIDField(db_index=True)
    role = models.CharField(max_length=12, choices=[("user", "User"), ("assistant", "Assistant")])
    content = models.TextField()
    kind = models.CharField(max_length=20, default="question")
    state = models.CharField(max_length=12, default="complete", choices=[("pending", "Pending"), ("complete", "Complete"), ("failed", "Failed")])
    error_code = models.CharField(max_length=64, blank=True)
    sources = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]
        constraints = [models.UniqueConstraint(fields=["conversation", "request_id", "role"], name="ba_message_turn_role_unique")]


class TurnAudit(models.Model):
    request_id = models.UUIDField(primary_key=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="audits")
    status = models.CharField(max_length=16, default="processing")
    error_code = models.CharField(max_length=64, blank=True)
    model_configuration = models.JSONField(default=dict)
    model_calls = models.PositiveIntegerField(default=0)
    batches = models.PositiveIntegerField(default=0)
    operations = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True)


class AuditEvent(models.Model):
    turn = models.ForeignKey(TurnAudit, on_delete=models.CASCADE, related_name="events")
    sequence = models.PositiveIntegerField()
    event = models.CharField(max_length=40)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sequence"]
        constraints = [models.UniqueConstraint(fields=["turn", "sequence"], name="ba_audit_sequence_unique")]
