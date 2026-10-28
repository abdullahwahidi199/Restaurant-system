---
id: "operator_modules_orders_waiter_tables"
title: "Operate tables and correct active orders"
module: "orders"
description: "Start a dine-in order from a table, change pending quantities, cancel or add lines, move an active order, and mark ready food served; explains immediate stock effects."
keywords: ["orders", "operate", "tables", "correct", "active", "Start New Order", "Change Table", "Add Item", "Mark Served"]
roles: ["Waiter", "Manager"]
related_docs: ["operator_modules_kitchen_preparation", "operator_modules_billing_cashier", "operator_troubleshooting_verification_register", "operator_reference_interface_component_waiter_homepage", "operator_reference_interface_component_waiter_tableactionmodal", "operator_reference_interface_component_waiter_addnewitemmodal", "operator_reference_interface_component_waiter_changetablemodal", "operator_reference_interface_component_manager_tables_managertablesworkspace", "operator_reference_interface_component_manager_tables_managertableactionmodal", "operator_reference_backend_orders_fields", "operator_reference_backend_orders_validation", "operator_reference_backend_orders_access"]
frontend_routes: ["/waiter", "/manager/tables"]
source_references: ["frontend/src/component/waiter/HomePage.jsx", "frontend/src/component/waiter/TableActionModal.jsx", "frontend/src/component/waiter/AddNewItemModal.jsx", "frontend/src/component/waiter/ChangeTableModal.jsx", "frontend/src/component/Manager/tables/ManagerTablesWorkspace.jsx", "frontend/src/component/Manager/tables/ManagerTableActionModal.jsx", "backend/backend/orders/views.py:bulk_update_order_items", "backend/backend/orders/views.py:add_items_to_order", "backend/backend/orders/views.py:cancel_order_item", "backend/backend/orders/views.py:change_order_table", "backend/backend/inventory/services.py:deduct_stock_for_order"]
status: "source_verified"
---

# Operate tables and correct active orders

## Page and prerequisites

**Waiter:** `/waiter`; **Manager → Tables:** `/manager/tables`. The current table panel shows name, capacity, status, note, current order, current reservation and upcoming reservation where available. Table records and menu/production must exist in the active branch. Search/status controls filter tables; manager and waiter layouts have different presentations, so use the component reference for the exact rendered row/icon controls.

An **available** table allows **Start New Order**. An **occupied** table displays its active order and line statuses. An **unavailable** table does not offer the normal new-order action. A reservation is separate from occupied status; inspect the customer/time before seating someone.

## Current-order actions

| Label/location | Conditions and operator steps | Record effect / next step | Failure / reversal |
|---|---|---|---|
| **Start New Order**, available table detail | Select the table, open its actions, activate the button | Opens role-specific order page with table state; see order-entry form | Another active order can win the race; refresh and use the actual active order. Closing entry before submit creates nothing. |
| **Edit Order**, occupied table | Enter editing mode; use −/+ on pending lines; **Save Changes** sends quantities | Updates pending line quantities. Other line states are skipped by bulk update. | Once kitchen has approved a line it is no longer quantity-editable here. No automatic stock reconciliation for a pending quantity change is visible in this endpoint. |
| Line **×** / cancel icon | Enabled only for pending line in the waiter modal | Sends cancellation immediately; sets cancelled actor/time; line excluded from billing; can make the order ready if it was the last unfinished line | This is not merely a draft deletion waiting for Save. Cancelled lines cannot be restored through this UI; add a new line if authorized and appropriate. |
| **Add Item** | Active order; opens add-items modal; select items and quantities, then submit | Creates new pending `is_new` lines, records the adding staff and price snapshot, immediately deducts raw stock or standalone production for those lines, refreshes availability, emits updates | Finalized orders reject additions. Stock/production shortages reject or fail the request; verify the actual order before retrying. |
| **Change Table** | In the waiter modal hidden while `current_reservation` exists | Opens destination dropdown; choose another available table without current reservation; **Confirm Change** moves order, occupies new table, frees old one if no other active order | Backend checks dine-in, nonfinal status, current branch, different table and target active orders; it does not repeat every frontend reservation/availability filter. Reverse with another permitted move while active. |
| **Mark Served** | Shown when the current order is `ready` | Sets overall order `served`; cashier can settle it | No general “unserve” control. Several handlers log failures without a toast; refresh and inspect the status. |

Do not confuse cancellation of a line with cancellation of the whole order. The waiter’s legacy `deleted_items` bulk payload is not processed by the current bulk endpoint. Dedicated pending-item cancellation is the implemented line removal path. Empty/unknown line IDs and non-pending quantities can be skipped rather than raising a visible field error.

## Stock and status caveats

Initial ordinary order stock is deducted when the order first becomes `in_progress`. Adding items invokes a separate deduction immediately, including when the overall order is still pending. The initial deduction service currently iterates all order lines, including cancelled lines, and added lines are not excluded by a per-line deducted flag. Consequently, “cancel means stock restored” and “all lines deduct exactly once” are not safe promises. These are implementation discrepancies; an authorized inventory operator must review movement records before a legitimate correction. Never manually edit database balances.

Starting/approving preparation can make editing controls unavailable while a modal is open. Refresh to get the latest state. `completed`, `delivered`, and `cancelled` are terminal for ordinary order status mutation, item edits and table moves. See [preparation](../kitchen/preparation.md), [cashier](../billing/cashier.md), and [verification register](../../troubleshooting/verification_register.md).

## Detailed controls, fields, and server rules

- [Home Page — controls and fields](../../reference/interface/component_waiter_homepage.md)
- [Table Action Modal — controls and fields](../../reference/interface/component_waiter_tableactionmodal.md)
- [Add New Item Modal — controls and fields](../../reference/interface/component_waiter_addnewitemmodal.md)
- [Change Table Modal — controls and fields](../../reference/interface/component_waiter_changetablemodal.md)
- [Manager Tables Workspace — controls and fields](../../reference/interface/component_manager_tables_managertablesworkspace.md)
- [Manager Table Action Modal — controls and fields](../../reference/interface/component_manager_tables_managertableactionmodal.md)
- [Orders — backend fields reference](../../reference/backend/orders_fields.md)
- [Orders — backend validation reference](../../reference/backend/orders_validation.md)
- [Orders — backend access reference](../../reference/backend/orders_access.md)
