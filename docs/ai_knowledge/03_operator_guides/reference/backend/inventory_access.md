---
id: "operator_reference_backend_inventory_access"
title: "Inventory — backend access reference"
module: "inventory"
description: "Static inventory implementation evidence for endpoint permissions and read/write role declarations; use linked operating guides for supported UI procedures."
keywords: ["inventory", "backend", "access", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_inventory_stock", "operator_modules_inventory_transfers", "operator_modules_procurement_purchasing", "operator_modules_procurement_payments_attachments"]
frontend_routes: []
source_references: ["backend/backend/inventory/models.py", "backend/backend/inventory/serializers.py", "backend/backend/inventory/services.py", "backend/backend/inventory/utils.py", "backend/backend/inventory/views.py"]
status: "source_verified"
---

# Inventory — backend access reference

Static implementation reference for `inventory`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/inventory/views.py`

### IngredientListCreateView

`[         IsKitchenManager \| IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \| IsFinanceManager,         IsSameRestaurant,         IsRestaurantActive     ]`

### IngredientPaginatedView

`[IsRestaurantAdmin \| IsKitchenManager \| IsInventoryManager \|IsOperationsManager, IsSameRestaurant, IsRestaurantActive]`

### IngredientRetrieveUpdateDestroyView

`[IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager ,IsSameRestaurant,IsRestaurantActive]`

### MenuItemIngredientListCreateView

`[IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager , IsSameRestaurant, IsRestaurantActive]`

### MenuItemIngredientDeleteView

`[IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager, IsRestaurantActive, IsSameRestaurant]`

### StockMovementListView

`[         IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,         IsSameRestaurant,         IsRestaurantActive     ]`

### SupplierListCreateView

`[         IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,         IsSameRestaurant,         IsRestaurantActive     ]`

### SupplierRetrieveUpdateView

`[         IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,         IsSameRestaurant,         IsRestaurantActive     ]`

### ingredient_purchase_history_view

`api_view(["GET"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### purchase_invoice_list_create

`api_view(["GET", "POST"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### purchase_invoice_detail

`api_view(["GET"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### purchase_invoice_attachment_list_create

`api_view(["GET", "POST"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### purchase_invoice_attachment_download

`api_view(["GET"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### purchase_invoice_attachment_delete

`api_view(["DELETE"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### purchase_invoice_approve

`api_view(["POST"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager,     IsSameRestaurant,     IsRestaurantActive ])`

### supplier_payment_detail

`api_view(["GET"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### supplier_payment_voucher

`api_view(["GET"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,      IsSameRestaurant,     IsRestaurantActive ])`

### supplier_payment_voucher_pdf

`api_view(["GET"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### supplier_payment_list_create

`api_view(["GET", "POST"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### supplier_ledger_view

`api_view(["GET"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### stock_transfer_list_create

`api_view(["GET", "POST"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### stock_transfer_action

`api_view(["POST"])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive, ])`

### low_stock_items

`api_view(['GET'])`; `permission_classes([IsRestaurantAdmin \| IsKitchenManager \| IsInventoryManager\|IsOperationsManager,IsSameRestaurant,IsRestaurantActive])`

### add_stock_view

`api_view(['POST'])`; `permission_classes([IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,IsSameRestaurant,IsRestaurantActive])`

### edit_stock_movement_view

`api_view(['PUT'])`; `permission_classes([     IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### search_ingredient_usage_view

`api_view(['GET'])`; `permission_classes([     IsRestaurantAdmin \| IsKitchenManager \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

### adjust_stock_view

`api_view(['POST'])`; `permission_classes([IsRestaurantAdmin \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,IsSameRestaurant,IsRestaurantActive ])`

### inventory_dashboard_summary

`api_view(['GET'])`; `permission_classes([IsRestaurantAdmin \| IsKitchenManager \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,IsSameRestaurant,IsRestaurantActive])`

### inventory_pdf

`api_view(['GET'])`; `permission_classes([     IsRestaurantAdmin \| IsKitchenManager \| IsInventoryManager \|IsOperationsManager \|IsFinanceManager,     IsSameRestaurant,     IsRestaurantActive ])`

## Related operating procedures

- [Ingredients, stock levels, adjustments, and movement correction](../../modules/inventory/stock.md)
- [Request and review a cross-branch stock transfer](../../modules/inventory/transfers.md)
- [Suppliers and purchase invoices: draft, receive, and approve](../../modules/procurement/purchasing.md)
- [Pay suppliers, inspect ledgers, and manage invoice attachments](../../modules/procurement/payments_attachments.md)
