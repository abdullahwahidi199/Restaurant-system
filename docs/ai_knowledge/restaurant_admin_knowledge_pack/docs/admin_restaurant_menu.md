---
id: admin_restaurant_menu
title: Restaurant > Menu
module: restaurant
namespace: admin
status: current_observed_behavior
summary: Current menu catalogue, pricing, preparation routing and selling availability, not sales performance. Includes
  selected-branch and applicable restaurant-wide legacy entries within loaded...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- availability
- catalogue
- category
- cost
- dishes
- items
- menu
- platter
- price
- profit
- recipe
- restaurant
related_docs:
- admin_operations_daily_productions
- admin_reports_menu_scope_cards
- admin_reports_finance_profit_cost
routes: []
source_refs:
- uploaded_admin_reference:lines_143-153
tool_hints:
- records.list
- configuration.get
metric_ids: []
---

### Restaurant > Menu

- **Purpose / scope:** Current menu catalogue, pricing, preparation routing and selling availability, not sales performance. Includes selected-branch and applicable restaurant-wide legacy entries within loaded categories; uncategorized entries are not included in the category-based totals.
- **Categories / Menu Items / Platters:** Categories counts loaded categories; Menu Items counts dishes plus platters, unlike the dashboard's dish-only count. Platters is the subset of platter entries. Category badges also count dishes plus platters, not portions or sales.
- **Active / Hidden / Production:** Active counts currently available dishes/platters; Hidden counts manual availability switched off; Production counts dishes configured for daily production, regardless of whether portions exist. These are whole-catalogue counts before category, search, station and availability filters. Active plus Hidden need not equal Menu Items because visible items may be out of stock.
- **Availability labels:** Available = final selling availability; Hidden = manually unavailable; Sold out = a production-tracked dish with no remaining production, including no batch; Out of Stock = unavailable stock flag; Unavailable = other unavailable cases. Hidden does not guarantee removal from the public menu, which can still show unavailable entries.
- **Ordinary dishes / recipes:** Recipe quantities are ingredient amounts per portion, in each ingredient's stock unit. Recalculated availability requires enough of every recipe ingredient for one portion plus manual availability; a missing recipe makes an ordinary item unavailable. This is separate from low-stock thresholds and does not promise enough stock for every requested quantity. Daily-production availability follows Operations > Daily Productions.
- **Platters:** One sellable entry with its own selling price, station and component dish quantities, which can be fractional. Recalculated availability requires its component dishes to be available plus the platter's manual availability; it does not verify the multiplied ingredient demand for a full platter/order. Production-tracked component deductions follow the exception already documented under Daily Productions.
- **Price / cost / Profit:** Price is the current selling price. Item-detail Total cost = sum of per-portion recipe quantities × current ingredient unit costs; Profit = selling price minus that recipe cost. Platter cost sums component dish costs × included quantities, and its displayed Profit subtracts this from the platter price. These are current ingredient-cost estimates, excluding discounts, wages, overhead and other expenses; they are not realized profit or historical cost of sales. Missing recipes/costs can understate cost. Catalogue prices are rounded to whole AFN; detail calculations can show decimals.
- **Category order / filtered view:** Rank and item order control presentation, not popularity or priority of kitchen work. Search/category/station/status filters narrow displayed entries without changing catalogue KPI definitions.
