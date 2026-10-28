---
id: "operator_modules_inventory_transfers"
title: "Request and review a cross-branch stock transfer"
module: "inventory"
description: "Request a pending transfer between branches, approve or reject it, and review source/destination stock effects and partial-failure recovery restrictions."
keywords: ["inventory", "request", "review", "cross", "branch", "stock", "transfer", "stock transfer", "transfer approval", "source branch", "destination branch"]
roles: ["Admin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_troubleshooting_verification_register", "operator_modules_branches_branches", "operator_reference_interface_component_admin_inventory_inventorydashboard", "operator_reference_interface_component_admin_inventory_stocktransferpanel", "operator_reference_backend_inventory_fields", "operator_reference_backend_inventory_validation", "operator_reference_backend_inventory_access"]
frontend_routes: []
source_references: ["frontend/src/component/Admin/Inventory/InventoryDashboard.jsx", "frontend/src/component/Admin/Inventory/StockTransferPanel.jsx", "backend/backend/inventory/serializers.py:StockTransferSerializer", "backend/backend/inventory/views.py:stock_transfer_list_create", "backend/backend/inventory/views.py:stock_transfer_action"]
status: "source_verified"
---

# Request and review a cross-branch stock transfer

## Open the transfer panel and check access

The **Stock Transfers** panel is mounted inside InventoryDashboard. It is hidden for BranchAdmin, and the API explicitly returns **Branch Admins cannot perform cross-branch transfers.** for that role. Endpoint roles include Admin, InventoryManager, OperationsManager and FinanceManager, but FinanceManager has no inventory portal route. A user must still have restaurant/branch scope accepted by the endpoint.

## Request, approve, or reject a transfer

1. Select the source branch as active branch before requesting. Refresh transfers to load current data.
2. In the transfer panel choose source **Ingredient**, different destination **Branch**, positive **Quantity**, and optional **Notes**; **Request Transfer** submits. The required selectors/quantity are enforced in UI; backend checks different branches, positive quantity and source-ingredient ownership.
3. A request creates a pending StockTransfer and log; requesting alone does not move stock.
4. On a pending row, authorized operator uses **Approve** or **Reject**. These are disabled while saving. The UI does not expose every backend action; backend `cancel` support is not a documented Cancel button.
5. Approve subtracts quantity from source ingredient, finds/creates destination ingredient by name when source is branch-owned, adds destination quantity, writes transfer_out/transfer_in movements, sets approved actor/time, appends transfer/audit logs and recalculates availability. Reject changes status/logs without moving stock.

Only pending transfers can change: **Only pending transfers can be changed.** A completed transfer has no direct undo. Correct a mistaken approved transfer through a separately authorized reverse transfer after reviewing actual quantities and both branches.

## Recover from a transfer failure

The approval function does not wrap both stock mutations and movement creation in a transaction. Destination lookup/stock errors can therefore leave partial changes; do not promise automatic rollback for every failure. After any transfer failure, stop repeated approval, have an authorized inventory administrator inspect both branch balances and movement records, and use supported corrective records only. This limitation is listed in [verification register](../../troubleshooting/verification_register.md).

Form errors use detail or **Could not create transfer. / Could not update transfer.** If ingredient/branch options are missing, verify active branch and assignments; never substitute another branch just to submit. Configuration migration does not move stock: [branches](../branches/branches.md).

## Detailed controls, fields, and server rules

- [Inventory Dashboard — controls and fields](../../reference/interface/component_admin_inventory_inventorydashboard.md)
- [Stock Transfer Panel — controls and fields](../../reference/interface/component_admin_inventory_stocktransferpanel.md)
- [Inventory — backend fields reference](../../reference/backend/inventory_fields.md)
- [Inventory — backend validation reference](../../reference/backend/inventory_validation.md)
- [Inventory — backend access reference](../../reference/backend/inventory_access.md)
