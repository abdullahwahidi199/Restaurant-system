---
id: admin_dashboard_sales_meaning
title: Dashboard > Shared Sales Meaning
module: dashboard
namespace: admin
status: current_observed_behavior
summary: Value of orders currently marked completed or delivered, attributed to order creation date, regardless of payment
  date or recorded collection. All other order statuses are excluded; histo...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- cancellation
- collection
- counts
- dashboard
- discount
- fee
- meaning
- order
- paid
- prices
- profit
- reservation
- revenue
- sales
- shared
- tax
- total
- unpaid
- value
- vs
- what
related_docs:
- admin_operations_orders
- admin_operations_reservations
- admin_reports_orders_cards
- admin_reports_finance_profit_cost
routes: []
source_refs:
- uploaded_admin_reference:lines_7-14
tool_hints:
- dashboard.get
metric_ids:
- orders.successful_revenue
- operations.reservation_charge
---

### Dashboard > Shared Sales Meaning

- **Revenue / sales:** Value of orders currently marked completed or delivered, attributed to order creation date, regardless of payment date or recorded collection. All other order statuses are excluded; historical totals can change after status, discount or charge changes.
- **Order value:** Sum of non-cancelled line quantities × recorded order-time prices, plus delivery fee for delivery orders and the linked fee/prepaid reservation charge; then apply the order discount percentage to the entire subtotal. Menu items and platters are included; older lines without recorded prices use current menu/platter prices.
- **Reservation charge:** Reserved duration rounded up to whole hours × current table hourly rate, rather than the recorded reservation amount; zero duration gives zero. Free reservations add nothing. Reservation payments are not subtracted; a linked charge is included on each qualifying order without reservation-status filtering.
- **Adjustments:** No separate tax, service charge, refund or payment adjustment is applied; the stored discount amount is not an additional deduction.
- **Interpretation:** These are operational order values, not verified cash collections or profit. The dashboard does not establish expenses, supplier payments, outstanding liabilities or net profit.
