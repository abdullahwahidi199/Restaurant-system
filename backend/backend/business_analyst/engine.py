import json
import time
from dataclasses import dataclass

from ai_assistant.errors import AssistantError
from ai_assistant.model_configuration import ModelConfiguration

from .context import principal_for
from .errors import OperationError
from .executor import BATCH_DEFINITION, BatchExecutor
from .prompts import SYSTEM_PROMPT
from .registry import json_bytes


@dataclass(frozen=True)
class Answer:
    kind: str
    content: str
    sources: list


class Engine:
    def __init__(self, provider, documents, registry, limits, *, audit=None):
        self.provider, self.documents, self.registry, self.limits = provider, documents, registry, limits
        self.audit = audit or (lambda event, metadata: None)

    def run(self, *, user, question, principal, history=(), request_id, configuration=None):
        configuration = configuration or ModelConfiguration.resolve()
        deadline = time.monotonic() + self.limits.turn_seconds
        executor = BatchExecutor(self.documents, self.registry, self.limits, audit=self.audit)
        capability_map = self.documents.capability_map(principal, self.registry)
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "Business Capability Map (selection metadata):\n" + json_bytes(capability_map).decode("utf-8")},
            *history,
            {"role": "user", "content": question},
        ]
        evidence, retrieval_rounds, repair_count = {}, 0, 0
        seen_call_ids = set()
        for number in range(1, self.limits.model_requests + 1):
            if principal_for(user).binding != principal.binding:
                raise AssistantError("context_changed", "Your authorized context changed. Start a new conversation.", 409)
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise AssistantError("turn_timeout", "The Business Analyst turn timed out.", 504)
            if len(json_bytes(messages)) > self.limits.context_bytes:
                raise AssistantError("context_limit", "The question and evidence exceed the context limit. Request fewer documents.", 422)
            self.audit("model_started", {"number": number, "configuration": configuration.public()})
            completion = self.provider.complete(messages=messages, tools=[BATCH_DEFINITION],
                                                tool_choice="auto", limits=self.limits,
                                                timeout=min(remaining, self.limits.provider_timeout),
                                                request_id=request_id, configuration=configuration)
            self.audit("model_finished", {"number": number, "usage": completion.usage, "tool_calls": len(completion.tool_calls)})
            if time.monotonic() >= deadline:
                raise AssistantError("turn_timeout", "The Business Analyst turn timed out.", 504)
            if completion.tool_calls:
                if retrieval_rounds >= self.limits.retrieval_rounds or len(completion.tool_calls) > 4:
                    raise AssistantError("retrieval_limit", "The retrieval limit was reached. Narrow the question.", 422)
                retrieval_rounds += 1
                messages.append(completion.message(include_reasoning=configuration.thinking))
                for call in completion.tool_calls:
                    if call.id in seen_call_ids:
                        raise AssistantError("provider_invalid_response", "The provider reused a tool call identifier.", 502)
                    seen_call_ids.add(call.id)
                    try:
                        if call.name != BATCH_DEFINITION["name"]:
                            raise OperationError("TOOL_NOT_REGISTERED")
                        if len(call.arguments.encode("utf-8")) > self.limits.argument_bytes:
                            raise OperationError("LIMIT_EXCEEDED")
                        payload = json.loads(call.arguments)
                        # Reject nonfinite values even for injected test providers.
                        json_bytes(payload)
                        result = executor.execute(payload, user=user, binding=principal.binding, deadline=deadline)
                    except OperationError as exc:
                        result = {"error": exc.as_dict(), "results": []}
                    except (ValueError, TypeError, UnicodeError, RecursionError):
                        result = {"error": OperationError("INVALID_PARAMETERS").as_dict(), "results": []}
                    for item in result["results"]:
                        if item["ok"]:
                            evidence[item["evidence_id"]] = self._source(item)
                    self.audit("retrieval_finished", {"call_id": call.id, "results": len(result["results"]),
                               "error_code": result.get("error", {}).get("code")})
                    messages.append({"role": "tool", "tool_call_id": call.id, "content": json_bytes(result).decode("utf-8")})
                continue
            try:
                answer = self._final(completion.text, evidence)
            except (ValueError, TypeError, KeyError, RecursionError):
                self.audit("answer_rejected", {"code": "INVALID_EVIDENCE_OR_FORMAT"})
                repair_count += 1
                if repair_count > 1:
                    raise AssistantError("unsupported_answer", "The model could not produce a supported answer.", 422) from None
                # Do not replay unsupported prose as accepted assistant context.
                permitted = json_bytes(sorted(evidence)).decode("utf-8")
                messages.append({"role": "user", "content": (
                    "Your final JSON or citations were invalid. Return exactly kind, content and citations. "
                    "The only permitted citation IDs are: " + permitted + ". "
                    "Never cite failed or permission-denied operations; describe their limitations in prose. "
                    "Tool IDs and invocation IDs are not citation IDs. Retrieve more evidence if needed. "
                    "Without successful evidence, use limitation or clarification with an empty citations array.")})
                continue
            return answer
        raise AssistantError("model_limit", "The model request limit was reached. Narrow the question.", 422)

    def _source(self, result):
        data = result["data"]
        if result["kind"] == "document":
            return {"evidence_id": result["evidence_id"], "kind": "document", "document_id": data["document_id"],
                    "title": data["title"], "provenance": data["provenance"]}
        return {"evidence_id": result["evidence_id"], "kind": "tool", "tool_id": data["tool_id"],
                "invocation_id": data["invocation_id"], "knowledge_ids": data["knowledge_ids"],
                "executed_at": data["executed_at"]}

    def _final(self, text, evidence):
        final = json.loads(text)
        if (not isinstance(final, dict) or set(final) != {"kind", "content", "citations"}
                or not isinstance(final["kind"], str) or final["kind"] not in {"answer", "clarification", "limitation"}
                or not isinstance(final["content"], str) or not final["content"].strip()
                or len(final["content"]) > self.limits.output_characters
                or not isinstance(final["citations"], list) or len(final["citations"]) > self.limits.turn_operations
                or any(not isinstance(citation, str) or citation not in evidence for citation in final["citations"])
                or len(set(final["citations"])) != len(final["citations"])
                or (final["kind"] == "answer" and not final["citations"])):
            raise ValueError
        return Answer(final["kind"], final["content"], [evidence[identity] for identity in final["citations"]])
