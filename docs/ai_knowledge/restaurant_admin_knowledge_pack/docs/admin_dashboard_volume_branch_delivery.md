---
id: admin_dashboard_volume_branch_delivery
title: Dashboard > Order Volume, Branch and Delivery Charts
module: dashboard
namespace: admin
status: current_observed_behavior
summary: Counts completed/delivered orders by creation day for the latest 14 dates with qualifying activity from the
  fixed-summary lookback; dates without qualifying orders are omitted. This is no...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- activity
- and
- branch
- branches
- charts
- dashboard
- delivery
- demand
- last
- order
- performance
- volume
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_42-48
tool_hints:
- dashboard.get
- reports.get
- analytics.timeseries
metric_ids: []
---

### Dashboard > Order Volume, Branch and Delivery Charts

- **Order volume:** Counts completed/delivered orders by creation day for the latest 14 dates with qualifying activity from the fixed-summary lookback; dates without qualifying orders are omitted. This is not necessarily the last 14 consecutive calendar days.
- **Side sparklines:** Revenue and completed/delivered order counts for the latest 10 qualifying-activity dates from the same lookback; independent of the selected sales-chart range.
- **Branch performance:** Appears when more than one comparison branch is available. Compares monthly completed/delivered order revenue by branch using Shared Sales Meaning; branch boundaries use Kabul dates and can differ from headline revenue boundaries.
- **Delivery activity:** Appears instead when at most one comparison branch is available. Today, This week and This month count delivery-type orders created in those periods, including cancelled and unfinished deliveries; they do not measure successful deliveries, speed or driver performance. Periods overlap and must not be added together.
