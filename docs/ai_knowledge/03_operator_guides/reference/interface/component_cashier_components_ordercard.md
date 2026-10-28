---
id: "operator_reference_interface_component_cashier_components_ordercard"
title: "Order Card — controls and fields"
module: "billing"
description: "Order Card — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["billing", "order", "card", "controls", "fields"]
roles: ["Cashier"]
related_docs: ["operator_modules_billing_cashier", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/cashier"]
source_references: ["frontend/src/component/Cashier/components/OrderCard.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Order Card — controls and fields

This reference records the controls and fields declared by `OrderCard`. Use [cashier](../../modules/billing/cashier.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Cashier/components/OrderCard.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Order # {order.order_number \|\| "—"}`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: View

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View |
| Location | OrderCard; JSX button; handler () =&gt; onViewDetails && onViewDetails(order) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View.  |
| Handler / destination | () =&gt; onViewDetails && onViewDetails(order) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Edit

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Edit |
| Location | OrderCard; JSX button; handler () =&gt; setShowEditModal(true) |
| Appears when | canEditOrder() && order.status !== "completed" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Edit.  |
| Handler / destination | () =&gt; setShowEditModal(true) |
| Local UI result | setShowEditModal |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Print

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Print |
| Location | OrderCard; JSX button; handler () =&gt; handlePrint(order) |
| Appears when | order.status !== "in_progress" && order.status !== "pending" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Print. Review the confirmation before accepting. |
| Handler / destination | () =&gt; handlePrint(order) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `handlePrint`.

Requests made by this handler or local helpers:

- `instance.patch(′/orders/orders/${order.id}/update_status/′, { status: "served",`

Dialog content: `"This order is not marked as served yet.\n\nMark as served and print bill?", )`.

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Discount

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Discount |
| Location | OrderCard; JSX button; handler () =&gt; setShowDiscountModal(true) |
| Appears when | !latestDiscountRequest AND order.status !== "completed" && Number(order.discount_percent) &lt;= 0 |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Discount.  |
| Handler / destination | () =&gt; setShowDiscountModal(true) |
| Local UI result | setShowDiscountModal |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Request Again

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Request Again |
| Location | OrderCard; JSX button; handler () =&gt; setShowDiscountModal(true) |
| Appears when | latestDiscountRequest?.status === "rejected" AND order.status !== "completed" && Number(order.discount_percent) &lt;= 0 |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Request Again.  |
| Handler / destination | () =&gt; setShowDiscountModal(true) |
| Local UI result | setShowDiscountModal |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | OrderCard; JSX button; handler () =&gt; setShowCancelConfirm(true) |
| Appears when | canCancelOrder() |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setShowCancelConfirm(true) |
| Local UI result | setShowCancelConfirm |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Mark Paid

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Mark Paid |
| Location | OrderCard; JSX button; handler () =&gt; handleMarkPaid(order) |
| Appears when | order.status !== "completed" && order.order_type !== "delivery" && order.status !== "pending" && order.status !== "in_progress" |
| Disabled when | !isPrinted |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Mark Paid.  |
| Handler / destination | () =&gt; handleMarkPaid(order) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `handleMarkPaid`.

Requests made by this handler or local helpers:

- `instance.patch( ′/orders/orders/${order.id}/update_status/′, { status: "completed", },`

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Reassign Assign

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reassign Assign |
| Location | OrderCard; JSX button; handler () =&gt; onAssignDelivery && onAssignDelivery(order) |
| Appears when | String(order.order_type \|\| order.order_type_display \|\| "") .toLowerCase() .includes("delivery") && order.status !== "completed" && order.status !== "cancelled" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reassign Assign.  |
| Handler / destination | () =&gt; onAssignDelivery && onAssignDelivery(order) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: Confirm Cash

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Confirm Cash |
| Location | OrderCard; JSX button; handler handleMarkDelivered |
| Appears when | order.order_type == "delivery" && order.status == "out_for_delivery" |
| Disabled when | !isPrinted |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Confirm Cash.  |
| Handler / destination | handleMarkDelivered |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `handleMarkDelivered`.

Requests made by this handler or local helpers:

- `instance.patch( ′/orders/orders/${order.id}/update_status/′, { status: "delivered", },`

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `window.confirm` | "This order is not marked as served yet.\n\nMark as served and print bill?" |
| `toast.success` | Order marked as served |
| `toast.error` | Failed to mark order as served |
| `toast.success` | Payment completed |
| `toast.error` | Failed to mark paid |
| `toast.error` | Only pending orders can be cancelled |
| `toast.success` | Order cancelled successfully |
| `toast.error` | Failed to cancel order |
| `toast.success` | Discount request submitted successfully |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.common.view` | View | مشاهده | کتل |
| `staff.table.edit` | Edit | ویرایش | سمول |
| `legacy.print_5b221e9c` | Print | چاپ | چاپ |
| `menu_item_sales.discount` | Discount | تخفیف | تخفیف |
| `legacy.request_again_5a9e942e` | Request Again | درخواست دوباره | بیا غوښتنه |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `legacy.mark_paid_522bb480` | Mark Paid | مارک پید | مارک پیډ |
| `legacy.reassign_55843fb0` | Reassign | تخصیص مجدد | بیا ټاکل |
| `legacy.assign_24449284` | Assign | تخصیص | ټاکنه |
| `legacy.confirm_cash_1b9603c3` | Confirm Cash | تأیید پول نقد | نغدی نغدی تایید کړه |

## Related interface references

- [component cashier components discountrequestmodal](component_cashier_components_discountrequestmodal.md)
- [component cashier components ordereditmodal](component_cashier_components_ordereditmodal.md)
- [component ordercancellationtoast](component_ordercancellationtoast.md)
