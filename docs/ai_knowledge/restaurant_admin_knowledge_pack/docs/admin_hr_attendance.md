---
id: admin_hr_attendance
title: HR > Attendance
module: hr
namespace: admin
status: current_observed_behavior
summary: Daily Present, Absent or Leave selections for staff currently assigned to the selected shift. Today uses the
  browser's local calendar date; no historical-date selector. Assigned staff inc...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- absent
- attendance
- hr
- leave
- present
- record
- saved
- shift
- today
related_docs:
- admin_hr_shifts
- admin_reports_staff_cards_charts
routes: []
source_refs:
- uploaded_admin_reference:lines_270-276
tool_hints:
- records.list
- records.get
- reports.get
metric_ids: []
---

### HR > Attendance

- **Purpose / date:** Daily Present, Absent or Leave selections for staff currently assigned to the selected shift. Today uses the browser's local calendar date; no historical-date selector. Assigned staff includes inactive/resigned staff still linked to that shift, not only payroll-eligible employees.
- **Assigned Staff / Present / Absent / Leave:** Assigned Staff counts current shift members; the other cards count their current selections. Unmarked staff default to Present, and changing a selection changes these counts before it is saved. They therefore do not prove attendance was recorded.
- **Saved attendance:** One status per employee, date and shift; a correction updates the existing matching record rather than intentionally adding another. The same employee can have separate saved records for different shifts on one date. Removing/changing a current assignment does not rewrite old attendance.
- **Interpretation / exclusions:** Present is a recorded status, not measured hours or proof of clock-in/out; Absent/Leave do not automatically deduct salary. Leave is not an approved leave request, entitlement balance or a paid/unpaid-leave calculation. Saved monthly attendance and its percentage appear on Shifts, with a different denominator from the main dashboard's Attendance Today gauge.
