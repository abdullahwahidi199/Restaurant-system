---
id: "operator_reference_interface_modules_payroll_payrollworkspace"
title: "Payroll Workspace — controls and fields"
module: "payroll"
description: "Payroll Workspace — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["payroll", "workspace", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager"]
related_docs: ["operator_modules_payroll_payroll", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/payroll", "/admin/dashboard/payroll/run", "/admin/dashboard/payroll/records", "/admin/dashboard/payroll/records/:id", "/admin/dashboard/payroll/advances", "/admin/dashboard/payroll/payments", "/admin/dashboard/payroll/employees/:id", "/finance-manager/payroll", "/finance-manager/payroll/run", "/finance-manager/payroll/records", "/finance-manager/payroll/records/:id", "/finance-manager/payroll/advances", "/finance-manager/payroll/payments", "/finance-manager/payroll/employees/:id"]
source_references: ["frontend/src/modules/payroll/PayrollWorkspace.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Payroll Workspace — controls and fields

This reference records the controls and fields declared by `PayrollWorkspace`. Use [payroll](../../modules/payroll/payroll.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/payroll/PayrollWorkspace.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`pageMeta.title`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| PageHeader | pageMeta.title | `tabs` |

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
| Location | PayrollWorkspace; JSX EmployeeSalaryProfile; handler model.saveSalaryProfile |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | model.saveSalaryProfile |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | PayrollWorkspace; JSX PayrollRun; handler model.submitWizard |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | model.submitWizard |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Run Payroll

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Run Payroll |
| Location | PayrollWorkspace; JSX Link; handler `${basePath}/payroll/run` |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Run Payroll.  |
| Handler / destination | `${basePath}/payroll/run` |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Advance

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Advance |
| Location | PayrollWorkspace; JSX ActionButton; handler () =&gt; model.setShowAdvanceDialog(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Advance.  |
| Handler / destination | () =&gt; model.setShowAdvanceDialog(true) |
| Local UI result | setShowAdvanceDialog |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | PayrollWorkspace; JSX PayrollPaymentModal; handler model.submitPayment |
| Appears when | model.paymentTarget |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | model.submitPayment |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | PayrollWorkspace; JSX SalaryAdvanceModal; handler model.submitAdvance |
| Appears when | model.showAdvanceDialog |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | model.submitAdvance |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.run_payroll_e6657ad6` | Run Payroll | اداره حقوق و دستمزد | د معاشونو چلول |
| `legacy.advance_67e70c3c` | Advance | پیش روی | پرمختګ |

## Related interface references

- [modules shared erp components actionbutton](modules_shared_erp_components_actionbutton.md)
- [modules shared erp components alert](modules_shared_erp_components_alert.md)
- [modules shared erp components confirmmodal](modules_shared_erp_components_confirmmodal.md)
- [modules shared erp components pageheader](modules_shared_erp_components_pageheader.md)
- [modules payroll components payrollpaymentmodal](modules_payroll_components_payrollpaymentmodal.md)
- [modules payroll components salaryadvancemodal](modules_payroll_components_salaryadvancemodal.md)
