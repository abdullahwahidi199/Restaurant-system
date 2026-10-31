"""Compatibility imports only. All persistence models belong to ai_assistant.

Queries must use the server-selected AgentStore; importing a model never scopes it.
"""
from ai_assistant.models import Conversation, Message, TurnAudit, AuditEvent  # noqa: F401
