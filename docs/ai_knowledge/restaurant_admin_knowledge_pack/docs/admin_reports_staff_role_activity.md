---
id: admin_reports_staff_role_activity
title: 'Finance > Reports > Staff Performance: Role Activity Tables'
module: reports
namespace: admin
status: current_observed_behavior
summary: Lists current Waiter-role profiles, including inactive/zero-activity staff. Orders Handled counts distinct period-created
  dine-in orders attributed to their creator, including unfinished/...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- activity
- cash
- cashier
- delivery
- driver
- finance
- handled
- performance
- reports
- revenue
- role
- staff
- tables
- waiter
related_docs:
- admin_operations_orders
- admin_reports_orders_cards
routes: []
source_refs:
- uploaded_admin_reference:lines_516-523
tool_hints:
- reports.get
metric_ids:
- staff.cashier_cash_handled_estimate
---

### Finance > Reports > Staff Performance: Role Activity Tables

- **Waiter Performance:** Lists current Waiter-role profiles, including inactive/zero-activity staff. Orders Handled counts distinct period-created dine-in orders attributed to their creator, including unfinished/cancelled orders; Completed Orders counts Completed only, not Delivered. Revenue sums gross line value only for line statuses Pending, Ready, Served or Completed on those orders, with stored-price/current-price fallback. In-progress and other line statuses are excluded, but a cancelled order with eligible lines can still contribute. No discounts, reservation/delivery charges or receipt verification; not the restaurant's successful net sales.
- **Delivery Performance:** Lists current Delivery Boy profiles. Both Deliveries Handled and Delivered count only Delivered delivery orders assigned to that employee, so the two counts currently coincide; they do not measure assignment count or success rate. Revenue uses those orders' full discounted shared order value, not only delivery fees. Creation date, not delivery-completion date, controls inclusion.
- **Cashier Performance:** Lists current Cashier profiles. Reservations counts non-cancelled bookings created by that cashier in the period. Orders Paid counts Completed/Delivered orders received by that cashier and created in the period, rather than payment transactions dated in it.
- **Total Cash Handled:** Current paid amounts on the included non-cancelled bookings, plus estimated settlement on the included received orders. Order settlement = max((non-cancelled item value + non-cancelled stored reservation amount + eligible delivery fee) × (1 − discount%) − prepaid reservation paid amount, 0). Uses the stored reservation amount here, not the shared table-rate charge. This is an attributed estimate, not reconciled till cash, payment-date collections or a cash-only method total; later booking payments can change a historical creation-date report.
- **Comparison / PDF Top Performers:** Role revenues use different rules and can describe the same underlying order; they must not be summed as extra business revenue or treated as equivalent productivity scores. The PDF ranks up to ten active-in-the-report waiter/delivery/cashier rows by their role-specific revenue/cash-handled figure, then order count; this does not establish profit contribution or an objectively comparable staff ranking.
