---
id: "operator_modules_orders_order_lists"
title: "Browse order history, details, and cancellation"
module: "orders"
description: "Find orders by customer, period and status, inspect details, and cancel eligible orders with role and terminal-status restrictions."
keywords: ["orders", "browse", "order", "history", "details", "cancellation", "order history", "cancel order", "order status", "customer search"]
roles: ["Admin", "BranchAdmin", "Manager"]
related_docs: ["operator_reference_backend_orders_access", "operator_troubleshooting_verification_register", "operator_troubleshooting_errors_and_recovery", "operator_reference_interface_component_admin_order_orderbase", "operator_reference_interface_component_admin_order_orderstable", "operator_reference_interface_component_admin_order_orderdetailsmodal", "operator_reference_interface_component_manager_orders_managerordersbase", "operator_reference_interface_component_ordercancellationtoast", "operator_reference_backend_orders_fields", "operator_reference_backend_orders_validation"]
frontend_routes: ["/admin/dashboard/orders", "/manager"]
source_references: ["frontend/src/component/Admin/order/OrderBase.jsx", "frontend/src/component/Admin/order/OrdersTable.jsx", "frontend/src/component/Admin/order/OrderDetailsModal.jsx", "frontend/src/component/Admin/order/orderPeriod.js", "frontend/src/component/Manager/orders/ManagerOrdersBase.jsx", "frontend/src/component/Manager/orders/ManagerOrdersTable.jsx", "frontend/src/component/OrderCancellationToast.jsx", "backend/backend/orders/views.py:order_list_create", "backend/backend/orders/views.py:cancel_order", "backend/backend/orders/tests.py:OrderRealtimeRegressionTests"]
status: "source_verified"
---

# Browse order history, details, and cancellation

## Pages and access

Admin/BranchAdmin: **Operations → Orders**, `/admin/dashboard/orders`. Manager: **Orders**, `/manager`. An active restaurant is required; results are branch scoped. Administrators may have all-branch read scope when requested by a supported control. Read scope does not imply cross-branch editing.

The table shows order number, customer, type, table, total/status, creator/receiver and relevant times as defined by each portal’s table component. Open the row detail/eye action to inspect lines, notes, reservation payment information and totals. ManagerOrdersBase currently reuses the administrator OrdersTable and OrderDetailsModal; the separate ManagerOrdersTable component is unmounted. Neither list is the cashier settlement screen.

## Search, periods, and pagination

Select the period presets or custom dates, then narrow by status and customer search. The main backend order list applies the date range only when both `start_date` and `end_date` are present. Search matches name or phone. Page navigation loads the requested slice; resetting filters resets the page controls.

The order list summary is scoped to branch/period before search and status filtering, so a headline count can differ from visible filtered rows. This is implemented behavior, not evidence of missing orders. This guide does not define or interpret business metrics.

## Cancel an order

Where a row/detail exposes **Cancel**, open it, check the order number, and accept the cancellation confirmation. Success sets the order `cancelled` and the model releases its table. Cancelled order lines and historic records remain associated; this action is not a deletion or refund transaction. No reopen operation is supported for finalized orders.

Waiter and Manager cancellation is server-limited to `pending`: **Waiter cannot cancel this order now** or **Manager cannot cancel this order now** explains a progressed order. Admin/BranchAdmin cannot change any finalized status. The cashier card only exposes whole-order cancellation for pending takeaway/delivery, even though the backend cashier branch is broader. Delivery orders already preparing may therefore not have a cancel button in that UI.

Some order detail APIs are declared with `IsAuthenticated` only and rely on scoped querysets instead of the same role policy as the screen. This is documented as an access-control difference, not an alternative operator workflow. No operational Delete Order procedure is documented merely because a generic destroy API exists. See [orders access](../../reference/backend/orders_access.md) and [verification register](../../troubleshooting/verification_register.md).

If a request fails or no toast appears, refresh and confirm current status. Terminal conflicts cannot be resolved by retrying a stale edit. See [errors and recovery](../../troubleshooting/errors_and_recovery.md).

## Detailed controls, fields, and server rules

- [Order Base — controls and fields](../../reference/interface/component_admin_order_orderbase.md)
- [Orders Table — controls and fields](../../reference/interface/component_admin_order_orderstable.md)
- [Order Details Modal — controls and fields](../../reference/interface/component_admin_order_orderdetailsmodal.md)
- [Manager Orders Base — controls and fields](../../reference/interface/component_manager_orders_managerordersbase.md)
- [Order Cancellation Toast — controls and fields](../../reference/interface/component_ordercancellationtoast.md)
- [Orders — backend fields reference](../../reference/backend/orders_fields.md)
- [Orders — backend validation reference](../../reference/backend/orders_validation.md)
- [Orders — backend access reference](../../reference/backend/orders_access.md)
