from dataclasses import dataclass, fields

from django.conf import settings
from ai_assistant.errors import AssistantError


@dataclass(frozen=True)
class Limits:
    input_characters: int = 4000
    request_bytes: int = 32768
    history_messages: int = 12
    model_requests: int = 5
    retrieval_rounds: int = 3
    batch_operations: int = 16
    turn_operations: int = 32
    document_bytes: int = 32000
    operation_bytes: int = 40000
    batch_bytes: int = 140000
    evidence_bytes: int = 200000
    context_bytes: int = 320000
    argument_bytes: int = 32000
    output_tokens: int = 2400
    output_characters: int = 16000
    provider_timeout: int = 20
    operation_seconds: int = 5
    turn_seconds: int = 90

    @classmethod
    def configured(cls):
        options = getattr(settings, "BUSINESS_ANALYST_LIMITS", {})
        if (not isinstance(options, dict) or set(options) - {f.name for f in fields(cls)}
                or any(type(v) is not int or not 1 <= v <= 1_000_000 for v in options.values())):
            raise AssistantError("configuration_invalid", "Business Analyst limits are invalid.")
        result = cls(**options)
        if (result.model_requests > 8 or result.retrieval_rounds > 5 or result.batch_operations > 24
                or result.turn_operations > 64 or result.history_messages > 40
                or result.input_characters > 16000 or result.turn_seconds > 180
                or result.provider_timeout > 60 or result.operation_seconds > 10
                or result.batch_bytes < 4000 or result.context_bytes < 64000):
            raise AssistantError("configuration_invalid", "Business Analyst limits exceed supported bounds.")
        return result
