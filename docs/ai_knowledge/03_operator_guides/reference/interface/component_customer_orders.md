---
id: "operator_reference_interface_component_customer_orders"
title: "Orders — controls and fields"
module: "public_ordering"
description: "Orders — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["public_ordering", "orders", "controls", "fields"]
roles: ["Public/customer"]
related_docs: ["operator_modules_public_ordering_customer_handoff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/orders"]
source_references: ["frontend/src/component/Customer/Orders.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Orders — controls and fields

This reference records the controls and fields declared by `Orders`. Use [customer handoff](../../modules/public_ordering/customer_handoff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Customer/Orders.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Your Orders`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Rate

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Rate |
| Location | Orders; JSX button; handler () =&gt; setReviewOrderID(order.id) |
| Appears when | orders.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Rate.  |
| Handler / destination | () =&gt; setReviewOrderID(order.id) |
| Local UI result | setReviewOrderID |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Cancel order

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel order |
| Location | Orders; JSX button; handler () =&gt; handleCancelClick(order.id) |
| Appears when | canCancel(order) AND orders.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel order.  |
| Handler / destination | () =&gt; handleCancelClick(order.id) |
| Local UI result | setOrderToBeCanceled, setShowCancelToast |

Trace symbols: `handleCancelClick`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `alert` | Failed to cancel order |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `orders.labels.rate` | Rate | امتیاز دهید | امتیاز ورکړئ |
| `orders.labels.cancel_order` | Cancel order | لغو سفارش | فرمایش لغوه کړئ |

## Related interface references

- [component customer reviewpage](component_customer_reviewpage.md)
- [component ordercancellationtoast](component_ordercancellationtoast.md)
