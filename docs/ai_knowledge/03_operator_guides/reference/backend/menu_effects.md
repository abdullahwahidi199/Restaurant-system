---
id: "operator_reference_backend_menu_effects"
title: "Menu — backend effects reference"
module: "menu"
description: "Static menu implementation evidence for record mutations, named effect helpers and transaction boundaries; use linked operating guides for supported UI procedures."
keywords: ["menu", "backend", "effects", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_menu_menu", "operator_modules_menu_stations", "operator_modules_production_daily_production", "operator_modules_customers_feedback"]
frontend_routes: []
source_references: ["backend/backend/menu/models.py", "backend/backend/menu/permissions.py", "backend/backend/menu/production_utils.py", "backend/backend/menu/serializers.py", "backend/backend/menu/services.py", "backend/backend/menu/signals.py", "backend/backend/menu/views.py"]
status: "source_verified"
---

# Menu — backend effects reference

Static implementation reference for `menu`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/menu/models.py`

### Category.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`
- `img.save( img_io, format="JPEG", quality=70, optimize=True )`
- `self.image.save( name, ContentFile(img_io.getvalue()), save=False )`
- `super().save(update_fields=["image"])`

### MenuItem.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`
- `img.save(img_io, format="JPEG", quality=70, optimize=True)`
- `self.image.save( name, ContentFile(img_io.getvalue()), save=False )`
- `super().save(update_fields=["image"])`

### MenuItem.mark_unavailable

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.is_available = False`
- `self.save(update_fields=["is_available"])`

### MenuItem.mark_available

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.is_available = True`
- `self.save(update_fields=["is_available"])`

### Platter.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`
- `img.save( img_io, format="JPEG", quality=70, optimize=True, )`
- `self.image.save( name, ContentFile(img_io.getvalue()), save=False, )`
- `super().save(update_fields=["image"])`

### PlatterItem.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().save(*args, **kwargs)`

## `backend/backend/menu/production_utils.py`

### create_or_replace_production

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `existing.delete()`
- `Ingredient.objects.filter(id=ingredient.id).update( quantity_available=F("quantity_available") - required )`
- `StockMovement.objects.bulk_create(movements)`
- `Production.objects.create( menu_item=menu_item, restaurant=menu_item.restaurant, branch=branch, quantity_produced=quantity, quantity_remaining=quantity, notes=notes, created_by=created_by, )`
- `menu_item.is_available = True`
- `menu_item.save(update_fields=["is_available"])`

Named effect helpers: `create_or_replace_production`.

### adjust_production

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `production.notes = notes`
- `production.save(update_fields=["notes"])`
- `Ingredient.objects.filter(id=recipe.ingredient_id).update( quantity_available=F("quantity_available") - required )`
- `StockMovement.objects.bulk_create(movements)`
- `Ingredient.objects.filter(id=recipe.ingredient_id).update( quantity_available=F("quantity_available") + refund )`
- `production.quantity_produced = new_quantity`
- `production.quantity_remaining = max(0, production.quantity_remaining + diff)`
- `production.save()`

Named effect helpers: `adjust_production`.

### consume_production

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `production.quantity_remaining -= quantity`
- `production.save(update_fields=["quantity_remaining"])`
- `menu_item.is_available = False`
- `menu_item.save(update_fields=["is_available"])`

Named effect helpers: `consume_production`.

### restore_production

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `production.quantity_remaining = min( production.quantity_produced, production.quantity_remaining + quantity )`
- `production.save(update_fields=["quantity_remaining"])`
- `menu_item.is_available = True`
- `menu_item.save(update_fields=["is_available"])`

Named effect helpers: `restore_production`.

### clear_production

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Ingredient.objects.filter(id=recipe.ingredient_id).update( quantity_available=F("quantity_available") + refund )`
- `StockMovement.objects.bulk_create(movements)`
- `production.delete()`
- `menu_item.is_available = False`
- `menu_item.save(update_fields=["is_available"])`

Named effect helpers: `clear_production`.

## `backend/backend/menu/serializers.py`

### PlatterItemSerializer.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.fields["menu_item"].queryset = scope_menu_related_queryset( MenuItem.objects.filter(restaurant=restaurant), restaurant, branch, )`

### PlatterSerializer.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.fields["category"].queryset = scope_menu_related_queryset( Category.objects.filter(restaurant=restaurant), restaurant, branch, )`
- `self.fields["items"].child.fields["menu_item"].queryset = ( scope_menu_related_queryset( MenuItem.objects.filter(restaurant=restaurant), restaurant, branch, ) )`
- `self.fields["station"].queryset = scope_menu_related_queryset( Station.objects.filter(restaurant=restaurant), restaurant, branch, )`

### PlatterSerializer.create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Platter.objects.create( **validated_data )`
- `PlatterItem.objects.create( platter=platter, **item_data )`

### PlatterSerializer.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `instance.save()`
- `instance.items.all().delete()`
- `PlatterItem.objects.create( platter=instance, **item_data )`

### ReveiwSerializer.create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().create(validated_data)`

### ReveiwSerializer.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `instance.responded_at = timezone.now()`
- `super().update(instance, validated_data)`

### MenuItemSerializer.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.fields["category"].queryset = scope_menu_related_queryset( Category.objects.filter(restaurant=restaurant), restaurant, branch, )`
- `self.fields["station"].queryset = scope_menu_related_queryset( Station.objects.filter(restaurant=restaurant), restaurant, branch, )`

### MenuItemSerializer.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(instance, validated_data)`

### MenuItemSerializer.create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().create(validated_data)`

## `backend/backend/menu/services.py`

### _normalize_category

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `obj.display_order = index`
- `obj.save(update_fields=["display_order"])`

### reorder_categories

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `category.rank = None`
- `category.save(update_fields=["rank"])`
- `category.rank = index`

### reorder_menu_entries

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `obj.category = category`
- `obj.display_order = index`
- `obj.save(update_fields=update_fields)`

Named effect helpers: `refresh_from_db`.

## `backend/backend/menu/signals.py`

### category_created_notification

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Notification.objects.create( restaurant=instance.restaurant, type="menu", message=f"New Category added: {instance.name}" )`

### category_deleted_notification

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Notification.objects.create( restaurant=instance.restaurant, type="menu", message=f"Category deleted: {instance.name}" )`

### menu_item_created_notification

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Notification.objects.create( restaurant=instance.restaurant, type="menu", message=f"New Item added to {instance.category.name}: {instance.name}" )`
- `Notification.objects.create( restaurant=instance.restaurant, type="menu", message=f"Menu item updated: {instance.name}" )`

### menu_item_deleted_notification

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Notification.objects.create( restaurant=instance.restaurant, type="menu", message=f"{instance.name} deleted from {instance.category.name if instance.category else 'Unknown'} category" )`

### Review_given_notification

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Notification.objects.create( restaurant=instance.menu_item.restaurant, branch=instance.branch, type="menu", message=f"New Review Given on {instance.menu_item}: {instance.comment}" )`

## `backend/backend/menu/views.py`

### category_list_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save( restaurant=restaurant, branch=get_menu_scope_branch(request, restaurant), )`

Named effect helpers: `record_instance_create`.

### menu_item_list_create_view

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save( restaurant=restaurant, branch=get_menu_scope_branch(request, restaurant), )`

Named effect helpers: `record_instance_create`.

### station_list_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save( restaurant=restaurant, branch=get_menu_scope_branch(request, restaurant), )`

Named effect helpers: `record_instance_create`.

### review_list_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save( restaurant=request.user.staff_profile.restaurant, branch=get_active_branch(request), )`

### send_review

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save(restaurant=restaurant, branch=branch)`

### platter_list_create_view

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save( restaurant=restaurant , branch=get_menu_scope_branch(request, restaurant), )`

Named effect helpers: `record_instance_create`.

### CategoryRetrieveDestroyView.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(request, *args, **kwargs)`

Named effect helpers: `refresh_from_db`, `record_instance_update`.

### StationRetrieveUpdateDestroyView.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(request, *args, **kwargs)`

Named effect helpers: `refresh_from_db`, `record_instance_update`.

### MenuItemRetrieveUpdateDestroyView.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(request, *args, **kwargs)`

Named effect helpers: `refresh_from_db`, `record_instance_update`.

### PlatterRetrieveUpdateDestroyView.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update( request, *args, **kwargs )`

Named effect helpers: `refresh_from_db`, `record_instance_update`.

## Related operating procedures

- [Manage categories, menu items, recipes, and platters](../../modules/menu/menu.md)
- [Configure preparation stations and kitchen assignments](../../modules/menu/stations.md)
- [Cook, adjust, clear, and inspect daily production](../../modules/production/daily_production.md)
- [Review customer feedback and respond](../../modules/customers/feedback.md)
