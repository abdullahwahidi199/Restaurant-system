---
id: "operator_modules_production_daily_production"
title: "Cook, adjust, clear, and inspect daily production"
module: "production"
description: "Enter portions in the active production card, cook or reduce a batch, confirm clearing without refund, and review availability and production movement permissions."
keywords: ["production", "cook", "adjust", "clear", "inspect", "daily", "prepared portions", "Cook", "Reduce", "Clear production"]
roles: ["Admin", "BranchAdmin", "OperationsManager", "InventoryManager", "Kitchen_manager"]
related_docs: ["operator_modules_audit_audit_activity", "operator_workflows_restock_and_prepare", "operator_reference_backend_menu_validation", "operator_reference_interface_component_admin_dailyproduction_dailyproduction", "operator_reference_interface_component_admin_dailyproduction_productioncard", "operator_reference_backend_menu_fields", "operator_reference_backend_menu_access"]
frontend_routes: ["/admin/dashboard/daily_production", "/operations-manager/daily_production", "/inventory-manager/daily-production", "/kitchen/daily-production"]
source_references: ["frontend/src/component/Admin/DailyProduction/DailyProduction.jsx", "frontend/src/component/Admin/DailyProduction/ProductionCard.jsx", "frontend/src/component/Admin/DailyProduction/ProductionItemCard.jsx", "frontend/src/component/Admin/DailyProduction/CreateProductionModal.jsx", "backend/backend/menu/views.py:production_list_create", "backend/backend/menu/views.py:production_detail", "backend/backend/menu/production_utils.py", "backend/backend/menu/test_production_movements.py"]
status: "source_verified"
---

# Cook, adjust, clear, and inspect daily production

## Page and prerequisites

Admin/BranchAdmin **Operations → Daily Productions** `/admin/dashboard/daily_production`; Operations Manager `/operations-manager/daily_production`; Inventory Manager `/inventory-manager/daily-production`; Kitchen `/kitchen/daily-production` and underscore alias. Production APIs permit these roles with active restaurant/branch. Only menu items configured `uses_daily_production` belong in this workflow. Their recipes define ingredients consumed when cooking.

Page controls include **Download PDF**, **Refresh**, stock-state chips **All items / In stock / Needs production**, item search, error dismiss, retry and clear filters. The page displays each tracked item’s produced/remaining state. PDF download is disabled before initial load or while downloading, and exports current branch production through its report endpoint. Analytics/metric interpretation is outside scope.

## Production actions and effects

The mounted `DailyProduction` page uses `ProductionCard`: enter **Quantity** (default1, normalized to integer minimum1), then **+ Cook** or **− Reduce**; **Clear** is shown only for an existing batch. `ProductionItemCard` and its **Custom amount... / Apply / - Remove** controls are unmounted and are not an alternative workflow.

| Action | Steps / requirements | Result and reversibility |
|---|---|---|
| **+ Cook** / increment | Enter/select positive integer portions as supported by card; activate once | Creates batch if missing or increases produced and remaining. Deducts recipe ingredients for added portions; creates production stock movements and audit movement. Can fail for insufficient raw stock. |
| **− Reduce** / decrement | Existing batch; positive reduction | Decreases produced and remaining by the difference and refunds corresponding raw recipe ingredients, while preserving consumed-count constraints. It is a correction operation, not a statement that food was actually returned to raw stock. Use only for a legitimate recording correction. |
| **Clear** / clear production confirmation | Existing batch; select Clear, then review and confirm **Clear production** or **Cancel** | Mounted card calls onClear(false), so clearing discards remaining production without returning ingredients. The backend refund option is not exposed by this card or its confirmation. No automatic recreate/undo. |
| **Refresh** / **Try again** | Page loaded or failed | Reloads branch item production, not a new batch. |

The backend also supports replace/create and absolute quantity adjustment: replacing discards the prior remaining batch and deducts the whole new batch again; adjustment deducts/refunds only the difference. An older `CreateProductionModal` is not mounted in the current page. Do not instruct an employee to replace production through an absent modal.

Each menu item is protected from simultaneous clicks in the current page by busy/in-flight state. Errors display backend `error` or a defined page fallback. Stock shortage leaves the transactional production operation uncommitted; correct actual inventory through procurement or an authorized count correction, then refresh.

## Consumption and audit

Standalone production item orders consume prepared portions at kitchen preparation, not raw ingredients a second time. Added order lines consume immediately through their own batch-deduction service. Platter composition skips standalone production portions by design. A production shortage can therefore block kitchen start even when an order was accepted earlier; order acceptance did not reserve production indefinitely.

Menu availability and affected platters are refreshed after production changes. **Production Movements** `/admin/dashboard/daily-production-movements` or Operations Manager equivalent shows create/replace/increment/decrement/adjust/consume/restore/clear evidence. InventoryManager and Kitchen_manager can operate production but cannot access that specialized movement endpoint. This is an intentional difference in current declarations, not a missing button to bypass.

See [audit activity](../audit/audit_activity.md), [restock and prepare](../../workflows/restock_and_prepare.md), and [menu validation](../../reference/backend/menu_validation.md) for exact quantity/shortage failures.

## Detailed controls, fields, and server rules

- [Daily Production — controls and fields](../../reference/interface/component_admin_dailyproduction_dailyproduction.md)
- [Production Card — controls and fields](../../reference/interface/component_admin_dailyproduction_productioncard.md)
- [Menu — backend fields reference](../../reference/backend/menu_fields.md)
- [Menu — backend validation reference](../../reference/backend/menu_validation.md)
- [Menu — backend access reference](../../reference/backend/menu_access.md)
