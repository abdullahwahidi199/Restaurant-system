---
id: "operator_role_guides_manager"
title: "Manager learning guide"
module: "roles"
description: "Learn the Manager operating sequence, permitted portal, handoffs and restrictions, with links to detailed procedures."
keywords: ["roles", "manager", "learning", "guide", "role training", "new employee", "permissions"]
roles: ["Manager"]
related_docs: ["operator_modules_orders_order_lists", "operator_modules_orders_waiter_tables", "operator_modules_reservations_reservations", "operator_modules_discounts_requests", "operator_modules_audit_audit_activity", "operator_navigation_page_directory", "operator_coverage_matrix", "operator_troubleshooting_errors_and_recovery"]
frontend_routes: []
source_references: ["frontend/src/App.jsx", "frontend/src/config/staffRoutes.js", "backend/backend/restaurants/permissions.py", "backend/backend/users/permissions.py"]
status: "source_verified"
---

# Manager learning guide

**Starting page:** `/manager`. Sign in through staff login; use only assigned restaurant/branch context. A role name alone is not a complete permission grant.

## Learning sequence

1. Learn Orders, Reservations, Tables, read-only Menu and Discount Requests. Use active branch records.
2. Seat/create dine-in orders from Tables; inspect reservations and record permitted arrival/no-show/cancellation.
3. Correct only allowed pending items/order; whole-order cancellation is pending-only. Manager menu browsing is not menu administration.
4. Decide discount requests within configured manager limit. Larger percentages require Admin/BranchAdmin; rejected requests can be resubmitted by cashier.
5. Coordinate kitchen/cashier handoff; Manager has no cashier checkout route. User activity link requires explicit monitor permission beyond ordinary Manager role.

## Practice and next steps

Read these procedures in order:

- [order lists](../modules/orders/order_lists.md)
- [waiter tables](../modules/orders/waiter_tables.md)
- [reservations](../modules/reservations/reservations.md)
- [requests](../modules/discounts/requests.md)
- [audit activity](../modules/audit/audit_activity.md)

Before a real create/cancel/payment, identify the record, current status and branch; understand whether the action is reversible. Use [page directory](../navigation/page_directory.md) for exact accessible routes and [coverage matrix](../coverage_matrix.md) for every source control/field. A hidden/disabled action should be explained from role, state, selection, stock or pending request—not bypassed with a direct API/URL. Use [errors and recovery](../troubleshooting/errors_and_recovery.md) for failures.
