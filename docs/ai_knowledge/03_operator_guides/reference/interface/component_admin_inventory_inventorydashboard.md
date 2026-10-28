---
id: "operator_reference_interface_component_admin_inventory_inventorydashboard"
title: "Inventory Dashboard — controls and fields"
module: "inventory"
description: "Inventory Dashboard — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["inventory", "dashboard", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_inventory_stock", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/inventory", "/admin/dashboard/inventory/ingredients", "/admin/dashboard/inventory/stock-levels", "/admin/dashboard/inventory/stock-movements", "/admin/dashboard/inventory/stock-adjustments", "/admin/dashboard/inventory/low-stock", "/admin/dashboard/inventory/reports", "/inventory-manager", "/inventory-manager/inventory", "/inventory-manager/inventory/ingredients", "/inventory-manager/inventory/stock-levels", "/inventory-manager/inventory/stock-movements", "/inventory-manager/inventory/stock-adjustments", "/inventory-manager/inventory/low-stock", "/inventory-manager/inventory/reports", "/operations-manager/inventory", "/operations-manager/inventory/ingredients", "/operations-manager/inventory/stock-levels", "/operations-manager/inventory/stock-movements", "/operations-manager/inventory/stock-adjustments", "/operations-manager/inventory/low-stock", "/operations-manager/inventory/reports"]
source_references: ["frontend/src/component/Admin/Inventory/InventoryDashboard.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Inventory Dashboard — controls and fields

This reference records the controls and fields declared by `InventoryDashboard`. Use [stock](../../modules/inventory/stock.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/Inventory/InventoryDashboard.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Inventory`, `{title}`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: New Ingredient

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | New Ingredient |
| Location | InventoryDashboard; JSX button; handler () =&gt; setShowCreate(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate New Ingredient.  |
| Handler / destination | () =&gt; setShowCreate(true) |
| Local UI result | setShowCreate |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Retry

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Retry |
| Location | InventoryDashboard; JSX button; handler loadSummary |
| Appears when | error |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Retry.  |
| Handler / destination | loadSummary |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | false |
| `setError` | true |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.ingredients.new_ingredient` | New Ingredient | ماده جدید | نوی جز |
| `inventory_manager.common.retry` | Retry | missing; fallback applies | missing; fallback applies |

## Related interface references

- [component admin inventory ingredientlist](component_admin_inventory_ingredientlist.md)
- [component admin inventory stockmovementlist](component_admin_inventory_stockmovementlist.md)
- [component admin inventory createingredient](component_admin_inventory_createingredient.md)
- [component admin inventory stocktransferpanel](component_admin_inventory_stocktransferpanel.md)
- [component admin inventory inventorysearch](component_admin_inventory_inventorysearch.md)
