---
id: admin_payroll_salary_advances
title: Payroll > Salary Advances
module: payroll
namespace: admin
status: current_observed_behavior
summary: Recorded positive amounts issued ahead of salary, with employee, date and reason; separate from salary-payment
  records. Search matches employee name, reason or notes; list order is advanc...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- advance
- advances
- applied
- debt
- employee
- open
- payroll
- recovery
- salary
related_docs:
- admin_payroll_records
- admin_payroll_payments
routes: []
source_refs:
- uploaded_admin_reference:lines_326-331
tool_hints:
- reports.get
- records.list
- records.get
metric_ids:
- payroll.advances_issued
---

### Payroll > Salary Advances

- **Purpose / dates:** Recorded positive amounts issued ahead of salary, with employee, date and reason; separate from salary-payment records. Search matches employee name, reason or notes; list order is advance date then creation time, newest first, with no date-range control. Payroll Employees is up to eight payroll-enabled profiles, not eight advance recipients or debtors.
- **Open / Applied:** Open means not linked to payroll; Applied means linked, including to Draft/unpaid payroll, not confirmed cash recovery or employee repayment. Generation links all unapplied employee advances dated on/before period end, including advances before period start and from another branch of the same restaurant. Later-dated advances remain open; ordinary profile deductions are separate.
- **Recovery / limitations:** The full eligible advance sum becomes Advance Deductions and each advance is marked Applied. No salary-based limit or partial-advance carry-forward is calculated when advances exceed available earnings; net floors at zero. Treatment/recovery of that excess remains unresolved. An advance issued after generation does not automatically revise existing payroll; Applied alone cannot establish actual recovered value.
