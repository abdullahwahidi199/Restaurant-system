---
id: admin_inventory_stock_adjustments
title: Inventory > Stock Adjustments
module: inventory
namespace: admin
status: current_observed_behavior
summary: Current ingredient balances with recording corrections classified as Adjustment or Waste. The Adjustment Queue
  panel is explanatory, not a pending-approval count or a separate list of out...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- adjustment
- adjustments
- correction
- delta
- inventory
- signed
- stock
- waste
related_docs:
- admin_inventory_stock_movements
routes: []
source_refs:
- uploaded_admin_reference:lines_193-199
tool_hints:
- records.list
- movements.list
- reports.get
metric_ids: []
---

### Inventory > Stock Adjustments

- **Purpose:** Current ingredient balances with recording corrections classified as Adjustment or Waste. The Adjustment Queue panel is explanatory, not a pending-approval count or a separate list of outstanding corrections.
- **Quantity / effect:** Quantity is a signed delta in the ingredient's stock unit, not a target balance: new balance = current balance + delta. A negative resulting balance and zero change are rejected. Corrections change quantity and availability, not supplier debt, payment history or a separately recorded expense.
- **Waste distinction:** New waste entries use the entered sign; selecting Waste does not itself force a reduction. Editing an existing waste movement forces its quantity negative. Positive/negative waste entries can therefore offset in the dashboard's net waste figures; a Waste label alone does not prove gross physical loss.
- **History:** View Adjustments opens Stock Movements filtered to adjustment only; waste has a separate type and the same default lookback/date rules apply. Ingredient balance columns retain the Ingredients definitions.
