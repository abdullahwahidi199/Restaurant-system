---
id: "operator_reference_interface_component_admin_inventory_stockmovementlist"
title: "Stock Movement List — controls and fields"
module: "inventory"
description: "Stock Movement List — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["inventory", "stock", "movement", "list", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_inventory_stock", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/inventory", "/admin/dashboard/inventory/ingredients", "/admin/dashboard/inventory/stock-levels", "/admin/dashboard/inventory/stock-movements", "/admin/dashboard/inventory/stock-adjustments", "/admin/dashboard/inventory/low-stock", "/admin/dashboard/inventory/reports", "/inventory-manager", "/inventory-manager/inventory", "/inventory-manager/inventory/ingredients", "/inventory-manager/inventory/stock-levels", "/inventory-manager/inventory/stock-movements", "/inventory-manager/inventory/stock-adjustments", "/inventory-manager/inventory/low-stock", "/inventory-manager/inventory/reports", "/operations-manager/inventory", "/operations-manager/inventory/ingredients", "/operations-manager/inventory/stock-levels", "/operations-manager/inventory/stock-movements", "/operations-manager/inventory/stock-adjustments", "/operations-manager/inventory/low-stock", "/operations-manager/inventory/reports"]
source_references: ["frontend/src/component/Admin/Inventory/StockMovementList.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Stock Movement List — controls and fields

This reference records the controls and fields declared by `StockMovementList`. Use [stock](../../modules/inventory/stock.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/Inventory/StockMovementList.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Stock Movements`, `{m.ingredient_name}`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Ingredient | `See parent row data and linked procedure.` |
| th | Type | `See parent row data and linked procedure.` |
| th | Details | `See parent row data and linked procedure.` |
| th | Date | `See parent row data and linked procedure.` |
| th | Created By | `See parent row data and linked procedure.` |
| th | Action | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Reset

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reset |
| Location | StockMovementList; JSX button; handler () =&gt; { setSearch(""); setType(""); setFromDate(""); setToDate(""); setPage(1); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reset.  |
| Handler / destination | () =&gt; { setSearch(""); setType(""); setFromDate(""); setToDate(""); setPage(1); } |
| Local UI result | setSearch, setType, setFromDate, setToDate, setPage |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Edit

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Edit |
| Location | StockMovementList; JSX button; handler () =&gt; setSelectedMovement(m) |
| Appears when | movements.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Edit.  |
| Handler / destination | () =&gt; setSelectedMovement(m) |
| Local UI result | setSelectedMovement |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Edit

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Edit |
| Location | StockMovementList; JSX button; handler () =&gt; setSelectedMovement(m) |
| Appears when | movements.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Edit.  |
| Handler / destination | () =&gt; setSelectedMovement(m) |
| Local UI result | setSelectedMovement |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search ingredient... | text; search | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: type | select; type | Not declared; see submit validation | typeParam | ; choices: All Types [], Purchase [purchase], Adjustment [adjustment], Waste [waste] | read-only=false; disabled=false |
| <a id="field-3"></a> F3: fromDate | date; fromDate | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: toDate | date; toDate | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Details | MobileMovementField; m.movement_type === "purchase" ? ( &lt;span&gt; {t("inventory_manager.common.qty", { defaultValue: "Qty" })}: {formatQuantity(m.change_quantity, m.ingredient_unit)} &lt;span className="mt-1 block text-green-70 … [see named source symbol] | Not declared; see submit validation | m.movement_type === "purchase" ? (                       &lt;span&gt;                         {t("inventory_manager.common.qty", { defaultValue: "Qty" })}: {formatQuantity(m.change_quantity, m.ingredient_unit)}                         &lt;span className="mt-1 block text-green-700"&gt;                           {t("inventory_manager.common.total", { defaultValue: "Total" })}{t("legacy.afn_fbd07c7e")} {calculateTotalPrice(m.change_quantity, m.unit_cost)}                         &lt;/span&gt;                         &lt;span className="mt-1 block text-xs text-gray-500"&gt;                           {t("inventory_manager.common.unit_cost", { defaultValue: "Unit Cost" })}({m.ingredient_unit}{t("legacy.afn_a1ffcca8")} {m.unit_cost}                         &lt;/span&gt;                       &lt;/span&gt;                     ) : (                       &lt;span                         className={                           parseFloat(m.change_quantity) &gt;= 0                             ? "text-green-600"                             : "text-red-600"                         }                       &gt;                         {parseFloat(m.change_quantity) &gt; 0 ? "+" : ""}                         {formatQuantity(m.change_quantity, m.ingredient_unit)}                       &lt;/span&gt;                     ) | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when movements.length === 0 [false branch] |
| <a id="field-6"></a> F6: Created By | MobileMovementField; m.createt_by_name \|\| t("inventory_manager.common.system", { defaultValue: "System" }) | Not declared; see submit validation | m.createt_by_name \|\| t("inventory_manager.common.system", { defaultValue: "System" }) | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when movements.length === 0 [false branch] |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.common.reset` | Reset | بازنشانی | بیا تنظیم |
| `inventory_manager.common.edit` | Edit | ویرایش | اېډېټ |
| `inventory_manager.stock_movements.search_placeholder` | Search ingredient... | جستجوی ماده... | جز ولټوئ... |
| `inventory_manager.stock_movements.all_types` | All Types | همه انواع | ټول ډولونه |
| `inventory_manager.types.purchase` | Purchase | خرید | پېرود |
| `inventory_manager.types.adjustment` | Adjustment | اصلاح | سمونه |
| `inventory_manager.types.waste` | Waste | ضایعات | ضایعات |
| `inventory_manager.common.details` | Details | جزئیات | تفصیل |
| `inventory_manager.common.qty` | Qty | مقدار | مقدار |
| `inventory_manager.common.total` | Total | مجموع | ټول |
| `legacy.afn_fbd07c7e` | : AFN | : AFN | : AFN |
| `inventory_manager.common.unit_cost` | Unit Cost | هزینه واحد | د واحد لګښت |
| `legacy.afn_a1ffcca8` | ): AFN | : AFN | : AFN |
| `inventory_manager.common.created_by` | Created By | ایجاد شده توسط | جوړ کړی |
| `inventory_manager.common.system` | System | سیستم | سیسټم |

## Related interface references

- [component admin inventory editstockmodal](component_admin_inventory_editstockmodal.md)
- [modules shared erp components tablepagination](modules_shared_erp_components_tablepagination.md)
