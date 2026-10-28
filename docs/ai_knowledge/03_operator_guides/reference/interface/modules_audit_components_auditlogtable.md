---
id: "operator_reference_interface_modules_audit_components_auditlogtable"
title: "Audit Log Table — controls and fields"
module: "audit"
description: "Audit Log Table — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["audit", "table", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager"]
related_docs: ["operator_modules_audit_audit_activity", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/audit-logs", "/finance-manager/audit-logs", "/operations-manager/audit-logs"]
source_references: ["frontend/src/modules/audit/components/AuditLogTable.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Audit Log Table — controls and fields

This reference records the controls and fields declared by `AuditLogTable`. Use [audit activity](../../modules/audit/audit_activity.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/audit/components/AuditLogTable.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| DataTable | Parent supplied | `[ { key: "time", header: "Time", render: (log) =&gt; formatDateTime(log.created_at) }, { key: "user", header: "User", render: (log) =&gt; log.user_name \|\| "System" }, { key: "module", header: "Module", render: (log) =&gt; log.module_display \|\| log.module }, { key: "action", header: "Action", render: (log) =&gt; &lt;AuditActionBadge action={log.action} /&gt; }, { key: "object", header: "Object", render: (log) =&gt; log.object_repr \|\| ′${log.object_type} #${log.object_id}′ }, { key: "description", header: "Description", render: (log) =&gt; log.description \|\| "-" }, { key: "branch", header: "Branch", render: (log) =&gt; log.branch_name \|\| "-" }, { key: "open", header: "", className: "px-4 py-3 text-right", render: (log) =&gt; ( &lt;button type="button" onClick={() =&gt; onOpen(log)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-950" title={View audit details} &gt; &lt;Eye className="h-4 w-4" /&gt; &lt;/button&gt; ), }, ]` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: View audit details

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View audit details |
| Location | AuditLogTable; JSX button; handler () =&gt; onOpen(log) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View audit details.  |
| Handler / destination | () =&gt; onOpen(log) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [audit activity](../../modules/audit/audit_activity.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.view_audit_details_0dee30c3` | View audit details | جزئیات حسابرسی را مشاهده کنید | د حساب ورکونې جزییات وګورئ |

## Related interface references

- [modules shared erp components datatable](modules_shared_erp_components_datatable.md)
