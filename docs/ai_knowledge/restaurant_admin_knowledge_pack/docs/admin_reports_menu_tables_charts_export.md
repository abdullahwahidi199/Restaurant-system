---
id: admin_reports_menu_tables_charts_export
title: 'Finance > Reports > Menu Items: Tables, Charts, Insights and Export'
module: reports
namespace: admin
status: current_observed_behavior
summary: Rank is position after the current display sort, not a permanent popularity rank. Item type distinguishes platters;
  Category reflects current classification. Orders counts distinct qualif...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- and
- cancel
- category
- charts
- export
- finance
- insights
- items
- menu
- pdf
- performance
- quantity
- reports
- tables
- top
- trends
related_docs:
- admin_reports_menu_scope_cards
routes: []
source_refs:
- uploaded_admin_reference:lines_545-557
tool_hints:
- reports.get
- analytics.breakdown
metric_ids:
- menu.net_item_sales
---

### Finance > Reports > Menu Items: Tables, Charts, Insights and Export

- **Sales Details table:** Rank is position after the current display sort, not a permanent popularity rank. Item type distinguishes platters; Category reflects current classification. Orders counts distinct qualifying orders containing that product; adding product order counts double-counts orders containing multiple products. Gross, Discount and Net follow the definitions above; Average Price = product Net ÷ units. Table count includes selected zero-sales rows, unlike the distinct selling-products card; Net Total covers the entire selection, not only the current page.
- **% of Sales column:** Product net sales ÷ all filtered-scope net sales before Top/Bottom selection × 100; zero when the denominator is zero. Top/Bottom rows need not add to 100%, even though the headline revenue describes only the selected ranking set.
- **Cancelled Qty column:** Cancelled lines within otherwise successful orders, not units on wholly cancelled orders. Products with only cancelled lines can appear as zero-sales catalogue rows with cancelled quantity zero; that zero is not proof there were no cancellations. Cancelled quantities do not add to Units Sold or sales revenue.
- **Category Performance table:** Groups the selected product set by current category, or Uncategorized. Items Sold counts distinct selling products; Units/Gross/Discount/Net sum product values. Average Item Revenue = category Net ÷ distinct selling products. Category % of Sales instead divides by the selected ranking set's total Net, so its denominator differs from the product table's pre-ranking share. No cost/margin inference follows from a category's revenue share.
- **Top Selling Items bar chart:** Up to ten positive-selling products within the current selection, always ranked by quantity. Bar length is Units Sold, not AFN, profit or the chosen Revenue ranking metric. In a Bottom selection it shows the highest quantities among that bottom subset, not the restaurant's overall top sellers.
- **Revenue by Category donut:** Positive category net revenue within the selected filtered/ranked set. Slice share measures category Net ÷ displayed positive category Net, not all restaurant sales, gross charges or profit. Zero-net categories are omitted.
- **Sales Trend:** Bars show product units on the left axis; the line shows net AFN revenue on the right. Uses the selected products over the applied order-creation period, not only the visible table page. Daily buckets for up to 45 inclusive dates, weekly for 46–240 and monthly above 240; weekly buckets start Monday, so a clipped first week's label may precede the selected start. Only buckets with activity are shown; missing dates are not filled with zero and no forecast/growth comparison is calculated.
- **Insights:** Top Performer means highest net revenue; Most Sold means highest units; Category Leader means highest category net revenue; Low Performer means lowest positive units, excluding unsold products. These are rule-based summaries of the selected set, not AI forecasts, profit rankings or explanations of why demand changed.
- **History / rounding:** Product names/categories and legacy fallback prices are current, so renaming, recategorization or repricing can change historical presentation. Product discount/net totals are rounded to cents; independently rounded products, trend buckets and other reports can have small differences.
- **PDF configuration / coverage:** The Menu Items PDF has its own dates, category, ranking/limit, zero-sales inclusion, display sort and section choices; defaults are copied from much of the screen state, but the screen's name search and Selling/Zero Sales Only filter are not passed through. Export can therefore cover a different product population. It includes the complete configured selection rather than only the table's 25-row page; Top/Bottom limits still intentionally reduce that selection.
