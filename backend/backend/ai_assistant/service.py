"""Scoped conversation persistence, leases and bounded model history."""
import logging
import uuid
from datetime import timedelta
from functools import lru_cache

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from knowledge.errors import GatewayError
from knowledge.gateway import KnowledgeGateway

from .config import Limits
from .errors import AssistantError
from .evidence import revalidate_reference
from .models import Conversation, Message
from .orchestrator import Orchestrator
from .provider import DeepSeekProvider

logger = logging.getLogger("ai_assistant")


@lru_cache(maxsize=1)
def get_gateway():
    return KnowledgeGateway()


def get_provider():
    if getattr(settings, "AI_ASSISTANT_PROVIDER", "deepseek") != "deepseek":
        raise AssistantError("configuration_invalid", "The configured AI provider is not supported.")
    return DeepSeekProvider()


def principal_for(user, gateway):
    try:
        return gateway.principal_resolver(user)
    except GatewayError as exc:
        raise AssistantError(exc.code, exc.message, 503 if exc.code == "authorization_unavailable" else 403) from None


def scope_for(user, principal):
    return {"user_id": user.pk, "authorization_binding": principal.binding, "restaurant_id": principal.restaurant_id or None, "branch_id": principal.branch_id or None}


def serialize_message(message, *, principal, index=None):
    sources, stale = [], False
    if message.role == "assistant" and message.kind == "answer":
        if index is None:
            index = get_gateway().repository.get()
        for source in message.sources:
            validated = revalidate_reference(source, index, principal)
            if not validated:
                stale = True
                break
            sources.append(validated[1])
        stale = stale or not sources
    return {"id": message.pk, "role": message.role, "content": "This earlier answer is unavailable in the current documentation context. Ask the question again." if stale else message.content,
            "kind": message.kind, "state": message.state, "error_code": message.error_code or None, "sources": [] if stale else sources,
            "stale_sources": stale, "created_at": message.created_at.isoformat()}


class ConversationService:
    def __init__(self, *, provider=None, gateway=None, limits=None, observer=None):
        self.gateway = gateway or get_gateway()
        self.provider = provider
        self.limits = limits or Limits.configured()
        self.observer = observer

    def _reserve(self, user, principal, question, conversation_id, request_id):
        now = timezone.now()
        with transaction.atomic():
            if conversation_id:
                conversation = Conversation.objects.filter(id=conversation_id, **scope_for(user, principal)).first()
                if not conversation:
                    raise AssistantError("conversation_not_found", "The conversation is not available in the current context.", 404)
            else:
                conversation = Conversation.objects.create(**scope_for(user, principal), title=question[:100])
            # Conditional UPDATE claims one turn across workers without holding a DB
            # transaction open during provider calls (also works on SQLite).
            claimed = Conversation.objects.filter(pk=conversation.pk).filter(Q(active_request__isnull=True) | Q(active_until__lt=now)).update(
                active_request=request_id, active_until=now + timedelta(seconds=self.limits.turn_seconds + 3 * self.limits.provider_timeout + 15), updated_at=now)
            if not claimed:
                raise AssistantError("conversation_busy", "Another reply is still being generated in this conversation.", 409)
            conversation.messages.filter(state="pending").update(state="failed", error_code="turn_interrupted")
            question_record = Message.objects.create(conversation=conversation, request_id=request_id, role="user", kind="question", content=question, state="pending")
        return conversation, question_record

    def reply(self, *, user, question, conversation_id=None, preferred_language="en"):
        if not isinstance(question, str) or not question.strip() or len(question) > self.limits.input_characters:
            raise AssistantError("invalid_message", "Enter a nonempty message within the configured length limit.", 400)
        try:
            question.encode("utf-8")
        except UnicodeError:
            raise AssistantError("invalid_message", "Message must contain valid Unicode text.", 400) from None
        request_id = uuid.uuid4()
        principal = principal_for(user, self.gateway)
        conversation, question_record = self._reserve(user, principal, question, conversation_id, request_id)
        try:
            prior = list(conversation.messages.filter(state="complete").order_by("-created_at", "-id")[:self.limits.history_messages])
            history = [{"role": item.role, "content": item.content, "kind": item.kind, "sources": item.sources} for item in reversed(prior)]
            engine = Orchestrator(self.provider or get_provider(), self.gateway, self.limits, self.observer)
            result = engine.run(user=user, question=question, history=history, preferred_language=preferred_language, request_id=str(request_id))
            current = principal_for(user, self.gateway)
            if current.binding != principal.binding:
                raise AssistantError("context_changed", "Your authorized context changed. Start a new conversation.", 409)
            verified_index = None
            if result.kind == "answer":
                verified_index = self.gateway.repository.get()
                if not result.sources or any(not revalidate_reference(source, verified_index, current) for source in result.sources):
                    raise AssistantError("sources_invalid", "The answer's documentation references could not be verified.", 502)
            with transaction.atomic():
                owned = Conversation.objects.filter(pk=conversation.pk, active_request=request_id).update(updated_at=timezone.now())
                if not owned:
                    raise AssistantError("turn_superseded", "This reply was superseded. Please reload the conversation.", 409)
                reply = Message.objects.create(conversation=conversation, request_id=request_id, role="assistant", content=result.content, kind=result.kind,
                                               sources=result.sources, index_version=result.index_version)
                Message.objects.filter(pk=question_record.pk).update(state="complete")
            logger.info("assistant_conversation", extra={"conversation_id": str(conversation.pk), "request_id": str(request_id), "termination_reason": result.kind})
            return {"conversation_id": str(conversation.pk), "request_id": str(request_id), "message": serialize_message(reply, principal=current, index=verified_index)}
        except Exception as exc:
            Message.objects.filter(pk=question_record.pk, state="pending").update(state="failed", error_code=exc.code if isinstance(exc, (AssistantError, GatewayError)) else "assistant_unavailable")
            error = exc if isinstance(exc, AssistantError) else AssistantError(exc.code, exc.message) if isinstance(exc, GatewayError) else AssistantError("assistant_unavailable", "The assistant could not complete the request. Please try again.")
            error.conversation_id, error.request_id = str(conversation.pk), str(request_id)
            logger.warning("assistant_conversation_failed", extra={"conversation_id": str(conversation.pk), "request_id": str(request_id), "termination_reason": error.code})
            raise error from None
        finally:
            Conversation.objects.filter(pk=conversation.pk, active_request=request_id).update(active_request=None, active_until=None)
