---
id: "operator_reference_interface_component_manager_orders_managerorderstable"
title: "Manager Orders Table — controls and fields"
module: "orders"
description: "Manager Orders Table declarations without a mounted App import path; retained for source explanation, not current operator instructions."
keywords: ["orders", "manager", "table", "controls", "fields"]
roles: []
related_docs: ["operator_modules_orders_order_lists", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: []
source_references: ["frontend/src/component/Manager/orders/ManagerOrdersTable.jsx", "frontend/src/i18n.js"]
status: "needs_verification"
availability: "unmounted"
---

# Manager Orders Table — controls and fields

This reference records the controls and fields declared by `ManagerOrdersTable`. Use [order lists](../../modules/orders/order_lists.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Manager/orders/ManagerOrdersTable.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Order # | `See parent row data and linked procedure.` |
| th | Customer | `See parent row data and linked procedure.` |
| th | Total | `See parent row data and linked procedure.` |
| th | Table # | `See parent row data and linked procedure.` |
| th | Status | `See parent row data and linked procedure.` |
| th | Created by | `See parent row data and linked procedure.` |
| th | Recieved by | `See parent row data and linked procedure.` |
| th | Date | `See parent row data and linked procedure.` |
| th | Actions | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Mounting status: Needs Verification

No rendered App route was traced to this component. It may be unused/legacy or only reachable through a runtime reference not resolved by static imports. The declarations below are inventory evidence, not an implemented navigation procedure. Do not teach its controls as available until a mounted caller is verified.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: View order

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View order |
| Location | ManagerOrdersTable; JSX button; handler () =&gt; onView(order) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View order.  |
| Handler / destination | () =&gt; onView(order) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [order lists](../../modules/orders/order_lists.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | ManagerOrdersTable; JSX button; handler () =&gt; onCancel(order) |
| Appears when | canCancelOrder(order, role) [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; onCancel(order) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [order lists](../../modules/orders/order_lists.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Cannot cancel this order

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cannot cancel this order |
| Location | ManagerOrdersTable; JSX button; handler Native submit / parent callback |
| Appears when | canCancelOrder(order, role) [false branch] |
| Disabled when | true |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cannot cancel this order.  |
| Handler / destination | Native submit / parent callback |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [order lists](../../modules/orders/order_lists.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.view_order_0df27975` | View order | ترتیب مشاهده | د لیدو ترتیب |
| `legacy.cannot_cancel_this_order_26731abf` | Cannot cancel this order | نمی توان این سفارش را لغو کرد | دا فرمایش لغوه نشی کېدای. |
