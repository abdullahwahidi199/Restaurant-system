"""One bounded retrieval phase; each operation succeeds or fails independently."""
import re
import time
from contextlib import ExitStack

from django.db import connections, transaction
from django.utils import timezone
from ai_assistant.errors import AssistantError

from .context import ToolContext, principal_for
from .errors import OperationError
from .registry import json_bytes

INVOCATION_ID = re.compile(r"[A-Za-z0-9_-]{1,64}\Z")

BATCH_DEFINITION = {
    "name": "retrieve_business_context",
    "description": "Fetch known Admin documents and invoke registered read-only business tools together in one batch. No search is needed.",
    "parameters": {"type": "object", "additionalProperties": False,
                   "required": ["document_ids", "tools"],
                   "properties": {
                       "document_ids": {"type": "array", "maxItems": 16, "items": {"type": "string", "maxLength": 96}},
                       "tools": {"type": "array", "maxItems": 16, "items": {
                           "type": "object", "additionalProperties": False,
                           "required": ["invocation_id", "tool_id", "parameters"],
                           "properties": {"invocation_id": {"type": "string", "maxLength": 64},
                                          "tool_id": {"type": "string", "maxLength": 96},
                                          "parameters": {"type": "object"}}}}}},
}


def _read_only(execute, sql, params, many, context):
    # Defense in depth for registered code. No model SQL or ORM interface exists.
    # SELECT functions are still trusted code: this is not a Python sandbox.
    statement = sql.strip().rstrip(";")
    if (not re.match(r"\ASELECT\b", statement, re.IGNORECASE) or ";" in statement
            or re.search(r"\b(INTO|FOR\s+(UPDATE|SHARE))\b", statement, re.IGNORECASE)):
        raise OperationError("READ_ONLY_VIOLATION")
    return execute(sql, params, many, context)


class BatchExecutor:
    def __init__(self, documents, registry, limits, *, audit=None):
        self.documents, self.registry, self.limits = documents, registry, limits
        self.audit = audit or (lambda event, metadata: None)
        self.operation_count = 0
        self.batch_count = 0
        self.total_bytes = 0
        self.invocation_ids = set()

    def execute(self, request, *, user, binding, deadline):
        if (not isinstance(request, dict) or set(request) != {"document_ids", "tools"}
                or not isinstance(request["document_ids"], list) or not isinstance(request["tools"], list)):
            return {"error": OperationError("INVALID_PARAMETERS").as_dict(), "results": []}
        operations = [("document", value) for value in request["document_ids"]] + [("tool", value) for value in request["tools"]]
        if not operations or len(operations) > self.limits.batch_operations:
            return {"error": OperationError("LIMIT_EXCEEDED").as_dict(), "results": []}
        self.batch_count += 1
        batch_id = f"b{self.batch_count}"
        self.audit("batch_started", {"batch_id": batch_id, "operations": len(operations)})
        results = []
        # Reserve room for error envelopes so large results cannot suppress peers.
        used = len(operations) * 800
        for index, (kind, value) in enumerate(operations):
            started = time.monotonic()
            evidence_id = f"{batch_id}:{index}"
            identity = value if kind == "document" else value.get("tool_id") if isinstance(value, dict) else None
            identity = identity if isinstance(identity, str) and re.fullmatch(r"[A-Za-z0-9_.-]{1,96}", identity) else "invalid"
            result = {"evidence_id": evidence_id, "kind": kind, "id": identity, "ok": False}
            self.operation_count += 1
            try:
                if self.operation_count > self.limits.turn_operations:
                    raise OperationError("LIMIT_EXCEEDED")
                if time.monotonic() >= deadline:
                    raise OperationError("TIMEOUT")
                try:
                    principal = principal_for(user)
                except AssistantError:
                    raise OperationError("PERMISSION_DENIED") from None
                if principal.binding != binding:
                    raise OperationError("PERMISSION_DENIED")
                operation_deadline = min(deadline, started + self.limits.operation_seconds)
                if kind == "document":
                    data = self.documents.fetch(value, principal, max_bytes=self.limits.document_bytes)
                else:
                    data = self._tool(value, principal, operation_deadline)
                if time.monotonic() >= operation_deadline:
                    raise OperationError("TIMEOUT")
                size = len(json_bytes(data))
                if (size > self.limits.operation_bytes or used + size > self.limits.batch_bytes
                        or self.total_bytes + size > self.limits.evidence_bytes):
                    raise OperationError("OUTPUT_TOO_LARGE")
                result.update(ok=True, data=data)
                used += size
                self.total_bytes += size
            except OperationError as exc:
                result["error"] = exc.as_dict()
            except Exception:
                # Unexpected handler/filesystem/database details are private.
                result["error"] = OperationError("EXECUTION_FAILED").as_dict()
            results.append(result)
            self.audit("operation_finished", {"evidence_id": evidence_id, "kind": kind, "id": identity,
                       "ok": result["ok"], "code": result.get("error", {}).get("code"),
                       "duration_ms": round((time.monotonic() - started) * 1000),
                       "bytes": len(json_bytes(result)),
                       **({"provenance": result["data"]["provenance"]} if result["ok"] and kind == "document" else {})})
        self.audit("batch_finished", {"batch_id": batch_id, "succeeded": sum(item["ok"] for item in results), "operations": len(results)})
        return {"batch_id": batch_id, "results": results}

    def _tool(self, invocation, principal, deadline):
        if (not isinstance(invocation, dict) or set(invocation) != {"invocation_id", "tool_id", "parameters"}
                or not isinstance(invocation["invocation_id"], str)
                or not INVOCATION_ID.fullmatch(invocation["invocation_id"])
                or invocation["invocation_id"] in self.invocation_ids):
            raise OperationError("INVALID_PARAMETERS")
        self.invocation_ids.add(invocation["invocation_id"])
        tool = self.registry.get(invocation["tool_id"])
        parameters = self.registry.validate_parameters(tool, invocation["parameters"])
        context = ToolContext(principal, min(deadline, time.monotonic() + tool.timeout_seconds))
        context.check_deadline()

        def guarded_read(execute, sql, params, many, db_context):
            context.check_deadline()
            result = _read_only(execute, sql, params, many, db_context)
            context.check_deadline()
            return result

        # Authorizers and handlers are both restricted to read-only SQL.
        with ExitStack() as stack:
            # A handler's database failure must not poison subsequent operations
            # when the caller already has an outer transaction (e.g. ATOMIC_REQUESTS).
            for connection in connections.all():
                stack.enter_context(transaction.atomic(using=connection.alias))
            for connection in connections.all():
                stack.enter_context(connection.execute_wrapper(guarded_read))
            if tool.authorize(context, parameters) is not True:
                raise OperationError("PERMISSION_DENIED")
            context.check_deadline()
            output = tool.handler(context, parameters)
            context.check_deadline()
            self.registry.validate_output(tool, output)
        return {"tool_id": tool.id, "invocation_id": invocation["invocation_id"],
                "knowledge_ids": list(tool.knowledge_ids), "executed_at": timezone.now().isoformat(), "output": output}
