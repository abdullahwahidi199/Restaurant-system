---
id: "operator_role_guides_administrators"
title: "Admin and BranchAdmin learning guide"
module: "roles"
description: "Learn the Admin and BranchAdmin operating sequence, permitted portal, handoffs and restrictions, with links to detailed procedures."
keywords: ["roles", "admin", "branchadmin", "learning", "guide", "role training", "new employee", "permissions"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_navigation_application_navigation", "operator_workflows_branch_setup", "operator_modules_employees_staff", "operator_modules_settings_restaurant_branch_settings", "operator_modules_audit_audit_activity", "operator_modules_payroll_payroll", "operator_navigation_page_directory", "operator_coverage_matrix", "operator_troubleshooting_errors_and_recovery"]
frontend_routes: []
source_references: ["frontend/src/App.jsx", "frontend/src/config/staffRoutes.js", "backend/backend/restaurants/permissions.py", "backend/backend/users/permissions.py"]
status: "source_verified"
---

# Admin and BranchAdmin learning guide

**Starting page:** `/admin/dashboard`. Sign in through staff login; use only assigned restaurant/branch context. A role name alone is not a complete permission grant.

## Learning sequence

1. Read exact navigation and branch scope. Admin can manage branches; BranchAdmin has one assigned branch and only Branch settings section.
2. Prepare tables/menu/recipes/stations/staff/stock/production before service. Learn order, reservation and discount exception rules.
3. Manage procurement/service/payroll obligations through their correct records. Admin/BranchAdmin approve payroll; FinanceManager cannot.
4. Use staff/account forms carefully: BranchAdmin cannot create/promote/delete other administrators, move staff cross-branch or change own role.
5. Review audit/production movements. Both may monitor activity; only Admin gets revoke authority by default. BranchAdmin needs explicit revoke permission and remains scoped.
6. Finalized order state is protected even for administrators; completed-order discount approval is a separate existing exception without refund support. No universal reopen/refund/database-repair procedure exists.

## Practice and next steps

Read these procedures in order:

- [application navigation](../navigation/application_navigation.md)
- [branch setup](../workflows/branch_setup.md)
- [staff](../modules/employees/staff.md)
- [restaurant branch settings](../modules/settings/restaurant_branch_settings.md)
- [audit activity](../modules/audit/audit_activity.md)
- [payroll](../modules/payroll/payroll.md)

Before a real create/cancel/payment, identify the record, current status and branch; understand whether the action is reversible. Use [page directory](../navigation/page_directory.md) for exact accessible routes and [coverage matrix](../coverage_matrix.md) for every source control/field. A hidden/disabled action should be explained from role, state, selection, stock or pending request—not bypassed with a direct API/URL. Use [errors and recovery](../troubleshooting/errors_and_recovery.md) for failures.
