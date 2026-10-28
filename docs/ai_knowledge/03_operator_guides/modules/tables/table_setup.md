---
id: "operator_modules_tables_table_setup"
title: "Create, update, and delete dining tables"
module: "tables"
description: "Add or update a dining table’s name, capacity, hourly reservation price and free-booking setting; explains deletion effects and role/API differences."
keywords: ["tables", "create", "update", "delete", "dining", "Add Table", "table capacity", "hourly rate", "delete table"]
roles: ["Admin", "BranchAdmin", "OperationsManager"]
related_docs: ["operator_reference_backend_orders_validation", "operator_modules_orders_waiter_tables", "operator_modules_reservations_reservations", "operator_reference_interface_component_admin_tables_tablebase", "operator_reference_interface_component_admin_tables_tablesdisplaymodal", "operator_reference_interface_component_admin_tables_tableaddmodal", "operator_reference_interface_component_admin_tables_tableupdatedeletemodal", "operator_reference_backend_orders_fields", "operator_reference_backend_orders_access"]
frontend_routes: ["/admin/dashboard/tables", "/operations-manager/tables", "/inventory-manager/tables"]
source_references: ["frontend/src/component/Admin/tables/TableBase.jsx", "frontend/src/component/Admin/tables/TablesDisplayModal.jsx", "frontend/src/component/Admin/tables/TableAddModal.jsx", "frontend/src/component/Admin/tables/TableUpdateDeleteModal.jsx", "backend/backend/orders/models.py:Table", "backend/backend/orders/views.py:TableRetrieveUpdateDestroyView"]
status: "source_verified"
---

# Create, update, and delete dining tables

## Open table setup

Admin/BranchAdmin: **Operations → Tables**, `/admin/dashboard/tables`. Operations Manager: **Tables**, `/operations-manager/tables`. Inventory Manager also has `/inventory-manager/tables`, but the table API excludes InventoryManager; that route is a known access mismatch. Waiter/Manager use operational table workspaces instead of the administration page.

## Open create or edit controls

The table page displays branch table cards, status, capacity and any attached current order/reservation information. Search/filter controls only change display. **Add Table** opens the create modal. A table-card edit/details action opens `TableUpdateDeleteModal`.

## Table form fields

| Form field | Create requirement / default | Backend rule and edit effect |
|---|---|---|
| Name / Table Name | HTML required, empty | Backend name max50, blank/null allowed. Frontend **Table must have name!** is stricter. Renaming affects future table displays and related reservation labels. |
| Capacity | Required numeric, empty | Positive integer model, default4 if omitted through serializer; operator should enter true seating capacity. Reservation guest validation uses this. |
| Price Per Hour (Reservations) | Required numeric, empty | Decimal(10,2), default0 backend. Reservation charges use hourly rate rounded up by duration. Existing reservation `total_price` is computed from the table’s current rate, so rate edits can affect displayed historical/linked charges. |
| Note | Optional text | Empty/null allowed. Displayed in table details. |
| Allow Free Reservation | Checkbox, true | Determines whether reservation form can choose free. Backend rejects a free reservation when false. |
| Status | Automatic / page controls where rendered | available/occupied/unavailable. New tables default available. Order model synchronizes occupied/available on assignment/finalization. |

## Submit table creation or update

Create: fill name, capacity and hourly price, choose free-reservation setting, then **Add Table**. While posting, label **Adding...** is disabled. Success refreshes/closes through parent. Edit preloads same settings; **Update** saves and refreshes. Escape/backdrop behavior varies; the X closes without saving local changes.

## Delete a table and review dependencies

**Delete** opens browser confirmation **Are you sure you want to delete this table?**. Backend explicitly blocks reserved/arrived reservations with **Cannot delete table with active reservations.** It has no equivalent active-order guard: deleting an occupied table can detach its order (SET_NULL). It is not a way to cancel or settle an order. Review dependencies and avoid removal during active service; see the verification register. Table deletion has no restore button; related reservation relationship is CASCADE at model level, while order table is SET_NULL. Review the record before confirming.

## Correct table occupancy through the order workflow

Available/occupied is automatically maintained for orders. Do not mark an occupied table available merely to bypass duplicate-order validation. Use the existing order, allowed table move, or authorized cancellation/completion. See [waiter tables](../orders/waiter_tables.md) and [reservations](../reservations/reservations.md).

## Detailed controls, fields, and server rules

- [Table Base — controls and fields](../../reference/interface/component_admin_tables_tablebase.md)
- [Tables Display Modal — controls and fields](../../reference/interface/component_admin_tables_tablesdisplaymodal.md)
- [Table Add Modal — controls and fields](../../reference/interface/component_admin_tables_tableaddmodal.md)
- [Table Update Delete Modal — controls and fields](../../reference/interface/component_admin_tables_tableupdatedeletemodal.md)
- [Orders — backend fields reference](../../reference/backend/orders_fields.md)
- [Orders — backend validation reference](../../reference/backend/orders_validation.md)
- [Orders — backend access reference](../../reference/backend/orders_access.md)
