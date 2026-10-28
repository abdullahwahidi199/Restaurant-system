---
id: "operator_reference_interface_component_waiter_tablesdisplaymodal"
title: "Tables Display Modal — controls and fields"
module: "orders"
description: "Tables Display Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["orders", "tables", "display", "modal", "controls", "fields"]
roles: ["Waiter"]
related_docs: ["operator_modules_orders_waiter_tables", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/waiter"]
source_references: ["frontend/src/component/waiter/TablesDisplayModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Tables Display Modal — controls and fields

This reference records the controls and fields declared by `TablesDisplayModal`. Use [waiter tables](../../modules/orders/waiter_tables.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/waiter/TablesDisplayModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Waiter Dashboard`, `Table {table.name}`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {s.charAt(0).toUpperCase() + s.slice(1)}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {s.charAt(0).toUpperCase() + s.slice(1)} |
| Location | TablesDisplayModal; JSX button; handler () =&gt; setFilter(s) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {s.charAt(0).toUpperCase() + s.slice(1)}.  |
| Handler / destination | () =&gt; setFilter(s) |
| Local UI result | setFilter |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | TablesDisplayModal; JSX div; handler () =&gt; handleTableClick(table) |
| Appears when | sortedTables.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; handleTableClick(table) |
| Local UI result | setSelectedTable |

Trace symbols: `handleTableClick`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | TablesDisplayModal; JSX button; handler (e) =&gt; { e.stopPropagation(); if (!canCancel) return; handleCancelClick(order); } |
| Appears when | order AND sortedTables.length === 0 [false branch] |
| Disabled when | !canCancel |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); if (!canCancel) return; handleCancelClick(order); } |
| Local UI result | setOrderToCancel, setShowCancelToast |

Trace symbols: `handleCancelClick`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `alert` | "Waiters can only cancel pending orders." |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `staff.cancel` | Cancel | لغو | لغوه کول |

## Related interface references

- [component waiter tableactionmodal](component_waiter_tableactionmodal.md)
- [component ordercancellationtoast](component_ordercancellationtoast.md)
