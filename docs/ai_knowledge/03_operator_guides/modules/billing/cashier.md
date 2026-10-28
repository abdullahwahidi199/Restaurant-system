---
id: "operator_modules_billing_cashier"
title: "Cashier queue, receipts, payment completion, and delivery settlement"
module: "billing"
description: "Use the cashier queue to review bills, print receipts, record full customer payment, assign delivery staff, and confirm returned cash; printing alone does not finalize payment."
keywords: ["billing", "cashier", "queue", "receipts", "payment", "completion", "delivery", "settlement", "point of sale", "checkout", "Mark Paid", "Confirm Cash", "receipt"]
roles: ["Cashier"]
related_docs: ["operator_modules_discounts_requests", "operator_workflows_takeaway_delivery", "operator_workflows_dine_in_to_payment", "operator_troubleshooting_errors_and_recovery", "operator_reference_interface_component_cashier_cashiermanagment", "operator_reference_interface_component_cashier_components_ordercard", "operator_reference_interface_component_cashier_components_ordereditmodal", "operator_reference_interface_component_cashier_components_billprintmodal", "operator_reference_interface_component_cashier_components_deliveryassignmentmodal", "operator_reference_backend_orders_fields", "operator_reference_backend_orders_validation", "operator_reference_backend_orders_access"]
frontend_routes: ["/cashier"]
source_references: ["frontend/src/component/Cashier/CashierManagment.jsx", "frontend/src/component/Cashier/components/OrderCard.jsx", "frontend/src/component/Cashier/components/OrderEditModal.jsx", "frontend/src/component/Cashier/components/BillPrintModal.jsx", "frontend/src/component/Cashier/components/DeliveryAssignmentModal.jsx", "backend/backend/orders/views.py:cashier_orders", "backend/backend/orders/views.py:handle_order_bill_print", "backend/backend/orders/views.py:assign_delivery", "backend/backend/orders/views.py:update_order_status", "backend/backend/orders/seriailizers.py:OrderSerializer.get_remaining_total"]
status: "source_verified"
---

# Cashier queue, receipts, payment completion, and delivery settlement

## Page and queue

Cashier home `/cashier` requires `Cashier`, active restaurant and branch context. Header actions are **Reservation**, **+ TakeAway**, **+ Delivery**, **Refresh Orders**, and **Reset Filters**. Filters narrow loaded orders by the controls in `FilterBar.jsx`. The queue contains dine-in `ready`/`served`, all noncompleted/noncancelled takeaway, and delivery `ready`/`out_for_delivery`. Pending delivery orders therefore may not appear in the cashier queue even after successful entry.

Each card displays order number, type, customer/table, creator, delivery assignee, status, remaining amount and discount information. **View** opens order detail; closing it changes nothing. Cancelled lines are visibly struck through in detail/receipt and excluded from the backend total. The server amount is authoritative over a card’s client-side price estimate; existing lines use `price_at_order` snapshots.

## Receipt and settlement actions

| Exact label | Location/conditions | Steps and result | Failure/correction/reversal |
|---|---|---|---|
| **Print** | Card; absent pending/in_progress | Open preview, review amounts, print. If dine-in not served, confirm **This order is not marked as served yet.\n\nMark as served and print bill?** first. That request sets served; receipt handler records `is_printed`. | Print failure does not establish payment. Popup/printer failures need browser recovery. Receipt reprint does not reopen order or collect money. |
| **Mark Paid** | Non-delivery, nonpending/nonprogress, noncompleted; disabled until `is_printed` | After actually collecting the displayed remaining amount, activate once | Sets `completed`, receiver staff and paid time; releases table; completes matching linked/fallback reservation. Success **Payment completed**. No amount entry, partial-payment ledger, method selection or refund action exists for a customer order. |
| **Assign** / **Reassign** | Delivery card, noncompleted/noncancelled | Choose delivery staff in assignment modal; save assignment or save and open WhatsApp | Records assignee. Ready becomes out_for_delivery. Finalized orders reject reassignment. Reassignment remains available before finalization. |
| **Confirm Cash** | Delivery `out_for_delivery`, disabled until receipt printed | After cash has been returned/confirmed, activate once | Sets order `delivered` (terminal), receiver and paid time; removes it from active queue. This is settlement, not a driver location update. No partial amount entry or reversal control. |
| **Discount** / **Request Again** | No applied percent; first request or latest rejected | Opens card/manual discount tabs | Request does not itself apply a manual discount; see [requests](../discounts/requests.md). |
| **Edit** | Takeaway/delivery; not completed | Opens line editor. Change pending quantities, cancel pending lines, add lines | Does not edit customer/header data. Backend blocks finalized orders even when a stale button remains visible. |
| **Cancel** | Pending takeaway/delivery only in card | Read confirmation and confirm | Cancels entire order; no customer refund record or stock-restoration guarantee. |

Printing and payment are separate. A printed receipt can exist on an unpaid order. The code cannot confirm physical payment or successful paper output. Complete the real collection/driver cash handover before finalizing.

## Delivery assignment form

Search the delivery staff picker by name/phone. Select the correct person; current assignee is preselected where present. Backend requires a `DeliveryBoy` in the same restaurant and assigned to the order branch. **Assign Only** saves without messaging. The WhatsApp action saves first, then opens `wa.me` with the generated message; the operator completes sending externally. It requires a selected person with a phone. **Copy** copies the message if clipboard access succeeds. Escape closes; Enter activates the send/assign action when selection exists.

Exact failures include **Delivery person ID required**, **Delivery person not found**, **Please select a delivery person**, **Selected delivery person has no phone number**, and the modal’s assignment-failed alert. A failed WhatsApp popup does not undo a successful assignment. Confirm the assignee before retrying. The message builder sometimes falls back to “Item” for line names, so inspect its contents before sending.

## Reservation balance and discounts

The server combines active line subtotals, applicable fee/prepaid reservation charge, and delivery fee, then applies the order discount percentage. It subtracts linked reservation `paid_amount` from the discounted total and floors remaining at zero. Free reservation totals can still appear in reservation/payment display properties—see the reservation discrepancy register. A reservation deposit is the implemented customer prepayment mechanism; it is not a general partial order payment feature.

Approve/refresh discounts before printing and collecting the final amount. A pending manual request can currently be approved after an order is completed, changing its discount without reopening payment; existing tests preserve this behavior. There is no automatic refund/financial adjustment flow to accompany that change. Escalate that case to an authorized administrator rather than telling an operator to re-mark paid.

Errors can show **Failed to mark paid**, **Failed to mark order as served**, or generic discount errors; some delivered updates only log failures. Refresh to verify status before retrying. Finalization retries preserve the original receiver/time. See [takeaway delivery](../../workflows/takeaway_delivery.md), [dine in to payment](../../workflows/dine_in_to_payment.md), and [errors and recovery](../../troubleshooting/errors_and_recovery.md).

## Detailed controls, fields, and server rules

- [Cashier Managment — controls and fields](../../reference/interface/component_cashier_cashiermanagment.md)
- [Order Card — controls and fields](../../reference/interface/component_cashier_components_ordercard.md)
- [Order Edit Modal — controls and fields](../../reference/interface/component_cashier_components_ordereditmodal.md)
- [Bill Print Modal — controls and fields](../../reference/interface/component_cashier_components_billprintmodal.md)
- [Delivery Assignment Modal — controls and fields](../../reference/interface/component_cashier_components_deliveryassignmentmodal.md)
- [Orders — backend fields reference](../../reference/backend/orders_fields.md)
- [Orders — backend validation reference](../../reference/backend/orders_validation.md)
- [Orders — backend access reference](../../reference/backend/orders_access.md)
