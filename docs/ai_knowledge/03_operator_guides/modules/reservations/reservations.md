---
id: "operator_modules_reservations_reservations"
title: "Book tables, record arrival, and handle reservations"
module: "reservations"
description: "Create or update a table reservation, record arrival, no-show or eligible cancellation, print a booking slip, and link a deposit to dine-in service."
keywords: ["reservations", "book", "tables", "record", "arrival", "handle", "table booking", "Create Reservation", "no-show", "reservation deposit"]
roles: ["Cashier", "Manager", "Admin", "BranchAdmin"]
related_docs: ["operator_workflows_reservation_to_service", "operator_modules_billing_cashier", "operator_troubleshooting_verification_register", "operator_reference_interface_component_cashier_components_reservationslist", "operator_reference_interface_component_cashier_components_addreservation", "operator_reference_interface_component_cashier_components_reservationupdateforms", "operator_reference_interface_component_cashier_components_reservationprintmodal", "operator_reference_interface_component_manager_reservations_managerreservationsbase", "operator_reference_interface_component_admin_reservations_reservationsmainpage", "operator_reference_backend_orders_fields", "operator_reference_backend_orders_validation", "operator_reference_backend_orders_access"]
frontend_routes: ["/cashier/reservations", "/manager/reservations", "/admin/dashboard/reservations"]
source_references: ["frontend/src/component/Cashier/components/ReservationsList.jsx", "frontend/src/component/Cashier/components/AddReservation.jsx", "frontend/src/component/Cashier/components/ReservationUpdateForms.jsx", "frontend/src/component/Cashier/components/ReservationPrintModal.jsx", "frontend/src/component/Manager/reservations/ManagerReservationsBase.jsx", "frontend/src/component/Admin/Reservations/ReservationsMainPage.jsx", "backend/backend/orders/models.py:Reservation", "backend/backend/orders/seriailizers.py:ReservationSerializer", "backend/backend/orders/views.py:ReservationRetrieveUpdateDestroyView", "backend/backend/orders/views.py:mark_reservation_arrived", "backend/backend/orders/views.py:mark_reservation_no_show"]
status: "source_verified"
---

# Book tables, record arrival, and handle reservations

## Pages, scope and controls

Cashier **Reservation** → `/cashier/reservations`; Manager **Reservations** → `/manager/reservations`; Admin/BranchAdmin **Operations → Reservations** → `/admin/dashboard/reservations`. These use separate lists. Search, status and date controls plus page navigation narrow the current branch. Administrator list is chiefly review/details; create is mounted in cashier and manager lists. Call_operator is allowed by create/list API but has no mounted reservation UI route.

Select **Add Reservation** / the create control shown by the list to open `AddReservation`. Select a row’s detail/edit/print controls to inspect or change an existing booking where rendered. Do not assume every portal shows all mutation controls.

## Create form

| Exact label / field | Requirement/default | Type and validation |
|---|---|---|
| Table * | Required, empty | Dropdown from current branch. Selecting table chooses free if permitted, otherwise fee, and clamps guests to capacity. |
| Customer Name | Required, empty | Text; frontend trims; backend max120. Match this name or phone during dine-in order creation to link the reservation. |
| Phone | Optional, empty | Text, backend max20, blank allowed. |
| Number of Guests | Default1 | Number; cannot exceed table.capacity; frontend max changes with table. Backend positive integer field. |
| Start Time * | Required, empty | datetime-local; frontend and backend reject past creates. Frontend derives reservation_date from its date portion; server checks consistency. |
| Reservation Date | Automatically synchronized/hidden in create | Date; API requires or derives it from start_time. It must agree with start-time date. |
| Duration (min) | Default60 | Number; custom frontend minimum30 and backend **Duration must be at least 30 minutes.** when duration is nonzero. |
| Reservation Type | Default free | Dropdown free/fee/prepaid; free only when table allows it. Fee and prepaid have rounded-hour charge. |
| Paid Amount | Shown for prepaid; default0 | Decimal(10,2). Switching away from prepaid resets it to0. Do not infer automatic card processing; this records an amount already collected. No comprehensive paid≤charge or nonnegative custom validation is defined in the serializer. |
| Notes | Optional, empty | Text area for special requests. |
| Estimated price / end time | Read-only preview | End=start+duration. Charged hours=ceiling(duration/60). Backend amount is0 for free, hourly total otherwise. |

1. Select table, enter customer/start time, guests and duration.
2. Inspect existing reservation time slots shown after table/date selection. That preview is advisory; server checks overlapping reserved/arrived bookings again.
3. Choose permitted reservation type and enter any actual prepaid amount; review rounded charge and end time.
4. Submit with **Create Reservation** in the modal footer (disabled and **Creating...** while posting). Frontend shows the first validation error as a toast and field errors; backend errors are parsed into fields/toasts. Success refreshes the parent list and closes through `onReservationSaved`.

Backend can reject date mismatch, past create, short duration, overcapacity, disallowed free booking, or overlap. Conflict text begins **⚠ Time conflict! Table ... is already booked ... Please choose a different time slot.** Select another valid time/table; do not cancel another guest’s booking without authorization.

## Edit, arrive, cancel, and no-show

Edit/update loads the existing record in `ReservationUpdateForms`; updates recalculate stored amount for current table/type/duration. Backend generic update/delete limits changes to allowed status in `ReservationRetrieveUpdateDestroyView`; see exact state errors in server reference. The server only applies the past-time create prohibition when there is no existing instance, so do not describe every edit as requiring a future start.

**Mark Arrived** is allowed to Manager/Cashier/Admin/BranchAdmin only while `reserved`; sets `arrived`, success **Customer marked as arrived**. **No Show** is server-limited to Manager/Admin/BranchAdmin, reserved only; sets `no_show`. A cashier UI control, if rendered, still cannot override that permission. **Cancel** is permitted to Manager/Cashier/Admin/BranchAdmin only while reserved; sets cancelled. Arrived reservations reject **Cannot cancel reservation now**. These actions have no general reverse buttons. Delete is a separate destructive operation, not a cancellation/refund action.

Printing opens reservation slip/browser print controls; it does not mark arrived, complete an order, or collect prepaid money. See each list’s exact action conditions in the interface reference.

## Connect reservation to service

Create a dine-in order on the reserved table during its start/end window with matching phone OR case-insensitive customer name. The server links it and marks reserved→arrived. Backend order total adds fee/prepaid charge, then the linked deposit reduces remaining payable. Mark Paid/Confirm Cash can complete the linked reservation; completion also has a fallback matching-reservation lookup. No automatic no-show timer or end-time completion job is established by inspected code.

`Reservation.total_price` always computes duration×current table price even for free reservations, although stored `amount` is0 for free and `Order.get_total` excludes the free fee. Receipt/deposit summaries can therefore differ for free bookings; verify the order’s server remaining total before collection. No automatic reservation deposit refund action exists.

Continue with [reservation to service](../../workflows/reservation_to_service.md), [cashier](../billing/cashier.md), and [verification register](../../troubleshooting/verification_register.md).

## Detailed controls, fields, and server rules

- [Reservations List — controls and fields](../../reference/interface/component_cashier_components_reservationslist.md)
- [Add Reservation — controls and fields](../../reference/interface/component_cashier_components_addreservation.md)
- [Reservation Update Forms — controls and fields](../../reference/interface/component_cashier_components_reservationupdateforms.md)
- [Reservation Print Modal — controls and fields](../../reference/interface/component_cashier_components_reservationprintmodal.md)
- [Manager Reservations Base — controls and fields](../../reference/interface/component_manager_reservations_managerreservationsbase.md)
- [Reservations Main Page — controls and fields](../../reference/interface/component_admin_reservations_reservationsmainpage.md)
- [Orders — backend fields reference](../../reference/backend/orders_fields.md)
- [Orders — backend validation reference](../../reference/backend/orders_validation.md)
- [Orders — backend access reference](../../reference/backend/orders_access.md)
