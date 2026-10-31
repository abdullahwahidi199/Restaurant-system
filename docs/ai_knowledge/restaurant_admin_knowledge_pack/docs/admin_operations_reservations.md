---
id: admin_operations_reservations
title: Operations > Reservations
module: operations
namespace: admin
status: current_observed_behavior
summary: Reviews bookings, guest demand, scheduled table time and reservation charges. Start/end filters apply inclusively
  to the reservation date, not record creation, arrival or payment date; no...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- balance
- booking
- cancellation
- duration
- fees
- guests
- operations
- prepaid
- reservation
- reservations
- status
related_docs:
- admin_dashboard_sales_meaning
- admin_operations_orders
routes: []
source_refs:
- uploaded_admin_reference:lines_89-99
tool_hints:
- records.list
- records.get
- analytics.aggregate
metric_ids:
- operations.reservation_charge
---

### Operations > Reservations

- **Purpose / dates:** Reviews bookings, guest demand, scheduled table time and reservation charges. Start/end filters apply inclusively to the reservation date, not record creation, arrival or payment date; no default date/status restriction. Pagination count includes all matching bookings, not only the visible page.
- **Guests / duration:** Guests is the recorded party size, not confirmed diners. End time = start time + duration; duration is reserved time, not measured stay. Standard booking checks compare party size with table capacity and prevent overlapping reserved/arrived bookings for the same table and reservation date; adjacent time slots are allowed.
- **Statuses:** Reserved = booked; Arrived = arrival recorded; Completed = marked finished, including completion alongside a matching order; Cancelled/No show = recorded cancellation/non-attendance. Passage of time alone does not establish arrival, completion or no-show.
- **Free / Fee / Prepaid:** Free adds no reservation charge to the order; Fee and Prepaid use the shared duration/rate charge. Prepaid identifies the reservation type; the actual recorded prepayment is a separate amount and need not equal the full charge.
- **Total price / recorded amount:** Displayed Total price uses the shared duration/current-table-rate calculation, even for Free reservations. The separately recorded amount is set to zero for Free, otherwise calculated when the booking is created/edited; later table-rate changes can make it differ from displayed Total price.
- **Pre-paid amount:** Payment amount recorded against the booking, independent of a later order payment. It is not a sum of collections in the selected booking-date period.
- **Balance Due / Post-paid:** Displayed Total price minus Pre-paid amount, without a zero floor; negative means recorded prepayment exceeds this calculated charge. Completed only changes the label to Post-paid; it does not record an additional payment or clear the balance. Free bookings can show a misleading positive balance because displayed Total price ignores the free type.
- **Financial limitation:** Cancellation/no-show does not automatically refund prepayment. Displayed reservation balances and whole-order balances use different formulas; do not add them as separate debts. Reconciliation of free-booking displays and actual charges remains unresolved.
