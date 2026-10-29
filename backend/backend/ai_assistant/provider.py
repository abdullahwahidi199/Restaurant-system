"""DeepSeek Chat Completions transport; orchestration sees only these dataclasses."""
import json
import logging
import re
import time
from dataclasses import dataclass, field
from urllib.parse import urlsplit

import httpx
from django.conf import settings

from .errors import AssistantError

logger = logging.getLogger("ai_assistant")
MAX_RESPONSE_BYTES = 256_000


@dataclass(frozen=True)
class ToolCall:
    id: str
    name: str
    arguments: str


@dataclass(frozen=True)
class Completion:
    text: str = ""
    tool_calls: tuple[ToolCall, ...] = ()
    finish_reason: str = "stop"
    usage: dict = field(default_factory=dict)

    def message(self):
        result = {"role": "assistant", "content": self.text or None}
        if self.tool_calls:
            result["tool_calls"] = [{"id": call.id, "type": "function", "function": {"name": call.name, "arguments": call.arguments}} for call in self.tool_calls]
        return result


def parse_completion(data):
    summary = {"finish_reason": None, "tool_call_count": 0, "assistant_content_length": 0}
    try:
        choices = data["choices"]
        if len(choices) != 1:
            raise ValueError
        choice = choices[0]
        message = choice["message"]
        # Capture shape only, including unusable/empty completions. Never retain
        # reasoning, content, tool arguments or arbitrary provider strings here.
        finish = choice.get("finish_reason")
        summary["finish_reason"] = finish if isinstance(finish, str) and finish in {"stop", "tool_calls", "length", "content_filter", "insufficient_system_resource"} else "unrecognized"
        summary["assistant_content_length"] = len(message["content"]) if isinstance(message.get("content"), str) else 0
        summary["tool_call_count"] = len(message["tool_calls"]) if isinstance(message.get("tool_calls"), list) else 0
        if message["role"] != "assistant" or message.get("reasoning_content"):
            raise ValueError
        raw_text = message.get("content")
        if raw_text is not None and not isinstance(raw_text, str):
            raise ValueError
        text = raw_text if raw_text is not None else ""
        if len(text) > 32000:
            raise ValueError
        text.encode("utf-8")
        calls = []
        raw_calls = message.get("tool_calls")
        raw_calls = [] if raw_calls is None else raw_calls
        if not isinstance(raw_calls, list) or len(raw_calls) > 16:
            raise ValueError
        for call in raw_calls:
            function = call["function"]
            if call["type"] != "function" or not isinstance(call["id"], str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", call["id"]):
                raise ValueError
            if not isinstance(function["name"], str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", function["name"]) or not isinstance(function["arguments"], str) or len(function["arguments"].encode("utf-8")) > 32000:
                raise ValueError
            calls.append(ToolCall(call["id"], function["name"], function["arguments"]))
        if len({call.id for call in calls}) != len(calls):
            raise ValueError
        finish = choice["finish_reason"]
        if finish not in {"stop", "tool_calls"} or (finish == "tool_calls") != bool(calls) or (not calls and not text.strip()):
            raise ValueError
        usage = data.get("usage", {})
        usage = {k: v for k, v in usage.items() if k in {"prompt_tokens", "completion_tokens", "total_tokens"} and isinstance(v, int) and not isinstance(v, bool) and 0 <= v <= 10**9} if isinstance(usage, dict) else {}
        return Completion(text, tuple(calls), finish, usage)
    except (KeyError, TypeError, ValueError, AttributeError):
        error = AssistantError("provider_invalid_response", "The AI provider returned an unusable response. Please try again.", 502)
        error.completion_summary = summary
        raise error from None


class DeepSeekProvider:
    def __init__(self, *, transport=None):
        self.transport = transport  # Explicit test seam, never supplied by HTTP/model args.

    def complete(self, *, messages, tools, tool_choice, limits, timeout, request_id):
        key = getattr(settings, "DEEPSEEK_API_KEY", "")
        base = getattr(settings, "DEEPSEEK_BASE_URL", "https://api.deepseek.com")
        model = getattr(settings, "DEEPSEEK_MODEL", "deepseek-flash")
        if not isinstance(key, str) or not key.strip():
            raise AssistantError("provider_not_configured", "The AI assistant is not configured. Ask an administrator to configure its provider.")
        try:
            if not isinstance(base, str):
                raise ValueError
            url = urlsplit(base)
            if url.scheme != "https" or not url.hostname or url.username or url.password or url.query or url.fragment or not isinstance(model, str) or not model.strip():
                raise ValueError
            url.port  # Validate malformed/non-numeric ports before constructing HTTP headers.
        except (ValueError, TypeError):
            raise AssistantError("configuration_invalid", "The AI provider endpoint or model is not configured correctly.") from None
        choice = tool_choice if tool_choice in {"auto", "none", "required"} else {"type": "function", "function": {"name": tool_choice}}
        payload = {"model": model, "messages": messages, "tools": [{"type": "function", "function": definition} for definition in tools],
                   "tool_choice": choice, "thinking": {"type": "disabled"}, "response_format": {"type": "json_object"}, "max_tokens": limits.output_tokens, "stream": False}
        started, outcome = time.monotonic(), "provider_failure"
        http_status, exception_category = None, None
        deadline = started + min(timeout, limits.provider_timeout)
        try:
            with httpx.Client(transport=self.transport, timeout=min(timeout, limits.provider_timeout), follow_redirects=False, trust_env=False) as client:
                with client.stream("POST", base.rstrip("/") + "/chat/completions", headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"}, json=payload) as response:
                    http_status = response.status_code
                    if time.monotonic() > deadline:
                        raise AssistantError("provider_timeout", "The AI provider timed out. Please try again.", 504)
                    if response.status_code in {401, 403}:
                        raise AssistantError("provider_authentication", "The AI provider could not authenticate. Ask an administrator to check provider configuration.")
                    if response.status_code == 429:
                        raise AssistantError("provider_rate_limited", "The AI provider is busy. Please try again later.", 429)
                    if response.status_code == 402:
                        raise AssistantError("provider_balance", "The AI provider account has insufficient balance. Ask an administrator to check billing.")
                    if response.status_code >= 500:
                        raise AssistantError("provider_unavailable", "The AI provider is temporarily unavailable. Please try again later.")
                    if response.status_code != 200:
                        raise AssistantError("provider_request_failed", "The AI provider could not process this request.", 502)
                    raw = bytearray()
                    for chunk in response.iter_bytes():
                        if time.monotonic() > deadline:
                            raise AssistantError("provider_timeout", "The AI provider timed out. Please try again.", 504)
                        if len(raw) + len(chunk) > MAX_RESPONSE_BYTES:
                            raise AssistantError("provider_invalid_response", "The AI provider response exceeded the supported limit.", 502)
                        raw.extend(chunk)
                    try:
                        data = json.loads(raw)
                    except (ValueError, UnicodeError, RecursionError):
                        raise AssistantError("provider_invalid_response", "The AI provider returned an unusable response.", 502) from None
                    result = parse_completion(data)
                    # The provider receives the credential only as an HTTP header.
                    # Do not forward it if a malformed/malicious provider echoes
                    # it in content or tool arguments, including JSON escapes.
                    for text in (result.text, *(call.arguments for call in result.tool_calls)):
                        try:
                            decoded = json.dumps(json.loads(text), ensure_ascii=False)
                        except (ValueError, TypeError, RecursionError):
                            decoded = text
                        if key in text or key in decoded:
                            raise AssistantError("provider_invalid_response", "The AI provider returned protected configuration material.", 502)
                    outcome = "ok"
                    return result
        except httpx.TimeoutException as exc:
            exception_category = type(exc).__name__
            outcome = "provider_timeout"
            raise AssistantError("provider_timeout", "The AI provider timed out. Please try again.", 504) from None
        except httpx.HTTPError as exc:
            exception_category = type(exc).__name__
            raise AssistantError("provider_unavailable", "The AI provider connection is temporarily unavailable.") from None
        except AssistantError as exc:
            exception_category = type(exc).__name__
            exc.provider_http_status = http_status
            outcome = exc.code
            raise
        finally:
            logger.info("assistant_provider", extra={"request_id": request_id, "provider_status": outcome, "provider_http_status": http_status,
                        "exception_category": exception_category, "failure_stage": "deepseek_connectivity",
                        "duration_ms": round((time.monotonic() - started) * 1000)})
