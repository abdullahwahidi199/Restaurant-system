---
id: admin_reports_orders_cards
title: 'Finance > Reports > Orders: Cards'
module: reports
namespace: admin
status: current_observed_behavior
summary: 'Completed and Delivered orders created within the applied period, using Dashboard > Shared Sales Meaning: non-cancelled
  item value plus eligible reservation/delivery charges, less the ord...'
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- cancelled
- cards
- completed
- delivery
- finance
- food
- lost
- order
- orders
- report
- reports
- reservation
- revenue
- sales
- total
related_docs:
- admin_dashboard_sales_meaning
- admin_reports_shared_period_rules
routes: []
source_refs:
- uploaded_admin_reference:lines_423-432
tool_hints:
- reports.get
metric_ids:
- orders.successful_revenue
- orders.all_status_count
- orders.successful_count
---

### Finance > Reports > Orders: Cards

- **Successful sales basis:** Completed and Delivered orders created within the applied period, using Dashboard > Shared Sales Meaning: non-cancelled item value plus eligible reservation/delivery charges, less the order discount. Other order statuses do not contribute revenue; payment collection is not required.
- **Total Revenue:** Sum of those successful order values. The Lost subtitle instead sums current calculated values of Cancelled orders in the period; it is potential order value, not refunded money or an immutable original lost-sales value. Cancelled lines are excluded even from Lost, so a fully cancelled order can show no lost value.
- **Total Orders / Avg Value:** Total Orders counts every order status created in the period. Avg Value = successful revenue ÷ number of successful orders, or zero if none; its denominator is not Total Orders when unfinished/cancelled orders exist.
- **Completed / Cancelled:** Completed combines Completed and Delivered order counts, unlike an operations count restricted to Completed alone. Cancelled counts cancelled orders, not cancelled lines or units. Both use order creation dates and current status.
- **Food Revenue:** Total Revenue − Delivery Revenue − Reservation Revenue. Represents the discounted item portion of successful order value, not gross menu sales, profit or food-only dish categories.
- **Delivery Revenue:** Only delivery fees on successful delivery orders, after each order's percentage discount; not all revenue from delivery-type orders.
- **Reservation Revenue:** Discounted fee/prepaid reservation charges linked to successful orders; free reservations contribute zero. Uses the shared current table-rate/duration calculation, not reservation payments or standalone bookings. A reservation linked to multiple successful orders can contribute repeatedly; reservation cancellation status is not separately excluded.
