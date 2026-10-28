---
id: "operator_reference_backend_audit_validation"
title: "Audit — backend validation reference"
module: "audit"
description: "Static audit implementation evidence for server validation triggers and rejection messages; use linked operating guides for supported UI procedures."
keywords: ["audit", "backend", "validation", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_audit_audit_activity"]
frontend_routes: []
source_references: ["backend/backend/audit/models.py", "backend/backend/audit/serializers.py", "backend/backend/audit/services.py", "backend/backend/audit/views.py"]
status: "source_verified"
---

# Audit — backend validation reference

Static implementation reference for `audit`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/audit/models.py`

### AuditLog.save

| Trigger / condition | Server result or message |
|---|---|
| `self.pk` | `ValueError("Audit logs are immutable.")` |

## Related operating procedures

- [Audit changes, inspect production movements, and manage staff sessions](../../modules/audit/audit_activity.md)
