"""Independent, scoped conversation lifecycle; provider calls never hold a DB lease transaction."""
import uuid
from datetime import timedelta

from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from ai_assistant.errors import AssistantError
from ai_assistant.model_configuration import ModelConfiguration
from ai_assistant.provider import DeepSeekProvider

from .auditing import Trace
from .config import Limits
from .context import principal_for, scope_for
from .documents import DocumentRepository
from .engine import Engine
from .errors import OperationError
from .models import Conversation, Message, TurnAudit
from .registry import production_registry


def get_provider():
    return DeepSeekProvider()


def current_sources(sources, documents, principal, limits):
    for source in sources:
        if source.get("kind") != "document":
            return False  # Past live observations must be retrieved again.
        try:
            current = documents.fetch(source["document_id"], principal, max_bytes=limits.document_bytes)
            if current["provenance"] != source["provenance"]:
                return False
        except (OperationError, KeyError, TypeError):
            return False
    return True


def serialize_message(message, documents, principal, limits, *, fresh=False):
    stale = (not fresh and message.role == "assistant"
             and ((message.kind == "answer" and not message.sources)
                  or (bool(message.sources) and not current_sources(message.sources, documents, principal, limits))))
    return {"id": message.pk, "role": message.role, "kind": message.kind, "state": message.state,
            "content": "This earlier answer requires fresh evidence. Ask the question again." if stale else message.content,
            "sources": [] if stale else message.sources, "stale_sources": stale,
            "error_code": message.error_code or None, "created_at": message.created_at.isoformat()}


class ConversationService:
    def __init__(self, *, provider=None, documents=None, registry=None, limits=None):
        self.provider = provider
        self.documents = documents or DocumentRepository()
        self.registry = registry or production_registry(self.documents)
        self.limits = limits or Limits.configured()

    def _reserve(self, user, principal, question, conversation_id, request_id, configuration):
        now = timezone.now()
        with transaction.atomic():
            if conversation_id:
                conversation = Conversation.objects.filter(id=conversation_id, **scope_for(user, principal)).first()
                if not conversation:
                    raise AssistantError("conversation_not_found", "The conversation is not available in the current context.", 404)
            else:
                conversation = Conversation.objects.create(**scope_for(user, principal), title=question[:100])
            claimed = Conversation.objects.filter(pk=conversation.pk).filter(
                Q(active_request__isnull=True) | Q(active_until__lt=now)).update(
                    active_request=request_id,
                    active_until=now + timedelta(seconds=self.limits.turn_seconds + 3 * self.limits.provider_timeout + 15),
                    updated_at=now)
            if not claimed:
                raise AssistantError("conversation_busy", "Another reply is being generated in this conversation.", 409)
            conversation.messages.filter(state="pending").update(state="failed", error_code="turn_interrupted")
            conversation.audits.filter(status="processing").update(status="failed", error_code="turn_interrupted", finished_at=now)
            question_record = Message.objects.create(conversation=conversation, request_id=request_id,
                                                    role="user", content=question, state="pending")
            turn = TurnAudit.objects.create(request_id=request_id, conversation=conversation,
                                            model_configuration=configuration.public())
        return conversation, question_record, Trace(turn)

    def reply(self, *, user, question, conversation_id=None, model=None, reasoning_effort=None):
        if not isinstance(question, str) or not question.strip() or len(question) > self.limits.input_characters:
            raise AssistantError("invalid_message", "Enter a nonempty message within the configured length limit.", 400)
        try:
            question.encode("utf-8")
        except UnicodeError:
            raise AssistantError("invalid_message", "Message must contain valid Unicode text.", 400) from None
        principal = principal_for(user)
        configuration = ModelConfiguration.resolve(model, reasoning_effort)
        request_id = uuid.uuid4()
        conversation, question_record, trace = self._reserve(user, principal, question, conversation_id, request_id, configuration)
        try:
            trace.event("turn_started", {"scope_binding": conversation.authorization_binding})
            prior = list(conversation.messages.filter(state="complete").order_by("-created_at", "-id")[:self.limits.history_messages])
            history = []
            for message in reversed(prior):
                item = serialize_message(message, self.documents, principal, self.limits)
                history.append({"role": item["role"], "content": item["content"]})
            result = Engine(self.provider or get_provider(), self.documents, self.registry, self.limits,
                            audit=trace.event).run(user=user, question=question, principal=principal,
                                                   history=history, request_id=str(request_id), configuration=configuration)
            current = principal_for(user)
            if current.binding != principal.binding:
                raise AssistantError("context_changed", "Your authorized context changed. Start a new conversation.", 409)
            document_sources = [source for source in result.sources if source["kind"] == "document"]
            if not current_sources(document_sources, self.documents, current, self.limits):
                raise AssistantError("sources_changed", "The documentation changed during generation. Ask again.", 409)
            with transaction.atomic():
                owned = Conversation.objects.filter(pk=conversation.pk, active_request=request_id,
                                                     active_until__gt=timezone.now()).update(
                                                         active_request=None, active_until=None, updated_at=timezone.now())
                if not owned:
                    raise AssistantError("turn_expired", "This turn is no longer active. Ask again.", 409)
                answer = Message.objects.create(conversation=conversation, request_id=request_id, role="assistant",
                                                content=result.content, kind=result.kind, sources=result.sources)
                Message.objects.filter(pk=question_record.pk, state="pending").update(state="complete")
                trace.event("turn_completed", {"kind": result.kind, "sources": result.sources})
                TurnAudit.objects.filter(pk=request_id).update(status="complete", finished_at=timezone.now())
            return {"conversation_id": str(conversation.pk), "request_id": str(request_id),
                    "message": serialize_message(answer, self.documents, current, self.limits, fresh=True)}
        except Exception as exc:
            code = exc.code if isinstance(exc, AssistantError) else "execution_failed"
            with transaction.atomic():
                Conversation.objects.filter(pk=conversation.pk, active_request=request_id).update(active_request=None, active_until=None)
                Message.objects.filter(pk=question_record.pk, state="pending").update(state="failed", error_code=code)
                TurnAudit.objects.filter(pk=request_id, status="processing").update(status="failed", error_code=code, finished_at=timezone.now())
                trace.event("turn_failed", {"code": code})
            error = exc if isinstance(exc, AssistantError) else AssistantError("execution_failed", "The Business Analyst could not complete this turn.")
            error.conversation_id, error.request_id = str(conversation.pk), str(request_id)
            raise error from None
