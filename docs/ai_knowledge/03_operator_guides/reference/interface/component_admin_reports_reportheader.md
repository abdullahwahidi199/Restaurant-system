---
id: "operator_reference_interface_component_admin_reports_reportheader"
title: "Report Header — controls and fields"
module: "reports"
description: "Report Header — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["reports", "report", "header", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_reports_report_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/reports", "/admin/dashboard/inventory", "/admin/dashboard/inventory/ingredients", "/admin/dashboard/inventory/stock-levels", "/admin/dashboard/inventory/stock-movements", "/admin/dashboard/inventory/stock-adjustments", "/admin/dashboard/inventory/low-stock", "/admin/dashboard/inventory/reports", "/inventory-manager", "/inventory-manager/inventory", "/inventory-manager/inventory/ingredients", "/inventory-manager/inventory/stock-levels", "/inventory-manager/inventory/stock-movements", "/inventory-manager/inventory/stock-adjustments", "/inventory-manager/inventory/low-stock", "/inventory-manager/inventory/reports", "/operations-manager/inventory", "/operations-manager/inventory/ingredients", "/operations-manager/inventory/stock-levels", "/operations-manager/inventory/stock-movements", "/operations-manager/inventory/stock-adjustments", "/operations-manager/inventory/low-stock", "/operations-manager/inventory/reports"]
source_references: ["frontend/src/component/Admin/Reports/ReportHeader.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Report Header — controls and fields

This reference records the controls and fields declared by `ReportHeader`. Use [report controls](../../modules/reports/report_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/Reports/ReportHeader.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {exportLabel}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {exportLabel} |
| Location | ReportHeader; JSX button; handler onExport |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | disabled |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {exportLabel}.  |
| Handler / destination | onExport |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [report controls](../../modules/reports/report_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.
