---
id: "operator_reference_interface_component_admin_menumanagement_addcategorymodal"
title: "Add Category Modal — controls and fields"
module: "menu"
description: "Add Category Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["menu", "category", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "Kitchen_manager", "Manager", "OperationsManager"]
related_docs: ["operator_modules_menu_menu", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/menu", "/manager/menu", "/inventory-manager/menu", "/operations-manager/menu", "/kitchen/menu"]
source_references: ["frontend/src/component/Admin/MenuManagement/AddCategoryModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Add Category Modal — controls and fields

This reference records the controls and fields declared by `AddCategoryModal`. Use [menu](../../modules/menu/menu.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/MenuManagement/AddCategoryModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{title}`, `Add Category`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| Panel | General | `See parent row data and linked procedure.` |
| Panel | Translations | `See parent row data and linked procedure.` |
| Panel | Display | `See parent row data and linked procedure.` |
| Panel | Image | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

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
| Location | AddCategoryModal; JSX div; handler (event) =&gt; { if (event.target === event.currentTarget) onClose(); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | (event) =&gt; { if (event.target === event.currentTarget) onClose(); } |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Close add category modal

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close add category modal |
| Location | AddCategoryModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close add category modal.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | AddCategoryModal; JSX form; handler handleAddCategory |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | handleAddCategory |
| Local UI result | setShowRestriction, setRankError, setLoading |

Trace symbols: `handleAddCategory`.

Requests made by this handler or local helpers:

- `instance.post("/menu/categories/", formData, { headers: { "Content-Type": "multipart/form-data" },`

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | AddCategoryModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | AddCategoryModal; JSX button; handler handleAddCategory |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading \|\| !!rankError |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleAddCategory |
| Local UI result | setShowRestriction, setRankError, setLoading |

Trace symbols: `handleAddCategory`.

Requests made by this handler or local helpers:

- `instance.post("/menu/categories/", formData, { headers: { "Content-Type": "multipart/form-data" },`

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: `${Category name} (English)` | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: `${Category name} (English)` | input; name | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Description | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Description | textarea; description | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Dari name | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-6"></a> F6: Dari name | input; nameDari | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-7"></a> F7: Pashto name | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-8"></a> F8: Pashto name | input; namePashto | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Display rank | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-10"></a> F10: Display rank | number; rank | Not declared; see submit validation | "" | min=1 | read-only=false; disabled=false |
| <a id="field-11"></a> F11: Upload image Square images work best | file; handleImageChange | Not declared; see submit validation | Parent/state supplied | accept=image/* | read-only=false; disabled=false; shown when imagePreview [false branch] |
| <a id="field-12"></a> F12: Replace image | file; handleImageChange | Not declared; see submit validation | Parent/state supplied | accept=image/* | read-only=false; disabled=false; shown when imagePreview |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.close_add_category_modal_b748dddb` | Close add category modal | مدال دسته بندی را ببندید | د کټګورۍ جمع کول موډل |
| `cancel` | Cancel | لغو | لغوه |
| `adding` | Adding... | در حال افزودن... | اضافه کېږي... |
| `add` | Add | افزودن | اضافه |
| `category_name` | Category name | نام دسته‌بندی | د کټګورۍ نوم |
| `legacy.e_g_fast_food_63b1552f` | e.g. Fast Food | مثلاً فست فود | لکه فاسټ فوډ |
| `description` | Description | توضیحات | تشریح |
| `legacy.short_description_for_this_category_4a09a40b` | Short description for this category | توضیح کوتاه برای این دسته بندی | د دې کټګورۍ لنډ تشریح |
| `legacy.dari_name_39072a2e` | Dari name | نام دری | دری نوم |
| `legacy.category_name_in_dari_fbb87039` | Category name in Dari | نام دسته بندی به زبان دری | په دری ژبه کې د کټګورۍ نوم |
| `legacy.pashto_name_fcbb52c5` | Pashto name | نام پشتو | پشتون نوم |
| `legacy.category_name_in_pashto_91939887` | Category name in Pashto | نام دسته بندی به زبان پشتو | په پښتو کې د کټګورۍ نوم |
| `legacy.display_rank_71adbeaf` | Display rank | رتبه نمایش | د نندارې درجه |
| `legacy.optional_order_for_menu_category_sorting_81762fdd` | Optional order for menu category sorting. | ترتیب اختیاری برای مرتب سازی دسته بندی منو. | د مینو د کټګورۍ ترتیب لپاره اختیاری ترتیب. |
| `legacy.e_g_1_5f1bad64` | e.g. 1 | مثلاً ۱ | مثلاً ۱ |
