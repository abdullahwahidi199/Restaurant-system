---
id: "operator_reference_interface_component_admin_stations_stationsmanagement"
title: "Stations Management — controls and fields"
module: "menu"
description: "Stations Management — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["menu", "stations", "management", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_menu_stations", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/stations", "/inventory-manager/stations", "/operations-manager/stations"]
source_references: ["frontend/src/component/Admin/stations/StationsManagement.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Stations Management — controls and fields

This reference records the controls and fields declared by `StationsManagement`. Use [stations](../../modules/menu/stations.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/stations/StationsManagement.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Kitchen Station Management`, `No Kitchen Stations Found`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Station Name | `See parent row data and linked procedure.` |
| th | Dari / Pashto | `See parent row data and linked procedure.` |
| th | Assigned Branch | `See parent row data and linked procedure.` |
| th | Routing Status | `See parent row data and linked procedure.` |
| th | Status | `See parent row data and linked procedure.` |
| th | Actions | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Add New Station

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add New Station |
| Location | StationsManagement; JSX button; handler () =&gt; { setEditingStation(null); setIsFormOpen(true); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add New Station.  |
| Handler / destination | () =&gt; { setEditingStation(null); setIsFormOpen(true); } |
| Local UI result | setEditingStation, setIsFormOpen |

Record/status result, downstream effects, failure recovery, and reversal: [stations](../../modules/menu/stations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Retry

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Retry |
| Location | StationsManagement; JSX button; handler fetchStations |
| Appears when | error [true branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Retry.  |
| Handler / destination | fetchStations |
| Local UI result | setLoading, setError, setStations |

Trace symbols: `fetchStations`.

Requests made by this handler or local helpers:

- `instance.get("/menu/stations/")`

Record/status result, downstream effects, failure recovery, and reversal: [stations](../../modules/menu/stations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Edit Station

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Edit Station |
| Location | StationsManagement; JSX button; handler () =&gt; { setEditingStation(st); setIsFormOpen(true); } |
| Appears when | filteredStations.length === 0 [false branch] AND error [false branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Edit Station.  |
| Handler / destination | () =&gt; { setEditingStation(st); setIsFormOpen(true); } |
| Local UI result | setEditingStation, setIsFormOpen |

Record/status result, downstream effects, failure recovery, and reversal: [stations](../../modules/menu/stations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: st.is_default ? Default station cannot be deleted : Delete Station

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | st.is_default ? Default station cannot be deleted : Delete Station |
| Location | StationsManagement; JSX button; handler () =&gt; { setStationToDelete(st); setIsDeleteOpen(true); } |
| Appears when | filteredStations.length === 0 [false branch] AND error [false branch] AND loading [false branch] |
| Disabled when | st.is_default |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate st.is_default ? Default station cannot be deleted : Delete Station.  |
| Handler / destination | () =&gt; { setStationToDelete(st); setIsDeleteOpen(true); } |
| Local UI result | setStationToDelete, setIsDeleteOpen |

Record/status result, downstream effects, failure recovery, and reversal: [stations](../../modules/menu/stations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search stations... | text; search | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Filter Branch: | select; branchFilter | Not declared; see submit validation | "all" | ; choices: All Stations [all], Restaurant Wide (All Branches) [restaurant_wide] | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Failed to load kitchen stations. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.add_new_station_4b527d7a` | Add New Station | افزودن ایستگاه جدید | نوی سټیشن اضافه کړئ |
| `menu_item_sales.retry` | Retry | تلاش دوباره | بیا هڅه |
| `legacy.edit_station_f89858eb` | Edit Station | ایستگاه ویرایش | ایډیټ سټیشن |
| `legacy.default_station_cannot_be_deleted_3646bb6e` | Default station cannot be deleted | ایستگاه پیش فرض قابل حذف نیست | اصلی سټیشن نشی حذف کېدای |
| `legacy.delete_station_a59e5f4f` | Delete Station | حذف ایستگاه | ډیلټ سټیشن |
| `legacy.search_stations_ebbb8b4b` | Search stations... | ایستگاه های جستجو... | د لټون ځایونه... |
| `legacy.all_stations_a0c5c58f` | All Stations | تمام ایستگاه ها | ټول سټیشنونه |
| `legacy.restaurant_wide_all_branches_e0008c68` | Restaurant Wide (All Branches) | رستورانت واید (تمام شعبه) | د رستورانت پراخ (ټولې څانګې) |

## Related interface references

- [component admin stations stationformmodal](component_admin_stations_stationformmodal.md)
- [component admin stations stationdeletemodal](component_admin_stations_stationdeletemodal.md)
