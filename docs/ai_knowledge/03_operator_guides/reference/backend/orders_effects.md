---
id: "operator_reference_backend_orders_effects"
title: "Orders — backend effects reference"
module: "orders"
description: "Static orders implementation evidence for record mutations, named effect helpers and transaction boundaries; use linked operating guides for supported UI procedures."
keywords: ["orders", "backend", "effects", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_orders_order_lists", "operator_forms_order_entry", "operator_modules_billing_cashier", "operator_modules_reservations_reservations", "operator_modules_discounts_requests"]
frontend_routes: []
source_references: ["backend/backend/orders/models.py", "backend/backend/orders/seriailizers.py", "backend/backend/orders/signals.py", "backend/backend/orders/views.py"]
status: "source_verified"
---

# Orders — backend effects reference

Static implementation reference for `orders`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/orders/models.py`

### Reservation.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.reservation_number = (last_reservation or 0) + 1`
- `super().save(*args, **kwargs)`

### Order.save

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.order_number = (last_order or 0) + 1`
- `self.preparation_start = timezone.now()`
- `self.preparation_end = timezone.now()`
- `self.table.status = 'occupied'`
- `self.table.status = 'available'`
- `super().save(*args, **kwargs)`
- `self.table.save(update_fields=['status'])`
- `self.stock_deducted = True`
- `super().save(update_fields=['stock_deducted'])`

Named effect helpers: `deduct_stock_for_order`.

### OrderItem.save

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.price_at_order = self.menu_item.get_effective_price(branch)`
- `self.price_at_order = self.platter.get_effective_price(branch)`
- `super().save(*args, **kwargs)`

## `backend/backend/orders/seriailizers.py`

### OrderItemSerializer.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.fields["menu_item"].queryset = scope_order_menu_queryset( MenuItem.objects.filter(restaurant=restaurant), restaurant, branch, )`
- `self.fields["platter"].queryset = scope_order_menu_queryset( Platter.objects.filter(restaurant=restaurant), restaurant, branch, )`

### ReservationSerializer.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.fields["table"].queryset = tables`

### ReservationSerializer.create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().create(validated_data)`

### ReservationSerializer.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(instance, validated_data)`

### OrderSerializer.__init__

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `self.fields["table"].queryset = tables`
- `self.fields["delivery_boy"].queryset = delivery_staff`
- `self.fields["items"].child.fields["menu_item"].queryset = menu_items`
- `self.fields["items"].child.fields["platter"].queryset = platters`

### OrderSerializer.create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `reservation.status = "arrived"`
- `reservation.save(update_fields=["status"])`
- `Order.objects.create(**validated_data)`
- `OrderItem.objects.create(order=order, **item)`

## `backend/backend/orders/signals.py`

### order_created_notification

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `Notification.objects.create( restaurant=instance.restaurant, branch=instance.branch, type="order", message=f"New order placed by {instance.name}" )`

## `backend/backend/orders/views.py`

### save_order_change

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `order._change_source = source`
- `order._change_actor_id = getattr(getattr(request, "user", None), "pk", None)`
- `request._order_change_request_id = request_id`
- `order._change_request_id = request_id`
- `order.save()`
- `order.save(update_fields=fields)`

Named effect helpers: `save_order_change`.

### order_status_conflict_response

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `payload.update( { "error_code": "insufficient_stock", "message": message, } )`
- `payload.update( { "error_code": "insufficient_production", "message": message, } )`

### discount_cards

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save( restaurant=restaurant, branch=branch, )`

### discount_card_actions

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`
- `card.delete()`

### apply_discount_card

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `order.discount_percent = card.discount_percentage`
- `order.discount_card = card`
- `card.used_count += 1`
- `card.save(update_fields=["used_count"])`

Named effect helpers: `save_order_change`.

### order_list_create

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save( restaurant=restaurant, branch=branch, created_by=staff )`

### change_order_table

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `order.table = new_table`
- `old_table.status = "available"`
- `old_table.save(update_fields=["status"])`

Named effect helpers: `save_order_change`.

### reservation_list_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save( restaurant=restaurant, branch=branch, created_by=request.user.staff_profile )`

Named effect helpers: `record_instance_create`.

### create_online_order

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save(restaurant=restaurant, branch=branch)`

Named effect helpers: `create_online_order`.

### mark_items_printed_to_kitchen

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `order.items.filter( is_printed_to_kitchen=False ).update( is_printed_to_kitchen=True )`

Named effect helpers: `save_order_change`.

### cancel_order

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `order.status = "cancelled"`

Named effect helpers: `save_order_change`.

### cancel_online_order

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `order.status = "cancelled"`

Named effect helpers: `save_order_change`.

### update_order_status

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `target_items.filter(status="pending").update(status="approved")`
- `order.status = "in_progress"`
- `target_items.filter(status__in=["pending", "approved"]).update(status="ready")`
- `order.status = "ready"`
- `order.status = new_status`
- `order.received_by = staff`
- `order.paid_at = timezone.now()`
- `reservation.status = "completed"`
- `reservation.save(update_fields=["status"])`

Named effect helpers: `save_order_change`.

### add_items_to_order

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `OrderItem.objects.bulk_create(order_items_to_create)`

Named effect helpers: `deduct_batch_stock_for_order_items`, `recalc_batch_menu_availability`, `save_order_change`, `broadcast_order_item_update`, `broadcast_table_items_update`.

### update_order_item_status

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `item.status = new_status`
- `item.save(update_fields=["status"])`
- `order.status = order_status_from_items(order)`

Named effect helpers: `save_order_change`.

### table_list_create

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save(restaurant=restaurant, branch=branch)`

Named effect helpers: `record_instance_create`.

### assign_delivery

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `order.delivery_boy = delivery_boy`
- `order.status = "out_for_delivery"`

Named effect helpers: `save_order_change`.

### handle_order_bill_print

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `order.is_printed = True`

Named effect helpers: `save_order_change`.

### mark_reservation_arrived

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `reservation.status = "arrived"`
- `reservation.save(update_fields=["status"])`

### mark_reservation_no_show

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `reservation.status = "no_show"`
- `reservation.save(update_fields=["status"])`

Named effect helpers: `record_instance_update`.

### cancel_reservation

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `reservation.status="cancelled"`
- `reservation.save(update_fields=["status"])`

Named effect helpers: `record_instance_update`.

### bulk_update_order_items

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `item.quantity = i["quantity"]`
- `item.save(update_fields=["quantity"])`
- `order.status = "ready"`

Named effect helpers: `save_order_change`.

### cancel_order_item

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `item.status = "cancelled"`
- `item.cancelled_by = request.user.staff_profile`
- `item.cancelled_at = timezone.now()`
- `item.save(update_fields=["status","cancelled_by","cancelled_at"])`
- `order.status = order_status_from_items(order)`

Named effect helpers: `save_order_change`.

### request_discount

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `DiscountRequest.objects.create( order=order, requested_by=request.user.staff_profile, discount_percent=percent, reason=reason )`

Named effect helpers: `save_order_change`.

### approve_discount_or_reject

Transaction evidence: explicit atomic decorator/block in this symbol.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `discount.status = "rejected"`
- `discount.approved_by = staff`
- `discount.approved_at = timezone.now()`
- `discount.save(update_fields=["status", "approved_by", "approved_at"])`
- `discount.status = "approved"`
- `order.discount_percent = discount.discount_percent`

Named effect helpers: `approve_discount_or_reject`, `save_order_change`.

### ReservationRetrieveUpdateDestroyView.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(request, *args, **kwargs)`

Named effect helpers: `refresh_from_db`, `record_instance_update`.

### TableRetrieveUpdateDestroyView.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(request, *args, **kwargs)`

Named effect helpers: `refresh_from_db`, `record_instance_update`.

### TableRetrieveUpdateDestroyView.delete

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().delete(request, *args, **kwargs)`

Named effect helpers: `record_instance_delete`.

## Related operating procedures

- [Browse order history, details, and cancellation](../../modules/orders/order_lists.md)
- [Create dine-in, takeaway, and staff delivery orders](../../forms/order_entry.md)
- [Cashier queue, receipts, payment completion, and delivery settlement](../../modules/billing/cashier.md)
- [Book tables, record arrival, and handle reservations](../../modules/reservations/reservations.md)
- [Request, approve, or reject a manual discount](../../modules/discounts/requests.md)
