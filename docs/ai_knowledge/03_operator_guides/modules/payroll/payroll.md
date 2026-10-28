---
id: "operator_modules_payroll_payroll"
title: "Salary profiles, payroll runs, advances, approval, and payment"
module: "payroll"
description: "Maintain salary profiles, generate payroll, record advances, approve drafts, and record partial or full salary payments; covers eligibility, period regeneration and balances."
keywords: ["payroll", "salary", "profiles", "runs", "advances", "approval", "payment", "salary payment", "salary advance", "payroll approval", "payroll wizard"]
roles: ["Admin", "BranchAdmin", "FinanceManager"]
related_docs: ["operator_reference_backend_users_fields", "operator_workflows_staff_to_payroll", "operator_reference_backend_users_validation", "operator_reference_interface_modules_payroll_payrollworkspace", "operator_reference_interface_modules_payroll_components_payrollpaymentmodal", "operator_reference_interface_modules_payroll_components_salaryadvancemodal", "operator_reference_interface_modules_payroll_components_payrolltable", "operator_reference_backend_users_access"]
frontend_routes: ["/admin/dashboard/payroll", "/finance-manager/payroll"]
source_references: ["frontend/src/modules/payroll/PayrollWorkspace.jsx", "frontend/src/modules/payroll/hooks/usePayrollWorkspace.js", "frontend/src/modules/payroll/pages/PayrollRun.jsx", "frontend/src/modules/payroll/pages/EmployeeSalaryProfile.jsx", "frontend/src/modules/payroll/pages/PayrollRecordDetail.jsx", "frontend/src/modules/payroll/components/PayrollPaymentModal.jsx", "frontend/src/modules/payroll/components/SalaryAdvanceModal.jsx", "frontend/src/modules/payroll/components/PayrollTable.jsx", "backend/backend/users/payroll_services.py", "backend/backend/users/models.py:Payroll", "backend/backend/users/models.py:PayrollPayment", "backend/backend/users/views.py:payroll_approve_view"]
status: "source_verified"
---

# Salary profiles, payroll runs, advances, approval, and payment

## Pages and access

Admin/BranchAdmin **HR → Payroll** and FinanceManager **Payroll**. Prefixes `/admin/dashboard` or `/finance-manager`; suffixes `/payroll`, `/payroll/run`, `/payroll/records`, `/payroll/records/:id`, `/payroll/advances`, `/payroll/payments`, `/payroll/employees/:id`. Read/generate/payment endpoints allow Admin/BranchAdmin and FinanceManager. **Approve payroll** endpoint allows only Admin/BranchAdmin even when FinanceManager sees an approval icon.

Prepare employee branch assignments, Active status, Payroll Active and salary profile first. Salary profile edits live on employee salary profile, and staff form also includes salary fields. New profile changes do not automatically rewrite paid payrolls.

## Salary profile form

**Salary Type** monthly/weekly/daily/hourly; **Base Salary**; **Payment Day** default1; **Allowances**, **Deductions**, **Overtime Rate** default0; **Payroll Notes**; **Payroll Active** true. Save profile updates Staff via staff detail endpoint. Blank money fields normalize to0. It refreshes staff/history/dashboard and shows **Salary profile updated.** Permission may still reject full staff update for certain roles/targets. Exact decimal limits/read-only outputs are in [users fields](../../reference/backend/users_fields.md).

## Payroll Wizard / Run Payroll

| Field/control | Default / requirement | Actual effect |
|---|---|---|
| Run Type | monthly | monthly or weekly; not every salary basis is a valid run period. |
| Start Date / End Date | Month start / today; required | Server requires valid dates, start≤end; equality is accepted despite error wording “after.” |
| Bonus | Blank→0 | Same default bonus applied to selected eligible employees. |
| Overtime Hours | Blank→0 | Uses each staff profile overtime rate. |
| Regular Days | Optional | For daily salary, defaults inclusive period days when omitted. |
| Regular Hours | Optional | For hourly salary, defaults0 when omitted; do not expect attendance to supply hours. |
| Notes | Optional | Stored on generated payroll. |
| Employee selection | Empty selection means all eligible | **Select All / Use All** and employee toggles control IDs. Empty is not “generate nobody.” |

1. Open wizard and check branch/period. Select intended staff or explicitly understand Use All.
2. Enter actual regular days/hours and permitted bonus/overtime; inspect selections.
3. **Generate Payroll** posts. Server locks eligible staff and finds payroll by staff+same exact start/end, creating or regenerating unpaid/nonpayment records. Only Active, payroll-enabled staff assigned to branch are eligible.
4. Generated records are **draft**, approval/time/payment fields reset for regenerated eligible records; unapplied advances dated≤period end are attached/deducted. Paid records or any records with payments are skipped. Existing approved-but-unpaid records can return to draft when regenerated. Different overlapping date ranges are not universally blocked by a same-period key.
5. Notice **{n} payroll records generated.** appears; form resets and records view loads. In fixed-view route, local view/navigation behavior is controlled by wrapper; use records navigation if URL remains on run.

Monthly and weekly salary bases use the stored base amount rather than prorating by attendance. Daily uses regular days/default inclusive days; hourly uses entered hours. The guide intentionally does not provide business analytics definitions. Do not assume paid leave/absence automatically changes these values.

## Review and approve

Open record from employee name/detail icon. It shows salary components, applied advances, status, paid/remaining and payment history. **Approve payroll** opens confirmation **Approve payroll for ...? This records the payroll expense in Finance.** Authorized Admin/BranchAdmin confirms; draft becomes approved with timestamp. Backend model exposes finance expense contribution for approved/paid records; do not assume a separate editable Expenses row is created.

Approval is not payment. There is no general Undo Approval button. Generating a period again can reset eligible unpaid records, with advance relinking; do not use regeneration as a routine reversal without checking current records and intended correction.

## Record a salary advance

**Salary Advances** add action opens employee, **Date** today, **Amount**, **Reason**, **Notes**. Employee/date/amount are required in UI. Reason lacks a frontend required marker but is a nonblank required model/serializer field; enter it to avoid server rejection. **Save Advance** submits. Amount must be positive; employee must be payroll eligible and accessible in branch. **Record**/save creates SalaryAdvance; UI **Salary advance recorded.** It is applied to a later eligible payroll generation, not an immediate revision of an already paid salary. `applied_to` is read-only. No dedicated advance reversal/edit UI is supplied by the mounted workspace.

## Record a partial or full payroll payment

**Record payroll payment** opens a record-specific modal: payroll selected, **Date** today, **Amount** default remaining, **Payment Method** cash, optional **Reference Number**/**Notes**. After actual payment, submit once. Draft rejects **Draft payroll cannot receive payments.**; nonpositive or overbalance rejects. Model updates paid amount/status/paid time. Partial payment remains outstanding; full payment becomes paid. UI refreshes record/history and shows **Payroll payment recorded.** No universal payment undo/refund button exists.

Failed load/generate/profile/payment shows module error banner with backend detail or fallback. **No active payroll employees found for this branch.** means check assignments/status/payroll-enabled rather than create a duplicate employee. After uncertain payment, reload payment history before retrying. See [staff to payroll](../../workflows/staff_to_payroll.md) and [users validation](../../reference/backend/users_validation.md).

## Detailed controls, fields, and server rules

- [Payroll Workspace — controls and fields](../../reference/interface/modules_payroll_payrollworkspace.md)
- [Payroll Payment Modal — controls and fields](../../reference/interface/modules_payroll_components_payrollpaymentmodal.md)
- [Salary Advance Modal — controls and fields](../../reference/interface/modules_payroll_components_salaryadvancemodal.md)
- [Payroll Table — controls and fields](../../reference/interface/modules_payroll_components_payrolltable.md)
- [Users — backend fields reference](../../reference/backend/users_fields.md)
- [Users — backend validation reference](../../reference/backend/users_validation.md)
- [Users — backend access reference](../../reference/backend/users_access.md)
