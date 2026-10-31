"""Immutable per-turn provider choices; never mutate settings or shared providers."""
from dataclasses import dataclass

from django.conf import settings
from .errors import AssistantError

MODELS = (("deepseek-flash", "DeepSeek Flash"), ("deepseek-v4-pro", "DeepSeek V4 Pro"))
EFFORTS = (("none", "Off"), ("low", "Low"), ("high", "High"), ("max", "Max"))


@dataclass(frozen=True)
class ModelConfiguration:
    model: str
    reasoning_effort: str = "none"

    @property
    def thinking(self):
        return self.reasoning_effort != "none"

    def public(self):
        return {"model": self.model, "reasoning_effort": self.reasoning_effort,
                "thinking": {"type": "enabled" if self.thinking else "disabled"}}

    @classmethod
    def resolve(cls, model=None, reasoning_effort=None):
        default_model = getattr(settings, "DEEPSEEK_MODEL", "deepseek-flash")
        # Preserve the application's historical explicit thinking=disabled default.
        default_effort = getattr(settings, "DEEPSEEK_REASONING_EFFORT", "none")
        selected = cls(default_model if model is None else model, default_effort if reasoning_effort is None else reasoning_effort)
        valid_model = lambda value: isinstance(value, str) and value in dict(MODELS)
        valid_effort = lambda value: isinstance(value, str) and value in dict(EFFORTS)
        if not valid_model(selected.model) or not valid_effort(selected.reasoning_effort):
            explicit_invalid = (model is not None and not valid_model(model)) or (reasoning_effort is not None and not valid_effort(reasoning_effort))
            raise AssistantError("invalid_model_configuration" if explicit_invalid else "configuration_invalid",
                                 "Choose a supported assistant model and thinking effort." if explicit_invalid else "The assistant model defaults are not configured correctly.",
                                 400 if explicit_invalid else 503)
        return selected


def model_options():
    defaults = ModelConfiguration.resolve()
    return {"models": [{"value": value, "label": label} for value, label in MODELS],
            "reasoning_efforts": [{"value": value, "label": label} for value, label in EFFORTS],
            "defaults": {"model": defaults.model, "reasoning_effort": defaults.reasoning_effort}}


def public_configuration_snapshot(value):
    """Whitelisted display fields, including historical/retired model names."""
    if not isinstance(value, dict):
        return None
    result = {key: value[key] for key in ("model", "reasoning_effort", "requested_model", "requested_reasoning_effort")
              if key in value and (value[key] is None or isinstance(value[key], str) and len(value[key]) <= 100)}
    thinking = value.get("thinking")
    if isinstance(thinking, dict) and thinking.get("type") in ("enabled", "disabled"):
        result["thinking"] = {"type": thinking["type"]}
    return result or None
