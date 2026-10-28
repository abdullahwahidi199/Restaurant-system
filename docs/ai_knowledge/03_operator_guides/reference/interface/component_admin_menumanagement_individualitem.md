---
id: "operator_reference_interface_component_admin_menumanagement_individualitem"
title: "Individual Item — controls and fields"
module: "menu"
description: "Individual Item — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["menu", "individual", "item", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_menu_menu", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/menu/item/:id", "/inventory-manager/menu/item/:id", "/operations-manager/menu/item/:id"]
source_references: ["frontend/src/component/Admin/MenuManagement/IndividualItem.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Individual Item — controls and fields

This reference records the controls and fields declared by `IndividualItem`. Use [menu](../../modules/menu/menu.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/MenuManagement/IndividualItem.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Edit Menu Item`, `Recipe Ingredients`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Delete

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Delete |
| Location | IndividualItem; JSX button; handler () =&gt; setShowDelete(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Delete.  |
| Handler / destination | () =&gt; setShowDelete(true) |
| Local UI result | setShowDelete |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | IndividualItem; JSX form; handler handleUpdate |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleUpdate |
| Local UI result | setShowRestriction, setLoading |

Trace symbols: `handleUpdate`, `saveIngredients`.

Requests made by this handler or local helpers:

- `instance.patch(′/menu/menu-items/${id}/′, formData, { headers: { "Content-Type": "multipart/form-data" },`
- `instance.patch(′/inventory/recipes/${ing.id}/′, { ingredient: ing.ingredient, quantity_required: ing.quantity_required,`
- `instance.post("/inventory/recipes/", { menu_item: item.id, ingredient: ing.ingredient, quantity_required: ing.quantity_required,`

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Default

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Default |
| Location | IndividualItem; JSX div; handler () =&gt; setItem({ ...item, station: st.id }) |
| Appears when | stations.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Default.  |
| Handler / destination | () =&gt; setItem({ ...item, station: st.id }) |
| Local UI result | setItem |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: ✕

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | ✕ |
| Location | IndividualItem; JSX button; handler () =&gt; removeIngredient(index) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate ✕.  |
| Handler / destination | () =&gt; removeIngredient(index) |
| Local UI result | setIngredients |

Trace symbols: `removeIngredient`.

Requests made by this handler or local helpers:

- `instance.delete(′/inventory/recipes/${ing.id}/′)`

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: + Add Ingredient

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | + Add Ingredient |
| Location | IndividualItem; JSX button; handler addIngredientRow |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate + Add Ingredient.  |
| Handler / destination | addIngredientRow |
| Local UI result | setIngredients |

Trace symbols: `addIngredientRow`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Updating... / Update Item (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Updating... / Update Item (conditional text) |
| Location | IndividualItem; JSX button; handler handleUpdate |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Updating... / Update Item (conditional text).  |
| Handler / destination | handleUpdate |
| Local UI result | setShowRestriction, setLoading |

Trace symbols: `handleUpdate`, `saveIngredients`.

Requests made by this handler or local helpers:

- `instance.patch(′/menu/menu-items/${id}/′, formData, { headers: { "Content-Type": "multipart/form-data" },`
- `instance.patch(′/inventory/recipes/${ing.id}/′, { ingredient: ing.ingredient, quantity_required: ing.quantity_required,`
- `instance.post("/inventory/recipes/", { menu_item: item.id, ingredient: ing.ingredient, quantity_required: ing.quantity_required,`

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Unlabelled control (see binding) | file; handleChange | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Name (English) | input; name | Not declared; see submit validation | item.name \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: نام (دری) | input; name_dari | Not declared; see submit validation | item.name_dari \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: نوم (پښتو) | input; name_pashto | Not declared; see submit validation | item.name_pashto \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Description (English) | textarea; description | Not declared; see submit validation | item.description \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-6"></a> F6: توضیحات (دری) | textarea; description_dari | Not declared; see submit validation | item.description_dari \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-7"></a> F7: توضیحات (پښتو) | textarea; description_pashto | Not declared; see submit validation | item.description_pashto \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-8"></a> F8: Price | number; price | Not declared; see submit validation | item.price \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Available | checkbox; is_manually_available | Not declared; see submit validation | item.is_manually_available | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-10"></a> F10: Uses Daily Production | checkbox; uses_daily_production | Not declared; see submit validation | item.uses_daily_production \|\| false | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-11"></a> F11: allIngredients                         .map((opt) =&gt; ({                           value: opt.id,                           label: `${opt.name} (${opt.unit})`,                         }))                         .find((o) =&gt; o.value === ing.ingredient) | Select; allIngredients .map((opt) =&gt; ({ value: opt.id, label: `${opt.name} (${opt.unit})`, })) .find((o) =&gt; o.value === ing.ingredient) | Not declared; see submit validation | allIngredients                         .map((opt) =&gt; ({                           value: opt.id,                           label: `${opt.name} (${opt.unit})`,                         }))                         .find((o) =&gt; o.value === ing.ingredient) | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-12"></a> F12: Qty | number; ing.quantity_required | Not declared; see submit validation | ing.quantity_required | step=0.001 | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `delete` | Delete | حذف | ړنګول |
| `legacy.add_ingredient_374ed1a3` | + Add Ingredient | + افزودن ماده | + مواد اضافه کړئ |
| `updating` | Updating... | در حال به‌روزرسانی... | تازه کېږي... |
| `update_item` | Update Item | به‌روزرسانی آیتم | توکی تازه کړئ |
| `attendance.table.name` | Name | نام | نوم |
| `description` | Description | توضیحات | تشریح |
| `menuDetails.price` | Price | قیمت | بیه |
| `inventory_manager.common.qty` | Qty | مقدار | مقدار |

## Related interface references

- [component admin menumanagement itemdeletemodal](component_admin_menumanagement_itemdeletemodal.md)
