---
id: admin_reports_inventory_cards_movements
title: 'Finance > Reports > Inventory: Cards and Movement Chart'
module: reports
namespace: admin
status: current_observed_behavior
summary: Current count of ingredient records, active and inactive; not stock quantity, value or items acquired in the
  period. Ignores report dates.
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- alerts
- and
- cards
- chart
- current
- finance
- inventory
- movement
- purchase
- report
- reports
- stock
- value
related_docs:
- admin_inventory_stock_movements
- admin_inventory_stock_levels
routes: []
source_refs:
- uploaded_admin_reference:lines_487-495
tool_hints:
- reports.get
metric_ids:
- inventory.report_purchase_movement_value
---

### Finance > Reports > Inventory: Cards and Movement Chart

- **Total Inventory Items:** Current count of ingredient records, active and inactive; not stock quantity, value or items acquired in the period. Ignores report dates.
- **Low Stock Alerts:** Current count of ingredients with available quantity ≤ minimum threshold, including zero/negative and inactive ingredients. This separate alert list is a current snapshot, not restricted to selected dates, and is not automatically refreshed just by changing report dates. It differs from the PDF's active-only, mutually exclusive Low/Critical/Out of Stock categories.
- **Total Movements:** Count of movements created within the period, excluding Order consumption. Includes Purchase, Adjustment, Waste, Production, Production Adjustment and transfers in/out. Counts movement records, not quantity, orders or purchase invoices; it covers more types than the ordinary Stock Movements page's Purchase/Adjustment/Waste list.
- **Purchase Value:** Sum of signed Purchase movement quantities × recorded unit costs, falling back to current ingredient costs, for movement creation times in the period. Not supplier payments or solely invoice-date purchases. Posting dates and invoice-line linkage can make it differ from Finance Purchase Value.
- **Movement Breakdown donut / legend:** Counts each included movement type; slice percentage = type count ÷ Total Movements × 100, rounded to whole percentages. Indicates event frequency, not stock volume, money, waste rate or order consumption. Order movements are excluded; rounded shares need not total exactly 100%.
- **Low Stock Items panel:** Lists the same current alerts with thresholds, not historical low-stock events. Its displayed current-stock value is presently not populated from the supplied quantity field; a blank figure must not be interpreted as zero. No stockout-duration or forecast is calculated.
