---
id: "operator_reference_interface_component_admin_stations_stationformmodal"
title: "Station Form Modal — controls and fields"
module: "menu"
description: "Station Form Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["menu", "station", "form", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_menu_stations", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/stations", "/inventory-manager/stations", "/operations-manager/stations"]
source_references: ["frontend/src/component/Admin/stations/StationFormModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Station Form Modal — controls and fields

This reference records the controls and fields declared by `StationFormModal`. Use [stations](../../modules/menu/stations.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/stations/StationFormModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Edit Kitchen Station Create New Station`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | StationFormModal; JSX button; handler closeModal |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | closeModal |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [stations](../../modules/menu/stations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | StationFormModal; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleSubmit |
| Local UI result | setError, setLoading |

Trace symbols: `handleSubmit`.

Record/status result, downstream effects, failure recovery, and reversal: [stations](../../modules/menu/stations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | StationFormModal; JSX button; handler closeModal |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | closeModal |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [stations](../../modules/menu/stations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Saving... / Update Station Create Station (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Saving... / Update Station Create Station (conditional text) |
| Location | StationFormModal; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Saving... / Update Station Create Station (conditional text).  |
| Handler / destination | handleSubmit |
| Local UI result | setError, setLoading |

Trace symbols: `handleSubmit`.

Record/status result, downstream effects, failure recovery, and reversal: [stations](../../modules/menu/stations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Station Name (English) * | text; name | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: نام استیشن (دری) | text; name_dari | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: د سټېشن نوم (پښتو) | text; name_pashto | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Description / Notes | textarea; description | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Assigned Branch | select; branch | Not declared; see submit validation | "" | ; choices: All Branches (Restaurant Wide) [] | read-only=false; disabled=false |
| <a id="field-6"></a> F6: / | checkbox; is_default | Not declared; see submit validation | false | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-7"></a> F7: / | checkbox; is_active | Not declared; see submit validation | true | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

- `handleSubmit`: `if (!formData.name.trim()) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Station name is required. |
| `setError` | err?.response?.data?.detail \|\| err?.response?.data?.name?.[0] \|\| "Failed to save station." |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `saving` | Saving... | در حال ذخیره... | خوندي کېږي... |
| `legacy.update_station_4b816b2f` | Update Station | ایستگاه به روزرسانی | د تازه کولو سټیشن |
| `legacy.create_station_f70532c4` | Create Station | ایستگاه را ایجاد کنید | Create Station |
| `legacy.e_g_juice_bar_dessert_station_grill_8f3e3481` | e.g., Juice Bar, Dessert Station, Grill | مثلاً بار آبمیوه، ایستگاه دسر، گریل | لکه، جوس بار، ډیزرټ سټیشن، ګریل |
| `legacy.optional_notes_about_what_is_prepared_here_1ed9ef1f` | Optional notes about what is prepared here... | یادداشت های اختیاری درباره آنچه اینجا آماده شده است... | اختیاری یادښتونه چې دلته چمتو شوی... |
| `legacy.all_branches_restaurant_wide_c52b353b` | All Branches (Restaurant Wide) | تمام شعب (در سطح رستورانت) | ټولې څانګې (د رستورانت پراخ) |
