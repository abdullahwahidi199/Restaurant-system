---
id: "operator_reference_backend_restaurants_effects"
title: "Restaurants — backend effects reference"
module: "branches"
description: "Static restaurants implementation evidence for record mutations, named effect helpers and transaction boundaries; use linked operating guides for supported UI procedures."
keywords: ["restaurants", "backend", "effects", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_branches_branches", "operator_modules_settings_restaurant_branch_settings", "operator_modules_administration_platform", "operator_navigation_application_navigation"]
frontend_routes: []
source_references: ["backend/backend/restaurants/branching.py", "backend/backend/restaurants/data_migration.py", "backend/backend/restaurants/models.py", "backend/backend/restaurants/permissions.py", "backend/backend/restaurants/serializers.py", "backend/backend/restaurants/views.py"]
status: "source_verified"
---

# Restaurants — backend effects reference

Static implementation reference for `restaurants`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/restaurants/branching.py`

### get_main_branch

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `restaurant.branches.create( name="Main Branch", code=f"MAIN-{restaurant.id}", address=restaurant.address or "", phone=restaurant.phone or "", email=restaurant.email or "", is_main_branch=True, is_active=True, )`

### sync_all_branch_access_staff

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `staff.branches.set(active_branches)`
- `staff.active_branch = active_branches.first()`
- `staff.save(update_fields=["active_branch"])`

### ensure_staff_branch_assignment

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `staff.branches.set(active_branches)`
- `staff.branches.set([selected_branch])`
- `staff.branches.set(requested_branches)`
- `staff.active_branch = available_branches.first()`
- `staff.save(update_fields=["active_branch"])`

### get_active_branch

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `request.active_branch = branch`
- `staff.active_branch = branch`
- `staff.save(update_fields=["active_branch"])`

### set_active_branch

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `staff.active_branch = assigned_branch`
- `staff.save(update_fields=["active_branch"])`
- `staff.active_branch = branch`

## `backend/backend/restaurants/data_migration.py`

### BranchDataMigrationService.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.source_branch = source_branch`
- `self.destination_branch = destination_branch`
- `self.restaurant = destination_branch.restaurant`
- `self.migration_type = migration_type`
- `self.created_by = created_by`
- `self.summary = { "units": empty_step(), "ingredient_categories": empty_step(), "ingredients": empty_step(), "categories": empty_step(), "menu_items": empty_step(), "recipes": empty_step(), "platters": empty_step(), "modifiers": empty_step(), "remaining_menu_relationships": empty_step(), "inventory_stock": { **empty_step(), "copied": False, "note": ( "Inventory quantities, batches, stock movements, purchases, " "transfers, and ledger records are intentionally excluded." ), }, }`
- `self.category_map = {}`
- `self.ingredient_map = {}`
- `self.menu_item_map = {}`
- `self.platter_map = {}`

### BranchDataMigrationService.run

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `BranchDataMigrationLog.objects.create( restaurant=self.restaurant, source_branch=self.source_branch, destination_branch=self.destination_branch, migration_type=self.migration_type, created_by=self.created_by, )`
- `log.status = "failed"`
- `log.finished_at = timezone.now()`
- `log.failed_count = 1`
- `log.summary = self.summary`
- `log.error_message = str(exc)`
- `log.save( update_fields=[ "status", "finished_at", "failed_count", "summary", "error_message", ] )`
- `log.status = "completed"`
- `log.imported_count = imported`
- `log.skipped_count = skipped`
- `log.failed_count = failed`
- `log.save( update_fields=[ "status", "finished_at", "imported_count", "skipped_count", "failed_count", "summary", ] )`

### BranchDataMigrationService.migrate_categories

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Category.objects.create( restaurant=self.restaurant, branch=self.destination_branch, name=category.name, description=category.description, name_dari=category.name_dari, name_pashto=category.name_pashto, image=category.image, rank=self.next_rank(category.rank), )`

### BranchDataMigrationService.migrate_ingredients

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Ingredient.objects.create( restaurant=self.restaurant, branch=self.destination_branch, name=ingredient.name, unit=ingredient.unit, quantity_available=Decimal("0.000"), minimum_threshold=ingredient.minimum_threshold, cost_per_unit=ingredient.cost_per_unit, is_active=ingredient.is_active, )`

### BranchDataMigrationService.migrate_menu_items

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `MenuItem.objects.create( restaurant=self.restaurant, branch=self.destination_branch, name=item.name, name_dari=item.name_dari, name_pashto=item.name_pashto, description=item.description, description_dari=item.description_dari, description_pashto=item.description_pashto, price=item.price, image=item.image, is_available=item.is_available, is_manually_available=item.is_manually_available, category=target_category, uses_daily_production=item.uses_daily_production, )`

### BranchDataMigrationService.migrate_recipes

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `MenuItemIngredient.objects.get_or_create( menu_item=target_item, ingredient=target_ingredient, defaults={"quantity_required": recipe.quantity_required}, )`

### BranchDataMigrationService.migrate_platters

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Platter.objects.create( restaurant=self.restaurant, branch=self.destination_branch, name=platter.name, name_dari=platter.name_dari, name_pashto=platter.name_pashto, description=platter.description, description_dari=platter.description_dari, description_pashto=platter.description_pashto, price=platter.price, image=platter.image, is_available=platter.is_available, is_manually_available=platter.is_manually_available, category=target_category, )`
- `PlatterItem.objects.bulk_create(platter_items, batch_size=200)`

## `backend/backend/restaurants/models.py`

### build_qr_png

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `image.save(buffer, format="PNG")`

### replace_field_file

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `storage.delete(field_file.name)`
- `storage.delete(generated_name)`
- `field_file.save(file_name, content, save=False)`

### invalidate_public_restaurant_cache

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `cache.delete(f"public_restaurant_entry:{slug}")`

### Restaurant.regenerate_brand_qr_code

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Restaurant.objects.filter(pk=self.pk).update(qr_code=self.qr_code.name)`

### Restaurant.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.slug = make_unique_restaurant_slug(self.name, self.pk)`
- `super().save(*args, **kwargs)`

### Restaurant.delete

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().delete(*args, **kwargs)`

### Branch.regenerate_qr_code

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.settings = settings_data`
- `Branch.objects.filter(pk=self.pk).update( qr_code=self.qr_code.name, settings=settings_data, )`

### Branch.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.slug = make_unique_branch_slug(self.restaurant, self.name, self.pk)`
- `super().save(*args, **kwargs)`

### Branch.delete

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `staff.active_branch = replacement`
- `staff.save(update_fields=["active_branch"])`
- `super().delete(*args, **kwargs)`

## `backend/backend/restaurants/serializers.py`

### BranchSerializer.create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Branch.objects.create(restaurant=restaurant, **validated_data)`

### BranchSerializer.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(instance, validated_data)`
- `staff.active_branch = replacement`
- `staff.save(update_fields=["active_branch"])`

### SubscriptionSerializer.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(instance, validated_data)`
- `restaurant.is_active = True`
- `restaurant.is_active = False`
- `restaurant.save()`

### RestaurantSerializer.create

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Restaurant.objects.create( **validated_data, menu_mode="separate", ingredient_mode="separate", recipe_mode="separate", pricing_mode="branch", )`
- `Staff.objects.create( user=user, name=admin_name, email=admin_email, phone=admin_phone, role="Admin", restaurant=restaurant, )`
- `staff.active_branch = main_branch`
- `staff.save(update_fields=["active_branch"])`

Named effect helpers: `create_user`.

### RestaurantSerializer.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `instance.save()`

## `backend/backend/restaurants/views.py`

### restaurant_list_create

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

Named effect helpers: `record_instance_create`.

### subscription_list_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

### attach_discovery_order_counts

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `item._discovery_order_count = menu_counts.get(item.id, 0)`
- `platter._discovery_order_count = platter_counts.get(platter.id, 0)`

### attach_discovery_location_metrics

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `restaurant._discovery_distance_km = restaurant_metrics["distance_km"]`
- `restaurant._discovery_delivers_to_location = restaurant_metrics[ "delivers_to_location" ]`
- `branch._discovery_distance_km = distance_km`
- `branch._discovery_delivers_to_location = delivers_to_location`

### get_public_restaurant_or_404

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `cache.set(cache_key, restaurant, PUBLIC_RESTAURANT_CACHE_SECONDS)`

### branch_list_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

Named effect helpers: `record_instance_create`.

### active_branch_view

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `AuthSession.objects.filter( id=session_id, user=request.user, restaurant=staff.restaurant, ).exclude(branch=branch).update(branch=branch)`

### branch_detail

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`
- `branch.delete()`

Named effect helpers: `record_instance_update`, `create_audit_log`.

### active_branch_settings

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

Named effect helpers: `record_instance_update`.

### restaurant_detail

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

Named effect helpers: `record_instance_update`.

### disable_subscription

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `subscription.is_active = False`
- `subscription.save()`
- `restaurant.is_active = False`
- `restaurant.save()`

### RestaurantDetailView.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(request, *args, **kwargs)`

Named effect helpers: `refresh_from_db`, `record_instance_update`.

## Related operating procedures

- [Manage branches, public links, and configuration migration](../../modules/branches/branches.md)
- [Restaurant settings, delivery defaults, branding, and branch overrides](../../modules/settings/restaurant_branch_settings.md)
- [Platform restaurant, subscription, and login-security administration](../../modules/administration/platform.md)
- [Sign in, choose a branch, and navigate](../../navigation/application_navigation.md)
