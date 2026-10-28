---
id: "operator_reference_backend_menu_access"
title: "Menu — backend access reference"
module: "menu"
description: "Static menu implementation evidence for endpoint permissions and read/write role declarations; use linked operating guides for supported UI procedures."
keywords: ["menu", "backend", "access", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_menu_menu", "operator_modules_menu_stations", "operator_modules_production_daily_production", "operator_modules_customers_feedback"]
frontend_routes: []
source_references: ["backend/backend/menu/models.py", "backend/backend/menu/permissions.py", "backend/backend/menu/production_utils.py", "backend/backend/menu/serializers.py", "backend/backend/menu/services.py", "backend/backend/menu/signals.py", "backend/backend/menu/views.py"]
status: "source_verified"
---

# Menu — backend access reference

Static implementation reference for `menu`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/menu/views.py`

### CanReadOrManageMenu

`{         "Admin",         "BranchAdmin",         "InventoryManager",         "Manager",         "Cashier",         "Waiter",         "Kitchen_manager",         "Call_operator",         "OperationsManager"     }`; `{"Admin", "BranchAdmin", "InventoryManager","OperationsManager"}`

### CategoryRetrieveDestroyView

`[IsSameRestaurant,IsRestaurantActive,CanReadOrManageMenu]`

### StationRetrieveUpdateDestroyView

`[         IsSameRestaurant,         IsRestaurantActive,         CanReadOrManageMenu,     ]`

### MenuItemRetrieveUpdateDestroyView

`[IsSameRestaurant, IsRestaurantActive, CanReadOrManageMenu]`

### ReviewRetrieveDestroyView

`[AllowAny]`

### PlatterRetrieveUpdateDestroyView

`[         IsSameRestaurant,         IsRestaurantActive,         CanReadOrManageMenu,     ]`

### MenuPrintView

`[         IsAuthenticated,         IsSameRestaurant,         IsRestaurantActive,         CanReadOrManageMenu,     ]`

### category_list_create

`api_view(['GET', 'POST'])`; `permission_classes([IsSameRestaurant,IsRestaurantActive,CanReadOrManageMenu])`

### category_reorder

`api_view(["POST"])`; `permission_classes([IsSameRestaurant, IsRestaurantActive, CanReadOrManageMenu])`

### menu_item_list_create_view

`api_view(['GET','POST'])`; `permission_classes([IsSameRestaurant,IsRestaurantActive,CanReadOrManageMenu])`

### menu_item_reorder

`api_view(["POST"])`; `permission_classes([IsSameRestaurant, IsRestaurantActive, CanReadOrManageMenu])`

### station_list_create

`api_view(["GET", "POST"])`; `permission_classes([IsSameRestaurant, IsRestaurantActive, CanReadOrManageMenu])`

### review_list_create

`api_view(['GET', "POST"])`; `permission_classes([IsSameRestaurant,IsRestaurantActive])`

### send_review

`api_view(['GET','POST'])`; `permission_classes([AllowAny])`

### public_categories

`api_view(['GET'])`; `permission_classes([AllowAny])`

### public_menu_items

`api_view(['GET'])`; `permission_classes([AllowAny])`

### public_menu_item_detail

`api_view(['GET'])`; `permission_classes([AllowAny])`

### platter_list_create_view

`api_view(['GET', 'POST'])`; `permission_classes([     IsSameRestaurant,     IsRestaurantActive,     CanReadOrManageMenu, ])`

### public_platters

`api_view(['GET'])`; `permission_classes([AllowAny])`

### public_platter_detail

`api_view(['GET'])`; `permission_classes([AllowAny])`

### menu_item_sales

`api_view(["GET"])`; `permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive])`

### production_pdf_report

`api_view(["GET"])`; `permission_classes([     IsAuthenticated,     IsSameRestaurant,     IsRestaurantActive,     IsRestaurantAdmin \| IsKitchenManager \| IsInventoryManager \| IsOperationsManager, ])`

### production_list_create

`api_view(['GET', 'POST'])`; `permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin \| IsKitchenManager \| IsInventoryManager \| IsOperationsManager])`

### production_detail

`api_view(['PATCH', 'DELETE'])`; `permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin \| IsKitchenManager \| IsInventoryManager \| IsOperationsManager])`

## Related operating procedures

- [Manage categories, menu items, recipes, and platters](../../modules/menu/menu.md)
- [Configure preparation stations and kitchen assignments](../../modules/menu/stations.md)
- [Cook, adjust, clear, and inspect daily production](../../modules/production/daily_production.md)
- [Review customer feedback and respond](../../modules/customers/feedback.md)
