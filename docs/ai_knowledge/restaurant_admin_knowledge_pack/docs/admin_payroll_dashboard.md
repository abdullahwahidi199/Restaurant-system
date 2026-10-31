---
id: admin_payroll_dashboard
title: Payroll > Dashboard
module: payroll
namespace: admin
status: current_observed_behavior
summary: Sum of payroll expense amounts for Approved/Paid records with period end on/after the current Kabul month/year's
  first day. Drafts are excluded. There is no upper date bound, so future pe...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- advances
- dashboard
- employees
- month
- outstanding
- paid
- payroll
- pending
- this
- trend
related_docs:
- admin_payroll_records
- admin_payroll_payments
- admin_payroll_salary_advances
routes: []
source_refs:
- uploaded_admin_reference:lines_294-306
tool_hints:
- reports.get
- records.list
- records.get
metric_ids:
- payroll.current_outstanding
---

### Payroll > Dashboard

- **Payroll This Month / This Year:** Sum of payroll expense amounts for Approved/Paid records with period end on/after the current Kabul month/year's first day. Drafts are excluded. There is no upper date bound, so future periods, including later months/years, can count; these are not strictly month-to-date/year-to-date cash payments.
- **Pending Payroll / Outstanding:** Sum of current remaining net balances of Approved records across all periods. Excludes drafts and Paid records; not just this month's salary or an overdue-only balance.
- **Employees Paid:** Actually counts payroll-enabled staff profiles, including Inactive/Resigned staff; it neither requires a salary payment nor counts employees paid this month. The Active caption refers to payroll enablement, not verified employment status or generation eligibility.
- **Advances Outstanding:** Actually sums all advances dated on/after the current month's first day, including applied and future-dated advances. It is not the balance of open advances and does not subtract payroll deductions.
- **Employees Awaiting Payment:** Up to 12 Approved payroll records, oldest period end first, not distinct employees. May include zero-net/zero-balance Approved records; Pending Payroll totals all qualifying balances, not just these 12 rows.
- **Upcoming Payroll:** Up to 12 payroll-enabled profiles sorted by Payment Day then name; includes inactive/resigned profiles. Amount is the configured base/rate, not calculated net pay. No next payment date, overdue test or unpaid-period check is performed; already-paid employees can appear.
- **Recent Payments:** Latest eight salary-payment records by recorded payment date, then creation time, across all periods. Each amount is one payment, not a salary total; future/backdated payment dates affect ordering.
- **Payroll Trend:** Net salary of the first seven loaded payroll records, labelled by period start. Not monthly totals, seven distinct dates or payment history; multiple employees can share a label. Includes drafts, approved and paid records unless record filters narrow the list.
- **Payroll by Role:** Sum of all matching net salaries grouped by the employee's current stored role, falling back to salary/run type if role is absent. Includes drafts and all matching periods, not just this month; subsequent role changes can reclassify historical amounts. Chart widths scale to the largest bar with a minimum visible width, not a percentage share.
- **Recent tables / decoration:** Payroll and advance tables show the first eight loaded records; payrolls sort by period start then original generation time, advances by date then creation time, newest first. Their counts are displayed rows, not full totals. Trend arrows beside KPI cards are decorative, not calculated changes.
