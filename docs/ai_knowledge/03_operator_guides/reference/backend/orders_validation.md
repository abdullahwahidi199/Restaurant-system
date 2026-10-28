---
id: "operator_reference_backend_orders_validation"
title: "Orders — backend validation reference"
module: "orders"
description: "Static orders implementation evidence for server validation triggers and rejection messages; use linked operating guides for supported UI procedures."
keywords: ["orders", "backend", "validation", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_orders_order_lists", "operator_forms_order_entry", "operator_modules_billing_cashier", "operator_modules_reservations_reservations", "operator_modules_discounts_requests"]
frontend_routes: []
source_references: ["backend/backend/orders/models.py", "backend/backend/orders/seriailizers.py", "backend/backend/orders/signals.py", "backend/backend/orders/views.py"]
status: "source_verified"
---

# Orders — backend validation reference

Static implementation reference for `orders`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/orders/models.py`

### Reservation.save

| Trigger / condition | Server result or message |
|---|---|
| `self.branch_id and self.table_id and self.table.branch_id != self.branch_id` | `ValueError("Reservation table belongs to another branch.")` |

### Order.save

| Trigger / condition | Server result or message |
|---|---|
| `table_will_be_saved and self.branch_id and self.table_id and self.table.branch_id != self.branch_id` | `ValueError("Order table belongs to another branch.")` |
| `reservation_will_be_saved and self.branch_id and self.reservation_id and self.reservation.branch_id != self.branch_id` | `ValueError("Order reservation belongs to another branch.")` |
| `discount_card_will_be_saved and self.branch_id and self.discount_card_id and self.discount_card.branch_id != self.branch_id` | `ValueError("Order discount card belongs to another branch.")` |
| `delivery_boy_will_be_saved and self.branch_id and self.delivery_boy_id and not self.delivery_boy.can_access_branch(self.branch)` | `ValueError("Delivery staff cannot access this branch.")` |
| `status_will_be_saved and old_status in FINALIZED_ORDER_STATUSES and self.status != old_status` | `ValueError( f"Finalized order {self.pk} cannot change from " f"{old_status} to {self.status}." )` |
| `old_status in FINALIZED_ORDER_STATUSES and ( (paid_at_will_be_saved and self.paid_at != old_state["paid_at"]) or ( received_by_will_be_saved and self.received_by_id != old_state["received_by_id"] ) )` | `ValueError( f"Payment metadata for finalized order {self.pk} is immutable." )` |
| `table_needs_sync and effective_status not in FINALIZED_ORDER_STATUSES AND self.pk is None or old_table_id != self.table_id AND active_orders.exists()` | `ValueError( f"Table {self.table.name} already has an active order " f"(#{active_orders.first().id})." )` |

### OrderItem.clean

| Trigger / condition | Server result or message |
|---|---|
| `not self.menu_item and not self.platter` | `ValidationError( "Either menu_item or platter is required." )` |
| `self.menu_item and self.platter` | `ValidationError( "Cannot have both menu_item and platter." )` |

## `backend/backend/orders/seriailizers.py`

### OrderItemSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `not menu_item and not platter` | `serializers.ValidationError( "Either menu_item or platter is required." )` |
| `menu_item and platter` | `serializers.ValidationError( "Cannot have both menu_item and platter." )` |

### ReservationSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `branch and table and table.branch_id and table.branch_id != branch.id` | `Collected validation error: errors["table"] = "This table belongs to another branch."` |
| `start_time and reservation_date AND start_time.date() != reservation_date` | `Collected validation error: errors["start_time"] = ( "Start time date must match reservation date." )` |
| `start_time and start_time &lt; now and not self.instance` | `Collected validation error: errors["start_time"] = "Cannot create a reservation in the past."` |
| `duration_minutes and duration_minutes &lt; 30` | `Collected validation error: errors["duration_minutes"] = "Duration must be at least 30 minutes."` |
| `table and guests &gt; table.capacity` | `Collected validation error: errors["guests"] = ( f"Table \"{table.name}\" only seats {table.capacity} guests. " f"Please reduce guests or choose a larger table." )` |
| `reservation_type == "free" and table and not table.allow_free_reservation` | `Collected validation error: errors["reservation_type"] = ( f"Table \"{table.name}\" does not allow free reservations. " f"Rate: {table.price_per_hour}/hr." )` |
| `errors` | `serializers.ValidationError(errors)` |
| `table and reservation_date and start_time and end_time AND r.start_time and r_end AND r.start_time &lt; end_time and r_end &gt; start_time` | `serializers.ValidationError({ "start_time": ( f"⚠ Time conflict! Table \"{table.name}\" is already booked by " f"\"{r.customer_name}\" from {conflict_start} to {conflict_end}. " f"Please choose a different time slot." ) })` |

### OrderSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `data.get('order_type') == 'dine-in' and not data.get('table')` | `serializers.ValidationError("A dine-in order must have a table.")` |
| `branch and table and table.branch_id and table.branch_id != branch.id` | `serializers.ValidationError( {"table": "This table belongs to another branch."} )` |
| `branch and delivery_boy and not delivery_boy.can_access_branch(branch)` | `serializers.ValidationError( {"delivery_boy": "This delivery person cannot access this branch."} )` |
| `not menu_item and not platter` | `serializers.ValidationError( "Either menu_item or platter is required" )` |
| `menu_item and platter` | `serializers.ValidationError( "Cannot use both menu_item and platter" )` |
| `menu_item AND not scope_order_menu_queryset( MenuItem.objects.filter(pk=menu_item.pk, restaurant=restaurant), restaurant, branch, ).exists()` | `serializers.ValidationError( {"items": "This menu item is not available for the active branch."} )` |
| `platter AND not scope_order_menu_queryset( Platter.objects.filter(pk=platter.pk, restaurant=restaurant), restaurant, branch, ).exists()` | `serializers.ValidationError( {"items": "This platter is not available for the active branch."} )` |
| `order_type == "delivery" and restaurant AND total &lt; min_order_amount` | `serializers.ValidationError( f"Minimum order is {min_order_amount} for delivery orders." )` |
| `order_type == "delivery" AND not delivery_available` | `serializers.ValidationError( "Delivery is not available for this branch." )` |
| `order_type == "delivery" AND is_staff_order AND distance is None` | `serializers.ValidationError( "Distance is required for delivery orders" )` |
| `order_type == "delivery" AND NOT (is_staff_order) AND origin_lat is None or origin_lng is None` | `serializers.ValidationError( "Branch location not set" )` |
| `order_type == "delivery" AND NOT (is_staff_order) AND customer_lat is None or customer_lng is None` | `serializers.ValidationError( "Customer location is required for delivery" )` |
| `order_type == "delivery" AND distance &gt; float(delivery_radius_km)` | `serializers.ValidationError( f"Delivery not available in your area ({distance:.2f} km too far)" )` |

## `backend/backend/orders/views.py`

### finalized_order_response

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"error": f"Order already {order.status}"}, status=status.HTTP_400_BAD_REQUEST, )` |

### get_branch_or_response

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"error": str(exc)}, status=status.HTTP_403_FORBIDDEN)` |

### validate_production_availability

| Trigger / condition | Server result or message |
|---|---|
| `menu_item_obj.uses_daily_production AND int(qty) &gt; int(remaining)` | `ValueError( f"Only {remaining} {menu_item_obj.name} remaining" )` |

### discount_cards

| Trigger / condition | Server result or message |
|---|---|
| `not restaurant` | `Response( {"error": "Restaurant not found"}, status=status.HTTP_403_FORBIDDEN )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( serializer.errors, status=status.HTTP_400_BAD_REQUEST )` |

### discount_card_actions

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"error": "Discount card not found"}, status=status.HTTP_404_NOT_FOUND )` |
| `request.method in ["PUT", "PATCH"]` | `Response( serializer.errors, status=status.HTTP_400_BAD_REQUEST )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"message": "Discount card deleted successfully"}, status=status.HTTP_204_NO_CONTENT )` |

### apply_discount_card

| Trigger / condition | Server result or message |
|---|---|
| `not card` | `Response( {"error": "Invalid card number"}, status=status.HTTP_400_BAD_REQUEST )` |
| `card.customer_phone != customer_phone` | `Response( {"error": "Phone number does not match"}, status=status.HTTP_400_BAD_REQUEST )` |
| `card.status != "active"` | `Response( {"error": "Card is not active"}, status=status.HTTP_400_BAD_REQUEST )` |
| `card.valid_until &lt; today` | `Response( {"error": "Card expired"}, status=status.HTTP_400_BAD_REQUEST )` |
| `card.usage_limit is not None and card.used_count &gt;= card.usage_limit` | `Response( {"error": "Usage limit reached"}, status=status.HTTP_400_BAD_REQUEST )` |
| `order.get_total() &lt; card.minimum_order_amount` | `Response( {"error": f"Minimum order amount is {card.minimum_order_amount}"}, status=status.HTTP_400_BAD_REQUEST )` |
| `order.discount_percent &gt; 0` | `Response( {"error": "Order already discounted"}, status=status.HTTP_400_BAD_REQUEST )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({ "message": "Discount card applied successfully", "discount_percent": card.discount_percentage })` |

### order_list_create

| Trigger / condition | Server result or message |
|---|---|
| `not restaurant` | `Response({"error": "User not associated with a restaurant"}, status=403)` |
| `NOT (request.method == 'GET') AND request.method == 'POST' AND serializer.is_valid()` | `Response({'error': str(e)}, status=400)` |
| `NOT (request.method == 'GET') AND request.method == 'POST'` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### change_order_table

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"error": "Order not found"}, status=404 )` |
| `order.order_type != "dine-in"` | `Response( {"error": "Only dine-in orders can change tables"}, status=400 )` |
| `order.status in FINALIZED_ORDER_STATUSES` | `Response( {"error": "Cannot change table for this order"}, status=400 )` |
| `not new_table_id` | `Response( {"error": "Table is required"}, status=400 )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"error": "Invalid table"}, status=400)` |
| `not new_table` | `Response( {"error": "Table not found"}, status=404 )` |
| `order.table_id == new_table.id` | `Response( {"error": "Order already assigned to this table"}, status=400 )` |
| `occupied` | `Response( {"error": "Target table is occupied"}, status=400 )` |

### reservation_list_create

| Trigger / condition | Server result or message |
|---|---|
| `not restaurant` | `Response({"error": "Restaurant not found"}, status=403)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response(serializer.errors, status=400)` |

### get_public_order_context

| Trigger / condition | Server result or message |
|---|---|
| `not is_active` | `NotFound("Restaurant not found")` |
| `not branch` | `NotFound("Branch not found")` |

### create_online_order

| Trigger / condition | Server result or message |
|---|---|
| `limited` | `Response({"error": "Too many online orders."}, status=429)` |
| `not serializer.is_valid()` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"error": str(e)}, status=400)` |

### kitchen_orders

| Trigger / condition | Server result or message |
|---|---|
| `not restaurant` | `Response({"error": "Restaurant not found"}, status=403)` |

### ready_kitchen_orders

| Trigger / condition | Server result or message |
|---|---|
| `not restaurant` | `Response({"error": "Restaurant not found"}, status=403)` |

### mark_items_printed_to_kitchen

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"error": "Order not found"}, status=404 )` |

### cancel_order

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)` |
| `NOT (role == "Customer") AND role == "Waiter" AND order.status not in ["pending"]` | `Response({"error": "Waiter cannot cancel this order now"}, status=status.HTTP_403_FORBIDDEN)` |
| `NOT (role == "Customer") AND NOT (role == "Waiter") AND role=='Manager' AND order.status not in ["pending"]` | `Response({"error": "Manager cannot cancel this order now"}, status=status.HTTP_403_FORBIDDEN)` |
| `NOT (role == "Customer") AND NOT (role == "Waiter") AND NOT (role=='Manager') AND role in ["Admin", "BranchAdmin"] AND order.status in ["completed"]` | `Response({"error":"Order is already completed"}, status=status.HTTP_403_FORBIDDEN)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"message": "Order cancelled", "order_id": order.id}, status=status.HTTP_200_OK)` |

### cancel_online_order

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)` |
| `order.order_type != "delivery"` | `Response({'error': 'Only delivery orders can be cancelled online'}, status=status.HTTP_400_BAD_REQUEST)` |
| `order.status in ["in_progress", "out_for_delivery"]` | `Response({'error': f'Order already {order.status}'}, status=status.HTTP_400_BAD_REQUEST)` |
| `minutes_passed &gt;2` | `Response({'error': 'Cancellation window has expired'}, status=status.HTTP_403_FORBIDDEN)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({'message': 'Order cancelled successfully'}, status=status.HTTP_200_OK)` |

### update_order_status

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)` |
| `new_status not in validated_statuses` | `Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)` |

### add_items_to_order

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({'error': 'Order not found'}, status=404)` |
| `item.get("menu_item") and item["menu_item"] in menu_items AND menu_item.uses_daily_production AND not prod or prod.quantity_remaining &lt; quantity` | `Response({ "error": f"Only {prod.quantity_remaining if prod else 0} {menu_item.name} remaining" }, status=400)` |

### update_order_item_status

| Trigger / condition | Server result or message |
|---|---|
| `not item_ref` | `Response( {"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"error": "Item not found"}, status=404)` |
| `new_status not in allowed_statuses` | `Response( {"error": "Invalid status"}, status=400 )` |
| `item.status == "cancelled"` | `Response( { "error": "Cancelled items cannot be changed" }, status=400 )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({ "message": f"Item marked as {new_status}", "order_status": order.status })` |

### table_list_create

| Trigger / condition | Server result or message |
|---|---|
| `not restaurant` | `Response({"error": "Restaurant not found"}, status=403)` |
| `NOT (request.method == 'GET') AND request.method == "POST" AND request.user.staff_profile.is_demo` | `Response({"detail": "Action restricted in demo mode"}, status=403)` |
| `NOT (request.method == 'GET') AND request.method == "POST"` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### assign_delivery

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND )` |
| `order.status in FINALIZED_ORDER_STATUSES` | `Response( {"error": f"Cannot assign delivery for {order.status} orders"}, status=status.HTTP_400_BAD_REQUEST )` |
| `not delivery_boy_id` | `Response( {"error": "Delivery person ID required"}, status=status.HTTP_400_BAD_REQUEST )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {"error": "Delivery person not found"}, status=status.HTTP_404_NOT_FOUND )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( { "message": ( f"Order reassigned from " f"{old_delivery_boy.name} to {delivery_boy.name}" if was_reassigned else "Delivery assigned successfully" ), "order": serializer.data, }, status=status.HTTP_200_OK )` |

### cashier_orders

| Trigger / condition | Server result or message |
|---|---|
| `not restaurant` | `Response({"error": "Restaurant not found"}, status=403)` |

### handle_order_bill_print

| Trigger / condition | Server result or message |
|---|---|
| `not restaurant` | `Response({"error": "Restaurant not found"}, status=403)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({ "message": "Bill printed successfully", "order_id": order.id, "is_printed": order.is_printed, "status": order.status, })` |

### cashier_reservations

| Trigger / condition | Server result or message |
|---|---|
| `not restaurant` | `Response({"error": "Restaurant not found"}, status=403)` |

### mark_reservation_arrived

| Trigger / condition | Server result or message |
|---|---|
| `reservation.status != "reserved"` | `Response( {"error": "Only reserved reservations can be marked arrived"}, status=400 )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"message": "Customer marked as arrived"})` |

### mark_reservation_no_show

| Trigger / condition | Server result or message |
|---|---|
| `reservation.status != "reserved"` | `Response( {"error": "Only reserved reservations can be marked no show"}, status=400 )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"message": "Customer marked as no shoiw"})` |

### cancel_reservation

| Trigger / condition | Server result or message |
|---|---|
| `reservation.status!="reserved"` | `Response( {"error": "Cannot cancel reservation now"}, status=400 )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"message": "Reservation ancelled successfully"})` |

### bulk_update_order_items

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"message": "Items updated"})` |

### cancel_order_item

| Trigger / condition | Server result or message |
|---|---|
| `not item_ref` | `Response( {"error": "Item not found"}, status=404 )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"error": "Item not found"}, status=404)` |
| `item.status != "pending"` | `Response( { "error": "Only pending items can be cancelled" }, status=400 )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({ "message": "Item cancelled successfully", "order_status": order.status, })` |

### request_discount

| Trigger / condition | Server result or message |
|---|---|
| `order.discount_percent&gt;0` | `ValidationError("Order already discounted")` |
| `DiscountRequest.objects.filter(order=order, status="approved").exists()` | `Response({"error": "Discount already applied"}, status=400)` |
| `percent&lt;=0` | `Response({"error": "Invalid discount"}, status=400)` |
| `percent&gt;100` | `Response({"error": "Invalid discount"}, status=400)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"message": "Discount request submitted", "id": discount.id})` |

### approve_discount_or_reject

| Trigger / condition | Server result or message |
|---|---|
| `percent &lt;= manager_limit AND staff.role not in ["Manager", "Admin", "BranchAdmin"]` | `Response( {"error": "Only Manager/Admin can approve"}, status=403 )` |
| `NOT (percent &lt;= manager_limit) AND percent &lt;= admin_limit AND staff.role not in ["Admin", "BranchAdmin"]` | `Response( {"error": "Only Admin can approve"}, status=403 )` |
| `NOT (percent &lt;= manager_limit) AND NOT (percent &lt;= admin_limit)` | `Response( {"error": "Discount exceeds allowed limit"}, status=400 )` |
| `not target_status` | `Response({"error": "Invalid action"}, status=400)` |
| `discount.status != "pending" AND target_status == discount.status` | `Response({"message": f"Already {discount.status}"})` |
| `discount.status != "pending"` | `Response( {"error": f"Discount request already {discount.status}"}, status=status.HTTP_409_CONFLICT, )` |
| `action == "reject"` | `Response({"message": "Rejected"})` |
| `action == "approve"` | `Response({"message": "Approved and applied"})` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"error": "Invalid action"}, status=400)` |

### TableRetrieveUpdateDestroyView.delete

| Trigger / condition | Server result or message |
|---|---|
| `has_active_reservations` | `Response( {"error": "Cannot delete table with active reservations."}, status=status.HTTP_400_BAD_REQUEST )` |

## Related operating procedures

- [Browse order history, details, and cancellation](../../modules/orders/order_lists.md)
- [Create dine-in, takeaway, and staff delivery orders](../../forms/order_entry.md)
- [Cashier queue, receipts, payment completion, and delivery settlement](../../modules/billing/cashier.md)
- [Book tables, record arrival, and handle reservations](../../modules/reservations/reservations.md)
- [Request, approve, or reject a manual discount](../../modules/discounts/requests.md)
