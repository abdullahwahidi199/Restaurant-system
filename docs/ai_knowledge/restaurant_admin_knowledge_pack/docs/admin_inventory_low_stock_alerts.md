---
id: admin_inventory_low_stock_alerts
title: Inventory > Low Stock Alerts
module: inventory
namespace: admin
status: current_observed_behavior
summary: Current ingredients with quantity ≤ minimum threshold, including inactive records and zero stock. Item count
  is matching ingredients, not units, order shortages or outstanding purchases...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- alerts
- inventory
- low
- of
- out
- pdf
- quantity
- stock
- threshold
- zero
related_docs:
- admin_inventory_stock_levels
- admin_reports_inventory_purchase_pdf
routes: []
source_refs:
- uploaded_admin_reference:lines_200-205
tool_hints:
- records.list
- movements.list
- reports.get
metric_ids:
- inventory.low_stock_count
---

### Inventory > Low Stock Alerts

- **Purpose / count:** Current ingredients with quantity ≤ minimum threshold, including inactive records and zero stock. Item count is matching ingredients, not units, order shortages or outstanding purchases; no activity-period filter.
- **Available / Minimum / Status:** Current balance and configured threshold in each ingredient's unit. Exactly zero is labelled Out of Stock; other matching quantities are labelled Low Stock. The alert is a replenishment signal, not an automatic purchase, forecast or guaranteed recipe shortage.
- **PDF difference:** The Low Stock PDF includes only positive quantities at/below threshold; zero-stock ingredients belong in the separate Out of Stock PDF. Thus its count can differ from this alert list and the active-only dashboard KPI.
