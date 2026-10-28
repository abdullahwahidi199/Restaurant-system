---
id: "operator_reference_interface_component_admin_order_orderdetailsmodal"
title: "Order Details Modal — controls and fields"
module: "orders"
description: "Order Details Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["orders", "order", "details", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "Manager"]
related_docs: ["operator_modules_orders_order_lists", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/orders", "/manager"]
source_references: ["frontend/src/component/Admin/order/OrderDetailsModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Order Details Modal — controls and fields

This reference records the controls and fields declared by `OrderDetailsModal`. Use [order lists](../../modules/orders/order_lists.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/order/OrderDetailsModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Order # # {order.order_number}`, `Payment Summary`, `{title}`

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
| Location | OrderDetailsModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [order lists](../../modules/orders/order_lists.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.
