---
id: "operator_reference_interface_component_cashier_cashiermanagment"
title: "Cashier Managment — controls and fields"
module: "billing"
description: "Cashier Managment — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["billing", "cashier", "managment", "controls", "fields"]
roles: ["Cashier"]
related_docs: ["operator_modules_billing_cashier", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/cashier"]
source_references: ["frontend/src/component/Cashier/CashierManagment.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Cashier Managment — controls and fields

This reference records the controls and fields declared by `CashierManagment`. Use [cashier](../../modules/billing/cashier.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Cashier/CashierManagment.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Cashier — Orders`, `Orders Summary`, `By Status`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Reservation

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reservation |
| Location | CashierManagment; JSX button; handler () =&gt; navigate("/cashier/reservations/") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reservation.  |
| Handler / destination | () =&gt; navigate("/cashier/reservations/") |
| Local UI result | Navigation: "/cashier/reservations/") |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: + TakeAway

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | + TakeAway |
| Location | CashierManagment; JSX button; handler () =&gt; navigate("/cashier/takeaway/") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate + TakeAway.  |
| Handler / destination | () =&gt; navigate("/cashier/takeaway/") |
| Local UI result | Navigation: "/cashier/takeaway/") |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: + Delivery

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | + Delivery |
| Location | CashierManagment; JSX button; handler () =&gt; navigate("/cashier/delivery/") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate + Delivery.  |
| Handler / destination | () =&gt; navigate("/cashier/delivery/") |
| Local UI result | Navigation: "/cashier/delivery/") |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Refresh Orders

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Refresh Orders |
| Location | CashierManagment; JSX button; handler fetchOrders |
| Appears when | loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Refresh Orders.  |
| Handler / destination | fetchOrders |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Reset Filters

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reset Filters |
| Location | CashierManagment; JSX button; handler () =&gt; setFilters(defaultFilters) |
| Appears when | loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reset Filters.  |
| Handler / destination | () =&gt; setFilters(defaultFilters) |
| Local UI result | setFilters |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.error` | Failed to fetch orders |
| `toast.success` | `Assigned to ${deliveryPersonName}` |
| `toast.error` | Failed to assign delivery person |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.reservation_18d5c8fe` | Reservation | رزرو | ریزرویشن |
| `legacy.takeaway_4028c33f` | + TakeAway | + برداشت | + ټیک اوې |
| `legacy.delivery_c6816a33` | + Delivery | + تحویل | + تحویلی |
| `legacy.refresh_orders_ac7223ef` | Refresh Orders | سفارش های تازه سازی | د تازه کولو امرونه |
| `legacy.reset_filters_5be69856` | Reset Filters | فیلترهای بازنشانی | ریسیټ فلټرونه |

## Related interface references

- [component cashier components deliveryassignmentmodal](component_cashier_components_deliveryassignmentmodal.md)
- [component cashier components orderdetailsmodal](component_cashier_components_orderdetailsmodal.md)
- [component cashier components billprintmodal](component_cashier_components_billprintmodal.md)
- [component cashier components filterbar](component_cashier_components_filterbar.md)
- [component cashier components takeawayorderform](component_cashier_components_takeawayorderform.md)
