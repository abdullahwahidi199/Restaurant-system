"""Shared scoped persistence and leases. No prompts, retrieval or tool dispatch."""
from dataclasses import dataclass
from datetime import timedelta
import time

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from .agents import validate_agent_type
from .audit_payloads import redact
from .auditing import Trace, reconcile_turns
from .errors import AssistantError
from .language import question_language
from .models import Conversation, Message, TurnAudit


@dataclass(frozen=True)
class AgentStore:
    agent_type: str
    binding_suffix: str = ""

    def __post_init__(self):
        validate_agent_type(self.agent_type)

    def conversations(self):
        return Conversation.objects.filter(agent_type=self.agent_type)

    def messages(self):
        return Message.objects.filter(conversation__agent_type=self.agent_type)

    def turns(self):
        return TurnAudit.objects.filter(agent_type=self.agent_type)

    def scope(self, user, principal):
        return {"agent_type": self.agent_type, "user_id": user.pk,
                "authorization_binding": principal.binding + self.binding_suffix,
                "restaurant_id": principal.restaurant_id or None, "branch_id": principal.branch_id or None}

    def reserve(self, *, user, principal, question, conversation_id, request_id, configuration,
                limits, preferred_language="en", requested=None, provider="deepseek"):
        now = timezone.now()
        with transaction.atomic():
            if conversation_id:
                conversation = self.conversations().filter(pk=conversation_id, **self.scope(user, principal)).first()
                if not conversation:
                    raise AssistantError("conversation_not_found", "The conversation is not available in the current context.", 404)
            else:
                conversation = Conversation.objects.create(**self.scope(user, principal), title=question[:100])
            reconcile_turns(conversation)
            claimed = self.conversations().filter(pk=conversation.pk).filter(
                Q(active_request__isnull=True) | Q(active_until__lt=now)).update(
                    active_request=request_id,
                    active_until=now + timedelta(seconds=limits.turn_seconds + 3 * limits.provider_timeout + 15), updated_at=now)
            if not claimed:
                raise AssistantError("conversation_busy", "Another reply is still being generated in this conversation.", 409)
            self.messages().filter(conversation=conversation, state="pending").update(state="failed", error_code="turn_interrupted")
            question_record = Message.objects.create(conversation=conversation, request_id=request_id, role="user",
                                                     kind="question", content=question, state="pending")
            configuration_data = {**configuration.public(), **(requested or {})}
            turn = TurnAudit.objects.create(request_id=request_id, agent_type=self.agent_type,
                conversation=conversation, conversation_identifier=conversation.pk, user_message=question_record,
                user=user, restaurant_id=principal.restaurant_id or None, branch_id=principal.branch_id or None,
                language=question_language(question, preferred_language), started_at=now,
                provider=redact(str(provider))[:40], model=configuration.model, model_configuration=configuration_data)
            trace = Trace(turn)
            event = trace.event("user_message", {"message_id": question_record.public_id, "content": question,
                "language": turn.language, "user_id": user.pk, "username": user.username,
                "restaurant_id": turn.restaurant_id, "branch_id": turn.branch_id, "model_configuration": configuration_data})
            self.turns().filter(pk=turn.pk).update(question_payload=event.payload)
        return conversation, question_record, trace

    def persist_answer(self, *, conversation, request_id, question_record, content, kind, sources,
                       trace, metrics=None, index_version="", require_unexpired=False, extra=None):
        started = time.perf_counter()
        with transaction.atomic():
            owner = self.conversations().filter(pk=conversation.pk, active_request=request_id)
            if require_unexpired:
                owner = owner.filter(active_until__gt=timezone.now())
            if not owner.update(updated_at=timezone.now()):
                raise AssistantError("turn_expired" if require_unexpired else "turn_superseded",
                                     "This reply is no longer active. Reload the conversation.", 409)
            answer = Message.objects.create(conversation=conversation, request_id=request_id, role="assistant",
                content=content, kind=kind, sources=sources, index_version=index_version)
            self.messages().filter(pk=question_record.pk, state="pending").update(state="complete")
            duration = round((time.perf_counter() - started) * 1000, 3)
            trace.event("answer_persisted", {"message_id": answer.public_id, "kind": kind, "sources": sources, **(extra or {})}, duration_ms=duration)
            trace.finish("completed", metrics={**(metrics or {}), "persistence_duration_ms": duration}, assistant=answer)
        return answer

    def fail_question(self, question_record, code):
        self.messages().filter(pk=question_record.pk, state="pending").update(state="failed", error_code=code)

    def release(self, conversation, request_id):
        self.conversations().filter(pk=conversation.pk, active_request=request_id).update(active_request=None, active_until=None)
