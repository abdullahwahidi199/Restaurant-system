import uuid

from django.conf import settings
from django.db import models


class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="operator_conversations")
    restaurant = models.ForeignKey("restaurants.Restaurant", null=True, on_delete=models.SET_NULL, related_name="operator_conversations")
    branch = models.ForeignKey("restaurants.Branch", null=True, on_delete=models.SET_NULL, related_name="operator_conversations")
    authorization_binding = models.CharField(max_length=64)
    title = models.CharField(max_length=100, blank=True)
    active_request = models.UUIDField(null=True, editable=False)
    active_until = models.DateTimeField(null=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]
        indexes = [models.Index(fields=["user", "-updated_at"], name="ai_conv_user_updated")]


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    request_id = models.UUIDField(db_index=True)
    role = models.CharField(max_length=12, choices=[("user", "User"), ("assistant", "Assistant")])
    content = models.TextField()
    kind = models.CharField(max_length=20, default="answer")
    state = models.CharField(max_length=12, default="complete", choices=[("pending", "Pending"), ("complete", "Complete"), ("failed", "Failed")])
    error_code = models.CharField(max_length=64, blank=True)
    sources = models.JSONField(default=list, blank=True)
    index_version = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]
        constraints = [models.UniqueConstraint(fields=["conversation", "request_id", "role"], name="ai_message_turn_role_unique")]
