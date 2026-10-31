---
id: admin_dashboard_sales_trend
title: Dashboard > Sales Trend and Selected-Period Summary
module: dashboard
namespace: admin
status: current_observed_behavior
summary: Both selected dates are inclusive, using Asia/Kabul calendar days and order creation time. Completion, delivery
  and payment dates do not determine inclusion. Completed/delivered statuses...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- AOV
- and
- average
- compare
- daily
- dashboard
- date
- day
- graph
- monthly
- order
- per
- previous
- range
- revenue
- sales
- selected-period
- summary
- trend
- value
- weekly
related_docs:
- admin_dashboard_sales_meaning
- admin_dashboard_fixed_date_rules
routes: []
source_refs:
- uploaded_admin_reference:lines_23-34
tool_hints:
- dashboard.get
- reports.get
- analytics.timeseries
metric_ids:
- orders.successful_count
---

### Dashboard > Sales Trend and Selected-Period Summary

- **Date inclusion:** Both selected dates are inclusive, using Asia/Kabul calendar days and order creation time. Completion, delivery and payment dates do not determine inclusion. Completed/delivered statuses and Shared Sales Meaning apply throughout.
- **Presets:** Last 7/30/90 days include today and the preceding 6/29/89 days. This month/year starts on the first calendar day and ends today; Last month/year covers the entire preceding calendar month/year. Last 12 months starts the day after the corresponding prior-year date, adjusted for leap days, and ends today. Future end dates are excluded.
- **Total revenue:** Sum of qualifying order values in the selected period, in AFN.
- **Completed orders:** Count of qualifying completed or delivered orders; differs from the all-status headline Total Orders.
- **Average order value:** Selected revenue ÷ qualifying order count; zero when there are no qualifying orders. Indicates average order value, not customer spend per visit or margin.
- **Revenue per day:** Selected revenue ÷ all calendar days in the inclusive range, including zero-sales days and today if selected.
- **Revenue / Orders graph:** Each point totals the chosen metric within its displayed day, week or month; tooltips also show qualifying order count and average order value for that bucket. Empty dates/buckets are zero. Weekly buckets follow Monday–Sunday and monthly buckets follow calendar months, clipped to the selected boundaries.
- **Automatic grouping:** Daily for up to 62 days, weekly for 63–180, monthly above 180. Grouping changes the plotted buckets, not period totals. Expanded-graph zoom changes only the visible points; summary totals and comparison still cover the full selected range.
- **Change versus previous period:** Compares the active graph metric with the immediately preceding, equal-length calendar period: (selected − previous) ÷ previous × 100, rounded to one decimal. When the previous value is zero, no percentage is calculated; “No sales in previous period” can also mean zero prior revenue despite qualifying orders. A range including today compares an unfinished day with a complete historical day.
