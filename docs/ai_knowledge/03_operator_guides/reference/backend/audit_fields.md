---
id: "operator_reference_backend_audit_fields"
title: "Audit — backend fields reference"
module: "audit"
description: "Static audit implementation evidence for model and serializer field types, defaults, choices and read-only constraints; use linked operating guides for supported UI procedures."
keywords: ["audit", "backend", "fields", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_audit_audit_activity"]
frontend_routes: []
source_references: ["backend/backend/audit/models.py", "backend/backend/audit/serializers.py", "backend/backend/audit/services.py", "backend/backend/audit/views.py"]
status: "source_verified"
---

# Audit — backend fields reference

Static implementation reference for `audit`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/audit/models.py`

### AuditLog

Serializer/model rules: `ordering = ["-created_at", "-id"]`; `indexes = [ models.Index(fields=["restaurant", "created_at"], name="audit_rest_created_idx"), models.Index(fields=["restaurant", "branch"], name="audit_rest_branch_idx"), models.Index(fields=["restaurant", "user"], name="audit_rest_user_idx"), models.Index(fields=["module", "action"], name="audit_module_action_idx"), models.Index(fields=["object_type", "object_id"], name="audit_object_idx"), models.Index(fields=["created_at"], name="audit_created_idx"), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `restaurant` | `models.ForeignKey( Restaurant, on_delete=models.CASCADE, related_name="audit_logs", )` |
| `branch` | `models.ForeignKey( Branch, on_delete=models.SET_NULL, related_name="audit_logs", null=True, blank=True, )` |
| `user` | `models.ForeignKey( settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="audit_logs", null=True, blank=True, )` |
| `action` | `models.CharField(max_length=30, choices=AuditAction.choices)` |
| `module` | `models.CharField(max_length=40, choices=AuditModule.choices)` |
| `object_type` | `models.CharField(max_length=120)` |
| `object_id` | `models.CharField(max_length=80)` |
| `object_repr` | `models.CharField(max_length=255, blank=True)` |
| `description` | `models.TextField(blank=True)` |
| `old_values` | `models.JSONField(default=dict, blank=True)` |
| `new_values` | `models.JSONField(default=dict, blank=True)` |
| `metadata` | `models.JSONField(default=dict, blank=True)` |
| `ip_address` | `models.GenericIPAddressField(null=True, blank=True)` |
| `user_agent` | `models.TextField(blank=True)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |

## `backend/backend/audit/serializers.py`

### AuditLogSerializer

Serializer/model rules: `model = AuditLog`; `fields = [ "id", "restaurant", "branch", "branch_name", "user", "user_name", "user_role", "action", "action_display", "module", "module_display", "object_type", "object_id", "object_repr", "description", "old_values", "new_values", "changes", "metadata", "ip_address", "user_agent", "created_at", ]`; `read_only_fields = fields`.

| Field | Actual type, defaults and constraints |
|---|---|
| `user_name` | `serializers.SerializerMethodField()` |
| `user_role` | `serializers.SerializerMethodField()` |
| `branch_name` | `serializers.ReadOnlyField(source="branch.name")` |
| `action_display` | `serializers.ReadOnlyField(source="get_action_display")` |
| `module_display` | `serializers.ReadOnlyField(source="get_module_display")` |
| `changes` | `serializers.SerializerMethodField()` |


A model default does not necessarily make a UI field optional. `blank=True` permits an empty model-form/serializer value; `null=True` permits database null; explicit serializer `required`, `read_only_fields`, validators, and create services can change the API requirement. Model fields without blank/null/default are ordinarily required by an automatic ModelSerializer field unless overridden. `SerializerMethodField`, `ReadOnlyField`, auto timestamps and explicitly read-only fields are calculated/server-owned. Dynamic querysets restrict choices to the current restaurant/branch. A model `clean()` method is not automatically a DRF validator.

## Related operating procedures

- [Audit changes, inspect production movements, and manage staff sessions](../../modules/audit/audit_activity.md)
