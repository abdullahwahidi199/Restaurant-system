---
id: admin_reports_staff_salary_history
title: 'Finance > Reports > Staff Performance: Salary and History Tables'
module: reports
namespace: admin
status: current_observed_behavior
summary: 'Despite its title, current salary configuration per employee, independent of report dates: salary type, base/rate,
  payment day, recurring allowances/deductions and payroll-enabled status....'
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- advances
- and
- deductions
- earnings
- employee
- finance
- history
- payment
- payroll
- performance
- report
- reports
- salary
- staff
- tables
related_docs:
- admin_payroll_records
- admin_payroll_payments
- admin_payroll_salary_advances
routes: []
source_refs:
- uploaded_admin_reference:lines_524-533
tool_hints:
- reports.get
metric_ids: []
---

### Finance > Reports > Staff Performance: Salary and History Tables

- **Salary History:** Despite its title, current salary configuration per employee, independent of report dates: salary type, base/rate, payment day, recurring allowances/deductions and payroll-enabled status. Not a timeline of historical salary changes or earned salary in the period; salary-basis meanings follow Staff/Payroll definitions.
- **Payroll Summary:** Groups overlapping-period payrolls by employee, including Drafts. Payrolls counts records; Gross, ordinary Deductions, advance-recovery Advances and Net sum their payroll fields; Balance = summed Net − cumulative Paid. Unlike the Payroll Cost card, draft calculations contribute to these rows. Payrolls can mistakenly display with an AFN format; it remains a record count, not currency.
- **Payroll History:** Latest 100 overlapping salary-period records, including Drafts, ordered by newest period end. Gross, Net and Balance are current payroll amounts, not transaction flows or prorated portions. Aggregate cards/summary are not limited to these 100 rows.
- **Payment History / Advance History:** Each shows at most the latest 100 matching transactions, ordered by transaction date/entry time. Payment Amount is one salary disbursement; its linked salary period can fall outside the selected range. Advance Amount is one issued advance; Applied means linked to payroll, not separately verified recovery, while Open means unlinked. Their headline transaction totals cover all matching records.
- **Employee Earnings:** Per employee, Earnings sums earned expense and Outstanding sums remaining salary for Approved/Paid overlapping payrolls. Paid is cumulative settlement of the overlapping payroll records across all payment dates, not the period's Payroll Paid transactions. Earnings is already after ordinary deductions, but not advance recovery, and is not take-home cash.
- **Employee Deductions:** Sums ordinary deductions plus advance recovery across overlapping payrolls, including Drafts. The Advances column is the advance-recovery subset already included in Deductions, not additional money to subtract or new advances issued during the selected period.
- **PDF coverage:** Current salary profiles, payroll history, payment history, advance history and employee earnings are further limited to the first 25 rows each. The PDF's Employee Deductions summary includes ordinary deductions plus advance recovery, including Drafts; it is not another payroll cost. Full aggregate totals and shorter detail lists can legitimately differ.
