---
id: admin_inventory_stock_levels
title: Inventory > Stock Levels
module: inventory
namespace: admin
status: current_observed_behavior
summary: 'Uses the same current-stock list and definitions as Ingredients: Quantity, Minimum threshold, Cost per unit,
  Used In and Low Stock/OK. Includes inactive records and has no historical date...'
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- balance
- current
- inventory
- levels
- minimum
- quantity
- raw
- stock
- threshold
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_188-192
tool_hints:
- records.list
- movements.list
- reports.get
metric_ids: []
---

### Inventory > Stock Levels

- **Purpose:** Uses the same current-stock list and definitions as Ingredients: Quantity, Minimum threshold, Cost per unit, Used In and Low Stock/OK. Includes inactive records and has no historical date cutoff.
- **Interpretation:** A current balance, not purchases or consumption in a period. Raw ingredients differ from prepared portions in Daily Productions; a low-stock warning is not the same as a menu item's one-portion availability check.
