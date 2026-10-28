---
id: "operator_reference_interface_modules_audit_productionmovementpage"
title: "Production Movement Page — controls and fields"
module: "audit"
description: "Production Movement Page — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["audit", "production", "movement", "page", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "OperationsManager"]
related_docs: ["operator_modules_audit_audit_activity", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/daily-production-movements", "/operations-manager/daily-production-movements"]
source_references: ["frontend/src/modules/audit/ProductionMovementPage.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Production Movement Page — controls and fields

This reference records the controls and fields declared by `ProductionMovementPage`. Use [audit activity](../../modules/audit/audit_activity.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/audit/ProductionMovementPage.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Daily production movements`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| PageHeader | Daily production movements | `See parent row data and linked procedure.` |
| dt | Change | `See parent row data and linked procedure.` |
| dt | Balance | `See parent row data and linked procedure.` |
| dt | Done by | `See parent row data and linked procedure.` |
| dt | Reference | `See parent row data and linked procedure.` |
| th | {heading} | `See parent row data and linked procedure.` |

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
| Location | ProductionMovementPage; JSX button; handler load |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Refresh.  |
| Handler / destination | load |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [audit activity](../../modules/audit/audit_activity.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search movements | input; search | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Movement type | select; filters.movement_type \|\| "" | Not declared; see submit validation | filters.movement_type \|\| "" | ; choices: All movement types [] | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Start date | date; filters.start_date \|\| "" | Not declared; see submit validation | filters.start_date \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: End date | date; filters.end_date \|\| "" | Not declared; see submit validation | filters.end_date \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Could not load production movements. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `production.refresh` | Refresh | missing; fallback applies | missing; fallback applies |
| `production.search_item_or_user` | Search item, user, or order... | missing; fallback applies | missing; fallback applies |
| `production.movement_type` | Movement type | missing; fallback applies | missing; fallback applies |
| `production.all_movement_types` | All movement types | missing; fallback applies | missing; fallback applies |
| `production.start_date` | Start date | missing; fallback applies | missing; fallback applies |
| `production.end_date` | End date | missing; fallback applies | missing; fallback applies |

## Related interface references

- [modules shared erp components pageheader](modules_shared_erp_components_pageheader.md)
- [modules shared erp components tablepagination](modules_shared_erp_components_tablepagination.md)
