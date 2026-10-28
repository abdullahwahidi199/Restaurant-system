---
id: "operator_reference_backend_audit_access"
title: "Audit — backend access reference"
module: "audit"
description: "Static audit implementation evidence for endpoint permissions and read/write role declarations; use linked operating guides for supported UI procedures."
keywords: ["audit", "backend", "access", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_audit_audit_activity"]
frontend_routes: []
source_references: ["backend/backend/audit/models.py", "backend/backend/audit/serializers.py", "backend/backend/audit/services.py", "backend/backend/audit/views.py"]
status: "source_verified"
---

# Audit — backend access reference

Static implementation reference for `audit`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/audit/views.py`

### AuditLogListView

`[         IsSuperAdmin \| IsRestaurantAdmin \| IsInventoryManager \| IsOperationsManager \| IsFinanceManager,         IsSameRestaurant,         IsRestaurantActive,     ]`

### ProductionMovementListView

`[         IsSuperAdmin \| IsRestaurantAdmin \| IsOperationsManager,         IsSameRestaurant,         IsRestaurantActive,     ]`

## Related operating procedures

- [Audit changes, inspect production movements, and manage staff sessions](../../modules/audit/audit_activity.md)
