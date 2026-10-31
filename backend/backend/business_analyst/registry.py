"""Explicit server-owned read-only handlers. Nothing is imported from AI strings."""
import copy
import json
import math
import re
from dataclasses import dataclass
from typing import Callable

from jsonschema import Draft202012Validator, SchemaError, ValidationError

from .errors import OperationError

TOOL_ID = re.compile(r"[a-z][a-z0-9_.]{0,95}\Z")
SCOPE_FIELDS = frozenset({"user", "user_id", "staff", "staff_id", "restaurant", "restaurant_id",
                          "branch", "branch_id", "role", "roles", "permissions", "scope", "authorization"})


def json_bytes(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":")).encode("utf-8")


def _safe_schema(schema, *, parameters=False):
    """Local JSON contracts only; no remote refs or open-ended scope containers."""
    Draft202012Validator.check_schema(schema)
    if not isinstance(schema, dict):
        raise ValueError("Contracts must be JSON schema objects.")
    if parameters and (schema.get("type") != "object" or schema.get("additionalProperties") is not False):
        raise ValueError("Parameters must be a closed object schema.")

    def parameter_contract(node):
        if not isinstance(node, dict) or node.get("type") not in {"object", "array", "string", "number", "integer", "boolean", "null"}:
            raise ValueError("Every parameter must have an explicit type.")
        if any(key in node for key in ("anyOf", "oneOf", "allOf", "not", "if", "then", "else", "patternProperties")):
            raise ValueError("Use simple explicit parameter contracts.")
        if node["type"] == "object":
            if node.get("additionalProperties") is not False or SCOPE_FIELDS.intersection(node.get("properties", {})):
                raise ValueError("Parameters cannot contain authorization scope.")
            for child in node.get("properties", {}).values():
                parameter_contract(child)
        if node["type"] == "array":
            if not isinstance(node.get("items"), dict):
                raise ValueError("Array parameters need a typed item contract.")
            parameter_contract(node["items"])
    if parameters:
        parameter_contract(schema)

    def visit(node):
        if isinstance(node, dict):
            if any(key in node for key in ("$ref", "$dynamicRef")):
                raise ValueError("External/reference schemas are not supported.")
            if parameters and node.get("type") == "object":
                if node.get("additionalProperties") is not False:
                    raise ValueError("Nested parameters must also be closed objects.")
                if SCOPE_FIELDS.intersection(node.get("properties", {})):
                    raise ValueError("Authorization context cannot be a model parameter.")
            for child in node.values():
                visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)
    visit(schema)
    json_bytes(schema)


def _defaults(value, schema):
    if isinstance(value, dict):
        for key, child in schema.get("properties", {}).items():
            if key not in value and "default" in child:
                value[key] = copy.deepcopy(child["default"])
            if key in value:
                _defaults(value[key], child)
    elif isinstance(value, list):
        for item in value:
            _defaults(item, schema.get("items", {}))


@dataclass(frozen=True)
class ToolDefinition:
    id: str
    description: str
    domain: str
    parameters: dict
    output: dict
    knowledge_ids: tuple[str, ...]
    authorize: Callable
    handler: Callable
    timeout_seconds: float = 5
    read_only: bool = True


class ToolRegistry:
    def __init__(self, documents):
        self.documents = documents
        self._tools = {}
        self._frozen = False

    def register(self, tool):
        if self._frozen:
            raise ValueError("The registry is frozen.")
        if (not isinstance(tool, ToolDefinition) or not isinstance(tool.id, str) or not TOOL_ID.fullmatch(tool.id)
                or tool.id in self._tools or not isinstance(tool.description, str) or not tool.description.strip()
                or not isinstance(tool.domain, str) or tool.domain not in self.documents.domain_ids or tool.read_only is not True
                or not callable(tool.authorize) or not callable(tool.handler)
                or not isinstance(tool.timeout_seconds, (float, int)) or isinstance(tool.timeout_seconds, bool)
                or not math.isfinite(tool.timeout_seconds) or not 0 < tool.timeout_seconds <= 10
                or not isinstance(tool.knowledge_ids, tuple) or not tool.knowledge_ids
                or any(not isinstance(identity, str) or identity not in self.documents.catalog for identity in tool.knowledge_ids)):
            raise ValueError("Invalid or duplicate read-only tool registration.")
        try:
            _safe_schema(tool.parameters, parameters=True)
            _safe_schema(tool.output)
            # Defaults must satisfy their contracts before a tool is registered.
            def check_defaults(schema):
                if isinstance(schema, dict):
                    if "default" in schema:
                        Draft202012Validator(schema).validate(schema["default"])
                    for child in schema.values():
                        check_defaults(child)
                elif isinstance(schema, list):
                    for child in schema:
                        check_defaults(child)
            check_defaults(tool.parameters)
        except (SchemaError, ValidationError, TypeError, ValueError, RecursionError):
            raise ValueError("Invalid tool contract.") from None
        self._tools[tool.id] = copy.deepcopy(tool)

    def freeze(self):
        self._frozen = True
        return self

    def get(self, identity):
        if not isinstance(identity, str) or identity not in self._tools:
            raise OperationError("TOOL_NOT_REGISTERED")
        return copy.deepcopy(self._tools[identity])

    def validate_parameters(self, tool, parameters):
        try:
            if not isinstance(parameters, dict):
                raise ValueError
            json_bytes(parameters)
            value = copy.deepcopy(parameters)
            _defaults(value, tool.parameters)
            Draft202012Validator(tool.parameters).validate(value)
            return value
        except (ValidationError, TypeError, ValueError, RecursionError):
            raise OperationError("INVALID_PARAMETERS") from None

    def validate_output(self, tool, output):
        try:
            json_bytes(output)
            Draft202012Validator(tool.output).validate(output)
        except (ValidationError, TypeError, ValueError, RecursionError):
            raise OperationError("INVALID_OUTPUT") from None

    def capabilities(self, domain):
        return [{"id": tool.id, "description": tool.description, "parameters": copy.deepcopy(tool.parameters),
                 "output": copy.deepcopy(tool.output), "knowledge_ids": list(tool.knowledge_ids)}
                for tool in self._tools.values() if tool.domain == domain]


def production_registry(documents):
    from .tools import register_tools
    registry = ToolRegistry(documents)
    register_tools(registry)
    return registry.freeze()
