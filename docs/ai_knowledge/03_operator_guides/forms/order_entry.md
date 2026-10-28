---
id: "operator_forms_order_entry"
title: "Create dine-in, takeaway, and staff delivery orders"
module: "orders"
description: "Open the correct waiter, manager, cashier or call-operator cart, choose items and customer details, and submit dine-in, takeaway or staff delivery orders."
keywords: ["orders", "create", "dine", "takeaway", "staff", "delivery", "order form", "required fields", "delivery distance", "cart quantity"]
roles: ["Waiter", "Manager", "Cashier", "Call_operator"]
related_docs: ["operator_modules_orders_waiter_tables", "operator_workflows_dine_in_to_payment", "operator_workflows_takeaway_delivery"]
frontend_routes: ["/waiter/new-order", "/manager/new-order", "/cashier/takeaway", "/cashier/delivery", "/call-operator"]
source_references: ["frontend/src/component/waiter/OrderAddModal.jsx", "frontend/src/component/Manager/tables/ManagerAddOrder.jsx", "frontend/src/component/Cashier/components/TakeAwayOrderForm.jsx", "frontend/src/component/Cashier/components/DeliveryOrderForm.jsx", "frontend/src/component/waiter/OrderCheckoutForm.jsx", "backend/backend/orders/seriailizers.py:OrderSerializer", "backend/backend/orders/views.py:order_list_create", "backend/backend/orders/models.py:Order.save"]
status: "source_verified"
---

# Create dine-in, takeaway, and staff delivery orders

## Open the correct entry page

- Waiter: **Tables → available table → Start New Order**, `/waiter/new-order`. The table is passed as navigation state; opening the URL without a selected table is not the supported flow.
- Manager: **Tables → available table → Start New Order**, `/manager/new-order`. Its route guard lacks a role list, but the page is a manager table workflow, not permission to use another portal.
- Cashier: **+ TakeAway**, `/cashier/takeaway`, or **+ Delivery**, `/cashier/delivery`.
- Call operator: `/call-operator` opens the delivery form directly.

The server order-create route requires an active staff restaurant despite its `AllowAny` declaration. Menu choices are constrained to the restaurant and current branch (including legacy branch-null entries where the scope helper permits them). Prepare tables, prices, recipes/production, and delivery settings first.

## Choose items before entering the customer

1. Use the menu search and category chips, including **All**. Items/platters display price and effective availability.
2. Select **Add** or plus. The cart increment code prevents exceeding the production remaining count and can show **Only {remaining} available**. Unavailable entries have an inactive Add control where rendered.
3. Open the cart using the cart icon/count. Use plus/minus, the quantity input, and the remove icon to correct lines. Enter **Item note** for preparation instructions; it is sent as the order-line description.
4. Enter customer details, inspect the cart total, and activate **Create Order • Afs …**. The button shows **Creating Order...** and is disabled while submitting.

## Field reference

| Visible field/control | Required in this screen | Type/default | Rules and downstream meaning |
|---|---|---|---|
| Menu search / category | No | Text / All | Filters displayed items; does not alter records. |
| Item quantity | Yes for each cart line | Number, starts at 1 | Cart handlers normalize quantities; use positive portions and respect remaining production. Backend `OrderItem.quantity` is a positive integer; fractional platter composition is a different feature. |
| Item note | No | Text, empty | Sent as line `description`; visible to kitchen. |
| Customer Name | Yes | Text, empty | Submit checks a nonblank name; backend name has max 100 characters. Does not necessarily create a customer account. |
| Phone Number (Optional) | No for dine-in/takeaway | Text, empty | Backend allows blank/null, max 15 characters. Keep a reservation’s phone/name consistent if linking a reservation. |
| Phone Number | Delivery control marks required | Text | Delivery uses a button handler rather than a native form submit; handler explicitly checks name and distance, so do not assume the HTML required attribute enforces every delivery field. Enter reachable phone details. |
| Address | Delivery control marks required | Text | Same browser-validation caveat; sent to delivery order and assignment message. |
| Distance (km) | Delivery only, yes | Number, empty | Staff supplies distance. Backend requires `distance_km`, checks branch delivery availability and radius, and computes delivery fee. It does not use this field to navigate a map. |
| Note (Optional) | No | Text, empty | Order-level note. Separate from each item’s kitchen description. |
| Table | Dine-in context | Automatically supplied | Must be same branch and not have another active order. No free table assignment from another portal is promised. |
| Order number / status / creator / delivery fee / total | Automatic | Read-only | Created pending; restaurant-wide sequential order number; creator is current staff. Price snapshots are stored per line. |

The older `OrderCheckoutForm` validates Latin letters/spaces for names and optional 7–15 digit phones. It is not imported by the mounted waiter order-entry page. Do not apply that stricter legacy rule to the current `OrderAddModal` cart workflow.

## Submission: frontend and backend

Empty carts show **Your cart is empty!**; missing name shows **Please fill in customer name**. Delivery additionally checks **Please enter delivery distance**. Successful create shows **Order placed successfully!** and follows the page’s navigation/reset handler. Inspect the returned queue/table to verify the order.

Backend validates each line has exactly one menu item or platter, restricts choices by restaurant/branch, snapshots effective prices, checks standalone production limits, and rejects table occupancy conflicts. Delivery also checks the item subtotal minimum, active delivery setting, radius and distance; its fee uses effective branch overrides or restaurant defaults. A configured minimum applies before the delivery fee. The generic order serializer does not duplicate every frontend cart/availability check.

Creating a dine-in order occupies its table. During the valid reservation time window, matching phone **or** case-insensitive customer name can attach the reservation and mark it arrived. A different name/phone can leave the deposit unlinked. Creation schedules notifications and realtime updates after commit. Ordinary initial stock deduction happens on first preparation, not at the initial create; added lines behave differently—see [waiter tables](../modules/orders/waiter_tables.md).

## Failure, correction, and next step

The UI generally shows **Failed to place order**; delivery also displays `non_field_errors[0]` when available. Server errors can name branch mismatch, occupied table, remaining production, delivery minimum, missing distance, delivery disabled, or excessive distance. Correct the actual prerequisite; do not turn availability off/on to override stock. Refresh first after an ambiguous timeout to avoid duplicate orders.

There is no “edit customer/order header” form for these existing orders in the cashier edit modal; it edits lines. Pending lines can be adjusted/cancelled, additional lines can be added, and permitted whole-order cancellation is state-dependent. Finalized orders cannot be reopened. Continue with [dine in to payment](../workflows/dine_in_to_payment.md) or [takeaway delivery](../workflows/takeaway_delivery.md).
