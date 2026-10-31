---
id: admin_hr_shifts
title: HR > Shifts
module: hr
namespace: admin
status: current_observed_behavior
summary: Recurring named working-hour groups and their current staff assignments, plus saved monthly attendance. Shifts
  counts shift definitions; Assigned Staff counts distinct linked employees ac...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- assignment
- attendance
- hr
- monthly
- rate
- schedules
- shift
- shifts
related_docs:
- admin_hr_attendance
- admin_reports_staff_cards_charts
routes: []
source_refs:
- uploaded_admin_reference:lines_277-286
tool_hints:
- records.list
- records.get
- reports.get
metric_ids:
- hr.monthly_record_attendance_rate
---

### HR > Shifts

- **Purpose / summary:** Recurring named working-hour groups and their current staff assignments, plus saved monthly attendance. Shifts counts shift definitions; Assigned Staff counts distinct linked employees across those shifts, irrespective of employment status. Neither counts employees actually present today.
- **Shift cards:** Start/End are configured working times, not clocked attendance. Duration is end minus start, treating an earlier end as next day; equal times show zero hours. Per-card Assigned Staff counts all members; five names are displayed and +N represents additional members. A shift does not generate payable hours, overtime, rota dates or salary by itself.
- **Assignment history:** Each employee has one current shift assignment. Removing a shift clears current assignments and the shift reference on saved attendance, but retains the attendance records/statuses; historical shift filtering can consequently lose that association.
- **Monthly attendance / dates:** Grid shows the browser's current calendar month, with no month/date-range selector. Available history starts at the server-calendar month's first day; different browser/server dates near a month boundary can omit records. Future-dated records in the displayed month are not excluded.
- **Filters / population:** Employee-name and shift filters narrow both the grid and its summary. Only employees with matching saved records appear; staff without records, unrecorded days and future blank cells do not become absences or enter the percentage denominator. Shift choices come from shifts present in that month's saved records.
- **Present / Absent / Leave / %:** Status cards count matching saved shift records. Overall and per-employee rate = Present ÷ (Present + Absent + Leave) × 100, rounded to whole percent; zero with no tracked records. Leave lowers the rate. Per-employee colour is green at ≥80%, amber at 60–79%, otherwise red; this is a display threshold, not a payroll penalty.
- **Multiple shifts limitation:** All matching shift records enter counts/rates, but a grid cell displays only one record per employee/date. Without a specific shift filter, multiple same-day shift statuses can therefore be hidden behind one mark; percentages are record-based, not unique-day attendance rates.
