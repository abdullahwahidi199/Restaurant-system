"""Independent, scoped conversation lifecycle; provider calls never hold a DB lease transaction."""
import time
import uuid

from ai_assistant.errors import AssistantError
from ai_assistant.model_configuration import ModelConfiguration
from ai_assistant.provider import DeepSeekProvider

from ai_assistant.auditing import scope as audit_scope
from .config import Limits
from .context import principal_for, scope_for, STORE
from .documents import DocumentRepository
from .engine import Engine
from .errors import OperationError
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


def serialize_message(message, documents, principal, limits, *, fresh=False, historical=False, tool_permissions=None):
    stale = (not fresh and message.role == "assistant"
             and ((message.kind == "answer" and not message.sources)
                  or (bool(message.sources) and not current_sources(message.sources, documents, principal, limits))))
    observed = False
    if historical and stale and message.sources and any(s.get("kind") == "tool" for s in message.sources):
        # History displays an authorized past observation. Model context still
        # uses the default redaction path and must retrieve fresh live evidence.
        from .context import ToolContext
        from .tools import authorize_tool
        permissions = tool_permissions if tool_permissions is not None else {}
        authorized = True
        for source in message.sources:
            if source.get("kind") != "tool":
                continue
            tool_id = source.get("tool_id")
            if tool_id not in permissions:
                permissions[tool_id] = authorize_tool(tool_id, ToolContext(principal, time.monotonic() + limits.operation_seconds), {})
            authorized = authorized and permissions[tool_id]
        docs = [s for s in message.sources if s.get("kind") == "document"]
        if authorized and current_sources(docs, documents, principal, limits):
            stale, observed = False, True
    return {"id": message.public_id, "role": message.role, "kind": message.kind, "state": message.state,
            "content": "This earlier answer requires fresh evidence. Ask the question again." if stale else message.content,
            "sources": [] if stale else message.sources, "stale_sources": stale,
            "historical_observation": observed,
            "error_code": message.error_code or None, "created_at": message.created_at.isoformat()}


class ConversationService:
    def __init__(self, *, provider=None, documents=None, registry=None, limits=None):
        self.provider = provider
        self.documents = documents or DocumentRepository()
        self.registry = registry or production_registry(self.documents)
        self.limits = limits or Limits.configured()

    def _reserve(self, user, principal, question, conversation_id, request_id, configuration, requested=None, preferred_language="en"):
        return STORE.reserve(user=user, principal=principal, question=question, conversation_id=conversation_id,
            request_id=request_id, configuration=configuration, limits=self.limits,
            requested=requested, preferred_language=preferred_language)

    def reply(self, *, user, question, conversation_id=None, model=None, reasoning_effort=None, preferred_language="en"):
        if not isinstance(question, str) or not question.strip() or len(question) > self.limits.input_characters:
            raise AssistantError("invalid_message", "Enter a nonempty message within the configured length limit.", 400)
        try:
            question.encode("utf-8")
        except UnicodeError:
            raise AssistantError("invalid_message", "Message must contain valid Unicode text.", 400) from None
        principal = principal_for(user)
        configuration = ModelConfiguration.resolve(model, reasoning_effort)
        request_id = uuid.uuid4()
        conversation, question_record, trace = self._reserve(user, principal, question, conversation_id, request_id, configuration,
            {"requested_model": model, "requested_reasoning_effort": reasoning_effort}, preferred_language)
        try:
            trace.event("turn_started", {"scope_binding": conversation.authorization_binding})
            prior = list(conversation.messages.filter(state="complete").order_by("-created_at", "-id")[:self.limits.history_messages])
            history = []
            for message in reversed(prior):
                item = serialize_message(message, self.documents, principal, self.limits)
                history.append({"role": item["role"], "content": item["content"]})
            with audit_scope(trace):
                result = Engine(self.provider or get_provider(), self.documents, self.registry, self.limits,
                                audit=trace.event).run(user=user, question=question, principal=principal,
                                                       history=history, request_id=str(request_id), configuration=configuration)
            current = principal_for(user)
            if current.binding != principal.binding:
                raise AssistantError("context_changed", "Your authorized context changed. Start a new conversation.", 409)
            document_sources = [source for source in result.sources if source["kind"] == "document"]
            if not current_sources(document_sources, self.documents, current, self.limits):
                raise AssistantError("sources_changed", "The documentation changed during generation. Ask again.", 409)
            trace.event("answer_generated", {"kind": result.kind, "content": result.content, "sources": result.sources})
            answer = STORE.persist_answer(conversation=conversation, request_id=request_id, question_record=question_record,
                content=result.content, kind=result.kind, sources=result.sources, trace=trace, require_unexpired=True)
            return {"conversation_id": str(conversation.pk), "request_id": str(request_id),
                    "message": serialize_message(answer, self.documents, current, self.limits, fresh=True)}
        except Exception as exc:
            error = exc if isinstance(exc, AssistantError) else AssistantError("execution_failed", "The Business Analyst could not complete this turn.")
            STORE.fail_question(question_record, error.code)
            try:
                trace.finish("failed", error=error, stage="business_analyst")
            except AssistantError:
                error = AssistantError("audit_unavailable", "The assistant's audit storage is unavailable. Please try again later.")
            error.conversation_id, error.request_id = str(conversation.pk), str(request_id)
            raise error from None
        except (KeyboardInterrupt, SystemExit, GeneratorExit) as exc:
            STORE.fail_question(question_record, "turn_interrupted")
            trace.finish("interrupted", error=exc, stage="business_analyst", interrupted=True)
            raise
        finally:
            STORE.release(conversation, request_id)
