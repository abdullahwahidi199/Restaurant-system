---
id: "operator_reference_interface_modules_payroll_components_payrolltable"
title: "Payroll Table — controls and fields"
module: "payroll"
description: "Payroll Table — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["payroll", "table", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager"]
related_docs: ["operator_modules_payroll_payroll", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/payroll", "/admin/dashboard/payroll/run", "/admin/dashboard/payroll/records", "/admin/dashboard/payroll/records/:id", "/admin/dashboard/payroll/advances", "/admin/dashboard/payroll/payments", "/admin/dashboard/payroll/employees/:id", "/finance-manager/payroll", "/finance-manager/payroll/run", "/finance-manager/payroll/records", "/finance-manager/payroll/records/:id", "/finance-manager/payroll/advances", "/finance-manager/payroll/payments", "/finance-manager/payroll/employees/:id"]
source_references: ["frontend/src/modules/payroll/components/PayrollTable.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Payroll Table — controls and fields

This reference records the controls and fields declared by `PayrollTable`. Use [payroll](../../modules/payroll/payroll.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/payroll/components/PayrollTable.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| DataTable | Parent supplied | `[ { key: "employee", header: "Employee", render: (payroll) =&gt; ( &lt;div&gt; &lt;Link to={′${basePath}/payroll/records/${payroll.id}′} className="font-semibold theme-text-primary hover:underline"&gt; {payroll.staff_name} &lt;/Link&gt; &lt;p className="text-xs capitalize theme-text-muted"&gt;{payroll.salary_type \|\| payroll.period_type}&lt;/p&gt; &lt;/div&gt; ), }, { key: "period", header: "Period", render: (payroll) =&gt; ′${payroll.period_start} to ${payroll.period_end}′ }, { key: "gross", header: "Gross", className: "text-right tabular-nums", render: (payroll) =&gt; money(payroll.gross_salary) }, { key: "net", header: "Net", className: "text-right font-semibold tabular-nums theme-text-primary", render: (payroll) =&gt; money(payroll.net_salary) }, { key: "paid", header: "Paid", className: "text-right tabular-nums", render: (payroll) =&gt; money(payroll.amount_paid) }, { key: "balance", header: "Balance", className: "text-right font-semibold tabular-nums text-[var(--theme-danger)]", render: (payroll) =&gt; money(payroll.remaining_balance) }, { key: "status", header: "Status", render: (payroll) =&gt; &lt;StatusBadge status={payroll.status} /&gt; }, { key: "actions", header: "Actions", render: (payroll) =&gt; { const payable = payroll.status !== "draft" && Number(payroll.remaining_balance \|\| 0) &gt; 0; return ( &lt;div className="flex justify-end gap-1"&gt; &lt;Link to={′${basePath}/payroll/records/${payroll.id}′} className="theme-btn theme-btn-ghost theme-btn-icon theme-text-muted" aria-label="Open payroll record"&gt; &lt;Eye className="h-4 w-4" /&gt; &lt;/Link&gt; {payroll.status === "draft" && onApprove && ( &lt;button type="button" onClick={() =&gt; onApprove(payroll)} className="theme-btn theme-btn-ghost theme-btn-icon theme-text-muted" aria-label="Approve payroll"&gt; &lt;Check className="h-4 w-4" /&gt; &lt;/button&gt; )} {payable && onPayment && ( &lt;button type="button" onClick={() =&gt; onPayment(payroll)} className="theme-btn theme-btn-ghost theme-btn-icon theme-text-muted" aria-label="Record payroll payment"&gt; &lt;HandCoins className="h-4 w-4" /&gt; &lt;/button&gt; )} &lt;/div&gt; ); }, }, ]` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {payroll.staff_name}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {payroll.staff_name} |
| Location | PayrollTable; JSX Link; handler `${basePath}/payroll/records/${payroll.id}` |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {payroll.staff_name}.  |
| Handler / destination | `${basePath}/payroll/records/${payroll.id}` |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Open payroll record

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Open payroll record |
| Location | PayrollTable; JSX Link; handler `${basePath}/payroll/records/${payroll.id}` |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Open payroll record.  |
| Handler / destination | `${basePath}/payroll/records/${payroll.id}` |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Approve payroll

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Approve payroll |
| Location | PayrollTable; JSX button; handler () =&gt; onApprove(payroll) |
| Appears when | payroll.status === "draft" && onApprove |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Approve payroll.  |
| Handler / destination | () =&gt; onApprove(payroll) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Record payroll payment

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Record payroll payment |
| Location | PayrollTable; JSX button; handler () =&gt; onPayment(payroll) |
| Appears when | payable && onPayment |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Record payroll payment.  |
| Handler / destination | () =&gt; onPayment(payroll) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.


## Related interface references

- [modules shared erp components datatable](modules_shared_erp_components_datatable.md)
