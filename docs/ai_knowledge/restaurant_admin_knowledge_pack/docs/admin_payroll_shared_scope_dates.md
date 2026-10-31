---
id: admin_payroll_shared_scope_dates
title: Payroll > Shared Scope and Dates
module: payroll
namespace: admin
status: current_observed_behavior
summary: Payrolls, advances and payments normally follow the selected branch. Lists, record counts, table pagination
  and exports cover all matching records; searches have no 100-record limit. Dash...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- advance
- and
- branches
- cost
- dates
- paid
- payroll
- salary
- scope
- shared
- vs
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_287-293
tool_hints:
- reports.get
- records.list
- records.get
metric_ids: []
---

### Payroll > Shared Scope and Dates

- **Scope / coverage:** Payrolls, advances and payments normally follow the selected branch. Lists, record counts, table pagination and exports cover all matching records; searches have no 100-record limit. Dashboard headline totals use complete scoped history; charts use matching payrolls with the display limits below. Individual payroll detail includes its full linked payment/advance history; employee salary-profile history is employee-wide as described under Staff.
- **Period controls:** No payroll-wide date-range selector. Wizard dates define the salary period, not a dashboard filter. Header This Month and Outstanding repeat the dashboard definitions below and must not be added to them. Record search/status/run-type filters can narrow list-based charts without narrowing headline totals.
- **Calendar differences:** Dashboard month/year boundaries use Kabul Today. Payment/advance form defaults and the wizard's suggested end date use UTC Today; the suggested month start converts the browser's first day to UTC and can become the preceding month's last date early in Kabul morning. Suggested dates do not guarantee the intended local pay period.
- **Financial distinction:** Payroll expense measures earned cost; net salary measures the amount payable after advances; salary payments and advances are recorded disbursements. Approval is not payment, and payment is not an additional salary expense. Payroll dashboard cost uses period end, whereas Finance reporting normally attributes approved payroll expense to approval date; equal date selections need not produce equal totals.
