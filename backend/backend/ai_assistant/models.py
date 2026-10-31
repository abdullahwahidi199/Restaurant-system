import uuid

from django.conf import settings
from django.db import models
from .agents import OPERATOR_MENTOR


class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent_type = models.CharField(max_length=64, default=OPERATOR_MENTOR, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ai_conversations")
    restaurant = models.ForeignKey("restaurants.Restaurant", null=True, on_delete=models.SET_NULL, related_name="ai_conversations")
    branch = models.ForeignKey("restaurants.Branch", null=True, on_delete=models.SET_NULL, related_name="ai_conversations")
    authorization_binding = models.CharField(max_length=128)
    title = models.CharField(max_length=100, blank=True)
    active_request = models.UUIDField(null=True, editable=False)
    active_until = models.DateTimeField(null=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-id"]
        indexes = [models.Index(fields=["user", "-updated_at"], name="ai_conv_user_updated"),
                   models.Index(fields=["agent_type", "user", "-updated_at"], name="ai_conv_agent_user_time")]


class Message(models.Model):
    # Original numeric API ID when imported from another agent's old table.
    legacy_id = models.PositiveBigIntegerField(null=True, editable=False)
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

    @property
    def public_id(self):
        return self.legacy_id if self.legacy_id is not None else self.pk

    class Meta:
        ordering = ["created_at", "id"]
        constraints = [models.UniqueConstraint(fields=["conversation", "request_id", "role"], name="ai_message_turn_role_unique")]


class AuditBlob(models.Model):
    """Content-addressed, redacted and encrypted historical payloads."""
    id = models.CharField(primary_key=True, max_length=64)
    kind = models.CharField(max_length=8)
    ciphertext = models.TextField()
    byte_count = models.PositiveIntegerField()
    children = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValueError("Audit payload snapshots are immutable.")
        return super().save(*args, **kwargs)


class TurnAudit(models.Model):
    request_id = models.UUIDField(primary_key=True)
    agent_type = models.CharField(max_length=64, default=OPERATOR_MENTOR, db_index=True)
    model_configuration = models.JSONField(default=dict)
    batches = models.PositiveIntegerField(default=0)
    operations = models.PositiveIntegerField(default=0)
    conversation = models.ForeignKey(Conversation, null=True, on_delete=models.SET_NULL, related_name="audits")
    conversation_identifier = models.UUIDField(db_index=True)
    user_message = models.ForeignKey(Message, null=True, on_delete=models.SET_NULL, related_name="user_audits")
    assistant_message = models.ForeignKey(Message, null=True, on_delete=models.SET_NULL, related_name="assistant_audits")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="ai_audits")
    restaurant = models.ForeignKey("restaurants.Restaurant", null=True, on_delete=models.SET_NULL)
    branch = models.ForeignKey("restaurants.Branch", null=True, on_delete=models.SET_NULL)
    question_payload = models.ForeignKey(AuditBlob, null=True, on_delete=models.PROTECT, related_name="questions")
    language = models.CharField(max_length=8, default="en")
    provider = models.CharField(max_length=40)
    model = models.CharField(max_length=100)
    status = models.CharField(max_length=16, default="processing")
    started_at = models.DateTimeField()
    finished_at = models.DateTimeField(null=True)
    duration_ms = models.FloatField(null=True)
    next_sequence = models.PositiveIntegerField(default=0)
    model_calls = models.PositiveIntegerField(default=0)
    completed_model_calls = models.PositiveIntegerField(default=0)
    tool_calls = models.PositiveIntegerField(default=0)
    completed_tool_calls = models.PositiveIntegerField(default=0)
    usage = models.JSONField(default=dict)
    usage_complete = models.BooleanField(default=True)
    stage_durations = models.JSONField(default=dict)
    error_code = models.CharField(max_length=80, blank=True)
    error_category = models.CharField(max_length=100, blank=True)
    failure_stage = models.CharField(max_length=80, blank=True)

    class Meta:
        ordering = ["-started_at", "-request_id"]
        indexes = [models.Index(fields=["status", "started_at"], name="ai_audit_status_time"),
                   models.Index(fields=["user", "started_at"], name="ai_audit_user_time"),
                   models.Index(fields=["agent_type", "started_at"], name="ai_audit_agent_time")]


class AuditBlobReference(models.Model):
    parent = models.ForeignKey(AuditBlob, on_delete=models.CASCADE, related_name="child_references")
    child = models.ForeignKey(AuditBlob, on_delete=models.PROTECT, related_name="parent_references")

    class Meta:
        constraints = [models.UniqueConstraint(fields=["parent","child"], name="ai_audit_blob_reference")]


class AuditEvent(models.Model):
    legacy_id = models.PositiveBigIntegerField(null=True, editable=False)
    turn = models.ForeignKey(TurnAudit, on_delete=models.CASCADE, related_name="events")
    sequence = models.PositiveIntegerField()
    event_type = models.CharField(max_length=40)
    status = models.CharField(max_length=20, default="completed")
    started_at = models.DateTimeField()
    finished_at = models.DateTimeField(null=True)
    duration_ms = models.FloatField(null=True)
    model_ordinal = models.PositiveIntegerField(null=True)
    tool_call_id = models.CharField(max_length=128, blank=True)
    tool_name = models.CharField(max_length=100, blank=True, db_index=True)
    payload = models.ForeignKey(AuditBlob, on_delete=models.PROTECT)

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValueError("Audit events are immutable.")
        return super().save(*args, **kwargs)

    class Meta:
        ordering = ["sequence"]
        constraints = [models.UniqueConstraint(fields=["turn", "sequence"], name="ai_audit_turn_sequence")]


class AuditAccess(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    actor_identifier = models.PositiveBigIntegerField(null=True)
    turn_identifier = models.UUIDField(null=True, db_index=True)
    event_sequence = models.PositiveIntegerField(null=True)
    access_type = models.CharField(max_length=32)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
