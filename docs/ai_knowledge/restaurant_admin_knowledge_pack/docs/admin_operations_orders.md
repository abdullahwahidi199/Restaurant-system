---
id: admin_operations_orders
title: Operations > Orders
module: operations
namespace: admin
status: current_observed_behavior
summary: Reviews dine-in, takeaway and delivery orders, their service progress, current charges and recorded payment
  information.
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- balance
- by
- delivery
- dine-in
- due
- operations
- order
- orders
- payment
- preparation
- received
- statuses
- takeaway
- timing
related_docs:
- admin_dashboard_sales_meaning
- admin_operations_reservations
- admin_reports_orders_cards
routes: []
source_refs:
- uploaded_admin_reference:lines_68-78
tool_hints:
- records.list
- records.get
- analytics.aggregate
metric_ids:
- orders.all_status_count
---

### Operations > Orders

- **Purpose:** Reviews dine-in, takeaway and delivery orders, their service progress, current charges and recorded payment information.
- **Period:** Defaults to Today. Today/Yesterday use Kabul calendar dates; Last 7 days includes today plus six preceding days; This month runs from the first through today; All time removes the date restriction. Custom boundaries are inclusive and filter order creation date, not payment or completion date; future end dates are disallowed.
- **Total Orders / Pending / Completed:** Counts for the selected branch and period before search/status filtering or pagination. Total includes every status; Pending counts only pending; Completed counts only completed, excluding delivered. Pending plus Completed need not equal Total. Search/status filters narrow the rows and pagination count, not these three cards.
- **Statuses:** Pending = awaiting preparation; In progress = preparation started; Ready = kitchen work ready; Served = dine-in served; Picked up = takeaway handoff; Out for delivery = delivery in transit; Completed/Delivered = finalized orders; Cancelled = cancelled record. Service progress alone does not establish collection.
- **Total / line subtotal:** Total follows the shared order-value calculation for any listed status, including cancelled orders; it is not automatically reportable sales. A line subtotal is quantity × recorded order price, with the legacy current-price fallback; cancelled lines remain visible but are excluded from Total. Delivery fee and applied discount percentage appear separately in details.
- **Balance Due / Post-paid:** max(Total − linked reservation prepayment, 0), displayed only when positive. The same figure is relabelled Post-paid for completed orders; it is not reduced by a separately recorded order payment and may remain positive after completion. The reservation-payment panel uses the reservation balance described below, not this whole-order balance.
- **Received by / Paid at:** Staff identity and timestamp recorded on completion/delivery. Bill printing alone does not record payment. “Not paid yet” is shown when the receiver's displayed full name is missing, which can also reflect an unnamed staff account; it is not conclusive payment evidence.
- **Preparation time:** Rounded minutes between the first recorded preparation start and ready time; absent until both exist. Excludes time awaiting preparation and delivery time.
