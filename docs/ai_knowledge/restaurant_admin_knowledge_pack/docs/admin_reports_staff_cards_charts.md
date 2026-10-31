---
id: admin_reports_staff_cards_charts
title: 'Finance > Reports > Staff Performance: Cards and Charts'
module: reports
namespace: admin
status: current_observed_behavior
summary: Staff counts, role distribution and salary profiles describe current branch membership/status, not historical
  headcount or hires during the period. Attendance uses attendance date; orders...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- and
- attendance
- cards
- charts
- employee
- finance
- overlap
- payroll
- performance
- period
- report
- reports
- staff
related_docs:
- admin_hr_attendance
- admin_payroll_records
- admin_reports_finance_profit_cost
routes: []
source_refs:
- uploaded_admin_reference:lines_505-515
tool_hints:
- reports.get
- analytics.breakdown
metric_ids:
- reports.staff_payroll_cost_by_overlap
- reports.staff_record_attendance_rate
---

### Finance > Reports > Staff Performance: Cards and Charts

- **Population / dates:** Staff counts, role distribution and salary profiles describe current branch membership/status, not historical headcount or hires during the period. Attendance uses attendance date; orders use creation time; reservation activity uses booking creation time rather than reserved date. Payroll inclusion is whole salary periods overlapping the selected range: start ≤ selected To and end ≥ selected From, without proration. Payment/advance transactions independently use their own dates.
- **Total / Active / Inactive Staff cards:** Total counts all currently assigned profiles. Active counts status Active; Inactive = Total − Active and therefore also includes Resigned, not just status Inactive. A person assigned to multiple branches can appear in each branch report.
- **Attendance Rate card:** Present attendance records ÷ all attendance records in the period × 100; zero with no records. Leave/Absent records are in the denominator; missing attendance days are not automatically counted absent. Display rounds to one decimal. This is a shift-record rate, not unique-person attendance or a percentage of scheduled working days.
- **Present Days / Attendance Records cards:** Present Days counts Present records, not unique people or calendar dates; multiple shifts can contribute separately. Attendance Records counts records across all statuses, not staff headcount.
- **Payroll Cost card:** Earned expense on Approved/Paid payrolls whose salary periods overlap the selected dates: max(gross − ordinary deductions, 0), without subtracting advance recovery. A one-day range can include an entire monthly payroll. Unlike Finance Payroll Cost, approval date is not the period selector.
- **Payroll Paid card:** Sum of salary-payment transactions dated in the period, regardless of whether their linked salary period overlaps. **Outstanding Salaries card:** Current remaining net salary on Approved overlapping-period payrolls only, not all-history salary debt. **Salary Advances card:** Advances issued in the period, including applied and open amounts, not the remaining unrecovered balance.
- **Staff by Role chart:** Count of current scoped staff per stored role; percentage = role count ÷ Total Staff × 100. Includes inactive/resigned profiles; not hours worked, payroll cost or productivity.
- **Attendance Summary chart:** Counts by attendance status, each divided by all period attendance records for its share; same denominator as Attendance Rate. **Daily Attendance table:** Record counts by date/status for dates with recorded attendance; omitted dates do not establish everyone was absent or off duty.
