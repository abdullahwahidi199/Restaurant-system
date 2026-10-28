---
id: "operator_reference_interface_component_admin_order_orderstable"
title: "Orders Table — controls and fields"
module: "orders"
description: "Orders Table — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["orders", "table", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "Manager"]
related_docs: ["operator_modules_orders_order_lists", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/orders", "/manager"]
source_references: ["frontend/src/component/Admin/order/OrdersTable.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Orders Table — controls and fields

This reference records the controls and fields declared by `OrdersTable`. Use [order lists](../../modules/orders/order_lists.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/order/OrdersTable.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| dt | Total | `See parent row data and linked procedure.` |
| dt | Table # | `See parent row data and linked procedure.` |
| dt | Created by | `See parent row data and linked procedure.` |
| dt | Date | `See parent row data and linked procedure.` |
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

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: View order

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View order |
| Location | OrdersTable; JSX button; handler () =&gt; onView(order) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View order.  |
| Handler / destination | () =&gt; onView(order) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [order lists](../../modules/orders/order_lists.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Cancel order

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel order |
| Location | OrdersTable; JSX button; handler () =&gt; onCancel(order) |
| Appears when | canCancelOrder(order, role) [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel order.  |
| Handler / destination | () =&gt; onCancel(order) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [order lists](../../modules/orders/order_lists.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Cannot cancel this order

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cannot cancel this order |
| Location | OrdersTable; JSX button; handler  |
| Appears when | canCancelOrder(order, role) [false branch] |
| Disabled when | true |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cannot cancel this order.  |
| Handler / destination |  |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [order lists](../../modules/orders/order_lists.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.view_order_0df27975` | View order | ترتیب مشاهده | د لیدو ترتیب |
| `orders.labels.cancel_order` | Cancel order | لغو سفارش | فرمایش لغوه کړئ |
| `legacy.cannot_cancel_this_order_26731abf` | Cannot cancel this order | نمی توان این سفارش را لغو کرد | دا فرمایش لغوه نشی کېدای. |
