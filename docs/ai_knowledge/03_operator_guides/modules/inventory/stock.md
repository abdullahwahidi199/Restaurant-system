---
id: "operator_modules_inventory_stock"
title: "Ingredients, stock levels, adjustments, and movement correction"
module: "inventory"
description: "Maintain ingredients and units, inspect stock and purchase history, record signed quantity adjustments, and correct eligible movements without assuming invoice reversal."
keywords: ["inventory", "ingredients", "stock", "levels", "adjustments", "movement", "correction", "ingredient", "stock level", "stock adjustment", "movement correction"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager", "Kitchen_manager"]
related_docs: ["operator_reference_backend_inventory_fields", "operator_modules_inventory_transfers", "operator_reference_interface_component_admin_inventory_inventorypages", "operator_reference_interface_component_admin_inventory_ingredientlist", "operator_reference_interface_component_admin_inventory_createingredient", "operator_reference_interface_component_admin_inventory_editingredientmodal", "operator_reference_interface_component_admin_inventory_adjuststockmodal", "operator_reference_interface_component_admin_inventory_stockmovementlist", "operator_reference_interface_component_admin_inventory_editstockmodal", "operator_reference_backend_inventory_validation", "operator_reference_backend_inventory_access"]
frontend_routes: ["/admin/dashboard/inventory", "/inventory-manager/inventory", "/operations-manager/inventory", "/kitchen/stock"]
source_references: ["frontend/src/component/Admin/Inventory/InventoryPages.jsx", "frontend/src/component/Admin/Inventory/IngredientList.jsx", "frontend/src/component/Admin/Inventory/CreateIngredient.jsx", "frontend/src/component/Admin/Inventory/EditIngredientModal.jsx", "frontend/src/component/Admin/Inventory/AdjustStockModal.jsx", "frontend/src/component/Admin/Inventory/StockMovementList.jsx", "frontend/src/component/Admin/Inventory/EditStockModal.jsx", "backend/backend/inventory/serializers.py:IngredientSerializer", "backend/backend/inventory/views.py:adjust_stock_view", "backend/backend/inventory/views.py:edit_stock_movement_view", "backend/backend/inventory/models.py"]
status: "source_verified"
---

# Ingredients, stock levels, adjustments, and movement correction

## Pages and access

Admin/BranchAdmin **Restaurant → Inventory**; Operations/Inventory Manager **Inventory**. Routes under each management prefix: `/inventory`, `/inventory/ingredients`, `/inventory/stock-levels`, `/inventory/stock-movements`, `/inventory/stock-adjustments`, `/inventory/low-stock`, `/inventory/reports`. Kitchen `/kitchen/stock` offers a read-oriented stock dashboard/list. FinanceManager has permissions for some stock APIs but no mounted Inventory page family.

Ingredients defines stock items; Stock Levels shows current quantity/threshold/cost; Stock Movements is the ledger; Stock Adjustments reuses ingredient rows and adds **View Adjustments** link; Low Stock Alerts offers **Create Purchase Invoice**; Reports has date bounds/output controls only (no analytics definitions here).

## Create versus edit ingredient

**New Ingredient** opens create. **Edit** on an ingredient opens edit. Both show **Ingredient Name**, **Unit** (kg/g/l/ml/pcs, default kg on create), and **Minimum Threshold** (blank→0). Name is required; server duplicate validation is case-insensitive per restaurant/branch: **An ingredient with this name already exists for this branch.** Exact model numeric/length constraints appear in [inventory fields](../../reference/backend/inventory_fields.md).

Create **Create** starts quantity and cost at0. Opening balance/cost are not exposed in this modal; receive purchased stock through invoices. Success closes and refreshes. **Update** changes the definition/threshold, not a purchase receipt. Editing unit relabels the ingredient; no universal automatic conversion of existing stock/recipes is implemented. Do not change units to correct quantity mistakes. **Cancel** closes without saving.

Ingredient **View** opens detail/purchase-history tabs; links to source invoice and movement are available. Some links hardcode the administrator prefix even in another portal; see verification register. **Delete** asks **Are you sure you want to delete this ingredient?** and removes the record if accepted by server. Deletion can affect dependent recipes and movements through model relationships; it has no restore UI. Prefer reviewing references before an authorized removal.

## Adjust stock after an actual count/correction

1. Select **Adjust** beside the ingredient on Ingredients/Stock Levels/Stock Adjustments.
2. Check displayed current available amount and unit.
3. Enter **Quantity (+ / -)** as a signed delta, not the target balance. Example of semantics: entering −2 subtracts two units from the current balance. Default blank; required; step0.01.
4. Choose **Adjustment Type** from the implemented dropdown (adjustment/waste options as rendered); default adjustment.
5. **Adjust Stock** submits; **Saving...** disables repeated submission. It updates current quantity, creates an attributed StockMovement, recalculates menu/platter availability and writes audit evidence. Success closes/refreshes.

Frontend attempts a below-zero check; serialized decimal types can affect its arithmetic. Server repeats the authoritative nonnegative-balance check. Zero is rejected as **All fields are required** by backend truthiness logic; enter a meaningful nonzero correction. **Insufficient stock. Available: ...** means the resulting balance would be negative. Missing/malformed decimal or missing record paths are not uniformly caught and may become technical failures.

A legitimate reverse correction is another authorized opposite delta after checking the ledger/current count. That is not deleting the original audit trail. Do not use corrections to manufacture stock to get an order through.

## Inspect or edit movement

Search ingredient, filter movement type/from/to dates, **Reset**, and use pagination. Row **Edit** is conditional: order movements are not editable. `EditStockModal` treats purchase movement type as fixed and allows quantity/total-price correction; nonpurchase movements use their own type/quantity controls. Quantities shown for small base units may be converted in that form; use the displayed unit.

**Save Changes** computes revised movement quantity/cost and server applies the difference to current stock. Negative resulting inventory or invalid quantity/cost rejects the update. It records changed movement/ingredient and recalculates availability. Direct movement correction does not synchronize every purchase invoice line/ledger/payment record, so invoice-backed movement editing can create a discrepancy; have the responsible manager review the invoice as well. The UI does not provide a general purchase invoice edit/void/refund flow.

Low stock is based on configured thresholds. **Create Purchase Invoice** opens Procurement under the current prefix; InventoryManager’s portal has no procurement routes, so that link is broken for that role. Contact a permitted purchasing operator. Cross-branch transfers are separate: [transfers](transfers.md).

## Detailed controls, fields, and server rules

- [Inventory Pages — controls and fields](../../reference/interface/component_admin_inventory_inventorypages.md)
- [Ingredient List — controls and fields](../../reference/interface/component_admin_inventory_ingredientlist.md)
- [Create Ingredient — controls and fields](../../reference/interface/component_admin_inventory_createingredient.md)
- [Edit Ingredient Modal — controls and fields](../../reference/interface/component_admin_inventory_editingredientmodal.md)
- [Adjust Stock Modal — controls and fields](../../reference/interface/component_admin_inventory_adjuststockmodal.md)
- [Stock Movement List — controls and fields](../../reference/interface/component_admin_inventory_stockmovementlist.md)
- [Edit Stock Modal — controls and fields](../../reference/interface/component_admin_inventory_editstockmodal.md)
- [Inventory — backend fields reference](../../reference/backend/inventory_fields.md)
- [Inventory — backend validation reference](../../reference/backend/inventory_validation.md)
- [Inventory — backend access reference](../../reference/backend/inventory_access.md)
