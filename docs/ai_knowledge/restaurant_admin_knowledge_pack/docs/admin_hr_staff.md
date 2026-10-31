---
id: admin_hr_staff
title: HR > Staff
module: hr
namespace: admin
status: current_observed_behavior
summary: Current employee identities, roles, contact details, assigned shift, employment status and salary profiles;
  not a headcount history or wage-payment report. Normally includes branch-assign...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- employee
- hr
- inactive
- profile
- rate
- resigned
- roles
- roster
- salary
- staff
related_docs:
- admin_payroll_records
- admin_hr_attendance
routes: []
source_refs:
- uploaded_admin_reference:lines_262-269
tool_hints:
- records.list
- records.get
- reports.get
metric_ids: []
---

### HR > Staff

- **Purpose / scope:** Current employee identities, roles, contact details, assigned shift, employment status and salary profiles; not a headcount history or wage-payment report. Normally includes branch-assigned staff plus restaurant-wide administrator profiles; Branch Admin visibility has additional administrator-account restrictions. Includes the full matching roster, without an employment-date filter.
- **Search / role:** Search matches name or stored role, not email, phone or the custom title shown for Other. Kitchen-station responsibility is separate from the employee's working shift; station meaning is defined under Restaurant > Kitchen Stations.
- **Employment status:** Active, Inactive and Resigned are distinct stored statuses; only Active is eligible for payroll generation. The table currently labels every non-Inactive row Active, so Resigned staff can appear active. Inactivation does not erase existing payroll or debt; employee deletion is not archival and can remove linked HR/payroll history.
- **Salary / profile:** Salary is the agreed base amount or rate in AFN, labelled monthly, weekly, daily or hourly; not gross earnings, take-home pay or money paid. Allowances and deductions are fixed amounts copied into each generated payroll, not percentages; overtime rate is AFN per overtime hour. Payment Day is a configured day-of-month, not evidence of payment or an automatic transfer schedule. Payroll Active is separate from employment status.
- **Linked salary-profile summaries:** Total Earnings sums payroll expense amounts defined under Payroll Records, including drafts; Deductions sums ordinary plus advance deductions across all payrolls. Total Paid sums salary-payment records; Advances sums all issued advances, applied and open. These cover the employee's complete history across branches, not selected-branch or selected-period totals. Earnings already subtracts ordinary deductions, so subtracting Deductions again double-counts them.
