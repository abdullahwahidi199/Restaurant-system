---
id: "operator_reference_interface_component_admin_tables_tablebase"
title: "Table Base — controls and fields"
module: "tables"
description: "Table Base — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["tables", "table", "base", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_tables_table_setup", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/tables", "/inventory-manager/tables", "/operations-manager/tables"]
source_references: ["frontend/src/component/Admin/tables/TableBase.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Table Base — controls and fields

This reference records the controls and fields declared by `TableBase`. Use [table setup](../../modules/tables/table_setup.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/tables/TableBase.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

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

### Action 1: Add Table

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add Table |
| Location | TableBase; JSX ActionButton; handler () =&gt; setAddTableDisplay(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add Table.  |
| Handler / destination | () =&gt; setAddTableDisplay(true) |
| Local UI result | setAddTableDisplay |

Record/status result, downstream effects, failure recovery, and reversal: [table setup](../../modules/tables/table_setup.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | err.message |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `add_table` | Add Table | افزودن میز | مېز اضافه کړئ |

## Related interface references

- [component admin tables tablesdisplaymodal](component_admin_tables_tablesdisplaymodal.md)
- [component admin tables tableaddmodal](component_admin_tables_tableaddmodal.md)
- [modules shared erp components actionbutton](modules_shared_erp_components_actionbutton.md)
- [modules shared erp components alert](modules_shared_erp_components_alert.md)
- [modules shared erp components pageheader](modules_shared_erp_components_pageheader.md)
- [component ui tableworkspacetoolbar](component_ui_tableworkspacetoolbar.md)
