---
id: admin_reports_menu_scope_cards
title: 'Finance > Reports > Menu Items: Scope, Filters and Cards'
module: reports
namespace: admin
status: current_observed_behavior
summary: Completed/Delivered orders created in the applied Kabul period; cancelled lines and all other order statuses
  are excluded. Menu items and platters are separate products, even with the sam...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- and
- bottom
- cards
- discounts
- filters
- finance
- gross
- items
- menu
- net
- product
- quantity
- reports
- revenue
- sales
- scope
- top
related_docs:
- admin_dashboard_sales_meaning
- admin_reports_orders_cards
- admin_restaurant_menu
routes: []
source_refs:
- uploaded_admin_reference:lines_534-544
tool_hints:
- reports.get
metric_ids:
- menu.net_item_sales
---

### Finance > Reports > Menu Items: Scope, Filters and Cards

- **Sales basis:** Completed/Delivered orders created in the applied Kabul period; cancelled lines and all other order statuses are excluded. Menu items and platters are separate products, even with the same name; one platter is one sellable unit, not its component portions. Gross Sales = sold quantity × recorded order-time price, falling back to current price for legacy lines. Discount attributes the order's percentage to item gross; Net Sales/Revenue = Gross − attributed Discount. Excludes delivery/reservation charges, COGS and profit; not a refund ledger.
- **Filters / ranking scope:** Name search covers English/Dari/Pashto; category uses the product's current category. Selling Only keeps positive-unit products; Zero Sales Only includes catalogue products with no qualifying sales. Include Zero-Sales Items adds current scoped catalogue products, including unavailable ones; otherwise All does not mean the entire catalogue. Top/Bottom 5/10/20/50 selects by Quantity or Revenue before display sorting. All cards, categories, charts, trends and insights use that full filtered/ranked set, not only the table's current 25-row page.
- **Total Menu Items Sold card:** Count of distinct selected products with positive units; not portions, catalogue size or number of orders. Different dish/platter records count separately.
- **Total Units Sold card:** Sum of selected non-cancelled product quantities, with platters counted as platter units. Not unique customers or component servings.
- **Total Menu Item Revenue card / Discount subtitle:** Sum of selected products' net sales; the subtitle sums attributed item discount. Net excludes fees and reservation charges, unlike Orders/Finance Total Revenue. Discount is already subtracted, not an additional deduction from displayed revenue.
- **Average Revenue Per Item card:** Selected net revenue ÷ distinct selling products, or zero if none. Average contribution per selling product, not average order value or price per unit.
- **Average Selling Price card:** Selected net revenue ÷ total units, or zero if none. Quantity-weighted realized price after discount, not the arithmetic average of menu prices or today's list price.
- **Top / Lowest Selling Item cards:** Highest quantity and lowest positive quantity among selling products in the selected set, with revenue/name tie-breaks. Show that product's units and net revenue. Lowest excludes zero-sales products even when included in the table; neither card switches to highest/lowest revenue merely because ranking is by Revenue.
