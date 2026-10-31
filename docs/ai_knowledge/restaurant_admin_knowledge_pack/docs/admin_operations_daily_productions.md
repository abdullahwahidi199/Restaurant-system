---
id: admin_operations_daily_productions
title: Operations > Daily Productions
module: operations
namespace: admin
status: current_observed_behavior
summary: Tracks prepared portions for bulk-cooked menu items, separate from raw ingredient stock. One current batch per
  menu item and branch persists until changed or cleared; “Daily” does not mea...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- batch
- cooking
- daily
- ingredients
- operations
- portions
- prepared
- produced
- production
- productions
- raw
- recipe
- remaining
- sold
related_docs:
- admin_operations_production_movements
- admin_restaurant_menu
- admin_inventory_stock_movements
routes: []
source_refs:
- uploaded_admin_reference:lines_100-113
tool_hints:
- records.list
- records.get
- analytics.aggregate
metric_ids:
- production.remaining_prepared
---

### Operations > Daily Productions

- **Purpose / period:** Tracks prepared portions for bulk-cooked menu items, separate from raw ingredient stock. One current batch per menu item and branch persists until changed or cleared; “Daily” does not mean a midnight reset or production within today's dates.
- **Tracked items / All items:** Count of menu items configured to use daily production, including items without a batch. **Active (in stock) / In stock:** Count with remaining portions above zero. **Needs production:** Tracked items minus in-stock items; includes sold-out and no-batch items. These counts ignore search and do not check manual menu availability.
- **Produced / Cooked:** Portions recorded in the current batch after additions/corrections. **Remaining:** Prepared portions still recorded as available. Summary cards sum these quantities across all tracked items, regardless of the visible search/status filter; they mix portions of different dishes and are not ingredient weights.
- **Sold:** Produced minus Remaining, shown per item and in the PDF. Means net prepared portions consumed, not necessarily paid, completed or served portions. **Active:** Batch has remaining portions; **Sold out:** Batch exists with none left; **No batch:** No current production record.
- **Ingredients / availability:** Cooking deducts each recipe ingredient's per-portion quantity × added portions. Subsequent standalone-order consumption reduces prepared portions without deducting those ingredients again. A production-tracked menu item requires a positive branch balance and manual availability; raw stock alone does not make it sellable. Missing recipes allow production without ingredient deductions, so accurate recipe setup matters.
- **Order timing / platters:** Initial order lines normally consume production when preparation first starts; later-added lines consume immediately. Order acceptance checks availability but does not reserve initial portions. Platter components configured for daily production are skipped: they consume neither that item's standalone prepared balance nor its recipe ingredients through the platter deduction path.
- **Corrections / clearing:** Cook increases Produced and Remaining equally. Reduce normally decreases both and returns the removed portions' recipe ingredients to raw stock, preserving Sold; it is a recording correction, not physical uncooking or a wastage measure. Reduction below consumed portions is blocked. A reduction to zero clears the batch without ingredient return. Clear also removes the batch without ingredient return in this page; replacement, where recorded in movements, discards the old balance and deducts ingredients for the entire new batch.
- **Consumption limitations:** Initial preparation can still deduct cancelled lines, and lines added before initial preparation can be deducted twice. Order/line cancellation does not automatically restore prepared portions. Thus Sold and Remaining may require movement review before reconciliation with sales or physical stock.
- **Menu-item use (requested):** In the menu-item editor, configure the recipe quantities per portion, enable Uses daily production and retain manual Available if the item should be sellable. It then appears in Daily Productions; Quantity with + Cook records prepared portions, while later cooking adds to the existing batch. This setup does not itself create prepared stock.
- **Example (illustrative):** Qabuli uses 0.2 kg rice per portion. Cooking 30 portions deducts 6 kg rice and shows Produced 30, Remaining 30. Consumption of five standalone portions shows Produced 30, Remaining 25, Sold 5; no further rice deduction occurs for those portions. Cooking 10 more deducts 2 kg rice and shows Produced 40, Remaining 35, Sold 5. Sold 5 alone does not prove five paid sales.
- **PDF:** Current full branch snapshot of tracked items, production balances, net Sold, batch creator and last update; ignores the screen's search/status filter. Its generation date does not turn existing batch quantities into that day's activity. Prepared by is the batch creator, not necessarily everyone who subsequently cooked or adjusted it.
