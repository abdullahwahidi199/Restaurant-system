---
id: "operator_reference_interface_component_waiter_tableactionmodal"
title: "Table Action Modal — controls and fields"
module: "orders"
description: "Table Action Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["orders", "table", "action", "modal", "controls", "fields"]
roles: ["Waiter"]
related_docs: ["operator_modules_orders_waiter_tables", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/waiter"]
source_references: ["frontend/src/component/waiter/TableActionModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Table Action Modal — controls and fields

This reference records the controls and fields declared by `TableActionModal`. Use [waiter tables](../../modules/orders/waiter_tables.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/waiter/TableActionModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Table {name} — {status}`, `👤 {current_order.name}`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | TableActionModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Start New Order

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Start New Order |
| Location | TableActionModal; JSX button; handler () =&gt; { navigate("/waiter/new-order/", { state: { table }, }); onClose(); } |
| Appears when | status === "available" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Start New Order.  |
| Handler / destination | () =&gt; { navigate("/waiter/new-order/", { state: { table }, }); onClose(); } |
| Local UI result | Navigation: "/waiter/new-order/", { state: { table }, }) |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Edit Order

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Edit Order |
| Location | TableActionModal; JSX button; handler () =&gt; setIsEditing(true) |
| Appears when | !isEditing AND current_order [true branch] AND status === "occupied" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Edit Order.  |
| Handler / destination | () =&gt; setIsEditing(true) |
| Local UI result | setIsEditing |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: -

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | - |
| Location | TableActionModal; JSX button; handler () =&gt; updateQty(item.id, item.quantity - 1) |
| Appears when | isEditing AND current_order.items.length &gt; 0 [true branch] AND current_order [true branch] AND status === "occupied" |
| Disabled when | !canChangeQuantity(item) |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate -.  |
| Handler / destination | () =&gt; updateQty(item.id, item.quantity - 1) |
| Local UI result | setItems |

Trace symbols: `updateQty`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: +

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | + |
| Location | TableActionModal; JSX button; handler () =&gt; updateQty(item.id, item.quantity + 1) |
| Appears when | isEditing AND current_order.items.length &gt; 0 [true branch] AND current_order [true branch] AND status === "occupied" |
| Disabled when | !canChangeQuantity(item) |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate +.  |
| Handler / destination | () =&gt; updateQty(item.id, item.quantity + 1) |
| Local UI result | setItems |

Trace symbols: `updateQty`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: ✕

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | ✕ |
| Location | TableActionModal; JSX button; handler () =&gt; cancelItem(item.id) |
| Appears when | isEditing AND current_order.items.length &gt; 0 [true branch] AND current_order [true branch] AND status === "occupied" |
| Disabled when | !canDeleteItem(item) |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate ✕.  |
| Handler / destination | () =&gt; cancelItem(item.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `cancelItem`.

Requests made by this handler or local helpers:

- `instance.patch(′/orders/order-items/${id}/cancel/′)`

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Save Changes

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Save Changes |
| Location | TableActionModal; JSX button; handler saveChanges |
| Appears when | isEditing AND current_order.items.length &gt; 0 [true branch] AND current_order [true branch] AND status === "occupied" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Save Changes.  |
| Handler / destination | saveChanges |
| Local UI result | setIsEditing |

Trace symbols: `saveChanges`.

Requests made by this handler or local helpers:

- `instance.patch( ′/orders/orders/${current_order.id}/bulk-update-items/′, { items: items.map((i) =&gt; ({ id: i.id, quantity: i.quantity,`

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Change Table

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Change Table |
| Location | TableActionModal; JSX button; handler () =&gt; setShowChangeTableModal(true) |
| Appears when | !table.current_reservation AND status === "occupied" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Change Table.  |
| Handler / destination | () =&gt; setShowChangeTableModal(true) |
| Local UI result | setShowChangeTableModal |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: Add Item

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add Item |
| Location | TableActionModal; JSX button; handler () =&gt; setAddNewItemDisplay(true) |
| Appears when | status === "occupied" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add Item.  |
| Handler / destination | () =&gt; setAddNewItemDisplay(true) |
| Local UI result | setAddNewItemDisplay |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: Mark Served

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Mark Served |
| Location | TableActionModal; JSX button; handler () =&gt; { handleMarkServed(); onClose(); } |
| Appears when | current_order && current_order.status === "ready" AND status === "occupied" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Mark Served.  |
| Handler / destination | () =&gt; { handleMarkServed(); onClose(); } |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `handleMarkServed`.

Requests made by this handler or local helpers:

- `instance.patch( ′/orders/orders/${current_order.id}/update_status/′, { status: "served", },`

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.start_new_order_262cef55` | Start New Order | نظم نو را آغاز کنید | نوې نظم پیل کړئ |
| `legacy.edit_order_13fcf49e` | Edit Order | ترتیب ویرایش | د سمون ترتیب |
| `save_changes` | Save Changes | ذخیره تغییرات | بدلونونه خوندي کړئ |
| `legacy.change_table_bb49e68f` | Change Table | میز تعویض | د چینج ټېبل |
| `add_item` | Add Item | افزودن آیتم | توکی اضافه کړئ |
| `legacy.mark_served_69286fd9` | Mark Served | مارک سرو | مارک سرو |

## Related interface references

- [component waiter orderaddmodal](component_waiter_orderaddmodal.md)
- [component waiter addnewitemmodal](component_waiter_addnewitemmodal.md)
- [component waiter changetablemodal](component_waiter_changetablemodal.md)
