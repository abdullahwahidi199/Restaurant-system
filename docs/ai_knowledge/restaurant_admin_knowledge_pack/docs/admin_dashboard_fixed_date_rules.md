---
id: admin_dashboard_fixed_date_rules
title: Dashboard > Fixed-Summary Date Rules
module: dashboard
namespace: admin
status: current_observed_behavior
summary: Fixed-summary Today and month starts are chosen using the UTC date. Order/item count cutoffs and delivery dates
  use Kabul boundaries, while headline revenue and small trend charts use UTC...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- Kabul
- UTC
- cutoff
- dashboard
- date
- fixed-summary
- lookback
- mismatch
- month
- rules
- timezone
- today
- week
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_49-55
tool_hints:
- dashboard.get
metric_ids: []
---

### Dashboard > Fixed-Summary Date Rules

- **Calendar mismatch:** Fixed-summary Today and month starts are chosen using the UTC date. Order/item count cutoffs and delivery dates use Kabul boundaries, while headline revenue and small trend charts use UTC creation dates. Attendance uses the summary's Today date. During 00:00–04:29 Kabul time, summary Today can still be yesterday; month boundaries can also differ from the selected sales chart.
- **This week:** Starts seven dates before summary Today, rather than at the calendar week's start. Headline order and delivery counts are additionally restricted to the current month, so early-month Week excludes the previous month's days; best sellers are not restricted this way.
- **Trend lookback:** Includes qualifying orders created on/after the Kabul date 30 dates before summary Today, grouped by UTC day; this is not an exact 30-day chart. Fixed summaries apply start cutoffs without an upper-date cutoff, unlike the bounded selected-period sales chart.
- **Unresolved:** Whether these differing day boundaries, week definitions and status inclusions match the intended business policy is unverified; they describe current calculations.
