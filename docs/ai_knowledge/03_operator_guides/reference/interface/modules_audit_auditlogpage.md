---
id: "operator_reference_interface_modules_audit_auditlogpage"
title: "Audit Log Page — controls and fields"
module: "audit"
description: "Audit Log Page — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["audit", "page", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager"]
related_docs: ["operator_modules_audit_audit_activity", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/audit-logs", "/finance-manager/audit-logs", "/operations-manager/audit-logs"]
source_references: ["frontend/src/modules/audit/AuditLogPage.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Audit Log Page — controls and fields

This reference records the controls and fields declared by `AuditLogPage`. Use [audit activity](../../modules/audit/audit_activity.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/audit/AuditLogPage.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Audit Logs`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| PageHeader | Audit Logs | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Previous

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Previous |
| Location | AuditLogPage; JSX button; handler () =&gt; setFilters((current) =&gt; ({ ...current, page: Math.max((current.page \|\| 1) - 1, 1) })) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | !filters.page \|\| filters.page &lt;= 1 |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Previous.  |
| Handler / destination | () =&gt; setFilters((current) =&gt; ({ ...current, page: Math.max((current.page \|\| 1) - 1, 1) })) |
| Local UI result | setFilters |

Record/status result, downstream effects, failure recovery, and reversal: [audit activity](../../modules/audit/audit_activity.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Next

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Next |
| Location | AuditLogPage; JSX button; handler () =&gt; setFilters((current) =&gt; ({ ...current, page: (current.page \|\| 1) + 1 })) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | (filters.page \|\| 1) * 20 &gt;= count |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Next.  |
| Handler / destination | () =&gt; setFilters((current) =&gt; ({ ...current, page: (current.page \|\| 1) + 1 })) |
| Local UI result | setFilters |

Record/status result, downstream effects, failure recovery, and reversal: [audit activity](../../modules/audit/audit_activity.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Failed to load audit logs. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `menu_item_sales.previous` | Previous | قبلی | مخکینی |
| `inventory_manager.common.next` | Next | بعدی | بل |

## Related interface references

- [modules shared erp components pageheader](modules_shared_erp_components_pageheader.md)
- [modules audit components auditlogfilters](modules_audit_components_auditlogfilters.md)
- [modules audit components auditlogtable](modules_audit_components_auditlogtable.md)
