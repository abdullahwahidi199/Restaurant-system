"""Runtime validation of the small JSON-schema subset used by our two tools."""
import re

from .errors import GatewayError


def validate(value, schema, location="arguments"):
    kind = schema["type"]
    valid_type = {"object": lambda v: isinstance(v, dict), "array": lambda v: isinstance(v, list), "string": lambda v: isinstance(v, str), "integer": lambda v: isinstance(v, int) and not isinstance(v, bool)}[kind]
    if not valid_type(value):
        raise GatewayError("invalid_arguments", f"{location} must be {kind}.")
    if kind == "object":
        properties = schema["properties"]
        if set(value) - set(properties) or any(key not in value for key in schema.get("required", [])):
            raise GatewayError("invalid_arguments", f"{location} has missing required or unsupported fields.")
        for name, item in value.items():
            validate(item, properties[name], f"{location}.{name}")
    elif kind in {"string", "array"}:
        lower, upper = ("minLength", "maxLength") if kind == "string" else ("minItems", "maxItems")
        if len(value) < schema.get(lower, 0) or len(value) > schema.get(upper, 10000):
            raise GatewayError("invalid_arguments", f"{location} exceeds its size bounds.")
        if kind == "array":
            for item in value:
                validate(item, schema["items"], location + "[]")
        elif "pattern" in schema and not re.fullmatch(schema["pattern"], value):
            raise GatewayError("invalid_arguments", f"{location} has an invalid identifier format.")
    elif value < schema.get("minimum", 0) or value > schema.get("maximum", 10000):
        raise GatewayError("invalid_arguments", f"{location} exceeds its numeric bounds.")
    if "enum" in schema and value not in schema["enum"]:
        raise GatewayError("invalid_arguments", f"{location} is not an accepted value.")
