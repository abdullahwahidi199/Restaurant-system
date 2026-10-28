---
id: "operator_role_guides_specialists"
title: "Inventory, Operations, Finance, Call Operator, and SuperAdmin learning guide"
module: "roles"
description: "Learn the Inventory, Operations, Finance, Call Operator, and SuperAdmin operating sequence, permitted portal, handoffs and restrictions, with links to detailed procedures."
keywords: ["roles", "inventory", "operations", "finance", "call", "operator", "superadmin", "learning", "guide", "role training", "new employee", "permissions"]
roles: ["InventoryManager", "OperationsManager", "FinanceManager", "Call_operator", "SuperAdmin"]
related_docs: ["operator_modules_inventory_stock", "operator_modules_procurement_purchasing", "operator_modules_contractors_services", "operator_modules_payroll_payroll", "operator_modules_administration_platform", "operator_forms_order_entry", "operator_navigation_page_directory", "operator_coverage_matrix", "operator_troubleshooting_errors_and_recovery"]
frontend_routes: []
source_references: ["frontend/src/App.jsx", "frontend/src/config/staffRoutes.js", "backend/backend/restaurants/permissions.py", "backend/backend/users/permissions.py"]
status: "source_verified"
---

# Inventory, Operations, Finance, Call Operator, and SuperAdmin learning guide

**Starting page:** `Role-specific portals`. Sign in through staff login; use only assigned restaurant/branch context. A role name alone is not a complete permission grant.

## Learning sequence

| Role | Learn first | Important restriction |
|---|---|---|
| InventoryManager | Inventory, ingredient definitions/count correction, menu/stations, production, expenses | Table route/API mismatch; no procurement route despite some API grants; low-stock purchase link can fail. |
| OperationsManager | Shifts/attendance, menu/stations/tables, production/movements, inventory/procurement/expenses, audit | Does not gain Staff creation or payroll approval from operational role. |
| FinanceManager | Expenses, procurement payments, contractor obligations, payroll generation/profile/payment, audit | Payroll approval denied; no general Reports/Inventory route families. |
| Call_operator | Staff delivery entry and real contact/address/distance | No cashier finalization or mounted reservation page even where create/list API permits. |
| SuperAdmin | Restaurants/subscriptions/login security | Frontend SuperAdmin and backend superuser must both be considered; no restaurant assigned by default. Not a substitute for a branch employee session. |
| DeliveryBoy / employment-only roles | Actual assignment/handover instructions from responsible operator | No mapped standalone delivery/employee portal in current React route tree. |

## Practice and next steps

Read these procedures in order:

- [stock](../modules/inventory/stock.md)
- [purchasing](../modules/procurement/purchasing.md)
- [services](../modules/contractors/services.md)
- [payroll](../modules/payroll/payroll.md)
- [platform](../modules/administration/platform.md)
- [order entry](../forms/order_entry.md)

Before a real create/cancel/payment, identify the record, current status and branch; understand whether the action is reversible. Use [page directory](../navigation/page_directory.md) for exact accessible routes and [coverage matrix](../coverage_matrix.md) for every source control/field. A hidden/disabled action should be explained from role, state, selection, stock or pending request—not bypassed with a direct API/URL. Use [errors and recovery](../troubleshooting/errors_and_recovery.md) for failures.
