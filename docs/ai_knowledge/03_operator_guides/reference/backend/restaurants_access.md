---
id: "operator_reference_backend_restaurants_access"
title: "Restaurants — backend access reference"
module: "branches"
description: "Static restaurants implementation evidence for endpoint permissions and read/write role declarations; use linked operating guides for supported UI procedures."
keywords: ["restaurants", "backend", "access", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_branches_branches", "operator_modules_settings_restaurant_branch_settings", "operator_modules_administration_platform", "operator_navigation_application_navigation"]
frontend_routes: []
source_references: ["backend/backend/restaurants/branching.py", "backend/backend/restaurants/data_migration.py", "backend/backend/restaurants/models.py", "backend/backend/restaurants/permissions.py", "backend/backend/restaurants/serializers.py", "backend/backend/restaurants/views.py"]
status: "source_verified"
---

# Restaurants — backend access reference

Static implementation reference for `restaurants`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/restaurants/permissions.py`

### HasStaffRole

`[]`

### IsRestaurantAdmin

`["Admin", "BranchAdmin"]`

### IsRestaurantOwnerOrAdmin

`["Admin", "SuperAdmin"]`

### IsManager

`["Manager"]`

### IsInventoryManager

`["InventoryManager"]`

### IsCallOperator

`["Call_operator"]`

### IsOperationsManager

`["OperationsManager"]`

### IsFinanceManager

`["FinanceManager"]`

### IsCashier

`["Cashier"]`

### IsWaiter

`["Waiter"]`

### IsKitchenManager

`["Kitchen_manager"]`

## `backend/backend/restaurants/views.py`

### RestaurantDetailView

`[IsSuperAdmin]`

### SubscriptionDetailView

`[IsSuperAdmin]`

### restaurant_list_create

`api_view(['GET', 'POST'])`; `permission_classes([IsSuperAdmin])`

### subscription_list_create

`api_view(['GET', 'POST'])`; `permission_classes([IsSuperAdmin])`

### restaurant_discovery

`api_view(["GET"])`; `authentication_classes([])`; `permission_classes([AllowAny])`

### public_restaurant_entry

`api_view(["GET"])`; `permission_classes([AllowAny])`

### public_restaurant_branches

`api_view(["GET"])`; `permission_classes([AllowAny])`

### public_branch_detail

`api_view(["GET"])`; `permission_classes([AllowAny])`

### branch_list_create

`api_view(["GET", "POST"])`; `permission_classes([IsAuthenticated, IsRestaurantActive])`

### my_branches

`api_view(["GET"])`; `permission_classes([IsAuthenticated, IsRestaurantActive])`

### active_branch_view

`api_view(["GET", "PATCH", "POST"])`; `permission_classes([IsAuthenticated, IsRestaurantActive])`

### branch_detail

`api_view(["GET", "PATCH", "PUT", "DELETE"])`; `permission_classes([IsAuthenticated, IsRestaurantActive])`

### branch_regenerate_qr

`api_view(["POST"])`; `permission_classes([IsAuthenticated, IsRestaurantActive, IsRestaurantOwnerOrAdmin])`

### enterprise_settings

`api_view(["GET", "PATCH"])`; `permission_classes([IsAuthenticated, IsRestaurantActive, IsRestaurantOwnerOrAdmin])`

### active_branch_settings

`api_view(["GET", "PATCH"])`; `permission_classes([IsAuthenticated, IsRestaurantActive, IsRestaurantAdmin])`

### branch_data_migrations

`api_view(["GET", "POST"])`; `permission_classes([IsAuthenticated, IsRestaurantActive])`

### branch_copy

`api_view(["POST"])`; `permission_classes([IsAuthenticated, IsRestaurantActive, IsRestaurantOwnerOrAdmin])`

### restaurant_detail

`api_view(['GET', 'PATCH'])`; `permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantOwnerOrAdmin,IsRestaurantActive])`

### disable_subscription

`api_view(['POST'])`; `permission_classes([IsSuperAdmin])`

### my_restaurant

`api_view(['GET'])`; `permission_classes([IsAuthenticated])`

## Related operating procedures

- [Manage branches, public links, and configuration migration](../../modules/branches/branches.md)
- [Restaurant settings, delivery defaults, branding, and branch overrides](../../modules/settings/restaurant_branch_settings.md)
- [Platform restaurant, subscription, and login-security administration](../../modules/administration/platform.md)
- [Sign in, choose a branch, and navigate](../../navigation/application_navigation.md)
