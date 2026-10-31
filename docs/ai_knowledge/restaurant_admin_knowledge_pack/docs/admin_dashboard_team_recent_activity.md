---
id: admin_dashboard_team_recent_activity
title: Dashboard > Team Overview and Recent Activity
module: dashboard
namespace: admin
status: current_observed_behavior
summary: Current count of staff records assigned to the branch, or restaurant staff in an all-branch summary; includes
  inactive and resigned staff, without a hire-date filter.
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- activity
- and
- attendance
- count
- dashboard
- notification
- overview
- rating
- recent
- staff
- team
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_56-62
tool_hints:
- dashboard.get
metric_ids:
- dashboard.attendance_today_gauge
---

### Dashboard > Team Overview and Recent Activity

- **Staff:** Current count of staff records assigned to the branch, or restaurant staff in an all-branch summary; includes inactive and resigned staff, without a hire-date filter.
- **Attendance today:** Number of Present attendance records dated summary Today ÷ Staff × 100; zero if Staff is zero. Counts shift records, not unique people or scheduled staff; multiple shifts can inflate the rate. The displayed gauge is capped at 100% and rounded to a whole percent, so it is not a reliable unique-person attendance rate.
- **Rating:** All-time arithmetic mean of review ratings in scope on a 1–5 scale, displayed to one decimal; zero means no reviews. It combines menu-item and delivery reviews and is not today's satisfaction score.
- **Recent activity / notifications:** Up to four latest unread notifications from the latest ten returned, including restaurant-wide notifications within a branch view. Timestamps are notification creation times; this panel is a limited unread activity feed, not a complete transaction history. An empty panel can also result from a loading failure.
