---
id: "operator_reference_interface_modules_shared_erp_components_datatable"
title: "Data Table — controls and fields"
module: "interface_reference"
description: "Data Table — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["interface_reference", "data", "table", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager"]
related_docs: ["operator_navigation_common_interface_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/payroll", "/admin/dashboard/payroll/run", "/admin/dashboard/payroll/records", "/admin/dashboard/payroll/records/:id", "/admin/dashboard/payroll/advances", "/admin/dashboard/payroll/payments", "/admin/dashboard/payroll/employees/:id", "/admin/dashboard/contractors", "/admin/dashboard/contractors/invoices", "/admin/dashboard/contractors/invoices/new", "/admin/dashboard/contractors/invoices/:id", "/admin/dashboard/contractors/contractors", "/admin/dashboard/contractors/contractors/:id", "/admin/dashboard/contractors/contracts", "/admin/dashboard/contractors/payments", "/admin/dashboard/contractors/payables", "/admin/dashboard/audit-logs", "/admin/dashboard/procurement", "/admin/dashboard/procurement/purchase-invoices", "/admin/dashboard/procurement/purchase-invoices/new", "/admin/dashboard/procurement/purchase-invoices/:id", "/admin/dashboard/procurement/suppliers", "/admin/dashboard/procurement/suppliers/:id", "/admin/dashboard/procurement/supplier-payments", "/admin/dashboard/procurement/payables", "/finance-manager/payroll", "/finance-manager/payroll/run", "/finance-manager/payroll/records", "/finance-manager/payroll/records/:id", "/finance-manager/payroll/advances", "/finance-manager/payroll/payments", "/finance-manager/payroll/employees/:id", "/finance-manager/contractors", "/finance-manager/contractors/invoices", "/finance-manager/contractors/invoices/new", "/finance-manager/contractors/invoices/:id", "/finance-manager/contractors/contractors", "/finance-manager/contractors/contractors/:id", "/finance-manager/contractors/contracts", "/finance-manager/contractors/payments", "/finance-manager/contractors/payables", "/finance-manager/procurement", "/finance-manager/procurement/purchase-invoices", "/finance-manager/procurement/purchase-invoices/new", "/finance-manager/procurement/purchase-invoices/:id", "/finance-manager/procurement/suppliers", "/finance-manager/procurement/suppliers/:id", "/finance-manager/procurement/supplier-payments", "/finance-manager/procurement/payables", "/finance-manager/audit-logs", "/operations-manager/procurement", "/operations-manager/procurement/purchase-invoices", "/operations-manager/procurement/purchase-invoices/new", "/operations-manager/procurement/purchase-invoices/:id", "/operations-manager/procurement/suppliers", "/operations-manager/procurement/suppliers/:id", "/operations-manager/procurement/supplier-payments", "/operations-manager/procurement/payables", "/operations-manager/audit-logs"]
source_references: ["frontend/src/modules/shared/erp/components/DataTable.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Data Table — controls and fields

This reference records the controls and fields declared by `DataTable`. Use [common interface controls](../../navigation/common_interface_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/shared/erp/components/DataTable.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | {column.sortable === false \|\| actionKeys.has(column.key) ? ( column.header ) : ( &lt;button type="button" onClick={() =&gt; toggleSort(column)} className={`inline-flex items-center gap-1.5 transition hover:text-[var(--theme-primary)] ${rightAligned ? "ml-a … [see named source symbol] | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Export

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Export |
| Location | DataTable; JSX button; handler exportCsv |
| Appears when | showExport && rows.length &gt; 0 |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Export.  |
| Handler / destination | exportCsv |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `exportCsv`, `getSortValue`, `stringify`.

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | DataTable; JSX button; handler () =&gt; toggleSort(column) |
| Appears when | column.sortable === false \|\| actionKeys.has(column.key) [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; toggleSort(column) |
| Local UI result | setPage, setSort |

Trace symbols: `toggleSort`.

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.export_f3e4fadb` | Export | صادرات | صادرات |

## Related interface references

- [modules shared erp components tablepagination](modules_shared_erp_components_tablepagination.md)
