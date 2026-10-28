---
id: "operator_reference_interface_modules_audit_components_auditlogfilters"
title: "Audit Log Filters — controls and fields"
module: "audit"
description: "Audit Log Filters — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["audit", "filters", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager"]
related_docs: ["operator_modules_audit_audit_activity", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/audit-logs", "/finance-manager/audit-logs", "/operations-manager/audit-logs"]
source_references: ["frontend/src/modules/audit/components/AuditLogFilters.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Audit Log Filters — controls and fields

This reference records the controls and fields declared by `AuditLogFilters`. Use [audit activity](../../modules/audit/audit_activity.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/audit/components/AuditLogFilters.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search audit logs... | input; filters.search \|\| "" | Not declared; see submit validation | filters.search \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: filters.module \|\| "" | select; filters.module \|\| "" | Not declared; see submit validation | filters.module \|\| "" | ; choices: All modules [] | read-only=false; disabled=false |
| <a id="field-3"></a> F3: filters.action \|\| "" | select; filters.action \|\| "" | Not declared; see submit validation | filters.action \|\| "" | ; choices: All actions [] | read-only=false; disabled=false |
| <a id="field-4"></a> F4: filters.start_date \|\| "" | date; filters.start_date \|\| "" | Not declared; see submit validation | filters.start_date \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: filters.end_date \|\| "" | date; filters.end_date \|\| "" | Not declared; see submit validation | filters.end_date \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.search_audit_logs_32507e59` | Search audit logs... | جستجوی لاگ های حسابرسی... | د تفتیش لاګونه لټون... |
| `legacy.all_modules_d52b5af0` | All modules | تمام ماژول ها | ټول ماډیولونه |
| `legacy.all_actions_7b34db9e` | All actions | تمام اقدامات | ټولې کړنې |
