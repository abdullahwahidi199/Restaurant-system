"""Metadata-only execution audit: no credentials, prompts, arguments or raw results."""
from django.db.models import F

from .models import AuditEvent, TurnAudit


class Trace:
    def __init__(self, turn):
        self.turn = turn
        self.sequence = 0

    def event(self, event, metadata):
        self.sequence += 1
        AuditEvent.objects.create(turn=self.turn, sequence=self.sequence, event=event, metadata=metadata)
        counter = {"model_started": "model_calls", "batch_started": "batches", "operation_finished": "operations"}.get(event)
        if counter:
            TurnAudit.objects.filter(pk=self.turn.pk).update(**{counter: F(counter) + 1})
