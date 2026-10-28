---
id: "operator_role_guides_cashier"
title: "Cashier learning guide"
module: "roles"
description: "Learn the Cashier operating sequence, permitted portal, handoffs and restrictions, with links to detailed procedures."
keywords: ["roles", "cashier", "learning", "guide", "role training", "new employee", "permissions"]
roles: ["Cashier"]
related_docs: ["operator_modules_billing_cashier", "operator_modules_discounts_requests", "operator_modules_discounts_discount_cards", "operator_modules_reservations_reservations", "operator_workflows_takeaway_delivery", "operator_navigation_page_directory", "operator_coverage_matrix", "operator_troubleshooting_errors_and_recovery"]
frontend_routes: []
source_references: ["frontend/src/App.jsx", "frontend/src/config/staffRoutes.js", "backend/backend/restaurants/permissions.py", "backend/backend/users/permissions.py"]
status: "source_verified"
---

# Cashier learning guide

**Starting page:** `/cashier`. Sign in through staff login; use only assigned restaurant/branch context. A role name alone is not a complete permission grant.

## Learning sequence

1. Confirm branch; learn queue inclusion: ready/served dine-in, active takeaway, ready/out-for-delivery delivery.
2. Use + TakeAway / + Delivery / Reservation for entry; check actual customer/contact/distance/booking information.
3. Review pending line edits/cancellations and stock effects; do not expect a customer-header edit form.
4. Apply a valid discount card or request manual approval. Wait for correct amount before receipt/collection.
5. Print receipt; collect full remaining amount; Mark Paid for dine-in/takeaway. Delivery: assign eligible driver, print, then Confirm Cash after real cash handover.
6. Printing is not payment; Mark Paid has no partial amount field. Check linked reservation deposit and terminal status after every ambiguous failure.

## Practice and next steps

Read these procedures in order:

- [cashier](../modules/billing/cashier.md)
- [requests](../modules/discounts/requests.md)
- [discount cards](../modules/discounts/discount_cards.md)
- [reservations](../modules/reservations/reservations.md)
- [takeaway delivery](../workflows/takeaway_delivery.md)

Before a real create/cancel/payment, identify the record, current status and branch; understand whether the action is reversible. Use [page directory](../navigation/page_directory.md) for exact accessible routes and [coverage matrix](../coverage_matrix.md) for every source control/field. A hidden/disabled action should be explained from role, state, selection, stock or pending request—not bypassed with a direct API/URL. Use [errors and recovery](../troubleshooting/errors_and_recovery.md) for failures.
