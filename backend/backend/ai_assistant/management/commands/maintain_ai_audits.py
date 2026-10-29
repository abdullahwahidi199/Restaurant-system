"""Explicit, scheduler-friendly retention and abandoned-turn recovery."""
from datetime import timedelta
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.db import IntegrityError, transaction
from django.db.models.deletion import ProtectedError
from ai_assistant.models import TurnAudit, AuditBlob, AuditAccess, AuditEvent
from ai_assistant.auditing import reconcile_turns


class Command(BaseCommand):
    help = "Dry-run audit retention by default; --execute reconciles abandoned turns and purges expired audit data only."

    def add_arguments(self, parser):
        parser.add_argument("--execute",action="store_true")

    def handle(self,*args,**options):
        days = settings.AI_AUDIT_RETENTION_DAYS
        access_days = settings.AI_AUDIT_ACCESS_RETENTION_DAYS
        if not 1 <= days <= 3650 or not 1 <= access_days <= 3650:
            raise CommandError("Audit retention must be between 1 and 3650 days.")
        cutoff = timezone.now()-timedelta(days=days)
        expired = TurnAudit.objects.exclude(status="processing").filter(started_at__lt=cutoff)
        accesses = AuditAccess.objects.filter(created_at__lt=timezone.now()-timedelta(days=access_days))
        self.stdout.write(f"Expired turns: {expired.count()}; expired access entries: {accesses.count()}.")
        if not options["execute"]:
            self.stdout.write("Dry run; no data changed.")
            return
        reconciled = reconcile_turns()
        expired.delete()
        accesses.delete()
        # Real FK edges protect shared strings, including concurrent new roots.
        # Delete old unreferenced roots first, then orphan text snapshots.
        removed = 0
        for kind in ("json","text"):
            candidates = AuditBlob.objects.filter(kind=kind, created_at__lt=timezone.now()-timedelta(days=1),
                auditevent__isnull=True, questions__isnull=True, parent_references__isnull=True).values_list("pk",flat=True).iterator(chunk_size=500)
            for identifier in candidates:
                try:
                    with transaction.atomic():
                        count,_ = AuditBlob.objects.filter(pk=identifier).delete()
                        removed += count
                except (ProtectedError,IntegrityError):
                    # A new audit referenced this blob during collection. Keep
                    # it; the next maintenance run can reconsider it safely.
                    continue
        self.stdout.write(f"Reconciled interrupted turns: {reconciled}; unreferenced payloads removed: {removed}. Conversation messages were not deleted.")
