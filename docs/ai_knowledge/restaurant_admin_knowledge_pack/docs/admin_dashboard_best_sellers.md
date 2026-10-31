---
id: admin_dashboard_best_sellers
title: Dashboard > Best Selling Items
module: dashboard
namespace: admin
status: current_observed_behavior
summary: Up to four entries ranked by summed order-line quantity for Today, Week or Month; Month is the default. Includes
  every order and line status, including cancellations; Week is not clipped...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- all
- best
- dashboard
- items
- platters
- popular
- products
- quantity
- ranking
- selling
- statuses
- top
related_docs:
- admin_reports_menu_scope_cards
- admin_reports_orders_charts_tables
routes: []
source_refs:
- uploaded_admin_reference:lines_35-41
tool_hints:
- dashboard.get
metric_ids:
- dashboard.best_seller_qty
---

### Dashboard > Best Selling Items

- **Purpose / Sold:** Up to four entries ranked by summed order-line quantity for Today, Week or Month; Month is the default. Includes every order and line status, including cancellations; Week is not clipped to the current month.
- **Price / Revenue:** Price is the current menu price; entry revenue is quantity × that price, without order discounts, delivery or reservation charges. It does not use recorded order-time prices and can change when menu prices change.
- **Grouping / platters:** Entries with the same menu name, current price and image are combined. Platter-only lines contribute quantity to an unnamed entry, with missing price/revenue displayed as zero; they are not separately identified or correctly valued here.
- **Interpretation:** Shows recorded ordering popularity under these rules, not verified completed-sales popularity or profitability. Its revenue does not reconcile directly to dashboard sales revenue.
