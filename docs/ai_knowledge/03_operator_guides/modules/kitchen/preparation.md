---
id: "operator_modules_kitchen_preparation"
title: "Prepare station orders, mark items ready, and print tickets"
module: "kitchen"
description: "Use the kitchen order sidebar to start preparation, approve or mark lines ready, handle station-specific work and shortages, and print new or full kitchen tickets."
keywords: ["kitchen", "prepare", "station", "orders", "mark", "items", "ready", "print", "tickets", "Start Preparing", "Mark as Ready", "kitchen ticket", "station queue"]
roles: ["Kitchen_manager"]
related_docs: ["operator_reference_backend_orders_access", "operator_workflows_dine_in_to_payment", "operator_modules_production_daily_production", "operator_reference_interface_component_kitchen_homepage", "operator_reference_interface_component_kitchen_compactordercard", "operator_reference_interface_component_kitchen_orderdetailsidebar", "operator_reference_interface_component_kitchen_orderitem", "operator_reference_backend_orders_fields", "operator_reference_backend_orders_validation"]
frontend_routes: ["/kitchen", "/kitchen/ready-orders", "/kitchen/stock", "/kitchen/menu"]
source_references: ["frontend/src/component/kitchen/Homepage.jsx", "frontend/src/component/kitchen/CompactOrderCard.jsx", "frontend/src/component/kitchen/OrderDetailSidebar.jsx", "frontend/src/component/kitchen/OrderCard.jsx", "frontend/src/component/kitchen/OrderItem.jsx", "frontend/src/component/kitchen/KitchenBillPrintModal.jsx", "frontend/src/component/kitchen/orderStatusError.js", "backend/backend/orders/views.py:update_order_status", "backend/backend/orders/views.py:update_order_item_status", "backend/backend/orders/views.py:kitchen_orders", "backend/backend/orders/tests.py"]
status: "source_verified"
---

# Prepare station orders, mark items ready, and print tickets

## Open and understand the queue

Kitchen employee role value: `Kitchen_manager`. Open **Kitchen** `/kitchen`. Related pages are **Ready Orders** `/kitchen/ready-orders`, **Stock** `/kitchen/stock`, **Menu** `/kitchen/menu`, and **Daily Production** `/kitchen/daily-production` (underscore alias also exists). Active branch and restaurant are required.

The kitchen queue loads active orders and their routed items. The status tabs, order-type filters, and search narrow this queue. Open a compact order card/detail sidebar to read quantities, new-line indicators, preparation descriptions and station names. Assigned stations affect which items are returned and changed by whole-order kitchen status actions. No station assignment means all applicable kitchen work, as verified by regression tests. A missing explicit station can be represented by the active branch/shared default **Main Kitchen**.

## Prepare the work

1. Read item quantities and preparation notes before starting. Green/new markers identify added lines and adding staff; ready/cancelled items are not new unfinished work.
2. Open the compact order card and use **Start Preparing** near the bottom of its detail sidebar, or **Approve** beside a pending line. Whole-order start approves pending lines for the employee’s stations and sets the overall order `in_progress`. A pending line approval also recalculates the overall state.
3. First transition into `in_progress` triggers initial stock/production deduction. If stock or ready production is insufficient, the transaction rolls back both item and order changes. Read the Dari stock/production error panel, have the appropriate operator resolve the real shortage, refresh, and retry.
4. An approved line offers **Re-pending** and **Ready**. Re-pending returns that line to pending while the order remains nonfinal; it is not a stock refund. **Ready** marks the line prepared. A ready line has a completion indicator rather than an editable action.
5. **Mark as Ready** near the bottom of the sidebar (shown when no visible line is pending and some station work remains unfinished, unless read-only), marks pending/approved items in the current employee’s stations ready. The overall order remains `in_progress` if another station has unfinished active items. Only all required stations finishing makes the whole order `ready`.
6. Waiter takes dine-in food and uses **Mark Served**, or the cashier processes ready takeaway/delivery. The Ready Orders screen is a handoff view, not a payment screen.

## Print kitchen tickets

In the detail sidebar choose **Unprinted Items** or **Reprint Full Order**, then **Print Bill** to open `KitchenBillPrintModal`. Review order number, table, item quantities and notes. The “new” mode excludes cancelled/already-printed lines and marks printed flags; full reprint excludes cancelled lines without marking new flags. The printed-items endpoint marks selected lines `is_printed_to_kitchen`; this is separate from `Order.is_printed` used for cashier receipts. Do not mark payment based on a kitchen ticket. Physical printer acceptance and popup behavior need manual verification.

The separate `OrderCard` has **Start / Mark Ready / Print** labels but is unmounted; those labels must not replace the mounted sidebar instructions.

## Conditional controls and permissions

Pending lines: **Approve**. Approved: **Re-pending**, **Ready**. Ready/cancelled or read-only view: no mutation buttons. Update buttons are disabled while their request is pending. Cancelled items reject later changes with **Cancelled items cannot be changed**. Finalized order guards reject stale kitchen requests.

Kitchen list endpoints require Kitchen_manager or Admin/BranchAdmin. The item-status mutation endpoint itself only declares authenticated, active restaurant permission; whole-order update declares authentication and uses station scoping. This mismatch does not grant other portal workflows. See [orders access](../../reference/backend/orders_access.md).

Realtime updates are best effort. If another screen appears stale, refresh before repeating the action. Stock/production conflicts return actionable `insufficient_stock`/`insufficient_production` information; unrelated errors fall back to the kitchen’s generic Dari message. Some approved→pending transitions are available in the UI but no general Ready→Pending/reopen action exists. See [dine in to payment](../../workflows/dine_in_to_payment.md) and [daily production](../production/daily_production.md).

## Detailed controls, fields, and server rules

- [Homepage — controls and fields](../../reference/interface/component_kitchen_homepage.md)
- [Compact Order Card — controls and fields](../../reference/interface/component_kitchen_compactordercard.md)
- [Order Detail Sidebar — controls and fields](../../reference/interface/component_kitchen_orderdetailsidebar.md)
- [Order Item — controls and fields](../../reference/interface/component_kitchen_orderitem.md)
- [Orders — backend fields reference](../../reference/backend/orders_fields.md)
- [Orders — backend validation reference](../../reference/backend/orders_validation.md)
- [Orders — backend access reference](../../reference/backend/orders_access.md)
