---
id: "operator_reference_interface_component_admin_inventory_ingredientlist"
title: "Ingredient List — controls and fields"
module: "inventory"
description: "Ingredient List — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["inventory", "ingredient", "list", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_inventory_stock", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/inventory", "/admin/dashboard/inventory/ingredients", "/admin/dashboard/inventory/stock-levels", "/admin/dashboard/inventory/stock-movements", "/admin/dashboard/inventory/stock-adjustments", "/admin/dashboard/inventory/low-stock", "/admin/dashboard/inventory/reports", "/inventory-manager", "/inventory-manager/inventory", "/inventory-manager/inventory/ingredients", "/inventory-manager/inventory/stock-levels", "/inventory-manager/inventory/stock-movements", "/inventory-manager/inventory/stock-adjustments", "/inventory-manager/inventory/low-stock", "/inventory-manager/inventory/reports", "/operations-manager/inventory", "/operations-manager/inventory/ingredients", "/operations-manager/inventory/stock-levels", "/operations-manager/inventory/stock-movements", "/operations-manager/inventory/stock-adjustments", "/operations-manager/inventory/low-stock", "/operations-manager/inventory/reports"]
source_references: ["frontend/src/component/Admin/Inventory/IngredientList.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Ingredient List — controls and fields

This reference records the controls and fields declared by `IngredientList`. Use [stock](../../modules/inventory/stock.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/Inventory/IngredientList.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Current Stock`, `{ingredient.name}`, `{ingredient.name}`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Name | `See parent row data and linked procedure.` |
| th | Quantity | `See parent row data and linked procedure.` |
| th | Min Threshold | `See parent row data and linked procedure.` |
| th | Cost / Unit | `See parent row data and linked procedure.` |
| th | Used In | `See parent row data and linked procedure.` |
| th | Status | `See parent row data and linked procedure.` |
| th | Action | `See parent row data and linked procedure.` |
| th | Purchase Date | `See parent row data and linked procedure.` |
| th | Supplier | `See parent row data and linked procedure.` |
| th | Invoice | `See parent row data and linked procedure.` |
| th | Quantity | `See parent row data and linked procedure.` |
| th | Unit Cost | `See parent row data and linked procedure.` |
| th | Total Cost | `See parent row data and linked procedure.` |
| th | Links | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: View

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View |
| Location | IngredientList; JSX button; handler () =&gt; openIngredientDetail(ingredient) |
| Appears when | ingredients.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View.  |
| Handler / destination | () =&gt; openIngredientDetail(ingredient) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Adjust

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Adjust |
| Location | IngredientList; JSX button; handler () =&gt; setAdjustIngredient(ingredient) |
| Appears when | ingredients.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Adjust.  |
| Handler / destination | () =&gt; setAdjustIngredient(ingredient) |
| Local UI result | setAdjustIngredient |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Edit

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Edit |
| Location | IngredientList; JSX button; handler () =&gt; setEditIngredient(ingredient) |
| Appears when | ingredients.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Edit.  |
| Handler / destination | () =&gt; setEditIngredient(ingredient) |
| Local UI result | setEditIngredient |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Delete

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Delete |
| Location | IngredientList; JSX button; handler () =&gt; deleteIngredient(ingredient.id) |
| Appears when | ingredient.menu_items_count === 0 AND ingredients.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Delete. Review the confirmation before accepting. |
| Handler / destination | () =&gt; deleteIngredient(ingredient.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `deleteIngredient`.

Requests made by this handler or local helpers:

- `instance.delete(′/inventory/ingredients/${id}/′).then(() =&gt; { fetchIngredients(page, search)`

Dialog content: `Are you sure you want to delete this ingredient?, ) ) { return`.

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: View

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View |
| Location | IngredientList; JSX button; handler () =&gt; openIngredientDetail(ingredient) |
| Appears when | ingredients.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View.  |
| Handler / destination | () =&gt; openIngredientDetail(ingredient) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Adjust

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Adjust |
| Location | IngredientList; JSX button; handler () =&gt; setAdjustIngredient(ingredient) |
| Appears when | ingredients.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Adjust.  |
| Handler / destination | () =&gt; setAdjustIngredient(ingredient) |
| Local UI result | setAdjustIngredient |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Edit

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Edit |
| Location | IngredientList; JSX button; handler () =&gt; setEditIngredient(ingredient) |
| Appears when | ingredients.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Edit.  |
| Handler / destination | () =&gt; setEditIngredient(ingredient) |
| Local UI result | setEditIngredient |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Delete

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Delete |
| Location | IngredientList; JSX button; handler () =&gt; deleteIngredient(ingredient.id) |
| Appears when | ingredient.menu_items_count === 0 AND ingredients.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Delete. Review the confirmation before accepting. |
| Handler / destination | () =&gt; deleteIngredient(ingredient.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `deleteIngredient`.

Requests made by this handler or local helpers:

- `instance.delete(′/inventory/ingredients/${id}/′).then(() =&gt; { fetchIngredients(page, search)`

Dialog content: `Are you sure you want to delete this ingredient?, ) ) { return`.

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: Full Inventory Report

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Full Inventory Report |
| Location | IngredientList; JSX button; handler () =&gt; handleDownloadPDF("all") |
| Appears when | ingredients.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Full Inventory Report.  |
| Handler / destination | () =&gt; handleDownloadPDF("all") |
| Local UI result | setAttribute |

Trace symbols: `handleDownloadPDF`.

Requests made by this handler or local helpers:

- `instance.get("/inventory/inventory-pdf/", { params: { type }, responseType: "blob",`

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: Low Stock Report

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Low Stock Report |
| Location | IngredientList; JSX button; handler () =&gt; handleDownloadPDF("low_stock") |
| Appears when | ingredients.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Low Stock Report.  |
| Handler / destination | () =&gt; handleDownloadPDF("low_stock") |
| Local UI result | setAttribute |

Trace symbols: `handleDownloadPDF`.

Requests made by this handler or local helpers:

- `instance.get("/inventory/inventory-pdf/", { params: { type }, responseType: "blob",`

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-11"></a>

### Action 11: Out of Stock Report

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Out of Stock Report |
| Location | IngredientList; JSX button; handler () =&gt; handleDownloadPDF("out_of_stock") |
| Appears when | ingredients.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Out of Stock Report.  |
| Handler / destination | () =&gt; handleDownloadPDF("out_of_stock") |
| Local UI result | setAttribute |

Trace symbols: `handleDownloadPDF`.

Requests made by this handler or local helpers:

- `instance.get("/inventory/inventory-pdf/", { params: { type }, responseType: "blob",`

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-12"></a>

### Action 12: Close

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close |
| Location | IngredientList; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-13"></a>

### Action 13: {tab.label}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {tab.label} |
| Location | IngredientList; JSX button; handler () =&gt; onTabChange(tab.id) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {tab.label}.  |
| Handler / destination | () =&gt; onTabChange(tab.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-14"></a>

### Action 14: Invoice

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Invoice |
| Location | IngredientList; JSX Link; handler `/admin/dashboard/procurement/purchase-invoices/${row.purchase_invoice}` |
| Appears when | activeTab === "history" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Invoice.  |
| Handler / destination | `/admin/dashboard/procurement/purchase-invoices/${row.purchase_invoice}` |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-15"></a>

### Action 15: Movement

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Movement |
| Location | IngredientList; JSX Link; handler `/admin/dashboard/inventory/stock-movements?movement=${row.stock_movement}` |
| Appears when | row.stock_movement AND activeTab === "history" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Movement.  |
| Handler / destination | `/admin/dashboard/inventory/stock-movements?movement=${row.stock_movement}` |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-16"></a>

### Action 16: Invoice

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Invoice |
| Location | IngredientList; JSX Link; handler `/admin/dashboard/procurement/purchase-invoices/${row.purchase_invoice}` |
| Appears when | activeTab === "history" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Invoice.  |
| Handler / destination | `/admin/dashboard/procurement/purchase-invoices/${row.purchase_invoice}` |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-17"></a>

### Action 17: Movement

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Movement |
| Location | IngredientList; JSX Link; handler `/admin/dashboard/inventory/stock-movements?movement=${row.stock_movement}` |
| Appears when | row.stock_movement AND activeTab === "history" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Movement.  |
| Handler / destination | `/admin/dashboard/inventory/stock-movements?movement=${row.stock_movement}` |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search by name... | text; search | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Min Threshold | MobileStockField; ingredient.minimum_threshold | Not declared; see submit validation | ingredient.minimum_threshold | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when ingredients.length === 0 [false branch] |
| <a id="field-3"></a> F3: Cost / Unit | MobileStockField; ingredient.cost_per_unit \|\| "--" | Not declared; see submit validation | ingredient.cost_per_unit \|\| "--" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when ingredients.length === 0 [false branch] |
| <a id="field-4"></a> F4: Used In | MobileStockField; t("inventory_manager.ingredients.menu_item_count", { defaultValue: "{{count}} Menu Item", defaultValue_plural: "{{count}} Menu Items", count: ingredient.menu_items_count \|\| 0, }) | Not declared; see submit validation | t("inventory_manager.ingredients.menu_item_count", {                       defaultValue: "{{count}} Menu Item",                       defaultValue_plural: "{{count}} Menu Items",                       count: ingredient.menu_items_count \|\| 0,                     }) | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when ingredients.length === 0 [false branch] |
| <a id="field-5"></a> F5: Supplier | MobileStockField; row.supplier_name | Not declared; see submit validation | row.supplier_name | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when activeTab === "history" |
| <a id="field-6"></a> F6: Quantity | MobileStockField; `${Number(row.quantity \|\| 0).toLocaleString()} ${ingredient.unit}` | Not declared; see submit validation | `${Number(row.quantity \|\| 0).toLocaleString()} ${ingredient.unit}` | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when activeTab === "history" |
| <a id="field-7"></a> F7: Unit Cost | MobileStockField; currency.format(row.unit_cost \|\| 0) | Not declared; see submit validation | currency.format(row.unit_cost \|\| 0) | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when activeTab === "history" |
| <a id="field-8"></a> F8: Total Cost | MobileStockField; currency.format(row.total_cost \|\| 0) | Not declared; see submit validation | currency.format(row.total_cost \|\| 0) | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when activeTab === "history" |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `window.confirm` | Are you sure you want to delete this ingredient? |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.common.view` | View | مشاهده | کتل |
| `inventory_manager.common.adjust` | Adjust | اصلاح | سمول |
| `inventory_manager.common.edit` | Edit | ویرایش | اېډېټ |
| `inventory_manager.common.delete` | Delete | حذف | ړنګول |
| `inventory_manager.ingredients.full_inventory_report` | Full Inventory Report | گزارش کامل انبار | د انبار بشپړ راپور |
| `inventory_manager.ingredients.low_stock_report` | Low Stock Report | گزارش موجودی کم | د کمې موجودۍ راپور |
| `inventory_manager.ingredients.out_of_stock_report` | Out of Stock Report | گزارش موجودی تمام‌شده | د ختمې موجودۍ راپور |
| `inventory_manager.common.close` | Close | بستن | بندول |
| `inventory_manager.common.invoice` | Invoice | فاکتور | انوایس |
| `inventory_manager.common.movement` | Movement | حرکت | حرکت |
| `inventory_manager.ingredients.search_placeholder` | Search by name... | جستجو بر اساس نام... | د نوم له مخې لټون... |
| `inventory_manager.ingredients.min_threshold` | Min Threshold | حداقل موجودی | حداقل موجودي |
| `inventory_manager.common.cost_per_unit` | Cost / Unit | هزینه / واحد | لګښت / واحد |
| `inventory_manager.common.used_in` | Used In | استفاده در | کارول شوی په |
| `inventory_manager.ingredients.menu_item_count` | {{count}} Menu Item | {{count}} آیتم منو | {{count}} د مېنو توکی |
| `inventory_manager.common.supplier` | Supplier | تامین‌کننده | عرضه کوونکی |
| `inventory_manager.common.quantity` | Quantity | مقدار | مقدار |
| `inventory_manager.common.unit_cost` | Unit Cost | هزینه واحد | د واحد لګښت |
| `inventory_manager.common.total_cost` | Total Cost | هزینه مجموعی | ټول لګښت |

## Related interface references

- [component admin inventory adjuststockmodal](component_admin_inventory_adjuststockmodal.md)
- [component admin inventory editingredientmodal](component_admin_inventory_editingredientmodal.md)
- [modules shared erp components tablepagination](modules_shared_erp_components_tablepagination.md)
