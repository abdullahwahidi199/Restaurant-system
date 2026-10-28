---
id: "operator_reference_interface_component_kitchen_ordercard"
title: "Order Card — controls and fields"
module: "kitchen"
description: "Order Card declarations without a mounted App import path; retained for source explanation, not current operator instructions."
keywords: ["kitchen", "order", "card", "controls", "fields"]
roles: []
related_docs: ["operator_modules_kitchen_preparation", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: []
source_references: ["frontend/src/component/kitchen/OrderCard.jsx", "frontend/src/i18n.js"]
status: "needs_verification"
availability: "unmounted"
---

# Order Card — controls and fields

This reference records the controls and fields declared by `OrderCard`. Use [preparation](../../modules/kitchen/preparation.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/kitchen/OrderCard.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Table {order.tableName}`, `Take away`, `Delivery`

## Mounting status: Needs Verification

No rendered App route was traced to this component. It may be unused/legacy or only reachable through a runtime reference not resolved by static imports. The declarations below are inventory evidence, not an implemented navigation procedure. Do not teach its controls as available until a mounted caller is verified.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Start

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Start |
| Location | OrderCard; JSX button; handler () =&gt; updateOrderStatus("in_progress") |
| Appears when | hasPendingItems && !allStationItemsReady |
| Disabled when | updating |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Start.  |
| Handler / destination | () =&gt; updateOrderStatus("in_progress") |
| Local UI result | setUpdating |

Trace symbols: `updateOrderStatus`.

Requests made by this handler or local helpers:

- `instance.patch(′/orders/orders/${order.id}/update_status/′, { status: newStatus,`

Record/status result, downstream effects, failure recovery, and reversal: [preparation](../../modules/kitchen/preparation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Print

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Print |
| Location | OrderCard; JSX button; handler () =&gt; setShowPrint(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Print.  |
| Handler / destination | () =&gt; setShowPrint(true) |
| Local UI result | setShowPrint |

Record/status result, downstream effects, failure recovery, and reversal: [preparation](../../modules/kitchen/preparation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Mark Ready

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Mark Ready |
| Location | OrderCard; JSX button; handler () =&gt; { updateOrderStatus("ready"); setRunning(false); } |
| Appears when | !hasPendingItems && !allStationItemsReady |
| Disabled when | updating |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Mark Ready.  |
| Handler / destination | () =&gt; { updateOrderStatus("ready"); setRunning(false); } |
| Local UI result | setRunning, setUpdating |

Trace symbols: `updateOrderStatus`.

Requests made by this handler or local helpers:

- `instance.patch(′/orders/orders/${order.id}/update_status/′, { status: newStatus,`

Record/status result, downstream effects, failure recovery, and reversal: [preparation](../../modules/kitchen/preparation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.start_952f3754` | Start | شروع | پیل کړه |
| `legacy.print_5b221e9c` | Print | چاپ | چاپ |
| `legacy.mark_ready_c4329a4d` | Mark Ready | مارک ردی | مارک ریډی |

## Related interface references

- [component kitchen orderitem](component_kitchen_orderitem.md)
