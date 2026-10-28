---
id: "operator_reference_backend_menu_validation"
title: "Menu — backend validation reference"
module: "menu"
description: "Static menu implementation evidence for server validation triggers and rejection messages; use linked operating guides for supported UI procedures."
keywords: ["menu", "backend", "validation", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_menu_menu", "operator_modules_menu_stations", "operator_modules_production_daily_production", "operator_modules_customers_feedback"]
frontend_routes: []
source_references: ["backend/backend/menu/models.py", "backend/backend/menu/permissions.py", "backend/backend/menu/production_utils.py", "backend/backend/menu/serializers.py", "backend/backend/menu/services.py", "backend/backend/menu/signals.py", "backend/backend/menu/views.py"]
status: "source_verified"
---

# Menu — backend validation reference

Static implementation reference for `menu`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/menu/production_utils.py`

### _locked_recipe_ingredient

| Trigger / condition | Server result or message |
|---|---|
| `branch and ingredient.branch_id and ingredient.branch_id != branch.id` | `ValueError("Ingredient stock belongs to another branch.")` |

### create_or_replace_production

| Trigger / condition | Server result or message |
|---|---|
| `not menu_item.uses_daily_production` | `ValueError(f"{menu_item.name} does not use production tracking.")` |
| `not branch` | `ValueError("An active branch is required for production.")` |
| `quantity &lt;= 0` | `ValueError("Quantity must be positive.")` |
| `insufficient` | `ValueError(f"Insufficient stock: {', '.join(insufficient)}")` |

### adjust_production

| Trigger / condition | Server result or message |
|---|---|
| `new_quantity &lt; 0` | `ValueError("Quantity cannot be negative.")` |
| `diff &gt; 0 AND insufficient` | `ValueError(f"Insufficient stock for: {', '.join(insufficient)}")` |

### consume_production

| Trigger / condition | Server result or message |
|---|---|
| `not branch` | `ValueError("An active branch is required for production.")` |
| `not production` | `ValueError( f"Insufficient production for: {menu_item.name} " f"(required {quantity} portion(s), available 0 portion(s), " f"shortage {quantity} portion(s); no active production batch)" )` |
| `production.quantity_remaining &lt; quantity` | `ValueError( f"Insufficient production for: {menu_item.name} " f"(required {quantity} portion(s), " f"available {production.quantity_remaining} portion(s), " f"shortage {shortage} portion(s))" )` |

### increment_production

| Trigger / condition | Server result or message |
|---|---|
| `not menu_item.uses_daily_production` | `ValueError(f"{menu_item.name} does not use production tracking.")` |
| `not branch` | `ValueError("An active branch is required for production.")` |
| `quantity &lt;= 0` | `ValueError("Quantity must be positive.")` |

### decrement_production

| Trigger / condition | Server result or message |
|---|---|
| `not menu_item.uses_daily_production` | `ValueError(f"{menu_item.name} does not use production tracking.")` |
| `not branch` | `ValueError("An active branch is required for production.")` |
| `quantity &lt;= 0` | `ValueError("Quantity must be positive.")` |
| `not existing` | `ValueError(f"No active production for {menu_item.name}")` |
| `new_qty &lt; sold` | `ValueError( f"Cannot reduce below {sold} — that many have already been sold." )` |

## `backend/backend/menu/serializers.py`

### PlatterItemSerializer.validate_quantity

| Trigger / condition | Server result or message |
|---|---|
| `value &lt;= Decimal('0')` | `serializers.ValidationError("Quantity must be greater than zero.")` |

### PlatterSerializer.to_internal_value

| Trigger / condition | Server result or message |
|---|---|
| `isinstance(items, str)` | `serializers.ValidationError({ "items": "Invalid JSON format." })` |

### PlatterSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `not items` | `serializers.ValidationError({ "items": "This field is required." })` |
| `len(items) == 0` | `serializers.ValidationError({ "items": "Platter must contain at least one item." })` |

### PlatterSerializer.validate_items

| Trigger / condition | Server result or message |
|---|---|
| `len(value) == 0` | `serializers.ValidationError( "Platter must contain at least one item." )` |

### ReveiwSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `delivery and menu_item and delivery.restaurant_id != menu_item.restaurant_id` | `serializers.ValidationError( {"menu_item": "This item belongs to another restaurant."} )` |

## `backend/backend/menu/services.py`

### reorder_categories

| Trigger / condition | Server result or message |
|---|---|
| `not isinstance(ordered_ids, list) or not ordered_ids` | `serializers.ValidationError({"categories": "A non-empty list is required."})` |
| `len(ordered_ids) != len(set(ordered_ids))` | `serializers.ValidationError({"categories": "Duplicate category IDs are not allowed."})` |
| `len(categories) != len(ordered_ids)` | `serializers.ValidationError({"categories": "Invalid or unauthorized category ID."})` |

### reorder_menu_entries

| Trigger / condition | Server result or message |
|---|---|
| `not isinstance(entries, list) or not entries` | `serializers.ValidationError({"items": "A non-empty list is required."})` |
| `not model or not entry_id` | `serializers.ValidationError({"items": "Each item needs id and type."})` |
| `key in seen` | `serializers.ValidationError({"items": "Duplicate menu entry IDs are not allowed."})` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `serializers.ValidationError({"items": "Invalid or unauthorized menu entry."})` |
| `obj.category_id not in {category.id, getattr(source_category, "id", None)}` | `serializers.ValidationError({"items": "Menu entries must belong to the affected category."})` |
| `category.branch_id and obj.branch_id and obj.branch_id != category.branch_id` | `serializers.ValidationError({"items": "Cannot move entries across branches."})` |
| `missing` | `serializers.ValidationError({"items": "Send the complete canonical order for the target category."})` |

## `backend/backend/menu/views.py`

### get_public_menu_context

| Trigger / condition | Server result or message |
|---|---|
| `not is_restaurant_active(restaurant)` | `NotFound("Restaurant not found")` |
| `not branch` | `NotFound("Branch not found")` |

### category_list_create

| Trigger / condition | Server result or message |
|---|---|
| `NOT (request.method == 'GET') AND request.method == 'POST' AND request.user.staff_profile.is_demo` | `Response({"detail":"Action is restricted in demo mode"},status=403)` |
| `NOT (request.method == 'GET') AND request.method == 'POST'` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### category_reorder

| Trigger / condition | Server result or message |
|---|---|
| `staff.is_demo` | `Response({"detail": "Action is restricted in demo mode"}, status=403)` |

### menu_item_list_create_view

| Trigger / condition | Server result or message |
|---|---|
| `NOT (request.method=="GET") AND request.method=="POST" AND request.user.staff_profile.is_demo` | `Response({"detail":"Action is restricted in demo mode"},status=403)` |
| `NOT (request.method=="GET") AND request.method=="POST"` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### menu_item_reorder

| Trigger / condition | Server result or message |
|---|---|
| `staff.is_demo` | `Response({"detail": "Action is restricted in demo mode"}, status=403)` |

### station_list_create

| Trigger / condition | Server result or message |
|---|---|
| `request.method == "POST" AND staff.is_demo` | `Response( {"detail": "Action is restricted in demo mode"}, status=status.HTTP_403_FORBIDDEN, )` |
| `request.method == "POST"` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### review_list_create

| Trigger / condition | Server result or message |
|---|---|
| `NOT (request.method == "GET") AND request.method == "POST"` | `Response(serializer.errors, status=400)` |

### send_review

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response(serializer.errors, status=400)` |

### platter_list_create_view

| Trigger / condition | Server result or message |
|---|---|
| `NOT (request.method == "GET") AND request.method == "POST" AND request.user.staff_profile.is_demo` | `Response( { "detail": "Action is restricted in demo mode" }, status=403 )` |
| `NOT (request.method == "GET") AND request.method == "POST"` | `Response( serializer.errors, status=status.HTTP_400_BAD_REQUEST )` |

### menu_item_sales

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"error": str(exc)}, status=400)` |

### production_list_create

| Trigger / condition | Server result or message |
|---|---|
| `not restaurant` | `Response({"error": "No restaurant"}, status=403)` |
| `not menu_item_id or quantity is None` | `Response({'error': 'menu_item and quantity are required'}, status=400)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({'error': 'Menu item not found'}, status=404)` |
| `NOT (action == 'set') AND NOT (action == 'increment') AND NOT (action == 'decrement')` | `Response({'error': f'Invalid action: {action}'}, status=400)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({'error': str(e)}, status=400)` |

### production_detail

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({'error': 'Not found'}, status=404)` |
| `request.method == 'PATCH'` | `Response({'error': str(e)}, status=400)` |

### CategoryRetrieveDestroyView.update

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response({'detail': 'Action restricted in demo mode.'}, status=403)` |

### CategoryRetrieveDestroyView.destroy

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response({'detail': 'Action restricted in demo mode.'}, status=403)` |

### StationRetrieveUpdateDestroyView.update

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response( {"detail": "Action restricted in demo mode."}, status=status.HTTP_403_FORBIDDEN, )` |

### StationRetrieveUpdateDestroyView.destroy

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response( {"detail": "Action restricted in demo mode."}, status=status.HTTP_403_FORBIDDEN, )` |

### MenuItemRetrieveUpdateDestroyView.update

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response( {'detail': 'Action restricted in demo mode.'}, status=403 )` |

### MenuItemRetrieveUpdateDestroyView.destroy

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response({'detail': 'Action restricted in demo mode.'}, status=403)` |

### PlatterRetrieveUpdateDestroyView.update

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response( { 'detail': 'Action restricted in demo mode.' }, status=403 )` |

### PlatterRetrieveUpdateDestroyView.destroy

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response( { 'detail': 'Action restricted in demo mode.' }, status=403 )` |

## Related operating procedures

- [Manage categories, menu items, recipes, and platters](../../modules/menu/menu.md)
- [Configure preparation stations and kitchen assignments](../../modules/menu/stations.md)
- [Cook, adjust, clear, and inspect daily production](../../modules/production/daily_production.md)
- [Review customer feedback and respond](../../modules/customers/feedback.md)
