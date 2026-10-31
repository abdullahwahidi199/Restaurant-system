"""Atomically copy, verify, then remove legacy persistence tables.

Run with application writers stopped. UUID collisions or active turns abort the
transaction; no source table is changed. Numeric IDs remain the public API IDs.
"""
import hashlib
import math

from django.core.management.color import no_style
from django.db import migrations
from django.db.models import Max
from django.utils import timezone

AGENT = "business_analyst"
USAGE = {"prompt_tokens", "completion_tokens", "total_tokens", "prompt_cache_hit_tokens", "prompt_cache_miss_tokens"}


def public_configuration(value):
    """Only model-selection fields belong in unencrypted audit summary columns."""
    from ai_assistant.audit_payloads import redact
    if not isinstance(value, dict):
        return {}
    clean = redact(value)
    result = {key: clean[key] for key in ("model", "reasoning_effort", "requested_model", "requested_reasoning_effort")
              if key in clean and (clean[key] is None or isinstance(clean[key], str) and len(clean[key]) <= 100)}
    thinking = clean.get("thinking")
    if isinstance(thinking, dict) and thinking.get("type") in ("enabled", "disabled"):
        result["thinking"] = {"type": thinking["type"]}
    return result


def insert(model, values, connection):
    """Explicit inserts preserve auto_now timestamps and use backend field adapters."""
    fields = [field for field in model._meta.concrete_fields if field.attname in values]
    columns = ", ".join(connection.ops.quote_name(f.column) for f in fields)
    sql = "INSERT INTO %s (%s) VALUES (%s)" % (
        connection.ops.quote_name(model._meta.db_table), columns, ", ".join(["%s"] * len(fields)))
    with connection.cursor() as cursor:
        cursor.execute(sql, [f.get_db_prep_save(values[f.attname], connection) for f in fields])


def payload(apps, connection, value):
    # Reuse the established redaction/encryption format. ORM writes use the
    # historical model and migration connection, never a runtime model manager.
    from ai_assistant.audit_payloads import canonical, cipher, redact
    from django.conf import settings
    value = redact(value)
    logical = canonical(value).encode("utf-8")
    if len(logical) > getattr(settings, "AI_AUDIT_MAX_EVENT_BYTES", 1_000_000):
        raise RuntimeError("A legacy audit exceeds the encrypted payload limit; source data was retained.")
    def pack(item):
        if isinstance(item, dict):
            if set(item) in ({"__audit_text_blob__"}, {"__audit_literal__"}):
                return {"__audit_literal__": [[k, pack(v)] for k, v in item.items()]}
            return {k: pack(v) for k, v in item.items()}
        return [pack(v) for v in item] if isinstance(item, list) else item
    raw = canonical(pack(value)).encode("utf-8")
    identity = hashlib.sha256(b"json\0" + raw).hexdigest()
    Blob = apps.get_model("ai_assistant", "AuditBlob")
    blob, created = Blob.objects.using(connection.alias).get_or_create(pk=identity, defaults={
        "kind": "json", "ciphertext": cipher().encrypt(raw).decode(), "byte_count": len(logical), "children": []})
    if not created and (blob.kind != "json" or cipher().decrypt(blob.ciphertext.encode()) != raw or blob.byte_count != len(logical)):
        raise RuntimeError("Existing audit payload failed integrity verification; source data was retained.")
    return blob.pk


def maximum(model, db):
    return model.objects.using(db).aggregate(value=Max("pk"))["value"] or 0


def migrate_data(apps, schema_editor):
    connection, db = schema_editor.connection, schema_editor.connection.alias
    OldConversation = apps.get_model("business_analyst", "Conversation")
    OldMessage = apps.get_model("business_analyst", "Message")
    OldTurn = apps.get_model("business_analyst", "TurnAudit")
    OldEvent = apps.get_model("business_analyst", "AuditEvent")
    Conversation = apps.get_model("ai_assistant", "Conversation")
    Message = apps.get_model("ai_assistant", "Message")
    Turn = apps.get_model("ai_assistant", "TurnAudit")
    Event = apps.get_model("ai_assistant", "AuditEvent")
    if connection.vendor == "postgresql":
        # Prevent old workers from adding source rows while they are copied.
        tables = ", ".join(connection.ops.quote_name(m._meta.db_table) for m in
                           (OldConversation, OldMessage, OldTurn, OldEvent, Conversation, Message, Turn, Event))
        with connection.cursor() as cursor:
            cursor.execute("LOCK TABLE " + tables + " IN SHARE ROW EXCLUSIVE MODE")
    if OldConversation.objects.using(db).filter(active_request__isnull=False, active_until__gt=timezone.now()).exists():
        raise RuntimeError("Business Analyst has active turns. Stop writers and let them finish before migrating.")
    if (Conversation.objects.using(db).filter(pk__in=OldConversation.objects.using(db).values("pk")).exists()
            or Turn.objects.using(db).filter(pk__in=OldTurn.objects.using(db).values("pk")).exists()
            or Conversation.objects.using(db).filter(agent_type=AGENT).exists()
            or Turn.objects.using(db).filter(agent_type=AGENT).exists()):
        raise RuntimeError("AI identifier collision or prior import detected. No legacy records were removed.")
    offset = max(maximum(Message, db), maximum(OldMessage, db))
    event_offset = max(maximum(Event, db), maximum(OldEvent, db))
    for row in OldConversation.objects.using(db).all().iterator(chunk_size=500):
        values = {f.attname: getattr(row, f.attname) for f in OldConversation._meta.concrete_fields}
        insert(Conversation, {**values, "agent_type": AGENT}, connection)
    for row in OldMessage.objects.using(db).all().iterator(chunk_size=500):
        values = {f.attname: getattr(row, f.attname) for f in OldMessage._meta.concrete_fields}
        insert(Message, {**values, "id": offset + row.pk, "legacy_id": row.pk, "index_version": ""}, connection)
    for row in OldTurn.objects.using(db).select_related("conversation").all().iterator(chunk_size=500):
        messages = OldMessage.objects.using(db).filter(conversation_id=row.conversation_id, request_id=row.pk)
        question, answer = messages.filter(role="user").first(), messages.filter(role="assistant").first()
        events = OldEvent.objects.using(db).filter(turn_id=row.pk)
        completed = list(events.filter(event="model_finished").values_list("metadata", flat=True))
        usage, complete = {}, len(completed) == row.model_calls
        for item in completed:
            reported = item.get("usage", {}) if isinstance(item, dict) else {}
            reported = {k: v for k, v in reported.items() if k in USAGE and type(v) is int and v >= 0} if isinstance(reported, dict) else {}
            complete = complete and {"prompt_tokens", "completion_tokens", "total_tokens"}.issubset(reported)
            for key, value in reported.items():
                usage[key] = usage.get(key, 0) + value
        tool_finishes = events.filter(event="retrieval_finished").count()
        configuration = public_configuration(row.model_configuration)
        model = configuration.get("model", "")
        model = model if isinstance(model, str) and len(model) <= 100 else ""
        elapsed = (row.finished_at - row.started_at).total_seconds() * 1000 if row.finished_at else None
        if elapsed is not None and elapsed < 0:
            elapsed = None
        original = {"content": question.content if question else "", "message_id": question.pk if question else None,
            "user_id": row.conversation.user_id, "restaurant_id": row.conversation.restaurant_id,
            "branch_id": row.conversation.branch_id, "model_configuration": row.model_configuration,
            "legacy_capture": {"source": "business_analyst_stage0", "model_payloads_recorded": False,
                "tool_starts_recorded": False, "original_status": row.status,
                "duration_basis": "recorded_turn_timestamps" if elapsed is not None else "unavailable"}}
        insert(Turn, {"request_id": row.pk, "agent_type": AGENT, "conversation_id": row.conversation_id,
            "conversation_identifier": row.conversation_id, "user_message_id": offset + question.pk if question else None,
            "assistant_message_id": offset + answer.pk if answer else None, "user_id": row.conversation.user_id,
            "restaurant_id": row.conversation.restaurant_id, "branch_id": row.conversation.branch_id,
            "question_payload_id": payload(apps, connection, original), "language": "", "provider": "", "model": model,
            "model_configuration": configuration, "status": "completed" if row.status == "complete" else row.status,
            "started_at": row.started_at, "finished_at": row.finished_at,
            "duration_ms": elapsed,
            "next_sequence": events.aggregate(value=Max("sequence"))["value"] or 0,
            "model_calls": row.model_calls, "completed_model_calls": len(completed),
            "tool_calls": tool_finishes, "completed_tool_calls": tool_finishes,
            "batches": row.batches, "operations": row.operations, "usage": usage, "usage_complete": complete,
            "stage_durations": {}, "error_code": row.error_code, "error_category": "", "failure_stage": ""}, connection)
    for row in OldEvent.objects.using(db).all().iterator(chunk_size=500):
        metadata = row.metadata if isinstance(row.metadata, dict) else {}
        duration = metadata.get("duration_ms")
        duration = duration if type(duration) in (int, float) and math.isfinite(duration) and duration >= 0 else None
        status = "started" if row.event.endswith("_started") else "recorded"
        if row.event == "operation_finished":
            status = "completed" if metadata.get("ok") is True else "failed" if metadata.get("ok") is False else "recorded"
        elif row.event in {"model_finished", "turn_completed"}:
            status = "completed"
        elif row.event == "turn_failed":
            status = "failed"
        ordinal = metadata.get("number") if row.event.startswith("model_") else None
        call_id = metadata.get("call_id", "")
        call_id = call_id if isinstance(call_id, str) and len(call_id) <= 128 else ""
        from ai_assistant.audit_payloads import redact
        call_id = redact(call_id)
        insert(Event, {"id": event_offset + row.pk, "legacy_id": row.pk, "turn_id": row.turn_id,
            "sequence": row.sequence, "event_type": row.event, "status": status, "started_at": row.created_at,
            "finished_at": None if status == "started" else row.created_at, "duration_ms": duration,
            "model_ordinal": ordinal if type(ordinal) is int and ordinal > 0 else None,
            "tool_call_id": call_id, "tool_name": "retrieve_business_context" if row.event == "retrieval_finished" else "",
            "payload_id": payload(apps, connection, row.metadata)}, connection)
    with connection.cursor() as cursor:
        for sql in connection.ops.sequence_reset_sql(no_style(), [Conversation, Message, Turn, Event]):
            cursor.execute(sql)
    verify(apps, schema_editor)


def verify(apps, schema_editor):
    """Check original values and every relationship again before source removal."""
    db = schema_editor.connection.alias
    OldConversation = apps.get_model("business_analyst", "Conversation")
    OldMessage = apps.get_model("business_analyst", "Message")
    OldTurn = apps.get_model("business_analyst", "TurnAudit")
    OldEvent = apps.get_model("business_analyst", "AuditEvent")
    Conversation = apps.get_model("ai_assistant", "Conversation")
    Message = apps.get_model("ai_assistant", "Message")
    Turn = apps.get_model("ai_assistant", "TurnAudit")
    Event = apps.get_model("ai_assistant", "AuditEvent")
    for old in OldConversation.objects.using(db).all().iterator(chunk_size=500):
        new = Conversation.objects.using(db).get(pk=old.pk, agent_type=AGENT)
        if any(getattr(old, f.attname) != getattr(new, f.attname) for f in OldConversation._meta.concrete_fields):
            raise RuntimeError("Conversation verification failed; legacy tables were retained.")
        originals = OldMessage.objects.using(db).filter(conversation_id=old.pk)
        copies = Message.objects.using(db).filter(conversation_id=old.pk)
        if originals.count() != copies.count():
            raise RuntimeError("Message count verification failed; legacy tables were retained.")
        for message in originals.iterator(chunk_size=500):
            copied = copies.get(legacy_id=message.pk)
            if any(getattr(message, f.attname) != getattr(copied, f.attname) for f in OldMessage._meta.concrete_fields if f.name != "id"):
                raise RuntimeError("Message verification failed; legacy tables were retained.")
    from ai_assistant.audit_payloads import cipher, redact
    import json
    def expand(item):
        if isinstance(item, dict):
            if set(item) == {"__audit_literal__"}:
                return {k: expand(v) for k, v in item["__audit_literal__"]}
            return {k: expand(v) for k, v in item.items()}
        return [expand(v) for v in item] if isinstance(item, list) else item
    for old in OldTurn.objects.using(db).all().iterator(chunk_size=500):
        new = Turn.objects.using(db).get(pk=old.pk, agent_type=AGENT, conversation_id=old.conversation_id)
        if (public_configuration(old.model_configuration) != new.model_configuration or
            any(getattr(old, key) != getattr(new, key) for key in
                ("error_code", "model_calls", "batches", "operations", "started_at", "finished_at"))):
            raise RuntimeError("Turn verification failed; legacy tables were retained.")
        originals = OldEvent.objects.using(db).filter(turn_id=old.pk)
        if originals.count() != Event.objects.using(db).filter(turn_id=new.pk).count():
            raise RuntimeError("Event count verification failed; legacy tables were retained.")
        for event in originals.iterator(chunk_size=500):
            copied = Event.objects.using(db).select_related("payload").get(turn_id=old.pk, sequence=event.sequence, legacy_id=event.pk)
            if (copied.event_type != event.event or copied.started_at != event.created_at
                    or expand(json.loads(cipher().decrypt(copied.payload.ciphertext.encode()))) != redact(event.metadata)):
                raise RuntimeError("Encrypted event verification failed; legacy tables were retained.")


class Migration(migrations.Migration):
    dependencies = [("business_analyst", "0001_initial"), ("ai_assistant", "0005_unified_agent_storage")]
    # Deliberately irreversible: rolling back must never discard richer shared
    # audits/new turns. A deployment rollback restores a verified database backup.
    operations = [migrations.RunPython(migrate_data),
                  migrations.DeleteModel("AuditEvent"), migrations.DeleteModel("TurnAudit"),
                  migrations.DeleteModel("Message"), migrations.DeleteModel("Conversation")]
