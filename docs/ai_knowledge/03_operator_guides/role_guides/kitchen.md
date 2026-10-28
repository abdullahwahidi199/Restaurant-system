---
id: "operator_role_guides_kitchen"
title: "Kitchen_manager learning guide"
module: "roles"
description: "Learn the Kitchen_manager operating sequence, permitted portal, handoffs and restrictions, with links to detailed procedures."
keywords: ["roles", "kitchen", "manager", "learning", "guide", "role training", "new employee", "permissions"]
roles: ["Kitchen_manager"]
related_docs: ["operator_modules_kitchen_preparation", "operator_modules_production_daily_production", "operator_workflows_restock_and_prepare", "operator_navigation_page_directory", "operator_coverage_matrix", "operator_troubleshooting_errors_and_recovery"]
frontend_routes: []
source_references: ["frontend/src/App.jsx", "frontend/src/config/staffRoutes.js", "backend/backend/restaurants/permissions.py", "backend/backend/users/permissions.py"]
status: "source_verified"
---

# Kitchen_manager learning guide

**Starting page:** `/kitchen`. Sign in through staff login; use only assigned restaurant/branch context. A role name alone is not a complete permission grant.

## Learning sequence

1. Confirm branch and assigned stations; unassigned kitchen accounts currently see all applicable work.
2. Read pending quantities and line descriptions; Start Preparing or Approve. Shortage blocks transition and rolls back status.
3. Finish your station items with Ready/Mark as Ready. Other unfinished stations keep whole order in progress.
4. Use Re-pending only from approved line when correction is needed; no stock refund is implied. Never reopen finalized orders.
5. Print kitchen ticket when needed; it is separate from cashier receipt. Use Ready Orders for handoff.
6. Inspect Stock/Menu; operate Daily Production only for actual prepared portions. Specialized Production Movements API is unavailable to this role.

## Practice and next steps

Read these procedures in order:

- [preparation](../modules/kitchen/preparation.md)
- [daily production](../modules/production/daily_production.md)
- [restock and prepare](../workflows/restock_and_prepare.md)

Before a real create/cancel/payment, identify the record, current status and branch; understand whether the action is reversible. Use [page directory](../navigation/page_directory.md) for exact accessible routes and [coverage matrix](../coverage_matrix.md) for every source control/field. A hidden/disabled action should be explained from role, state, selection, stock or pending request—not bypassed with a direct API/URL. Use [errors and recovery](../troubleshooting/errors_and_recovery.md) for failures.
