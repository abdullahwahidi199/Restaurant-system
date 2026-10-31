"""Stable server-selected identities; clients never choose an execution agent."""
import re

OPERATOR_MENTOR = "operator_mentor"
BUSINESS_ANALYST = "business_analyst"
AGENT_LABELS = {OPERATOR_MENTOR: "Operator Mentor", BUSINESS_ANALYST: "Business Analyst"}
AGENT_PATTERN = re.compile(r"[a-z][a-z0-9_]{0,63}\Z")


def validate_agent_type(value):
    # New agents supply another stable identifier, not another model/table set.
    if not isinstance(value, str) or not AGENT_PATTERN.fullmatch(value):
        raise ValueError("Invalid server agent identity.")
    return value
