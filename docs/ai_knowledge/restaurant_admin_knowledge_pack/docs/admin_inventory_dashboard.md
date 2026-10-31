---
id: admin_inventory_dashboard
title: Inventory > Dashboard
module: inventory
namespace: admin
status: current_observed_behavior
summary: Current raw-ingredient stock position with recent consumption/waste indicators. Current-stock KPIs have no period
  filter; consumption/waste use movement creation times within the precedin...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- consumption
- dashboard
- ingredient
- inventory
- low
- raw
- stock
- transfers
- value
- wastage
related_docs:
- admin_inventory_ingredients
- admin_inventory_stock_movements
- admin_reports_inventory_cards_movements
routes: []
source_refs:
- uploaded_admin_reference:lines_162-171
tool_hints:
- records.list
- movements.list
- reports.get
metric_ids:
- inventory.current_stock_value
- inventory.low_stock_count
---

### Inventory > Dashboard

- **Purpose / period:** Current raw-ingredient stock position with recent consumption/waste indicators. Current-stock KPIs have no period filter; consumption/waste use movement creation times within the preceding rolling 30 days, not order/payment dates. Embedded stock lists retain their own rules below.
- **Total Ingredients / Low Stock / Out of Stock:** Counts active ingredient records in scope. Low Stock means available quantity ≤ configured threshold; Out of Stock means exactly zero. These counts can overlap and must not be added. Embedded ingredient and alert lists include inactive records, so their counts can differ.
- **Inventory Value:** Sum of active ingredients' current quantity × current cost per stock unit. Purchase posting replaces unit cost with the received line's price, valuing existing stock at that new cost as well; this is neither weighted-average/FIFO valuation, purchase spending nor historical cost of sales. Ingredient cost is stored to two decimals, while invoice unit prices can have four, creating rounding differences.
- **Top Consumed Ingredients:** Up to five ingredient-name/unit groups ranked by greatest negative net order-movement quantity. Excludes cooking/production, waste, adjustments and transfers, and does not require completed/paid orders; it is not total ingredient usage. Ingredients can remain in the history after becoming inactive.
- **Consumption pie / percentages:** Uses absolute quantities of those five groups; converts kg to g and litres to ml before drawing shares. Percentages are shares of the displayed numeric quantities only, not all consumption or spending. Ranking occurs before conversion, and combining mass, volume and pieces prevents a meaningful common physical-unit comparison.
- **High Waste Ingredients:** Up to five name/unit groups with the lowest signed sum of waste movements, displayed as absolute amounts in their own units; positive corrections can offset negative waste. The badge is the displayed group count, at most five. This is recorded net quantity, not monetary loss or a waste percentage.
- **Stock transfers panel:** Shows up to five recent transfers where available. Pending is a request; approval moves quantity out of the source and into the destination; Rejected/Cancelled do not move it. Not shown to Branch Admins. These movements are not purchases or sales and are excluded from the Stock Movements list below.
