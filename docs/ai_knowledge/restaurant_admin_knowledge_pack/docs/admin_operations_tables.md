---
id: admin_operations_tables
title: Operations > Tables
module: operations
namespace: admin
status: current_observed_behavior
summary: Current seating capacity, table state, active orders and current/next bookings; not a dated occupancy or table-revenue
  report.
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- active
- capacity
- free
- occupied
- operations
- order
- reservations
- seat
- table
- tables
related_docs:
- admin_operations_reservations
- admin_operations_orders
routes: []
source_refs:
- uploaded_admin_reference:lines_79-88
tool_hints:
- records.list
- records.get
- analytics.aggregate
metric_ids: []
---

### Operations > Tables

- **Purpose:** Current seating capacity, table state, active orders and current/next bookings; not a dated occupancy or table-revenue report.
- **Tables / Seats:** Number of table records and sum of their capacities, including unavailable tables. Status-chip counts cover all loaded tables; name search and the selected chip affect visible cards, not these totals. Seats are configured capacity, not occupied guest count.
- **Available / Occupied / Unavailable:** Stored table states indicating availability, occupation or manual unavailability. An active order normally marks its table occupied; finalization releases it. These are table counts, not seat counts or utilization percentages.
- **Reserved:** Displayed whenever there is a current reservation, overriding the stored state even if occupied/unavailable. Reserved bookings are current within their start/end window; Arrived bookings are current until their end, even if their scheduled start is still ahead. Elapsed bookings can disappear from the current display without their stored status changing.
- **Next reservation:** Earliest future booking still marked reserved; it does not by itself make the table currently Reserved. End time is start plus reserved duration.
- **Active order / Items:** Most recently created order at the table in pending, in-progress, ready or served status. Only one active order is displayed, not an aggregate if duplicate assignments exist. Items counts non-cancelled order lines, not summed portions or distinct menu products. Its loaded amount follows the shared order value.
- **Amount limitation:** Some live item updates use current menu prices and omit platter values, discounts and extra charges; the table amount can temporarily differ from order details. Reconcile against refreshed order details before treating it as the payable amount.
