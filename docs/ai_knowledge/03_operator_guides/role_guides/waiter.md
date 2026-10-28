---
id: "operator_role_guides_waiter"
title: "Waiter learning guide"
module: "roles"
description: "Learn the Waiter operating sequence, permitted portal, handoffs and restrictions, with links to detailed procedures."
keywords: ["roles", "waiter", "learning", "guide", "role training", "new employee", "permissions"]
roles: ["Waiter"]
related_docs: ["operator_modules_orders_waiter_tables", "operator_forms_order_entry", "operator_workflows_dine_in_to_payment", "operator_navigation_page_directory", "operator_coverage_matrix", "operator_troubleshooting_errors_and_recovery"]
frontend_routes: []
source_references: ["frontend/src/App.jsx", "frontend/src/config/staffRoutes.js", "backend/backend/restaurants/permissions.py", "backend/backend/users/permissions.py"]
status: "source_verified"
---

# Waiter learning guide

**Starting page:** `/waiter`. Sign in through staff login; use only assigned restaurant/branch context. A role name alone is not a complete permission grant.

## Learning sequence

1. Sign in and confirm branch. Learn available/occupied/unavailable tables and current/upcoming reservations.
2. Open available table → Start New Order; learn search, categories, quantities, line notes, customer form and submission.
3. Reopen occupied table to inspect current order. Edit only pending quantities; line cancellation sends immediately. Add Item triggers immediate stock deduction.
4. Watch kitchen readiness, deliver food, then Mark Served. Move tables only through Change Table when allowed.
5. Hand remaining balance/discount issues to cashier. A waiter has no cashier settlement portal. Whole-order cancellation is pending-only; finalized orders cannot reopen.

## Practice and next steps

Read these procedures in order:

- [waiter tables](../modules/orders/waiter_tables.md)
- [order entry](../forms/order_entry.md)
- [dine in to payment](../workflows/dine_in_to_payment.md)

Before a real create/cancel/payment, identify the record, current status and branch; understand whether the action is reversible. Use [page directory](../navigation/page_directory.md) for exact accessible routes and [coverage matrix](../coverage_matrix.md) for every source control/field. A hidden/disabled action should be explained from role, state, selection, stock or pending request—not bypassed with a direct API/URL. Use [errors and recovery](../troubleshooting/errors_and_recovery.md) for failures.
