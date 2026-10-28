---
id: "operator_workflows_branch_setup"
title: "Set up a branch before accepting orders"
module: "workflows"
description: "Prepare branch access, configuration, tables, menu routing, stock, production, delivery defaults and QR verification before service."
keywords: ["workflows", "branch", "before", "accepting", "orders", "new branch", "branch onboarding", "service preparation"]
roles: ["SuperAdmin", "Admin", "BranchAdmin"]
related_docs: ["operator_modules_administration_platform", "operator_modules_branches_branches", "operator_modules_settings_restaurant_branch_settings", "operator_workflows_restock_and_prepare"]
frontend_routes: []
source_references: ["backend/backend/restaurants/serializers.py:RestaurantSerializer.create", "backend/backend/restaurants/data_migration.py", "frontend/src/component/Admin/branches/BranchManagement.jsx", "frontend/src/component/Admin/settings/settingsConfig.js", "frontend/src/component/Admin/staff/StaffFormModal.jsx"]
status: "source_verified"
---

# Set up a branch before accepting orders

## Prepare the branch for service

1. Platform SuperAdmin establishes restaurant/main branch/admin account and valid subscription/branch allowance through platform UI. Restaurant Admin creates additional branch if required and permitted.
2. Admin activates branch and assigns staff. Confirm that each ordinary operator can select it; BranchAdmin is restricted to exactly one branch. Update active branch deliberately.
3. In Branch Management, select another source and confirmed configuration migration if reusing menu/recipes. Review imported/skipped results. Stock/purchases/orders/production do not copy. Modifiers migration is a placeholder.
4. Check destination tables/capacity/reservation rates, stations/menu routing, recipes/units/prices/manual availability, and kitchen staff station assignments. Migration inventory excludes table/order history; create required tables through supported setup.
5. Enter real purchase receipts for stock and actual production batches. Verify availability; zero stock after configuration migration is expected.
6. Admin configures restaurant defaults; Admin/BranchAdmin configures permitted branch delivery overrides. Verify origin/radius/minimum/fees before online delivery. Receipt/printer/tax/cash-drawer fields must not be assumed active integrations.
7. Copy/scan public QR and verify correct customer menu/branch selection. Perform the manual acceptance steps in the verification register with nonproduction data in a suitable environment before service.

No automated complete onboarding wizard or publish step is established. Existing setup forms save directly to their records; changing theme/language is not branch activation. See [platform](../modules/administration/platform.md), [branches](../modules/branches/branches.md), [restaurant branch settings](../modules/settings/restaurant_branch_settings.md), and [restock and prepare](restock_and_prepare.md).
