---
id: "operator_workflows_restock_and_prepare"
title: "Restock ingredients and make menu items available for service"
module: "workflows"
description: "Receive real ingredient purchases, approve draft receipts, cook tracked production and verify menu availability before orders reach the kitchen."
keywords: ["workflows", "restock", "ingredients", "make", "menu", "items", "available", "service", "purchase to production", "inventory shortage"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager", "FinanceManager", "Kitchen_manager"]
related_docs: ["operator_modules_inventory_stock", "operator_modules_procurement_purchasing", "operator_modules_procurement_payments_attachments", "operator_modules_production_daily_production", "operator_modules_inventory_transfers"]
frontend_routes: []
source_references: ["backend/backend/inventory/services.py:create_purchase_invoice", "backend/backend/inventory/services.py:post_purchase_invoice_inventory", "backend/backend/inventory/utils.py:update_menu_item_availability", "backend/backend/menu/production_utils.py", "backend/backend/orders/models.py:Order.save"]
status: "source_verified"
---

# Restock ingredients and make menu items available for service

## Receive stock and prepare available portions

1. Authorized inventory operator opens Ingredients/Low Stock and verifies active branch, real quantity/unit, recipe and threshold. **New Ingredient** creates definition with zero stock; it does not receive supplies.
2. Permitted purchasing operator opens Procurement → Create Purchase Invoice. Select matching supplier or cash purchase, date and active branch ingredient lines, actual positive quantities and prices.
3. Choose Create Invoice to receive now, or Save Draft if not ready. Draft saves no stock/payment. Authorized approver later opens draft → Approve; posted flag prevents duplicate receiving through repeated approval.
4. Posting creates ingredient quantity increases, per-line purchase movements, updated unit costs and availability recalculations. Verify the invoice/movements/current stock before retrying after a timeout.
5. Ordinary recipe items become available when manual availability and enough ingredients/recipe conditions are satisfied. For production-tracked standalone items, raw stock alone is insufficient: kitchen/production operator opens Daily Production → cook/increment actual portions. Recipe raw stock is deducted and prepared remaining balance increases.
6. Verify station routing and menu effective availability; accept orders. Kitchen first preparation deducts ordinary recipe stock or standalone prepared portions. Shortages roll back that status operation; check both raw and production balances.
7. Pay supplier separately or with initial recorded payment; print voucher if required. Paying does not receive the same stock again.

## Correct counts and recover safely

If actual counted stock differs, use authorized signed Adjust Stock, creating an audit movement. Do not enter a fake purchase or cook portions that do not exist merely to enable menu availability. If branch configuration must be copied, migrate definitions first; copied definitions start with zero stock. A transfer is another approval workflow with known nontransactional failure risks, not a purchase.

There is no general posted-invoice void/refund or production clear undo. Preserve invoice/movement evidence and use a manager-approved supported correction. See [stock](../modules/inventory/stock.md), [purchasing](../modules/procurement/purchasing.md), [payments attachments](../modules/procurement/payments_attachments.md), [daily production](../modules/production/daily_production.md), and [transfers](../modules/inventory/transfers.md).
