---
id: admin_dashboard_headline_cards
title: Dashboard > Headline and Side Summary Cards
module: dashboard
namespace: admin
status: current_observed_behavior
summary: Current count of menu-item records in scope, including unavailable items; excludes platters. The availability
  caption does not establish how many items can currently be sold.
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- and
- cards
- count
- dashboard
- headline
- menu
- monthly
- orders
- products
- side
- sold
- summary
- total
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_15-22
tool_hints:
- dashboard.get
metric_ids: []
---

### Dashboard > Headline and Side Summary Cards

- **Menu Items:** Current count of menu-item records in scope, including unavailable items; excludes platters. The availability caption does not establish how many items can currently be sold.
- **Total Revenue / Total sales:** Same monthly revenue figure repeated in the headline and side card, using Shared Sales Meaning and the fixed-summary date rules below; do not add them together.
- **Total Orders:** Number of orders created since the month began, including pending, cancelled and every other status. Today and This week are subsets of those monthly orders, with the same status inclusion.
- **Total Sold Products:** Sum of order-line quantities since the month began, including menu items, platters, cancelled lines and orders of every status. A platter counts as ordered platter units, not its component portions. Counts ordered quantities, not distinct products or confirmed completed sales.
- **Display:** Monetary headline, side and best-seller figures are rounded to whole AFN; sales-chart amounts show up to two decimals. Icon rings on headline cards and the upward icon beside monthly sales are decorative, not measured percentages or evidence of growth.
