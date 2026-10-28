---
id: "operator_workflows_reservation_to_service"
title: "Reservation: booking, arrival, dining, and closure"
module: "workflows"
description: "Connect a reserved table and optional deposit to arrival, a matching dine-in order, kitchen service and cashier closure; includes cancellation and no-show alternatives."
keywords: ["workflows", "reservation", "booking", "arrival", "dining", "closure", "booking workflow", "deposit", "reservation completion"]
roles: ["Cashier", "Manager", "Waiter", "Admin", "BranchAdmin"]
related_docs: ["operator_modules_reservations_reservations", "operator_modules_orders_waiter_tables", "operator_workflows_dine_in_to_payment"]
frontend_routes: []
source_references: ["frontend/src/component/Cashier/components/AddReservation.jsx", "frontend/src/component/Cashier/components/ReservationsList.jsx", "backend/backend/orders/seriailizers.py:ReservationSerializer", "backend/backend/orders/seriailizers.py:OrderSerializer.create", "backend/backend/orders/views.py:update_order_status"]
status: "source_verified"
---

# Reservation: booking, arrival, dining, and closure

**Start:** Cashier/Manager reservation list. **Prerequisites:** branch table/capacity/hourly rate/free-permission and actual guest/time/deposit details.

## Book, arrive, serve, and complete

1. Open add-reservation modal; select table and future start time, name, guests/duration, type and actual prepaid amount if any.
2. Review estimated end/rounded-hour charge and existing bookings; submit. Frontend/server validate; reserved record receives restaurant-level reservation number. Overlap rejection requires another time/table, not database alteration.
3. On arrival, permitted staff uses **Mark Arrived** from list or creates a matching dine-in order during the valid time window. Matching phone OR case-insensitive customer name links booking and changes reserved→arrived.
4. Waiter creates/services dine-in order; kitchen prepares; cashier reviews linked deposit. Nonfree reservation charge enters order total and deposit reduces remaining. Free reservation displays have a known calculated-total discrepancy; use actual order server total/remaining and obtain authorized review if inconsistent.
5. Print and collect actual remaining → Mark Paid. Linked/fallback matching booking becomes completed; table released through order model.

## Cancel or record no-show

**Alternative reserved outcomes:** Cancel permitted to Cashier/Manager/Admin/BranchAdmin; No Show permitted to Manager/Admin/BranchAdmin only. Arrived/completed/cancelled/no_show cannot simply be cancelled through reserved-only action. Printing reservation slip does not change status or collect a deposit. No automatic no-show or end-time closure is established, and there is no deposit-refund workflow.

## Correct a reservation or deposit mismatch

**Correction:** Before the state blocks edit, use reservation update, recheck table/time/guests/duration and save; amount recalculates. A changed table hourly rate can affect computed booking price. If a deposit failed to link, verify matching details/time/branch rather than manually changing order relationships. Escalate existing mismatched service records to authorized manager; do not invent an attach-reservation button.

See [reservations](../modules/reservations/reservations.md), [waiter tables](../modules/orders/waiter_tables.md), and [dine in to payment](dine_in_to_payment.md).
