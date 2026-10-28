---
id: "operator_reference_interface_component_admin_menumanagement_additemmodal"
title: "Add Item Modal — controls and fields"
module: "menu"
description: "Add Item Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["menu", "item", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "Kitchen_manager", "Manager", "OperationsManager"]
related_docs: ["operator_modules_menu_menu", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/menu", "/manager/menu", "/inventory-manager/menu", "/operations-manager/menu", "/kitchen/menu"]
source_references: ["frontend/src/component/Admin/MenuManagement/AddItemModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Add Item Modal — controls and fields

This reference records the controls and fields declared by `AddItemModal`. Use [menu](../../modules/menu/menu.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/MenuManagement/AddItemModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{title}`, `Add New Item`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | AddItemModal; JSX div; handler (event) =&gt; { if (event.target === event.currentTarget) onClose(); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | (event) =&gt; { if (event.target === event.currentTarget) onClose(); } |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Close add item modal

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close add item modal |
| Location | AddItemModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close add item modal.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | AddItemModal; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | handleSubmit |
| Local UI result | setShowRestriction, setLoading |

Trace symbols: `handleSubmit`.

Requests made by this handler or local helpers:

- `instance.post("/menu/menu-items/", formData)`

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Remove selected image

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Remove selected image |
| Location | AddItemModal; JSX button; handler removeImage |
| Appears when | imagePreview [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Remove selected image.  |
| Handler / destination | removeImage |
| Local UI result | setImage, setImagePreview |

Trace symbols: `removeImage`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Add ingredient

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add ingredient |
| Location | AddItemModal; JSX button; handler addRecipeRow |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add ingredient.  |
| Handler / destination | addRecipeRow |
| Local UI result | setRecipe |

Trace symbols: `addRecipeRow`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | AddItemModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | AddItemModal; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading \|\| !selectedcategoryid |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleSubmit |
| Local UI result | setShowRestriction, setLoading |

Trace symbols: `handleSubmit`.

Requests made by this handler or local helpers:

- `instance.post("/menu/menu-items/", formData)`

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Item name | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Item name | input; name | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Description | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Description | textarea; description | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Dari name | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-6"></a> F6: Dari name | input; nameDari | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-7"></a> F7: Pashto name | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-8"></a> F8: Pashto name | input; namePashto | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Dari description | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-10"></a> F10: Dari description | textarea; descriptionDari | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-11"></a> F11: Pashto description | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-12"></a> F12: Pashto description | textarea; descriptionPashto | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-13"></a> F13: Upload item image PNG or JPG, ideally square or 4:3 | file; handleImageChange | Not declared; see submit validation | Parent/state supplied | accept=image/* | read-only=false; disabled=false; shown when imagePreview [false branch] |
| <a id="field-14"></a> F14: Replace image | file; handleImageChange | Not declared; see submit validation | Parent/state supplied | accept=image/* | read-only=false; disabled=false; shown when imagePreview |
| <a id="field-15"></a> F15: Price | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-16"></a> F16: Price | number; price | true | "" | min=0; step=0.01 | read-only=false; disabled=false |

## Submission and validation evidence

- `handleSubmit`: `if (isDemo) {`; `if (image) formData.append("image", image); const itemRes = await instance.post("/menu/menu-items/", formData); const menuItemId = itemRes.data.id; for (const row of recipe) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.close_add_item_modal_ef037490` | Close add item modal | مودال افزودن آیتم را ببندید | د item add modal بند کړئ |
| `legacy.remove_selected_image_5e01adf1` | Remove selected image | حذف تصویر انتخاب شده | ټاکل شوی انځور لرې کړه |
| `legacy.add_ingredient_4ca518bb` | Add ingredient | مواد اولیه را اضافه کنید | اجزا اضافه کړئ |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `saving` | Saving... | در حال ذخیره... | خوندي کېږي... |
| `legacy.add_item_5bcf4db4` | Add item | افزودن آیتم | توکی اضافه کړئ |
| `legacy.item_name_b56b71bb` | Item name | نام آیتم | د توکی نوم |
| `legacy.use_the_name_staff_will_search_for_most_often_a6cf835a` | Use the name staff will search for most often. | از نامی استفاده کنید که کارکنان بیشتر جستجو می کنند. | هغه نوم وکاروه چې کارکوونکی به یې تر ټولو ډېر لټوی. |
| `legacy.e_g_chicken_karahi_50844b49` | e.g. Chicken Karahi | مثلاً مرغ کراهی | لکه چرګ کاراهی |
| `description` | Description | توضیحات | تشریح |
| `legacy.short_customer_facing_description_7b01de1c` | Short customer-facing description... | توضیح کوتاه رو به مشتری... | لنډ پیرودونکی ته تشریح... |
| `legacy.dari_name_39072a2e` | Dari name | نام دری | دری نوم |
| `legacy.item_name_in_dari_7561085c` | Item name in Dari | نام آیتم در دری | د توکی نوم په دری کې |
| `legacy.pashto_name_fcbb52c5` | Pashto name | نام پشتو | پشتون نوم |
| `legacy.item_name_in_pashto_6d8225d5` | Item name in Pashto | نام آیتم به پشتو | د توکی نوم په پښتو کې |
| `legacy.dari_description_f2d9dcc8` | Dari description | توصیف دری | دری تشریح |
| `legacy.description_in_dari_ee53e8af` | Description in Dari | توضیحات به زبان دری | په دری ژبه کې تشریح |
| `legacy.pashto_description_4c13a593` | Pashto description | توصیف پشتو | پښتو تشریح |
| `legacy.description_in_pashto_e7e4e941` | Description in Pashto | توضیحات به زبان پشتو | په پښتو کې تشریح |
| `menuDetails.price` | Price | قیمت | بیه |
| `labels.afn` | AFN | افغانی | افغانۍ |

## Related interface references

- [component admin menumanagement recipeingredientrow](component_admin_menumanagement_recipeingredientrow.md)
