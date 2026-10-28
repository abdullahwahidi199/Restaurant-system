---
id: "operator_modules_menu_menu"
title: "Manage categories, menu items, recipes, and platters"
module: "menu"
description: "Create and edit menu categories, dishes, recipe ingredient quantities and platters; covers availability, ordering, exports and different read-only management views."
keywords: ["menu", "manage", "categories", "items", "recipes", "platters", "menu item", "dish", "recipe", "platter", "menu availability"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager", "Manager", "Kitchen_manager"]
related_docs: ["operator_reference_backend_menu_fields", "operator_modules_production_daily_production", "operator_modules_inventory_stock", "operator_troubleshooting_verification_register", "operator_reference_interface_component_admin_menumanagement_menuworkspace", "operator_reference_interface_component_admin_menumanagement_addcategorymodal", "operator_reference_interface_component_admin_menumanagement_editcategorymodal", "operator_reference_interface_component_admin_menumanagement_categorydeletemodal", "operator_reference_interface_component_admin_menumanagement_additemmodal", "operator_reference_interface_component_admin_menumanagement_individualitem", "operator_reference_interface_component_admin_menumanagement_recipeingredientrow", "operator_reference_interface_component_admin_menumanagement_platteraddmodal", "operator_reference_interface_component_admin_menumanagement_platterdetails", "operator_reference_backend_menu_validation", "operator_reference_backend_menu_access"]
frontend_routes: ["/admin/dashboard/menu", "/inventory-manager/menu", "/operations-manager/menu", "/manager/menu", "/kitchen/menu"]
source_references: ["frontend/src/component/Admin/MenuManagement/MenuWorkspace.jsx", "frontend/src/component/Admin/MenuManagement/AddCategoryModal.jsx", "frontend/src/component/Admin/MenuManagement/EditCategoryModal.jsx", "frontend/src/component/Admin/MenuManagement/CategoryDeleteModal.jsx", "frontend/src/component/Admin/MenuManagement/AddItemModal.jsx", "frontend/src/component/Admin/MenuManagement/IndividualItem.jsx", "frontend/src/component/Admin/MenuManagement/RecipeIngredientRow.jsx", "frontend/src/component/Admin/MenuManagement/PlatterAddModal.jsx", "frontend/src/component/Admin/MenuManagement/PlatterDetails.jsx", "backend/backend/menu/models.py", "backend/backend/menu/serializers.py", "backend/backend/menu/views.py", "backend/backend/inventory/utils.py", "backend/backend/menu/test_production_movements.py"]
status: "source_verified"
---

# Manage categories, menu items, recipes, and platters

## Pages and access

Admin/BranchAdmin **Restaurant → Menu** `/admin/dashboard/menu`; Inventory Manager `/inventory-manager/menu`; Operations Manager `/operations-manager/menu`. Manager `/manager/menu` uses `canManage={false}` to browse. Kitchen `/kitchen/menu` has separate read-oriented components. Standalone platter listing `/admin/dashboard/platters` also exists; menu workspace combines dishes/platters. Detail URLs use `/menu/item/:id` and `/menu/platter/:id` under the management prefix; kitchen item detail is `/kitchen/menu/items/:id` (plural).

Before creating a dish, prepare its branch category, station and ingredients. Branch menu data is independent; branch-null legacy entries may still be included by query helpers. Do not treat removed sharing-mode fields as a shared-menu feature.

## Workspace actions

The workspace offers category selection (**All categories / Complete menu** included), dish/platter search, station/availability/status filters, sorting, grid/list display, export mode and selection controls. These change the working view. Category edit icon opens category form; item name/detail link opens its detail page. Management controls are hidden/limited when `canManage=false`; a visible route still depends on endpoint permission.

Use the add-category/item/platter controls to open their modals. Drag handles on category/item ordering persist reorder requests; a failure can show **Failed to save menu order**. Reorder changes display ranks, not prices or stock. Row category dropdown changes the assigned category through its update handler. Row **Export row**, selected/all CSV export, and PDF export operate on the selected export mode/data; downloaded output does not change menu records. The exact bulk selection and header actions are in `MenuWorkspace` reference, including custom button wrappers.

## Category form and lifecycle

Create/edit fields include English name, Dari name, Pashto name, description and image/rank where rendered by each modal. English name is required by create UI; localized names are optional. Full length/type/default constraints are in [menu fields](../../reference/backend/menu_fields.md). Select an image file only where the form exposes upload; preview is local until submit. Create attaches the active branch/restaurant. Update changes labels/description/image/rank on the same category, affecting grouping and menu display.

**Cancel**/close discards unsaved values. Category **Delete** opens its confirmation; MenuItem.category uses CASCADE, so category deletion can delete its menu items and dependent records; the category view has no active-order protection. Platter.category uses SET_NULL. Optional rank has a separate frontend taken-rank check: **Rank {n} is already taken. Please choose another.** This is not a safe way to hide one dish: use the item’s visibility/availability setting. There is no category undo operation; inspect the exact warning before confirming.

## Create a menu item

| Field/control | Required/default | Type/validation and meaning |
|---|---|---|
| Item Name | Yes, empty | English text. Model maximum and uniqueness rules are in menu field reference. |
| Description | Optional, empty | Customer-facing text, separate from order preparation instructions. |
| Dari Name / Pashto Name | Optional | Text used by localized menu displays. |
| Dari Description / Pashto Description | Optional | Localized description. |
| Category | Required selection/context | The add modal is disabled without selected category. Prepare/select a category first. |
| Station | Optional selection | Routes preparation work; omitted station uses default kitchen representation where applicable. |
| Price | Required number | Decimal currency amount. Check the true price; UI numeric constraints are in AddItemModal reference. |
| Image / remove image icon | Optional file | File selection/preview; remove clears chosen image state. Stored via multipart handling. |
| Daily production / availability controls | Defaults depend on create/detail form | Production mode consumes prepared portions rather than raw ingredients per standalone order. Manual availability is separate from calculated stock availability. |
| Recipe ingredient | Optional row until configured; needed for stock-derived availability | Select branch ingredient, set **Quantity** per single portion. **Add Ingredient** adds a local row; × removes a row before submitting. |

Select category, open add item, fill name/price and desired station/recipe/localization, then **Add Item**. The footer is disabled while saving or without category. Backend menu creation and recipe endpoints are distinct operations in UI handlers; a multi-request failure can leave the menu item created without every recipe row. Refresh the actual item before retrying a create. Demo guards can show a restricted action message.

## Edit item and recipe differences

The item detail page preloads image, name/localizations, description/localizations, price, **Available** (manual switch), **Uses Daily Production**, station and recipe rows. **Update Item** sends item changes and recipe changes through their handlers. Existing ingredients can be changed/removed; new rows are added separately. Read-only fields such as calculated availability/cost and production remaining are not direct stock inputs.

An ingredient recipe links one menu item to an ingredient and quantity per portion; backend restricts restaurant/branch consistency. Effective availability requires manual availability and computed stock/production eligibility. A recipe-less ordinary item can become unavailable when availability is recalculated; adding stock cannot fix a missing recipe. Setting manual availability true does not override insufficient ingredients.

Edits affect future orders and availability. Existing order lines normally bill their price snapshot; changing today’s menu price does not rewrite that snapshot. Removing a recipe can affect future deductions, so inspect existing work before changing production/recipes midservice. `Delete` opens item confirmation; no restore UI is provided. Stock movements already recorded are not erased by a menu edit.

## Platters

**Add Platter** opens fields for name/localizations, description/localizations, price, category/station/image and included item rows. Every row chooses a menu item and positive fractional quantity (backend Decimal with three decimal places). Add/remove rows locally, then submit. Backend requires at least one included item and rejects quantity≤0 or malformed items JSON.

Detail shows included items, availability reasons, **View Item → / View Details**, and editable fields. **Add Item**, **Remove**, **Update Platter**, and **Delete Platter** have distinct effects: row removal edits composition; Delete Platter removes the platter after confirmation. Update replaces/synchronizes included rows as implemented by serializer; an item list is required even for updates. Unavailable reasons link to items needing recipe/stock/production attention.

An order platter multiplies ingredient requirements by included-item quantity×ordered platter quantity. The code intentionally skips standalone daily-production balances for daily-production items included inside platters; do not promise those included portions consume the standalone prepared balance. Regression tests cover that exception. See [daily production](../production/daily_production.md) and [stock](../inventory/stock.md).

Full per-modal labels, choices, disabled conditions, success/failure messages and multilingual resources are in the interface index. Unrouted/legacy forms are identified as such in [verification register](../../troubleshooting/verification_register.md).

## Detailed controls, fields, and server rules

- [Menu Workspace — controls and fields](../../reference/interface/component_admin_menumanagement_menuworkspace.md)
- [Add Category Modal — controls and fields](../../reference/interface/component_admin_menumanagement_addcategorymodal.md)
- [Edit Category Modal — controls and fields](../../reference/interface/component_admin_menumanagement_editcategorymodal.md)
- [Category Delete Modal — controls and fields](../../reference/interface/component_admin_menumanagement_categorydeletemodal.md)
- [Add Item Modal — controls and fields](../../reference/interface/component_admin_menumanagement_additemmodal.md)
- [Individual Item — controls and fields](../../reference/interface/component_admin_menumanagement_individualitem.md)
- [Recipe Ingredient Row — controls and fields](../../reference/interface/component_admin_menumanagement_recipeingredientrow.md)
- [Platter Add Modal — controls and fields](../../reference/interface/component_admin_menumanagement_platteraddmodal.md)
- [Platter Details — controls and fields](../../reference/interface/component_admin_menumanagement_platterdetails.md)
- [Menu — backend fields reference](../../reference/backend/menu_fields.md)
- [Menu — backend validation reference](../../reference/backend/menu_validation.md)
- [Menu — backend access reference](../../reference/backend/menu_access.md)
