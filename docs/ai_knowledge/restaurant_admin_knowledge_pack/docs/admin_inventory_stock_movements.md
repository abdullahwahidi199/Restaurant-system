---
id: admin_inventory_stock_movements
title: Inventory > Stock Movements
module: inventory
namespace: admin
status: current_observed_behavior
summary: Lists purchase, adjustment and waste movements only. Even All Types excludes order consumption, production deductions/returns
  and transfers; it cannot alone reconcile every change in stock.
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- adjustments
- corrections
- history
- inventory
- movement
- movements
- purchases
- stock
- waste
related_docs:
- admin_reports_inventory_cards_movements
- admin_procurement_purchase_invoices
routes: []
source_refs:
- uploaded_admin_reference:lines_181-187
tool_hints:
- records.list
- movements.list
- reports.get
metric_ids: []
---

### Inventory > Stock Movements

- **Purpose / exclusions:** Lists purchase, adjustment and waste movements only. Even All Types excludes order consumption, production deductions/returns and transfers; it cannot alone reconcile every change in stock.
- **Dates / count:** Defaults to movements created within the preceding rolling 30 days. Supplying either From or To replaces that default with the supplied inclusive Kabul-date bounds; an omitted opposite bound stays open. A specific-movement view bypasses the default lookback. Search/type/date filters narrow the pagination count, which counts events, not units or AFN.
- **Quantity / Total / Unit cost:** Quantity is the signed stock change: positive increases stock, negative reduces it. Purchases show historical movement quantity × recorded unit cost as Total, not payment. g/ml quantities are displayed as kg/l, while the unit cost remains per original stock unit; the total uses matching original units. Missing cost is not evidence of a zero-value purchase.
- **Corrections:** A revised movement changes current stock by revised effect minus old effect, not by adding the full revised quantity again. Purchase corrections also change current ingredient cost and, where linked, invoice-line quantity/price and invoice totals/status. Existing payment records are retained; reducing charges below payments can create reconciliation differences. Order movements are not editable here; purchase types remain purchases, while adjustment/waste can switch between those types.
