from dataclasses import dataclass, fields

from django.conf import settings

from .errors import AssistantError


@dataclass(frozen=True)
class Limits:
    history_messages: int = 12
    input_characters: int = 4000
    request_bytes: int = 32768
    model_requests: int = 6
    tool_calls: int = 12
    fetched_sections: int = 8
    tool_result_bytes: int = 64000
    total_tool_bytes: int = 180000
    evidence_characters: int = 48000
    context_bytes: int = 240000
    output_tokens: int = 1800
    output_characters: int = 16000
    provider_timeout: int = 20
    turn_seconds: int = 90
    tool_argument_bytes: int = 32000

    @classmethod
    def configured(cls):
        options = getattr(settings, "AI_ASSISTANT_LIMITS", {})
        valid = {f.name for f in fields(cls)}
        if not isinstance(options, dict) or set(options) - valid or any(isinstance(v, bool) or not isinstance(v, int) or v < 1 or v > 1_000_000 for v in options.values()):
            raise AssistantError("configuration_invalid", "The assistant limits are not configured correctly.")
        limits = cls(**options)
        if limits.model_requests > 12 or limits.tool_calls > 32 or limits.turn_seconds > 300 or limits.fetched_sections > 20 or limits.history_messages > 200 or limits.input_characters > 32000 or limits.provider_timeout > 120 or limits.context_bytes < limits.input_characters * 4:
            raise AssistantError("configuration_invalid", "The assistant limits exceed supported bounds.")
        return limits
