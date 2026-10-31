---
id: admin_payroll_wizard
title: Payroll > Payroll Wizard
module: payroll
namespace: admin
status: current_observed_behavior
summary: Calculates Draft payroll from current salary profiles for Active, Payroll Active employees assigned to the active
  branch. Empty employee selection means all eligible employees, not none....
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- allowances
- base
- daily
- deductions
- draft
- generate
- hourly
- overtime
- payroll
- regeneration
- salary
- wizard
related_docs:
- admin_payroll_records
- admin_payroll_salary_advances
routes: []
source_refs:
- uploaded_admin_reference:lines_307-315
tool_hints:
- reports.get
- records.list
- records.get
metric_ids: []
---

### Payroll > Payroll Wizard

- **Purpose / eligibility:** Calculates Draft payroll from current salary profiles for Active, Payroll Active employees assigned to the active branch. Empty employee selection means all eligible employees, not none. The displayed selection list/count can include inactive/resigned payroll-enabled profiles that generation excludes.
- **Run Type / dates:** Monthly or Weekly labels the run; the employee's Salary Type independently determines the base calculation. Inclusive start/end dates can be equal and need not be a full calendar month/week; monthly/weekly base is not automatically prorated for shorter or longer periods, hire date, absence or leave.
- **Base calculation:** Monthly/weekly employees receive their full configured base once. Daily base = daily rate × entered Regular Days, defaulting to inclusive calendar days in the period, including weekends. Hourly base = hourly rate × entered Regular Hours, defaulting to zero. Fractional days/hours are allowed; attendance and shift duration supply neither automatically.
- **Adjustments:** The same entered bonus and overtime hours apply to every included employee; overtime uses each employee's own rate. Profile allowances/deductions apply once per record, independently of days/hours. Salary calculation and advance recovery use the definitions below; there is no automatic tax or attendance-penalty calculation.
- **Generated count / regeneration:** Counts created or recalculated records, excluding Paid records and any record already having a payment. Unpaid records for the exact employee/start/end can be recalculated and reset from Approved to Draft, removing approval recognition until approved again. Generated records can therefore be recalculations, not additional payroll debt.
- **Period overlap / branch limitation:** Exact employee/start/end identifies one payroll across run types and branches; an unpaid regeneration can change its run type/branch. Different overlapping date pairs are not generally prevented, so successful generation is not proof that earnings were not counted twice.
