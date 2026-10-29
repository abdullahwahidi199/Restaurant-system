"""Allowlisted structured diagnostics; never serialize arbitrary log extras."""
import json
import logging


class AssistantLogFormatter(logging.Formatter):
    def format(self, record):
        fields = ("request_id", "conversation_id", "failure_stage", "exception_category", "internal_error_code",
                  "provider_http_status", "provider_status", "tool", "status", "error_code", "knowledge_index_status",
                  "index_root", "index_reason", "os_errno", "os_winerror", "duration_ms", "model_requests", "tool_calls", "searches", "fetches",
                  "termination_reason", "orchestration_state", "state_before", "model_call_ordinal", "finish_reason",
                  "tool_call_count", "assistant_content_length", "tool_choice", "decision", "decision_reason",
                  "provider_duration_ms", "context_duration_ms", "search_duration_ms", "fetch_duration_ms",
                  "validation_duration_ms", "request_context_bytes", "complete_evidence_count")
        return json.dumps({"event": record.getMessage(), "level": record.levelname,
                           **{key: getattr(record, key) for key in fields if hasattr(record, key)}}, ensure_ascii=True)
