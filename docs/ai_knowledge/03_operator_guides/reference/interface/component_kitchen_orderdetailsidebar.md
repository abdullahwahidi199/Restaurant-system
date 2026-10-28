---
id: "operator_reference_interface_component_kitchen_orderdetailsidebar"
title: "Order Detail Sidebar — controls and fields"
module: "kitchen"
description: "Order Detail Sidebar — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["kitchen", "order", "detail", "sidebar", "controls", "fields"]
roles: ["Kitchen_manager"]
related_docs: ["operator_modules_kitchen_preparation", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/kitchen", "/kitchen/ready-orders"]
source_references: ["frontend/src/component/kitchen/OrderDetailSidebar.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Order Detail Sidebar — controls and fields

This reference records the controls and fields declared by `OrderDetailSidebar`. Use [preparation](../../modules/kitchen/preparation.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/kitchen/OrderDetailSidebar.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{getOrderTitle()}`, `Order Items`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Close order details

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close order details |
| Location | OrderDetailSidebar; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Kitchen_manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close order details.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [preparation](../../modules/kitchen/preparation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Start Preparing

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Start Preparing |
| Location | OrderDetailSidebar; JSX button; handler () =&gt; updateOrderStatus("in_progress") |
| Appears when | hasPendingItems && !allStationItemsReady && !readOnly |
| Disabled when | updating |
| Permission | Parent route role plus endpoint enforcement. Kitchen_manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Start Preparing.  |
| Handler / destination | () =&gt; updateOrderStatus("in_progress") |
| Local UI result | setUpdating, setStatusError |

Trace symbols: `updateOrderStatus`.

Requests made by this handler or local helpers:

- `instance.patch(′/orders/orders/${order.id}/update_status/′, { status: newStatus,`

Record/status result, downstream effects, failure recovery, and reversal: [preparation](../../modules/kitchen/preparation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Print Bill

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Print Bill |
| Location | OrderDetailSidebar; JSX button; handler () =&gt; setShowPrint(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Kitchen_manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Print Bill.  |
| Handler / destination | () =&gt; setShowPrint(true) |
| Local UI result | setShowPrint |

Record/status result, downstream effects, failure recovery, and reversal: [preparation](../../modules/kitchen/preparation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Mark as Ready

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Mark as Ready |
| Location | OrderDetailSidebar; JSX button; handler () =&gt; { updateOrderStatus("ready"); } |
| Appears when | !hasPendingItems && !allStationItemsReady && !readOnly |
| Disabled when | updating |
| Permission | Parent route role plus endpoint enforcement. Kitchen_manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Mark as Ready.  |
| Handler / destination | () =&gt; { updateOrderStatus("ready"); } |
| Local UI result | setUpdating, setStatusError |

Trace symbols: `updateOrderStatus`.

Requests made by this handler or local helpers:

- `instance.patch(′/orders/orders/${order.id}/update_status/′, { status: newStatus,`

Record/status result, downstream effects, failure recovery, and reversal: [preparation](../../modules/kitchen/preparation.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: printMode | select; printMode | Not declared; see submit validation | "new" | ; choices: Reprint Full Order [all] | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.close_order_details_43432bf9` | Close order details | جزئیات سفارش نهایی | د نږدې ترتیب تفصیلات |
| `legacy.start_preparing_b18be6d5` | Start Preparing | شروع به آماده سازی کنید | چمتووالی پیل کړئ |
| `legacy.print_bill_30706866` | Print Bill | لایحه چاپ | چاپ بیل |
| `legacy.mark_as_ready_21098bbc` | Mark as Ready | مارک به عنوان آماده | د چمتو په توګه نښه |
| `legacy.unprinted_items_b89d0277` | Unprinted Items | اقلام چاپ نشده | چاپ شوی توکی |
| `legacy.reprint_full_order_15703afc` | Reprint Full Order | چاپ کامل سفارش | بیا چاپ بشپړ امر |

## Related interface references

- [component kitchen orderitem](component_kitchen_orderitem.md)
