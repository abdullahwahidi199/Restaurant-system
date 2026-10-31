"""Durable per-turn tracing, isolated from ordinary diagnostic logging."""
import logging
import re
import time
from contextlib import contextmanager
from contextvars import ContextVar

from django.db import transaction
from django.utils import timezone

from .audit_payloads import put_blob, unavailable, redact
from .audit_payloads import read_blob
from knowledge.markdown import digest
from .models import AuditEvent, TurnAudit

logger = logging.getLogger("ai_assistant")
_active = ContextVar("assistant_audit", default=None)
USAGE_KEYS = {"prompt_tokens", "completion_tokens", "total_tokens", "prompt_cache_hit_tokens", "prompt_cache_miss_tokens"}


def current():
    return _active.get()


@contextmanager
def scope(trace):
    token = _active.set(trace)
    try:
        yield
    finally:
        _active.reset(token)


def emit(event_type, payload, **metadata):
    trace = current()
    if trace:
        return trace.event(event_type, payload, **metadata)


class Trace:
    def __init__(self, turn):
        self.turn = turn
        self.started = time.perf_counter()
        self.model = None
        self.evidence_origins = {}

    @staticmethod
    def evidence_key(reference):
        return digest("\0".join(reference.get(k,"") for k in ("document_id","section_id","content_hash")))

    def fetched(self, sections):
        for section in sections:
            self.evidence_origins[self.evidence_key(section)] = str(self.turn.pk)

    def reused(self, restored, history):
        prior = next((m for m in reversed(history) if m.get("role")=="assistant" and m.get("sources")),None)
        origins = {}
        if prior and prior.get("request_id"):
            previous = AuditEvent.objects.filter(turn_id=prior["request_id"], turn__agent_type=self.turn.agent_type,
                turn__conversation_identifier=self.turn.conversation_identifier, event_type="answer_generated").select_related("payload").first()
            if previous:
                origins = read_blob(previous.payload).get("evidence_origins",{})
        evidence = []
        for item in restored:
            key = self.evidence_key(item["reference"])
            origin = origins.get(key)
            if origin:
                self.evidence_origins[key] = origin
            evidence.append({**item,"original_retrieval_turn":origin})
        self.event("evidence_reused", {"evidence":evidence,"index_version_validated":True,"permissions_rechecked":True,
            "new_search_performed":False,"prior_turns":sorted(set(self.evidence_origins.values()))})

    def event(self, event_type, payload, *, status="completed", started_at=None, duration_ms=None,
              model_ordinal=None, tool_call_id="", tool_name=""):
        if event_type == "operation_finished":
            status = "completed" if payload.get("ok") else "failed"
            duration_ms = payload.get("duration_ms")
            tool_name = payload.get("id", "") if payload.get("kind") == "tool" else ""
        try:
            with transaction.atomic():
                turn = TurnAudit.objects.select_for_update().get(pk=self.turn.pk, agent_type=self.turn.agent_type)
                if event_type == "batch_started":
                    self.turn.batches += 1
                elif event_type == "operation_finished":
                    self.turn.operations += 1
                blob = put_blob(payload)
                sequence = turn.next_sequence + 1
                event = AuditEvent.objects.create(turn=turn, sequence=sequence, event_type=event_type, payload=blob,
                    status=status, started_at=started_at or timezone.now(), finished_at=None if status in {"processing","started"} else timezone.now(),
                    duration_ms=duration_ms, model_ordinal=model_ordinal, tool_call_id=redact(tool_call_id)[:128],
                    tool_name=tool_name if isinstance(tool_name, str) and re.fullmatch(r"[a-z][a-z0-9_.]{0,99}", redact(tool_name)) else "")
                TurnAudit.objects.filter(pk=turn.pk).update(next_sequence=sequence,
                    model_calls=self.turn.model_calls, completed_model_calls=self.turn.completed_model_calls,
                    tool_calls=self.turn.tool_calls, completed_tool_calls=self.turn.completed_tool_calls,
                    usage=self.turn.usage, usage_complete=self.turn.usage_complete,
                    batches=self.turn.batches, operations=self.turn.operations)
            return event
        except Exception as exc:
            logger.error("assistant_audit_write_failed", extra={"request_id":str(self.turn.pk), "exception_category":type(exc).__name__})
            raise unavailable() from None

    def begin_model(self, ordinal, contract):
        self.model = {"ordinal":ordinal, "contract":contract, "started_at":timezone.now(), "clock":time.perf_counter(), "request":False, "response":False}

    def model_request(self, payload, *, boundary="deepseek_http", transmitted=True):
        if not self.model or self.model["request"]:
            return
        self.model["request"] = True
        self.turn.model_calls += 1
        self.event("model_request", {"capture_boundary":boundary, "transmitted":transmitted, "provider":self.turn.provider, "payload":payload},
                   status="started", started_at=self.model["started_at"], model_ordinal=self.model["ordinal"])

    def model_response(self, data, *, http_status=200, boundary="deepseek_http"):
        if not self.model or self.model["response"]:
            return
        # Strict response-envelope allowlist. Never persist HTTP headers,
        # private reasoning fields or unrelated provider error response bodies.
        payload = {key:data[key] for key in ("id", "model", "choices", "usage") if isinstance(data, dict) and key in data}
        if isinstance(payload.get("choices"),list):
            choices = []
            for choice in payload["choices"]:
                if not isinstance(choice,dict):
                    choices.append({"invalid_choice_type":type(choice).__name__})
                    continue
                clean = {k:choice[k] for k in ("index","finish_reason") if k in choice}
                message = choice.get("message")
                if isinstance(message,dict):
                    clean["message"] = {k:message[k] for k in ("role","content","tool_calls") if k in message}
                else:
                    clean["invalid_message_type"] = type(message).__name__
                choices.append(clean)
            payload["choices"] = choices
        self.turn.completed_model_calls += 1
        usage = payload.get("usage", {})
        actual = {k:v for k,v in usage.items() if k in USAGE_KEYS and isinstance(v,int) and not isinstance(v,bool) and 0 <= v <= 10**9} if isinstance(usage,dict) else {}
        self.turn.usage_complete = self.turn.usage_complete and all(k in actual for k in ("prompt_tokens","completion_tokens","total_tokens"))
        for key, value in actual.items():
            self.turn.usage[key] = self.turn.usage.get(key,0) + value
        self.event("model_response", {"capture_boundary":boundary, "http_status":http_status, "response":payload},
                   started_at=self.model["started_at"], duration_ms=round((time.perf_counter()-self.model["clock"])*1000,3), model_ordinal=self.model["ordinal"])
        self.model["response"] = True

    def finish_model(self, completion=None, error=None):
        if not self.model:
            return
        if not self.model["request"]:
            self.model_request(self.model["contract"], boundary="provider_contract", transmitted=None if completion else False)
        if not self.model["response"]:
            if completion:
                self.model_response({"model":self.turn.model, "choices":[{"message":completion.message(), "finish_reason":completion.finish_reason}], "usage":completion.usage}, boundary="provider_contract")
            else:
                self.event("model_response", {"error_code":getattr(error,"code","provider_failure"), "error_category":type(error).__name__,
                    "http_status":getattr(error,"provider_http_status",None)}, status="failed", started_at=self.model["started_at"],
                    duration_ms=round((time.perf_counter()-self.model["clock"])*1000,3), model_ordinal=self.model["ordinal"])
                self.turn.usage_complete = False

    def finish(self, status, *, error=None, stage="", metrics=None, assistant=None, interrupted=False):
        metrics = metrics or {}
        if error:
            self.event("error", {"stage":stage, "error_category":type(error).__name__, "error_code":getattr(error,"code","turn_interrupted" if interrupted else "assistant_unavailable")}, status="interrupted" if interrupted else "failed")
        duration = round((time.perf_counter()-self.started)*1000,3)
        self.event("turn_completed", {"status":status, "duration_ms":duration, "metrics":metrics}, status=status, duration_ms=duration)
        try:
            TurnAudit.objects.filter(pk=self.turn.pk).update(status=status, finished_at=timezone.now(), duration_ms=duration,
                model_calls=self.turn.model_calls, completed_model_calls=self.turn.completed_model_calls,
                tool_calls=self.turn.tool_calls, completed_tool_calls=self.turn.completed_tool_calls,
                usage=self.turn.usage, usage_complete=self.turn.usage_complete,
                stage_durations={k:v for k,v in metrics.items() if k.endswith("_duration_ms")},
                assistant_message=assistant, failure_stage=stage if error else "",
                error_code=getattr(error,"code","turn_interrupted" if interrupted else "assistant_unavailable") if error else "",
                error_category=type(error).__name__ if error else "")
        except Exception:
            raise unavailable() from None


def reconcile_turns(conversation=None):
    """Persist observed abandoned leases, without inventing missing responses."""
    from django.db.models import Q, F
    rows = TurnAudit.objects.filter(status="processing").filter(Q(conversation__isnull=True) |
        Q(conversation__active_request__isnull=True) | Q(conversation__active_until__lt=timezone.now()) |
        ~Q(conversation__active_request=F("request_id")))
    if conversation:
        rows = rows.filter(conversation=conversation)
    count = 0
    for turn in rows.iterator():
        trace = Trace(turn)
        with transaction.atomic():
            locked = TurnAudit.objects.select_for_update().get(pk=turn.pk)
            if locked.status != "processing":
                continue
            trace.event("error", {"error_code":"turn_interrupted", "stage":"lease_reconciliation", "interruption_time_unknown":True,
                "explanation":"The processing lease was observed absent, expired or superseded; missing operations were not reconstructed."}, status="interrupted")
            TurnAudit.objects.filter(pk=turn.pk).update(status="interrupted", finished_at=timezone.now(), error_code="turn_interrupted", failure_stage="lease_reconciliation", usage_complete=False)
            count += 1
    return count
