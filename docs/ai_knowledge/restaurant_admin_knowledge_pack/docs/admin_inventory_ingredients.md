---
id: admin_inventory_ingredients
title: Inventory > Ingredients
module: inventory
namespace: admin
status: current_observed_behavior
summary: Ingredient definitions, current quantities, units, replenishment thresholds, costs and recipe use. Lists include
  active and inactive records; search matches names and pagination count cov...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- cost
- history
- inactive
- ingredient
- ingredients
- inventory
- purchase
- quantities
- recipe
- unit
related_docs:
- admin_inventory_stock_levels
- admin_procurement_purchase_invoices
routes: []
source_refs:
- uploaded_admin_reference:lines_172-180
tool_hints:
- records.list
- movements.list
- reports.get
metric_ids: []
---

### Inventory > Ingredients

- **Purpose:** Ingredient definitions, current quantities, units, replenishment thresholds, costs and recipe use. Lists include active and inactive records; search matches names and pagination count covers matching records, not stock volume. New ingredient definitions start with zero quantity and cost, not an automatic purchase.
- **Quantity / Cost per unit:** Current recorded raw-stock balance and AFN cost per recorded unit (kg, g, l, ml or pcs). Quantities of different units must not be added as one physical total. Cost reflects the current stored value, normally overwritten by purchase receipts/corrections, not an average purchase cost.
- **Minimum threshold / Status:** Configured replenishment warning point in that same unit. Low Stock means quantity ≤ threshold; otherwise OK. It is not a computed demand forecast, reorder quantity or proof that recipes cannot be prepared.
- **Used In:** Number of linked recipe entries, effectively distinct menu items using the ingredient; not sold portions, platter count or recent consumption.
- **Purchase history:** All non-draft invoice lines for that ingredient in scope, including supplierless purchases, ordered by purchase date. Quantity is received stock-unit quantity; Unit cost is that line's historical unit price; Total cost is the line charge. This history is not supplier payments or the complete stock-movement history.
- **Inventory PDFs:** Full inventory and out-of-stock downloads are current full-scope snapshots, ignoring screen search/page and including inactive ingredients. Row/total value = quantity × current unit cost. Their generation date does not make those balances activity for that date; the Low Stock PDF has the narrower rule documented under Low Stock Alerts.
