---
id: "operator_reference_interface_component_manager_tables_managertablesworkspace"
title: "Manager Tables Workspace — controls and fields"
module: "orders"
description: "Manager Tables Workspace — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["orders", "manager", "tables", "workspace", "controls", "fields"]
roles: ["Manager"]
related_docs: ["operator_modules_orders_waiter_tables", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/manager/tables"]
source_references: ["frontend/src/component/Manager/tables/ManagerTablesWorkspace.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Manager Tables Workspace — controls and fields

This reference records the controls and fields declared by `ManagerTablesWorkspace`. Use [waiter tables](../../modules/orders/waiter_tables.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Manager/tables/ManagerTablesWorkspace.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Tables`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| PageHeader | Tables | `See parent row data and linked procedure.` |

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
| Location | ManagerTablesWorkspace; JSX RestaurantTableCard; handler () =&gt; setSelectedTable(table) |
| Appears when | filteredTables.length &gt; 0 [true branch] AND loading [false branch] AND error [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; setSelectedTable(table) |
| Local UI result | setSelectedTable |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | ManagerTablesWorkspace; JSX button; handler () =&gt; handleCancelClick(order) |
| Appears when | canCancel [true branch] AND filteredTables.length &gt; 0 [true branch] AND loading [false branch] AND error [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; handleCancelClick(order) |
| Local UI result | setOrderToCancel, setShowCancelToast |

Trace symbols: `handleCancelClick`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `tables_workspace.table` | Table | میز | مېز |
| `capacity` | Capacity | ظرفیت | ظرفیت |
| `note` | Note | یادداشت | یادښت |
| `tables_workspace.open_table` | Open table | باز کردن میز | مېز پرانیستل |
| `staff.cancel` | Cancel | لغو | لغوه کول |

## Related interface references

- [modules shared erp components alert](modules_shared_erp_components_alert.md)
- [modules shared erp components pageheader](modules_shared_erp_components_pageheader.md)
- [component ordercancellationtoast](component_ordercancellationtoast.md)
- [component ui restauranttablecard](component_ui_restauranttablecard.md)
- [component ui tableworkspacetoolbar](component_ui_tableworkspacetoolbar.md)
- [component manager tables managertableactionmodal](component_manager_tables_managertableactionmodal.md)
