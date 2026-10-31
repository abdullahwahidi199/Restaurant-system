---
id: admin_reports_orders_charts_tables
title: 'Finance > Reports > Orders: Charts and Tables'
module: reports
namespace: admin
status: current_observed_behavior
summary: Each type's count and revenue include successful orders only; revenue is their full discounted order value,
  including applicable charges. Bar width = that successful type count ÷ all-stat...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- and
- charts
- daily
- delivery
- finance
- hours
- items
- orders
- pdf
- peak
- reports
- search
- tables
- top
- waiter
related_docs:
- admin_reports_orders_cards
- admin_reports_menu_scope_cards
routes: []
source_refs:
- uploaded_admin_reference:lines_433-443
tool_hints:
- reports.get
- analytics.breakdown
metric_ids:
- orders.report_top_items_qty
---

### Finance > Reports > Orders: Charts and Tables

- **By Order Type:** Each type's count and revenue include successful orders only; revenue is their full discounted order value, including applicable charges. Bar width = that successful type count ÷ all-status Total Orders × 100. Bars need not total 100% when other statuses exist, and delivery-type revenue is not the Delivery Revenue fee card.
- **Order Status:** Counts all period orders by current status; categories together reconcile to all-status Total Orders. This measures current service outcomes of orders created in the period, not a timeline of status changes during it.
- **Top Selling Items:** Up to ten entries ranked by non-cancelled line quantity on successful orders. Quantity counts ordered units, with a platter counted as a sellable unit, not exploded components. Revenue = quantity × recorded order-time price, falling back to current menu/platter price for older lines; it is gross before discounts and excludes delivery/reservation charges. Grouping by product name can merge distinct products or a dish and platter with the same name. This is not the main Dashboard's all-status best-seller calculation.
- **Daily Breakdown:** Successful order count and discounted full-order revenue for dates with successful activity; no zero-sales dates are inserted. Inclusion uses Kabul date boundaries, but rows are currently grouped by UTC creation date. Early-Kabul orders can therefore appear under the preceding date, potentially outside the displayed calendar range.
- **Average Preparation Time:** Mean minutes from recorded preparation start to preparation end among successful period orders with both timestamps, rounded to two decimals. Excludes missing timings and does not measure queue time before preparation, customer waiting or delivery time.
- **Menu Item Sales Lookup:** Name search across English/Dari/Pashto product names, within the period and active branch. Units and revenue follow the Menu Items report's successful-sales rules, with net item revenue after attributed discount and platters separate. Only the first 200 matching selling products are returned; this lookup is not a complete unlimited export and does not change the Orders cards. Its net revenue differs from the gross Top Selling Items table.
- **Orders PDF summary / Peak Hours:** The PDF's Total Revenue (non-cancelled) still means Completed/Delivered revenue, not every non-cancelled status. Peak Hours shows the five busiest dated Kabul-hour buckets by all-status order creation count, including cancellations; it does not combine the same hour across different days or measure peak successful revenue.
- **Orders PDF performance tables:** Separate calculations from Staff Performance. Waiter Performance groups all-status period orders by the employee receiving them, without requiring a Waiter role; Delivery Boy Performance groups all-status delivery orders by assigned driver. Both show up to ten name groups, ranked by their displayed counts. Revenue is gross item value including cancelled lines, before discounts/charges. Counts can repeat one order for multiple joined item lines, so are not reliable distinct order/delivery counts; same-name employees can merge. These PDF tables must not be interpreted using the Staff report's creator/status/net-value rules.
