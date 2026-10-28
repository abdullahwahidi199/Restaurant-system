---
id: "operator_reference_backend_orders_access"
title: "Orders — backend access reference"
module: "orders"
description: "Static orders implementation evidence for endpoint permissions and read/write role declarations; use linked operating guides for supported UI procedures."
keywords: ["orders", "backend", "access", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_orders_order_lists", "operator_forms_order_entry", "operator_modules_billing_cashier", "operator_modules_reservations_reservations", "operator_modules_discounts_requests"]
frontend_routes: []
source_references: ["backend/backend/orders/models.py", "backend/backend/orders/seriailizers.py", "backend/backend/orders/signals.py", "backend/backend/orders/views.py"]
status: "source_verified"
---

# Orders — backend access reference

Static implementation reference for `orders`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/orders/views.py`

### ReservationRetrieveUpdateDestroyView

`[IsAuthenticated, IsManager\|IsCashier \| IsRestaurantAdmin,IsRestaurantActive]`

### OrderRetrieveDestroyView

`[IsAuthenticated]`

### TableRetrieveUpdateDestroyView

`[IsAuthenticated, IsSameRestaurant, IsRestaurantActive, IsRestaurantAdmin \| IsManager \| IsWaiter \| IsCashier \| IsOperationsManager]`

### discount_cards

`api_view(["GET", "POST"])`; `permission_classes([     IsAuthenticated,     IsRestaurantActive,     IsManager \| IsCashier \| IsRestaurantAdmin, ])`

### discount_card_actions

`api_view(["GET", "PUT", "PATCH", "DELETE"])`; `permission_classes([     IsAuthenticated,     IsRestaurantActive,     IsManager \| IsCashier \| IsRestaurantAdmin, ])`

### apply_discount_card

`api_view(["POST"])`; `permission_classes([IsAuthenticated, IsCashier])`

### discount_card_details

`api_view(["GET"])`; `permission_classes([     IsAuthenticated,     IsRestaurantActive,     IsManager \| IsCashier \| IsRestaurantAdmin, ])`

### order_list_create

`api_view(['GET', 'POST'])`; `permission_classes([AllowAny,IsRestaurantActive])`

### change_order_table

`api_view(["PATCH"])`; `permission_classes([     IsAuthenticated,     IsRestaurantActive,     IsManager \| IsWaiter \| IsRestaurantAdmin ])`

### reservation_list_create

`api_view(["GET", "POST"])`; `permission_classes([IsAuthenticated,IsManager\| IsCashier \|IsCallOperator\| IsRestaurantAdmin,IsRestaurantActive])`

### create_online_order

`api_view(['POST'])`; `permission_classes([AllowAny])`

### kitchen_orders

`api_view(["GET"])`; `permission_classes([IsAuthenticated, IsRestaurantActive, IsKitchenManager \| IsRestaurantAdmin])`

### ready_kitchen_orders

`api_view(["GET"])`; `permission_classes([IsAuthenticated, IsRestaurantActive, IsKitchenManager \| IsRestaurantAdmin])`

### mark_items_printed_to_kitchen

`api_view(["POST"])`; `permission_classes([     IsAuthenticated,     IsRestaurantActive,     IsKitchenManager \| IsRestaurantAdmin, ])`

### cancel_order

`api_view(["PATCH"])`; `permission_classes([IsAuthenticated, IsSameRestaurant,IsRestaurantActive,IsManager\| IsWaiter\|IsCashier  \| IsRestaurantAdmin])`

### cancel_online_order

`api_view(['PATCH'])`; `permission_classes([AllowAny])`

### update_order_status

`api_view(['PATCH'])`; `permission_classes([IsAuthenticated])`

### add_items_to_order

`api_view(["PATCH"])`; `permission_classes([IsAuthenticated])`

### update_order_item_status

`api_view(["PATCH"])`; `permission_classes([     IsAuthenticated,     IsRestaurantActive ])`

### table_list_create

`api_view(['GET', "POST"])`; `permission_classes([IsAuthenticated,IsSameRestaurant,IsRestaurantActive,IsRestaurantAdmin \| IsManager \| IsWaiter \| IsCashier \| IsOperationsManager])`

### assign_delivery

`api_view(["PATCH"])`; `permission_classes([IsAuthenticated, IsCashier, IsRestaurantActive])`

### cashier_orders

`api_view(['GET'])`; `permission_classes([IsAuthenticated,IsRestaurantActive, IsCashier\|IsRestaurantAdmin])`

### handle_order_bill_print

`api_view(['POST'])`; `permission_classes([IsAuthenticated, IsRestaurantActive, IsCashier \| IsRestaurantAdmin])`

### cashier_reservations

`api_view(['GET'])`; `permission_classes([IsAuthenticated,IsRestaurantActive, IsCashier \| IsRestaurantAdmin])`

### mark_reservation_arrived

`api_view(["POST"])`; `permission_classes([IsAuthenticated,IsRestaurantActive,IsManager\| IsCashier \| IsRestaurantAdmin])`

### mark_reservation_no_show

`api_view(["POST"])`; `permission_classes([IsAuthenticated,IsRestaurantActive,IsManager \| IsRestaurantAdmin])`

### cancel_reservation

`api_view(["PATCH"])`; `permission_classes([IsAuthenticated,IsRestaurantActive, IsManager\|IsCashier \| IsRestaurantAdmin])`

### bulk_update_order_items

`api_view(["PATCH"])`; `permission_classes([IsAuthenticated])`

### cancel_order_item

`api_view(["PATCH"])`; `permission_classes([IsAuthenticated])`

### all_discount_requests

`api_view(['GET'])`; `permission_classes([IsAuthenticated, IsSameRestaurant, IsRestaurantAdmin])`

### request_discount

`api_view(["POST"])`; `permission_classes([IsAuthenticated, IsCashier])`

### approve_discount_or_reject

`api_view(["PATCH"])`; `permission_classes([IsAuthenticated])`

### manager_pending_discount_requests

`api_view(["GET"])`; `permission_classes([IsAuthenticated,IsSameRestaurant,IsManager])`

### admin_pending_discount_requests

`api_view(['GET'])`; `permission_classes([IsAuthenticated,IsSameRestaurant,IsRestaurantAdmin])`

## Related operating procedures

- [Browse order history, details, and cancellation](../../modules/orders/order_lists.md)
- [Create dine-in, takeaway, and staff delivery orders](../../forms/order_entry.md)
- [Cashier queue, receipts, payment completion, and delivery settlement](../../modules/billing/cashier.md)
- [Book tables, record arrival, and handle reservations](../../modules/reservations/reservations.md)
- [Request, approve, or reject a manual discount](../../modules/discounts/requests.md)
