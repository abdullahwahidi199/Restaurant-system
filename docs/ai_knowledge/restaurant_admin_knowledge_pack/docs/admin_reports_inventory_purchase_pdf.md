---
id: admin_reports_inventory_purchase_pdf
title: 'Finance > Reports > Inventory: Purchase Analysis and PDF'
module: reports
namespace: admin
status: current_observed_behavior
summary: Uses non-Draft invoice lines whose purchase date is in the period, not movement creation dates. Per ingredient,
  quantity is purchased stock units; Average Cost = summed historical line va...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- analysis
- and
- average
- cost
- finance
- history
- ingredient
- inventory
- pdf
- purchase
- purchasing
- reports
- supplier
- valuation
- wastage
related_docs:
- admin_procurement_purchase_invoices
- admin_inventory_ingredients
routes: []
source_refs:
- uploaded_admin_reference:lines_496-504
tool_hints:
- reports.get
metric_ids:
- inventory.current_stock_value
---

### Finance > Reports > Inventory: Purchase Analysis and PDF

- **Purchase Cost Intelligence:** Uses non-Draft invoice lines whose purchase date is in the period, not movement creation dates. Per ingredient, quantity is purchased stock units; Average Cost = summed historical line value ÷ summed quantity, a quantity-weighted average rather than the mean of prices. Last Price/Supplier means the latest purchase within the selected period, not necessarily the latest ever or today's ingredient cost. Value sums historical line charges. Displayed averages round to two decimals; unlinked movements are absent.
- **Supplier History:** Groups those period invoice lines by supplier name, including Cash / No Supplier. Invoices counts distinct invoices, Lines counts invoice lines, Qty sums purchased units and Value sums charges rather than payments. Qty across kilograms, litres and pieces is not a meaningful single physical total; name-based grouping can combine different records.
- **Purchase History:** Latest 30 matching invoice lines, newest purchase date/entry time first. Date is invoice purchase date; Qty, Unit Price and Value are historical line values. Multiple rows can belong to one invoice; it is not a complete invoice ledger. Cost/supplier aggregates cover all matching lines, not just those 30.
- **PDF stock status / valuation:** Current, not reconstructed at the selected end date. For active ingredients only: Out of Stock means quantity ≤ 0; Critical means 0 < quantity ≤ half the threshold; Low means half-threshold < quantity ≤ threshold; Healthy means quantity > threshold. Counts are mutually exclusive. Total Inventory Value = sum of active current quantity × current unit cost, not money spent in the period. Full Inventory also lists inactive records as Inactive, so its rows need not match active valuation categories.
- **PDF movement measures:** Purchase Value follows movement dates; Waste Quantity/Cost sum absolute waste quantities and corresponding recorded/fallback costs. Mixed ingredient units must not be interpreted as one physical quantity. Consumption Quantity/Cost are currently fixed at zero because order consumption is excluded, not proof that no ingredients were used. Daily movement trend counts events and signed net quantities on dates with activity, without inserting zero dates; its quantities can mix units. The movement-type section currently shows purchases only.
- **PDF samples / ranking caveat:** Recent Movements includes at most 30 latest movements, including Order consumption despite its exclusion from headline movement counts. PDF purchase-cost/supplier groups are capped at 15 each and purchase history at 20 lines. Top Wasted Ingredients is capped at ten but sorts signed waste totals before showing their absolute values; ordinary negative waste can put smaller losses first. That ranking's cost uses absolute net waste × current ingredient cost, unlike the report's sum of absolute movement quantities at recorded/fallback costs; it is not a reliable largest-loss ranking.
