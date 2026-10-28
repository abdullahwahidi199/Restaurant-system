---
id: "operator_reference_interface_modules_activity_activitydashboard"
title: "Activity Dashboard — controls and fields"
module: "audit"
description: "Activity Dashboard — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["audit", "activity", "dashboard", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "Manager"]
related_docs: ["operator_modules_audit_audit_activity", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/activity", "/manager/activity"]
source_references: ["frontend/src/modules/activity/ActivityDashboard.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Activity Dashboard — controls and fields

This reference records the controls and fields declared by `ActivityDashboard`. Use [audit activity](../../modules/audit/audit_activity.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/activity/ActivityDashboard.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`User activity`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| PageHeader | User activity | `tabs` |
| th | User | `See parent row data and linked procedure.` |
| th | Role / branch | `See parent row data and linked procedure.` |
| th | Device | `See parent row data and linked procedure.` |
| th | Session | `See parent row data and linked procedure.` |
| th | Started | `See parent row data and linked procedure.` |
| th | Last seen | `See parent row data and linked procedure.` |
| th | Status | `See parent row data and linked procedure.` |
| th | Actions | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Refresh

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Refresh |
| Location | ActivityDashboard; JSX button; handler () =&gt; load() |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Refresh.  |
| Handler / destination | () =&gt; load() |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [audit activity](../../modules/audit/audit_activity.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Revoke

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Revoke |
| Location | ActivityDashboard; JSX button; handler () =&gt; setConfirm({ mode: "one", session }) |
| Appears when | canRevoke && session.can_revoke AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Revoke.  |
| Handler / destination | () =&gt; setConfirm({ mode: "one", session }) |
| Local UI result | setConfirm |

Record/status result, downstream effects, failure recovery, and reversal: [audit activity](../../modules/audit/audit_activity.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Revoke all

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Revoke all |
| Location | ActivityDashboard; JSX button; handler () =&gt; setConfirm({ mode: "all", session }) |
| Appears when | session.concurrent_sessions &gt; 1 AND canRevoke && session.can_revoke AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Revoke all.  |
| Handler / destination | () =&gt; setConfirm({ mode: "all", session }) |
| Local UI result | setConfirm |

Record/status result, downstream effects, failure recovery, and reversal: [audit activity](../../modules/audit/audit_activity.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Previous

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Previous |
| Location | ActivityDashboard; JSX button; handler () =&gt; changeFilter("page", filters.page - 1) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | filters.page &lt;= 1 |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Previous.  |
| Handler / destination | () =&gt; changeFilter("page", filters.page - 1) |
| Local UI result | setFilters |

Trace symbols: `changeFilter`.

Record/status result, downstream effects, failure recovery, and reversal: [audit activity](../../modules/audit/audit_activity.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Next

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Next |
| Location | ActivityDashboard; JSX button; handler () =&gt; changeFilter("page", filters.page + 1) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | filters.page &gt;= (data.pages \|\| 1) |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Next.  |
| Handler / destination | () =&gt; changeFilter("page", filters.page + 1) |
| Local UI result | setFilters |

Trace symbols: `changeFilter`.

Record/status result, downstream effects, failure recovery, and reversal: [audit activity](../../modules/audit/audit_activity.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search name or username | input; filters.search | Not declared; see submit validation | filters.search | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: filters.role | select; filters.role | Not declared; see submit validation | filters.role | ; choices: All roles [] | read-only=false; disabled=false |
| <a id="field-3"></a> F3: filters.status | select; filters.status | Not declared; see submit validation | filters.status | ; choices: All statuses [] | read-only=false; disabled=false |
| <a id="field-4"></a> F4: filters.branch | select; filters.branch | Not declared; see submit validation | filters.branch | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | requestError.response?.data?.detail \|\| "Activity data could not be loaded." |
| `toast.success` | confirm.mode === "all" ? "All account sessions were revoked." : "Session revoked successfully." |
| `toast.error` | requestError.response?.data?.detail \|\| "The session could not be revoked." |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.


## Related interface references

- [modules shared erp components confirmmodal](modules_shared_erp_components_confirmmodal.md)
- [modules shared erp components pageheader](modules_shared_erp_components_pageheader.md)
