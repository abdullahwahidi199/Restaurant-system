---
id: "operator_reference_backend_audit_effects"
title: "Audit — backend effects reference"
module: "audit"
description: "Static audit implementation evidence for record mutations, named effect helpers and transaction boundaries; use linked operating guides for supported UI procedures."
keywords: ["audit", "backend", "effects", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_audit_audit_activity"]
frontend_routes: []
source_references: ["backend/backend/audit/models.py", "backend/backend/audit/serializers.py", "backend/backend/audit/services.py", "backend/backend/audit/views.py"]
status: "source_verified"
---

# Audit — backend effects reference

Static implementation reference for `audit`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/audit/models.py`

### AuditLog.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`

## `backend/backend/audit/services.py`

### create_audit_log

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `AuditLog.objects.create(**payload)`

Named effect helpers: `create_audit_log`.

### record_report_export

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `export_metadata.update(metadata)`

Named effect helpers: `record_report_export`, `create_audit_log`.

## Related operating procedures

- [Audit changes, inspect production movements, and manage staff sessions](../../modules/audit/audit_activity.md)
