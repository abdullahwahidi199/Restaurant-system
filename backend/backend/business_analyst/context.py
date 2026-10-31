"""Reuse the existing server-side staff resolver, never request/model scope claims."""
import time
from dataclasses import dataclass

from django.db import DatabaseError
from ai_assistant.errors import AssistantError
from ai_assistant.agents import BUSINESS_ANALYST
from ai_assistant.persistence import AgentStore
from knowledge.access import resolve_principal
from knowledge.errors import GatewayError

from .errors import OperationError

POLICY_VERSION = "business-analyst-stage0-1"

STORE = AgentStore(BUSINESS_ANALYST, ":" + POLICY_VERSION)


def principal_for(user):
    try:
        principal = resolve_principal(user)
    except GatewayError:
        raise AssistantError("PERMISSION_DENIED", OperationError.MESSAGES["PERMISSION_DENIED"], 403) from None
    except DatabaseError:
        raise AssistantError("authorization_unavailable", "Authorization is temporarily unavailable.") from None
    # The existing resolver's platform-superuser bypass has no tenant context.
    # Business operations always require an explicitly resolved restaurant/branch.
    if not principal.restaurant_id or not principal.branch_id:
        raise AssistantError("PERMISSION_DENIED", OperationError.MESSAGES["PERMISSION_DENIED"], 403)
    return principal


@dataclass(frozen=True)
class ToolContext:
    principal: object
    deadline: float

    def check_deadline(self):
        if time.monotonic() >= self.deadline:
            raise OperationError("TIMEOUT")

    def require_record_scope(self, record):
        """Handlers must also apply operation permissions and filter querysets.

        Scope defaults to the active branch, even for restaurant administrators.
        Do not use an AI argument as a substitute for either trusted ID.
        """
        if (str(getattr(record, "restaurant_id", "")) != self.principal.restaurant_id
                or str(getattr(record, "branch_id", "")) != self.principal.branch_id):
            raise OperationError("PERMISSION_DENIED")


def scope_for(user, principal):
    return STORE.scope(user, principal)
