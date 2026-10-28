---
id: "operator_workflows_staff_to_payroll"
title: "Employee setup to attendance, salary approval, and payment"
module: "workflows"
description: "Connect employee and shift setup, attendance, salary advances, payroll generation, administrator approval and salary payment."
keywords: ["workflows", "employee", "setup", "attendance", "salary", "approval", "payment", "employee onboarding", "attendance to payroll", "salary approval"]
roles: ["Admin", "BranchAdmin", "OperationsManager", "FinanceManager"]
related_docs: ["operator_modules_employees_staff", "operator_modules_employees_attendance_shifts", "operator_modules_payroll_payroll"]
frontend_routes: []
source_references: ["backend/backend/users/serializers.py:StaffSerializer", "backend/backend/users/views.py:mark_attendance_view", "backend/backend/users/payroll_services.py:generate_payroll", "backend/backend/users/payroll_services.py:create_payroll_payment", "frontend/src/modules/payroll/hooks/usePayrollWorkspace.js"]
status: "source_verified"
---

# Employee setup to attendance, salary approval, and payment

## Set up staff, record attendance, and pay salary

1. Admin/BranchAdmin creates shift and staff, sets branch/role/status, salary basis/base/allowances/deductions/overtime and Payroll Active. BranchAdmin can manage ordinary staff only in their branch. Confirm login/station assignment separately from payroll eligibility.
2. Admin/BranchAdmin/OperationsManager selects today’s shift in Attendance and records Present/Absent/Leave, then saves. Defaults are Present. Re-saving updates same shift/date records. Attendance does not automatically calculate payroll hours/deductions.
3. Admin/BranchAdmin/FinanceManager records legitimate Salary Advance if paid: employee/date/positive amount/reason/notes. Future generation picks unapplied advances dated≤period end; a saved advance is not a customer/supplier payment.
4. Payroll Wizard: confirm branch, monthly/weekly period, dates, selected staff (empty means all eligible), bonus/overtime and actual days/hours for daily/hourly staff → Generate Payroll.
5. Review draft record details/components/applied advances. Regenerating same exact period can reset approved-but-unpaid records; paid/any-payment records skipped. Avoid creating overlapping periods unintentionally.
6. Admin/BranchAdmin uses Approve confirmation. FinanceManager can prepare records but cannot approve through current endpoint. Approval exposes salary expense in finance; it does not transfer money or necessarily create a generic editable expense row.
7. Admin/BranchAdmin/FinanceManager records actual partial/full payroll payment. Draft blocked; overpayment blocked. Payment recalculates paid/remaining/status; full becomes paid. Review payment history after success.

## Correct an unpaid run or investigate a payment

**Correction:** Change salary profile for future runs; revise eligible unpaid period only with responsible approval and re-review. No universal refund/payment delete/undo is mounted. If paid record is wrong or a save response is uncertain, inspect record/payment history and involve authorized manager before creating another payment. Leave status is not a separate approval workflow. See [staff](../modules/employees/staff.md), [attendance shifts](../modules/employees/attendance_shifts.md), and [payroll](../modules/payroll/payroll.md).
