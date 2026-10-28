---
id: "operator_reference_interface_component_admin_menumanagement_platteraddmodal"
title: "Platter Add Modal — controls and fields"
module: "menu"
description: "Platter Add Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["menu", "platter", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "Kitchen_manager", "Manager", "OperationsManager"]
related_docs: ["operator_modules_menu_menu", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/menu", "/manager/menu", "/inventory-manager/menu", "/operations-manager/menu", "/kitchen/menu"]
source_references: ["frontend/src/component/Admin/MenuManagement/PlatterAddModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Platter Add Modal — controls and fields

This reference records the controls and fields declared by `PlatterAddModal`. Use [menu](../../modules/menu/menu.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/MenuManagement/PlatterAddModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{title}`, `Add New Platter`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | PlatterAddModal; JSX div; handler (event) =&gt; { if (event.target === event.currentTarget) onClose(); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | (event) =&gt; { if (event.target === event.currentTarget) onClose(); } |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Close platter modal

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close platter modal |
| Location | PlatterAddModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close platter modal.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | PlatterAddModal; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | handleSubmit |
| Local UI result | setLoading |

Trace symbols: `handleSubmit`.

Requests made by this handler or local helpers:

- `instance.post("/menu/platters/", payload, { headers: { "Content-Type": "multipart/form-data" },`

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Remove platter item

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Remove platter item |
| Location | PlatterAddModal; JSX button; handler () =&gt; removePlatterItem(index) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Remove platter item.  |
| Handler / destination | () =&gt; removePlatterItem(index) |
| Local UI result | setFormData |

Trace symbols: `removePlatterItem`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Add menu item

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add menu item |
| Location | PlatterAddModal; JSX button; handler addPlatterItem |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add menu item.  |
| Handler / destination | addPlatterItem |
| Local UI result | setFormData |

Trace symbols: `addPlatterItem`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Remove selected image

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Remove selected image |
| Location | PlatterAddModal; JSX button; handler removeImage |
| Appears when | imagePreview [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Remove selected image.  |
| Handler / destination | removeImage |
| Local UI result | setFormData, setImagePreview |

Trace symbols: `removeImage`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | PlatterAddModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | PlatterAddModal; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading \|\| !selectedcategoryid \|\| validItems.length === 0 |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleSubmit |
| Local UI result | setLoading |

Trace symbols: `handleSubmit`.

Requests made by this handler or local helpers:

- `instance.post("/menu/platters/", payload, { headers: { "Content-Type": "multipart/form-data" },`

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Platter name | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Platter name | input; name | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Description | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Description | textarea; description | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Dari name | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-6"></a> F6: Dari name | input; name_dari | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-7"></a> F7: Pashto name | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-8"></a> F8: Pashto name | input; name_pashto | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Dari description | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-10"></a> F10: Dari description | textarea; description_dari | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-11"></a> F11: Pashto description | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-12"></a> F12: Pashto description | textarea; description_pashto | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-13"></a> F13: Quantity | Select; menuOptions.find( (option) =&gt; option.value === item.menu_item, ) | Not declared; see submit validation | menuOptions.find(                             (option) =&gt; option.value === item.menu_item,                           ) | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-14"></a> F14: Quantity | number; item.quantity | Not declared; see submit validation | item.quantity | min=0.01; step=any | read-only=false; disabled=false |
| <a id="field-15"></a> F15: Upload platter image PNG or JPG, ideally 4:3 | file; handleImageChange | Not declared; see submit validation | Parent/state supplied | accept=image/* | read-only=false; disabled=false; shown when imagePreview [false branch] |
| <a id="field-16"></a> F16: Replace image | file; handleImageChange | Not declared; see submit validation | Parent/state supplied | accept=image/* | read-only=false; disabled=false; shown when imagePreview |
| <a id="field-17"></a> F17: Price | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-18"></a> F18: Price | number; price | true | "" | min=0; step=0.01 | read-only=false; disabled=false |

## Submission and validation evidence

- `handleSubmit`: See the named handler and the module procedure for custom validation.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.close_platter_modal_8d99df3a` | Close platter modal | مدال صفحه بسته | کلوز پلیټر موډل |
| `legacy.remove_platter_item_d3e135f7` | Remove platter item | حذف قطعه بشقاب | د پلیټر توکی لرې کړه |
| `legacy.add_menu_item_2ca3f4f4` | Add menu item | افزودن آیتم منو | د مینو توکی اضافه کړئ |
| `legacy.remove_selected_image_5e01adf1` | Remove selected image | حذف تصویر انتخاب شده | ټاکل شوی انځور لرې کړه |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `legacy.creating_28ea7667` | Creating... | خلق کردن... | جوړول... |
| `legacy.create_platter_e49fc647` | Create platter | سینی خلق کنید | Create Platter |
| `legacy.platter_name_1619bed9` | Platter name | نام پلاتر | د پلیټر نوم |
| `legacy.e_g_family_feast_3178f4cc` | e.g. Family Feast | مثلاً جشن خانوادگی | لکه د کورنۍ مېلمستیا |
| `description` | Description | توضیحات | تشریح |
| `legacy.short_description_of_the_platter_0b31a02c` | Short description of the platter... | توضیح کوتاه سینی... | د پلیټر لنډه تشریح... |
| `legacy.dari_name_39072a2e` | Dari name | نام دری | دری نوم |
| `legacy.platter_name_in_dari_f84868f5` | Platter name in Dari | نام بشقاب به زبان دری | د پلیټر نوم په دری کې |
| `legacy.pashto_name_fcbb52c5` | Pashto name | نام پشتو | پشتون نوم |
| `legacy.platter_name_in_pashto_339d4f09` | Platter name in Pashto | نام سینی به زبان پشتو | د پلیټ نوم په پښتو کې |
| `legacy.dari_description_f2d9dcc8` | Dari description | توصیف دری | دری تشریح |
| `legacy.description_in_dari_ee53e8af` | Description in Dari | توضیحات به زبان دری | په دری ژبه کې تشریح |
| `legacy.pashto_description_4c13a593` | Pashto description | توصیف پشتو | پښتو تشریح |
| `legacy.description_in_pashto_e7e4e941` | Description in Pashto | توضیحات به زبان پشتو | په پښتو کې تشریح |
| `legacy.select_an_item_10dbf591` | Select an item | یک مورد را انتخاب کنید | یو توکی انتخاب کړئ |
| `menuDetails.price` | Price | قیمت | بیه |
| `labels.afn` | AFN | افغانی | افغانۍ |
