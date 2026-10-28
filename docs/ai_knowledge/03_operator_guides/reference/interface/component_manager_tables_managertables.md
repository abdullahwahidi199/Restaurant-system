---
id: "operator_reference_interface_component_manager_tables_managertables"
title: "Manager Tables — controls and fields"
module: "orders"
description: "Manager Tables declarations without a mounted App import path; retained for source explanation, not current operator instructions."
keywords: ["orders", "manager", "tables", "controls", "fields"]
roles: []
related_docs: ["operator_modules_orders_waiter_tables", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: []
source_references: ["frontend/src/component/Manager/tables/ManagerTables.jsx", "frontend/src/i18n.js"]
status: "needs_verification"
availability: "unmounted"
---

# Manager Tables — controls and fields

This reference records the controls and fields declared by `ManagerTables`. Use [waiter tables](../../modules/orders/waiter_tables.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Manager/tables/ManagerTables.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Waiter Dashboard`, `Table {table.name}`

## Mounting status: Needs Verification

No rendered App route was traced to this component. It may be unused/legacy or only reachable through a runtime reference not resolved by static imports. The declarations below are inventory evidence, not an implemented navigation procedure. Do not teach its controls as available until a mounted caller is verified.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {s.charAt(0).toUpperCase() + s.slice(1)}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {s.charAt(0).toUpperCase() + s.slice(1)} |
| Location | ManagerTables; JSX button; handler () =&gt; setFilter(s) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {s.charAt(0).toUpperCase() + s.slice(1)}.  |
| Handler / destination | () =&gt; setFilter(s) |
| Local UI result | setFilter |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | ManagerTables; JSX div; handler () =&gt; handleTableClick(table) |
| Appears when | sortedTables.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
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
| Location | ManagerTables; JSX button; handler (e) =&gt; { e.stopPropagation(); if (!canCancel) return; handleCancelClick(order); } |
| Appears when | order AND sortedTables.length === 0 [false branch] |
| Disabled when | !canCancel |
| Permission | Parent route role plus endpoint enforcement.  |
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

- [component manager tables managertableactionmodal](component_manager_tables_managertableactionmodal.md)
- [component ordercancellationtoast](component_ordercancellationtoast.md)
