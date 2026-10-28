---
id: "operator_reference_interface_modules_shared_erp_components_pageheader"
title: "Page Header — controls and fields"
module: "interface_reference"
description: "Page Header — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["interface_reference", "page", "header", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "InventoryManager", "Manager", "OperationsManager"]
related_docs: ["operator_navigation_common_interface_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard", "/admin/dashboard/staff", "/admin/dashboard/daily-production-movements", "/admin/dashboard/orders", "/admin/dashboard/tables", "/admin/dashboard/expenses", "/admin/dashboard/payroll", "/admin/dashboard/payroll/run", "/admin/dashboard/payroll/records", "/admin/dashboard/payroll/records/:id", "/admin/dashboard/payroll/advances", "/admin/dashboard/payroll/payments", "/admin/dashboard/payroll/employees/:id", "/admin/dashboard/contractors", "/admin/dashboard/contractors/invoices", "/admin/dashboard/contractors/invoices/new", "/admin/dashboard/contractors/invoices/:id", "/admin/dashboard/contractors/contractors", "/admin/dashboard/contractors/contractors/:id", "/admin/dashboard/contractors/contracts", "/admin/dashboard/contractors/payments", "/admin/dashboard/contractors/payables", "/admin/dashboard/discount-cards", "/admin/dashboard/reports", "/admin/dashboard/audit-logs", "/admin/dashboard/activity", "/admin/dashboard/procurement", "/admin/dashboard/procurement/purchase-invoices", "/admin/dashboard/procurement/purchase-invoices/new", "/admin/dashboard/procurement/purchase-invoices/:id", "/admin/dashboard/procurement/suppliers", "/admin/dashboard/procurement/suppliers/:id", "/admin/dashboard/procurement/supplier-payments", "/admin/dashboard/procurement/payables", "/admin/dashboard/inventory", "/admin/dashboard/inventory/ingredients", "/admin/dashboard/inventory/stock-levels", "/admin/dashboard/inventory/stock-movements", "/admin/dashboard/inventory/stock-adjustments", "/admin/dashboard/inventory/low-stock", "/admin/dashboard/inventory/reports", "/manager", "/manager/tables", "/manager/activity", "/inventory-manager", "/inventory-manager/tables", "/inventory-manager/inventory", "/inventory-manager/inventory/ingredients", "/inventory-manager/inventory/stock-levels", "/inventory-manager/inventory/stock-movements", "/inventory-manager/inventory/stock-adjustments", "/inventory-manager/inventory/low-stock", "/inventory-manager/inventory/reports", "/inventory-manager/expenses", "/finance-manager", "/finance-manager/expenses", "/finance-manager/payroll", "/finance-manager/payroll/run", "/finance-manager/payroll/records", "/finance-manager/payroll/records/:id", "/finance-manager/payroll/advances", "/finance-manager/payroll/payments", "/finance-manager/payroll/employees/:id", "/finance-manager/contractors", "/finance-manager/contractors/invoices", "/finance-manager/contractors/invoices/new", "/finance-manager/contractors/invoices/:id", "/finance-manager/contractors/contractors", "/finance-manager/contractors/contractors/:id", "/finance-manager/contractors/contracts", "/finance-manager/contractors/payments", "/finance-manager/contractors/payables", "/finance-manager/procurement", "/finance-manager/procurement/purchase-invoices", "/finance-manager/procurement/purchase-invoices/new", "/finance-manager/procurement/purchase-invoices/:id", "/finance-manager/procurement/suppliers", "/finance-manager/procurement/suppliers/:id", "/finance-manager/procurement/supplier-payments", "/finance-manager/procurement/payables", "/finance-manager/audit-logs", "/operations-manager/daily-production-movements", "/operations-manager/tables", "/operations-manager/expenses", "/operations-manager/procurement", "/operations-manager/procurement/purchase-invoices", "/operations-manager/procurement/purchase-invoices/new", "/operations-manager/procurement/purchase-invoices/:id", "/operations-manager/procurement/suppliers", "/operations-manager/procurement/suppliers/:id", "/operations-manager/procurement/supplier-payments", "/operations-manager/procurement/payables", "/operations-manager/audit-logs", "/operations-manager/inventory", "/operations-manager/inventory/ingredients", "/operations-manager/inventory/stock-levels", "/operations-manager/inventory/stock-movements", "/operations-manager/inventory/stock-adjustments", "/operations-manager/inventory/low-stock", "/operations-manager/inventory/reports"]
source_references: ["frontend/src/modules/shared/erp/components/PageHeader.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Page Header — controls and fields

This reference records the controls and fields declared by `PageHeader`. Use [common interface controls](../../navigation/common_interface_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/shared/erp/components/PageHeader.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{title}`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {content}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {content} |
| Location | PageHeader; JSX Link; handler tab.to |
| Appears when | tab.to [true branch] AND tabs.length &gt; 0 |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {content}.  |
| Handler / destination | tab.to |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: {content}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {content} |
| Location | PageHeader; JSX button; handler () =&gt; onTab?.(tab.key) |
| Appears when | tab.to [false branch] AND tabs.length &gt; 0 |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {content}.  |
| Handler / destination | () =&gt; onTab?.(tab.key) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.
