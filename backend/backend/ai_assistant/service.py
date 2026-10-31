"""Scoped conversation persistence, leases and bounded model history."""
import logging
import uuid
import time
from functools import lru_cache

from django.conf import settings
from knowledge.errors import GatewayError
from knowledge.gateway import KnowledgeGateway

from .config import Limits
from .errors import AssistantError
from .evidence import revalidate_reference
from .agents import OPERATOR_MENTOR
from .persistence import AgentStore

from .auditing import scope as audit_scope
from .orchestrator import Orchestrator
from .provider import DeepSeekProvider
from .model_configuration import ModelConfiguration

logger = logging.getLogger("ai_assistant")
STORE = AgentStore(OPERATOR_MENTOR)


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
    return STORE.scope(user, principal)


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
    return {"id": message.public_id, "role": message.role, "content": "This earlier answer is unavailable in the current documentation context. Ask the question again." if stale else message.content,
            "kind": message.kind, "state": message.state, "error_code": message.error_code or None, "sources": [] if stale else sources,
            "stale_sources": stale, "created_at": message.created_at.isoformat()}


class ConversationService:
    def __init__(self, *, provider=None, gateway=None, limits=None, observer=None):
        self.gateway = gateway or get_gateway()
        self.provider = provider
        self.limits = limits or Limits.configured()
        self.observer = observer

    def _reserve(self, user, principal, question, conversation_id, request_id, preferred_language="en", configuration=None, requested=None):
        configuration = configuration or ModelConfiguration.resolve()
        return STORE.reserve(user=user, principal=principal, question=question, conversation_id=conversation_id,
            request_id=request_id, configuration=configuration, limits=self.limits, preferred_language=preferred_language,
            requested=requested, provider=getattr(settings, "AI_ASSISTANT_PROVIDER", "deepseek"))

    def reply(self, *, user, question, conversation_id=None, preferred_language="en", model=None, reasoning_effort=None):
        if not isinstance(question, str) or not question.strip() or len(question) > self.limits.input_characters:
            raise AssistantError("invalid_message", "Enter a nonempty message within the configured length limit.", 400)
        try:
            question.encode("utf-8")
        except UnicodeError:
            raise AssistantError("invalid_message", "Message must contain valid Unicode text.", 400) from None
        request_id = uuid.uuid4()
        principal = principal_for(user, self.gateway)
        configuration = ModelConfiguration.resolve(model, reasoning_effort)
        conversation, question_record, trace = self._reserve(user, principal, question, conversation_id, request_id, preferred_language, configuration,
            {"requested_model": model, "requested_reasoning_effort": reasoning_effort})
        started, stage, engine = time.monotonic(), "conversation_history", None
        try:
            prior = list(conversation.messages.filter(state="complete").order_by("-created_at", "-id")[:self.limits.history_messages])
            history = [{"role": item.role, "content": item.content, "kind": item.kind, "sources": item.sources, "request_id":str(item.request_id), "message_id":item.pk} for item in reversed(prior)]
            stage = "provider_configuration"
            engine = Orchestrator(self.provider or get_provider(), self.gateway, self.limits, self.observer)
            with audit_scope(trace):
                result = engine.run(user=user, question=question, history=history, preferred_language=preferred_language, request_id=str(request_id), configuration=configuration)
            trace.event("answer_generated", {"kind":result.kind, "content":result.content, "sources":result.sources, "index_version":result.index_version,
                "evidence_origins":trace.evidence_origins, **({'application_status': result.application_status} if result.application_status else {})})
            current = principal_for(user, self.gateway)
            if current.binding != principal.binding:
                raise AssistantError("context_changed", "Your authorized context changed. Start a new conversation.", 409)
            verified_index = None
            if result.kind == "answer":
                engine.diagnostics["failure_stage"] = "knowledge_index_loading"
                verified_index = self.gateway.repository.get()
                if not result.sources or any(not revalidate_reference(source, verified_index, current) for source in result.sources):
                    raise AssistantError("sources_invalid", "The answer's documentation references could not be verified.", 502)
            engine.diagnostics["failure_stage"] = "conversation_persistence"
            reply = STORE.persist_answer(conversation=conversation, request_id=request_id, question_record=question_record,
                content=result.content, kind=result.kind, sources=result.sources, index_version=result.index_version,
                trace=trace, metrics=result.metrics,
                extra={'application_status': result.application_status} if result.application_status else None)
            logger.info("assistant_conversation", extra={"conversation_id": str(conversation.pk), "request_id": str(request_id), "termination_reason": result.kind})
            return {"conversation_id": str(conversation.pk), "request_id": str(request_id), "message": serialize_message(reply, principal=current, index=verified_index),
                    **({'application_status': result.application_status} if result.application_status else {})}
        except Exception as exc:
            STORE.fail_question(question_record, exc.code if isinstance(exc, (AssistantError, GatewayError)) else "assistant_unavailable")
            error = exc if isinstance(exc, AssistantError) else AssistantError(exc.code, exc.message) if isinstance(exc, GatewayError) else AssistantError("assistant_unavailable", "The assistant could not complete the request. Please try again.")
            error.conversation_id, error.request_id = str(conversation.pk), str(request_id)
            try:
                trace.finish("failed", error=error, stage=engine.diagnostics.get("failure_stage",stage) if engine else stage, metrics=getattr(engine,"metrics",{}))
            except AssistantError:
                error = AssistantError("audit_unavailable", "The assistant's audit storage is unavailable. Please try again later.")
                error.conversation_id, error.request_id = str(conversation.pk), str(request_id)
            logger.warning("assistant_conversation_failed", extra={"conversation_id": str(conversation.pk), "request_id": str(request_id), "termination_reason": error.code,
                           "failure_stage": stage, "knowledge_index_status": "not_loaded", **(engine.diagnostics if engine else {}),
                           "exception_category": type(exc).__name__, "internal_error_code": error.code, "provider_http_status": getattr(exc, "provider_http_status", None),
                           "duration_ms": round((time.monotonic() - started) * 1000),
                           **{k: getattr(engine, "metrics", {}).get(k, 0) for k in ("model_requests", "tool_calls", "searches", "fetches")}})
            raise error from None
        except (KeyboardInterrupt, SystemExit, GeneratorExit) as exc:
            STORE.fail_question(question_record, "turn_interrupted")
            trace.finish("interrupted", error=exc, stage=engine.diagnostics.get("failure_stage",stage) if engine else stage,
                         metrics=getattr(engine,"metrics",{}), interrupted=True)
            raise
        finally:
            STORE.release(conversation, request_id)
