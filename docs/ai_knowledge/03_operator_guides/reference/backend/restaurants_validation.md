---
id: "operator_reference_backend_restaurants_validation"
title: "Restaurants — backend validation reference"
module: "branches"
description: "Static restaurants implementation evidence for server validation triggers and rejection messages; use linked operating guides for supported UI procedures."
keywords: ["restaurants", "backend", "validation", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_branches_branches", "operator_modules_settings_restaurant_branch_settings", "operator_modules_administration_platform", "operator_navigation_application_navigation"]
frontend_routes: []
source_references: ["backend/backend/restaurants/branching.py", "backend/backend/restaurants/data_migration.py", "backend/backend/restaurants/models.py", "backend/backend/restaurants/permissions.py", "backend/backend/restaurants/serializers.py", "backend/backend/restaurants/views.py"]
status: "source_verified"
---

# Restaurants — backend validation reference

Static implementation reference for `restaurants`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/restaurants/branching.py`

### ensure_branch_admin_requested_assigned_branch

| Trigger / condition | Server result or message |
|---|---|
| `requested_branch_id and ( not assigned_branch or str(requested_branch_id) != str(assigned_branch.id) )` | `PermissionDenied("Branch Admins can only access their assigned branch.")` |

### get_active_branch

| Trigger / condition | Server result or message |
|---|---|
| `not staff AND raise_exception` | `PermissionDenied("No staff profile found for this user.")` |
| `is_branch_admin(staff) AND not branch and raise_exception` | `PermissionDenied("No active branch is assigned to this user.")` |
| `branch_id AND raise_exception` | `PermissionDenied("Invalid active branch.")` |
| `branch_id AND branch and not staff.can_access_branch(branch) AND raise_exception` | `PermissionDenied("You do not have access to this branch.")` |
| `not branch and raise_exception` | `PermissionDenied("No active branch is assigned to this user.")` |

### set_active_branch

| Trigger / condition | Server result or message |
|---|---|
| `not staff` | `PermissionDenied("No staff profile found for this user.")` |
| `not staff.can_access_branch(branch)` | `PermissionDenied("You do not have access to this branch.")` |

### get_requested_branch

| Trigger / condition | Server result or message |
|---|---|
| `not staff AND raise_exception` | `PermissionDenied("No staff profile found for this user.")` |
| `is_branch_admin(staff) AND requested and requested not in ("current", "") AND requested == "all"` | `PermissionDenied( "Branch Admins cannot request all branches." )` |
| `requested and requested != "current" AND raise_exception` | `PermissionDenied("Invalid branch.")` |
| `requested and requested != "current" AND not staff.can_access_branch(branch) AND raise_exception` | `PermissionDenied("You do not have access to this branch.")` |

## `backend/backend/restaurants/data_migration.py`

### BranchDataMigrationService.__init__

| Trigger / condition | Server result or message |
|---|---|
| `migration_type not in MIGRATION_TYPES` | `ValueError("Invalid migration type.")` |
| `source_branch.restaurant_id != destination_branch.restaurant_id` | `ValueError("Source and destination branches must belong to the same restaurant.")` |
| `source_branch.id == destination_branch.id` | `ValueError("Source and destination branches must be different.")` |

## `backend/backend/restaurants/models.py`

### Branch.clean

| Trigger / condition | Server result or message |
|---|---|
| `not self.pk and not self.is_main_branch AND not subscription` | `ValidationError( "This restaurant does not have an active subscription." )` |
| `not self.pk and not self.is_main_branch AND not subscription.is_valid` | `ValidationError( "The restaurant subscription has expired." )` |
| `not self.pk and not self.is_main_branch AND current &gt;= subscription.max_branches` | `ValidationError( f"This subscription allows a maximum of {subscription.max_branches} " "branches. Please contact the system owner to upgrade the subscription." )` |
| `self.is_main_branch AND not self.is_active` | `ValidationError("Main branch must remain active.")` |
| `self.is_main_branch AND existing.exists()` | `ValidationError("A restaurant can only have one main branch.")` |

### Branch.delete

| Trigger / condition | Server result or message |
|---|---|
| `self.is_main_branch` | `ValidationError("Main branch cannot be deleted.")` |
| `self.has_operational_data()` | `ValidationError( "This branch contains operational data and cannot be deleted." )` |
| `branchless_staff.exists()` | `ValidationError( "This branch is the only assigned branch for one or more staff members." )` |

## `backend/backend/restaurants/serializers.py`

### BranchSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `is_main_branch and not is_active` | `serializers.ValidationError( {"is_active": "Main branch must remain active."} )` |
| `is_main_branch and restaurant AND existing.exists()` | `serializers.ValidationError( {"is_main_branch": "A restaurant can only have one main branch."} )` |
| `instance and instance.is_active and not is_active AND branchless_staff` | `serializers.ValidationError( { "is_active": ( "This branch is the only active branch for one or more " "staff members." ) } )` |

### RestaurantSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `User.objects.filter(username__iexact=admin_name).exists()` | `Collected validation error: errors["admin_name"] = ( "An account with this administrator username already exists. " "Choose a different username." )` |
| `Staff.objects.filter(email__iexact=admin_email).exists()` | `Collected validation error: errors["admin_email"] = ( "A staff account with this administrator email already exists." )` |
| `Staff.objects.filter(phone=admin_phone).exists()` | `Collected validation error: errors["admin_phone"] = ( "A staff account with this administrator phone number already exists." )` |
| `errors` | `serializers.ValidationError(errors)` |

### RestaurantSerializer.create

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `serializers.ValidationError( { "non_field_errors": [ "The restaurant and administrator could not be created because " "one of the account details is already in use. Refresh the page " "and choose a different administrator username, email, or phone." ] } )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `serializers.ValidationError( {"non_field_errors": list(exc.messages)} )` |

## `backend/backend/restaurants/views.py`

### restaurant_list_create

| Trigger / condition | Server result or message |
|---|---|
| `NOT (request.method == 'GET') AND request.method == 'POST'` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### subscription_list_create

| Trigger / condition | Server result or message |
|---|---|
| `NOT (request.method == 'GET') AND request.method == 'POST'` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### restaurant_discovery

| Trigger / condition | Server result or message |
|---|---|
| `coordinate_error` | `Response( {"detail": coordinate_error}, status=status.HTTP_400_BAD_REQUEST, )` |

### get_public_restaurant_or_404

| Trigger / condition | Server result or message |
|---|---|
| `not is_public_restaurant_active(restaurant)` | `NotFound("Restaurant not found")` |

### branch_context_response

| Trigger / condition | Server result or message |
|---|---|
| `not staff` | `Response( {"detail": "No restaurant assigned to this user."}, status=status.HTTP_404_NOT_FOUND, )` |

### branch_list_create

| Trigger / condition | Server result or message |
|---|---|
| `not staff` | `Response( {"detail": "No restaurant assigned to this user."}, status=status.HTTP_404_NOT_FOUND, )` |
| `not is_owner_or_admin(staff)` | `Response( {"detail": "Only restaurant owners/admins can create branches."}, status=status.HTTP_403_FORBIDDEN, )` |
| `subscription AND current_branches &gt;= subscription.max_branches` | `Response( { "detail": ( f"This subscription allows only " f"{subscription.max_branches} branches." ) }, status=status.HTTP_400_BAD_REQUEST, )` |
| `staff.is_demo` | `Response( {"detail": "Action restricted in demo mode."}, status=status.HTTP_403_FORBIDDEN, )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### active_branch_view

| Trigger / condition | Server result or message |
|---|---|
| `not staff` | `Response( {"detail": "No restaurant assigned to this user."}, status=status.HTTP_404_NOT_FOUND, )` |

### branch_detail

| Trigger / condition | Server result or message |
|---|---|
| `not staff` | `Response( {"detail": "No restaurant assigned to this user."}, status=status.HTTP_404_NOT_FOUND, )` |
| `request.method == "GET" AND not staff.can_access_branch(branch)` | `Response( {"detail": "You do not have access to this branch."}, status=status.HTTP_403_FORBIDDEN, )` |
| `not is_owner_or_admin(staff)` | `Response( {"detail": "Only restaurant owners/admins can manage branches."}, status=status.HTTP_403_FORBIDDEN, )` |
| `staff.is_demo` | `Response( {"detail": "Action restricted in demo mode."}, status=status.HTTP_403_FORBIDDEN, )` |
| `request.method in ["PATCH", "PUT"]` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"detail": exc.messages if hasattr(exc, "messages") else str(exc)}, status=status.HTTP_400_BAD_REQUEST, )` |

### branch_regenerate_qr

| Trigger / condition | Server result or message |
|---|---|
| `not staff` | `Response( {"detail": "No restaurant assigned to this user."}, status=status.HTTP_404_NOT_FOUND, )` |
| `staff.is_demo` | `Response( {"detail": "Action restricted in demo mode."}, status=status.HTTP_403_FORBIDDEN, )` |

### enterprise_settings

| Trigger / condition | Server result or message |
|---|---|
| `not staff` | `Response( {"detail": "No restaurant assigned to this user."}, status=status.HTTP_404_NOT_FOUND, )` |
| `request.method == "GET"` | `Response( { "menu_mode": "separate", "ingredient_mode": "separate", "recipe_mode": "separate", "pricing_mode": "branch", "detail": "Menu sharing has been removed. Branches use independent data.", } )` |
| `staff.is_demo` | `Response( {"detail": "Action restricted in demo mode."}, status=status.HTTP_403_FORBIDDEN, )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( { "menu_mode": "separate", "ingredient_mode": "separate", "recipe_mode": "separate", "pricing_mode": "branch", "detail": "Menu sharing has been removed. Use branch data migration instead.", } )` |

### active_branch_settings

| Trigger / condition | Server result or message |
|---|---|
| `not staff` | `Response( {"detail": "No restaurant assigned to this user."}, status=status.HTTP_404_NOT_FOUND, )` |
| `staff.is_demo` | `Response( {"detail": "Action restricted in demo mode."}, status=status.HTTP_403_FORBIDDEN, )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### branch_data_migrations

| Trigger / condition | Server result or message |
|---|---|
| `not staff` | `Response( {"detail": "No restaurant assigned to this user."}, status=status.HTTP_404_NOT_FOUND, )` |
| `not can_manage_branch_migrations(staff)` | `Response( {"detail": "You do not have permission to migrate branch data."}, status=status.HTTP_403_FORBIDDEN, )` |
| `staff.is_demo` | `Response( {"detail": "Action restricted in demo mode."}, status=status.HTTP_403_FORBIDDEN, )` |
| `not destination_branch` | `Response( {"detail": "No active destination branch is assigned to this user."}, status=status.HTTP_400_BAD_REQUEST, )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |

### branch_copy

| Trigger / condition | Server result or message |
|---|---|
| `not staff` | `Response( {"detail": "No restaurant assigned to this user."}, status=status.HTTP_404_NOT_FOUND, )` |
| `staff.is_demo` | `Response( {"detail": "Action restricted in demo mode."}, status=status.HTTP_403_FORBIDDEN, )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( { "detail": "Branch data migrated.", "migration": BranchDataMigrationLogSerializer(log).data, } )` |

### restaurant_detail

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"detail": "Restaurant not found for this user."}, status=status.HTTP_404_NOT_FOUND )` |
| `request.method == 'PATCH'` | `Response( serializer.errors, status=status.HTTP_400_BAD_REQUEST )` |

### disable_subscription

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"detail": "Restaurant and subscription disabled successfully."}, status=status.HTTP_200_OK )` |

### my_restaurant

| Trigger / condition | Server result or message |
|---|---|
| `request.user.is_superuser` | `Response( {"detail": "Superuser does not have a restaurant."}, status=403 )` |
| `not hasattr(request.user, "staff_profile") or not request.user.staff_profile.restaurant` | `Response( {"detail": "No restaurant assigned to this user."}, status=404 )` |

## Related operating procedures

- [Manage branches, public links, and configuration migration](../../modules/branches/branches.md)
- [Restaurant settings, delivery defaults, branding, and branch overrides](../../modules/settings/restaurant_branch_settings.md)
- [Platform restaurant, subscription, and login-security administration](../../modules/administration/platform.md)
- [Sign in, choose a branch, and navigate](../../navigation/application_navigation.md)
