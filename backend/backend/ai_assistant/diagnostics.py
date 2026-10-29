"""Allowlisted structured diagnostics; never serialize arbitrary log extras."""
import json
import logging


class AssistantLogFormatter(logging.Formatter):
    def format(self, record):
        fields = ("request_id", "conversation_id", "failure_stage", "exception_category", "internal_error_code",
                  "provider_http_status", "provider_status", "tool", "status", "error_code", "knowledge_index_status",
                  "index_root", "index_reason", "os_errno", "os_winerror", "duration_ms", "model_requests", "tool_calls", "searches", "fetches",
                  "termination_reason", "orchestration_state")
        return json.dumps({"event": record.getMessage(), "level": record.levelname,
                           **{key: getattr(record, key) for key in fields if hasattr(record, key)}}, ensure_ascii=True)
