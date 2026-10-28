---
id: "operator_reference_interface_component_admin_menumanagement_platterdetails"
title: "Platter Details — controls and fields"
module: "menu"
description: "Platter Details — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["menu", "platter", "details", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_menu_menu", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/menu/platter/:id", "/inventory-manager/menu/platter/:id", "/operations-manager/menu/platter/:id"]
source_references: ["frontend/src/component/Admin/MenuManagement/PlatterDetails.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Platter Details — controls and fields

This reference records the controls and fields declared by `PlatterDetails`. Use [menu](../../modules/menu/menu.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/MenuManagement/PlatterDetails.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Update Platter`, `Delete Platter`, `Platter Items`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Delete Platter

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Delete Platter |
| Location | PlatterDetails; JSX button; handler () =&gt; setShowDelete(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Delete Platter.  |
| Handler / destination | () =&gt; setShowDelete(true) |
| Local UI result | setShowDelete |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | PlatterDetails; JSX button; handler () =&gt; setShowDelete(false) |
| Appears when | showDelete |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setShowDelete(false) |
| Local UI result | setShowDelete |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Deleting... Delete Platter

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Deleting... Delete Platter |
| Location | PlatterDetails; JSX button; handler handleDelete |
| Appears when | showDelete |
| Disabled when | deleting |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Deleting... Delete Platter.  |
| Handler / destination | handleDelete |
| Local UI result | setDeleting, setError |

Trace symbols: `handleDelete`.

Requests made by this handler or local helpers:

- `instance.delete(′/menu/platters/${id}/′)`

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: View Item →

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View Item → |
| Location | PlatterDetails; JSX Link; handler `${dashboardBase}/menu/item/${reason.id}` |
| Appears when | reason.type === "menu_item" AND hasUnavailableReasons AND !finalAvailability |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View Item →.  |
| Handler / destination | `${dashboardBase}/menu/item/${reason.id}` |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | PlatterDetails; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below. Review the confirmation before accepting. |
| Handler / destination | handleSubmit |
| Local UI result | setSaving, setError, setLoading, setPlatterDetails, setFormData, setStations |

Trace symbols: `fetchPlatterDetails`, `fetchStations`, `handleSubmit`.

Requests made by this handler or local helpers:

- `instance.put(′/menu/platters/${id}/′, fd, { headers: { "Content-Type": "multipart/form-data", },`
- `instance.put(′/menu/platters/${id}/′, payload)`
- `instance.get(′/menu/platters/${id}/′)`
- `instance.get("/menu/stations/")`

Dialog content: `"Platter updated successfully")`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Default

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Default |
| Location | PlatterDetails; JSX div; handler () =&gt; setFormData({ ...formData, station: st.id }) |
| Appears when | stations.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Default.  |
| Handler / destination | () =&gt; setFormData({ ...formData, station: st.id }) |
| Local UI result | setFormData |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Add Item

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add Item |
| Location | PlatterDetails; JSX button; handler addItem |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add Item.  |
| Handler / destination | addItem |
| Local UI result | setFormData |

Trace symbols: `addItem`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Remove

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Remove |
| Location | PlatterDetails; JSX button; handler () =&gt; removeItem(index) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Remove.  |
| Handler / destination | () =&gt; removeItem(index) |
| Local UI result | setFormData |

Trace symbols: `removeItem`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: View Details

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View Details |
| Location | PlatterDetails; JSX Link; handler `${dashboardBase}/menu/item/${unavailableReason.id}` |
| Appears when | unavailableReason |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View Details.  |
| Handler / destination | `${dashboardBase}/menu/item/${unavailableReason.id}` |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | PlatterDetails; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | saving |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below. Review the confirmation before accepting. |
| Handler / destination | handleSubmit |
| Local UI result | setSaving, setError, setLoading, setPlatterDetails, setFormData, setStations |

Trace symbols: `fetchPlatterDetails`, `fetchStations`, `handleSubmit`.

Requests made by this handler or local helpers:

- `instance.put(′/menu/platters/${id}/′, fd, { headers: { "Content-Type": "multipart/form-data", },`
- `instance.put(′/menu/platters/${id}/′, payload)`
- `instance.get(′/menu/platters/${id}/′)`
- `instance.get("/menu/stations/")`

Dialog content: `"Platter updated successfully")`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Platter Image | file; (e) =&gt; { const file = e.target.files[0]; if (file) { setSelectedImage(file); } } | Not declared; see submit validation | Parent/state supplied | accept=image/* | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Name (English) | text; name | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: نام (دری) | text; name_dari | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: نوم (پښتو) | text; name_pashto | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Description (English) | textarea; description | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-6"></a> F6: توضیحات (دری) | textarea; description_dari | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-7"></a> F7: توضیحات (پښتو) | textarea; description_pashto | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-8"></a> F8: Price | number; price | Not declared; see submit validation | "" | step=0.01 | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Available | checkbox; is_manually_available | Not declared; see submit validation | true | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-10"></a> F10: Menu Item | Select; menuOptions.find( (opt) =&gt; opt.value === Number(item.menu_item), ) | Not declared; see submit validation | menuOptions.find(                             (opt) =&gt; opt.value === Number(item.menu_item),                           ) | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-11"></a> F11: Quantity | number; item.quantity | Not declared; see submit validation | item.quantity | min=0.01; step=any | read-only=false; disabled=false |

## Submission and validation evidence

- `handleSubmit`: `if (selectedImage) { const fd = new FormData(); Object.entries(payload).forEach(([key, value]) =&gt; { if (key === "items") {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Failed to delete platter. |
| `setError` | Failed to fetch platter details |
| `alert` | "Platter updated successfully" |
| `setError` | Failed to update platter |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.delete_platter_5e2a9e0f` | Delete Platter | حذف پلاتر | پلیټر حذف کړه |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `legacy.deleting_e16cac65` | Deleting... | در حال حذف... | پاکول... |
| `legacy.view_item_e0beed3e` | View Item → | مشاهده آیتم → | د توکی → |
| `add_item` | Add Item | افزودن آیتم | توکی اضافه کړئ |
| `legacy.remove_e963907d` | Remove | حذف | لرې کول |
| `legacy.view_details_907b3bee` | View Details | جزئیات را ببینید | تفصیلات وګورئ |
| `updating` | Updating... | در حال به‌روزرسانی... | تازه کېږي... |
| `legacy.update_platter_eebcdbcc` | Update Platter | به روزرسانی پلاتر | پلیټر تازه کول |
| `legacy.select_menu_item_59579899` | Select menu item... | آیتم منو را انتخاب کنید... | د مینو توکی انتخاب کړه... |
