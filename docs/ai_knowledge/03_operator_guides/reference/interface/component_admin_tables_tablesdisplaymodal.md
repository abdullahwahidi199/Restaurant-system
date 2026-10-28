---
id: "operator_reference_interface_component_admin_tables_tablesdisplaymodal"
title: "Tables Display Modal — controls and fields"
module: "tables"
description: "Tables Display Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["tables", "display", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_tables_table_setup", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/tables", "/inventory-manager/tables", "/operations-manager/tables"]
source_references: ["frontend/src/component/Admin/tables/TablesDisplayModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Tables Display Modal — controls and fields

This reference records the controls and fields declared by `TablesDisplayModal`. Use [table setup](../../modules/tables/table_setup.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/tables/TablesDisplayModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

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
| Location | TablesDisplayModal; JSX RestaurantTableCard; handler () =&gt; setSelectedTable(table) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; setSelectedTable(table) |
| Local UI result | setSelectedTable |

Record/status result, downstream effects, failure recovery, and reversal: [table setup](../../modules/tables/table_setup.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `tables_workspace.table` | Table | میز | مېز |
| `capacity` | Capacity | ظرفیت | ظرفیت |
| `note` | Note | یادداشت | یادښت |
| `tables_workspace.edit_table` | View and edit | مشاهده و ویرایش | کتل او سمول |

## Related interface references

- [component admin tables tableupdatedeletemodal](component_admin_tables_tableupdatedeletemodal.md)
- [component ui restauranttablecard](component_ui_restauranttablecard.md)
