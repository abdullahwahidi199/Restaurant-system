---
id: admin_dashboard_overview
title: Dashboard > Main Admin Dashboard
module: dashboard
namespace: admin
status: current_observed_behavior
summary: Summarizes sales, order demand, popular items, branch activity and team indicators; panels use different periods
  and inclusion rules.
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- admin
- dashboard
- main
related_docs:
- admin_dashboard_headline_cards
- admin_dashboard_sales_trend
- admin_dashboard_fixed_date_rules
routes: []
source_refs:
- uploaded_admin_reference:lines_1-6
tool_hints:
- dashboard.get
metric_ids: []
---

### Dashboard > Main Admin Dashboard

- **Purpose:** Summarizes sales, order demand, popular items, branch activity and team indicators; panels use different periods and inclusion rules.
- **Branch scope:** Normally the selected branch. Branch Admins are restricted to their assigned branch. Branch performance can compare all active branches accessible to an Admin, even when the other panels show one branch.
- **Period scope:** The sales chart defaults to the last 30 days; its range changes only that chart and its totals/comparison. Headline cards, best sellers, order volume and team indicators retain their own periods.
