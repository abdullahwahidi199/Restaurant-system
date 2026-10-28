---
id: "operator_reference_backend_endpoint_directory"
title: "API endpoint traceability directory"
module: "reference"
description: "API endpoint traceability directory — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["reference", "endpoint", "traceability", "directory"]
roles: ["See access section"]
related_docs: ["operator_reference_backend_index", "operator_navigation_application_navigation"]
frontend_routes: []
source_references: ["backend/backend/backend/urls.py", "backend/backend/customers/urls.py", "backend/backend/menu/urls.py", "backend/backend/orders/urls.py", "backend/backend/reports/urls.py", "backend/backend/users/urls.py", "backend/backend/system/urls.py", "backend/backend/inventory/urls.py", "backend/backend/procurement/urls.py", "backend/backend/contractors/urls.py", "backend/backend/otp/urls.py", "backend/backend/restaurants/urls.py", "backend/backend/expenses/urls.py", "backend/backend/audit/urls.py"]
status: "source_verified"
---

# API endpoint traceability directory

Implementation URL inventory for traceability. Prefixes are from backend/urls.py. These entries are API behavior evidence, not extra operator pages. Unmounted/admin-framework/bootstrap/debug helpers are not operational procedures. Check the linked module access/validation reference and current portal before acting. No direct API-call recovery workflow is taught.

| API namespace | Declared suffix / route expression | Handler |
|---|---|---|
| `/api/customer/` | `'signup/'` | `SignupView.as_view()` |
| `/api/customer/` | `'login/'` | `LoginView.as_view()` |
| `/api/customer/` | `'profile/'` | `CustomerProfileView.as_view()` |
| `/api/customer/` | `'orders/'` | `CustomerOrdersView.as_view()` |
| `/api/customer/` | `'orders/&lt;int:pk&gt;/'` | `CustomerOrderDetailView.as_view()` |
| `/api/customer/` | `'orders/&lt;int:pk&gt;/cancel/'` | `CustomerOrderCancelView.as_view()` |
| `/api/customer/` | `'orders/&lt;int:pk&gt;/socket-ticket/'` | `CustomerOrderSocketTicketView.as_view()` |
| `/api/customer/` | `'checkout/validate/'` | `MarketplaceCheckoutValidationView.as_view()` |
| `/api/customer/` | `'addresses/'` | `CustomerAddressListCreateView.as_view()` |
| `/api/customer/` | `'addresses/&lt;int:pk&gt;/'` | `CustomerAddressDetailView.as_view()` |
| `/api/customer/` | `'&lt;slug:slug&gt;/reviews/'` | `CustomerReviewsView.as_view()` |
| `/api/customer/` | `'token/refresh/'` | `TokenRefreshView.as_view()` |
| `/api/customer/` | `'customer/token/refresh/'` | `TokenRefreshView.as_view()` |
| `/api/menu/` | `'categories/'` | `category_list_create` |
| `/api/menu/` | `'categories/reorder/'` | `category_reorder` |
| `/api/menu/` | `'categories/&lt;int:pk&gt;/'` | `CategoryRetrieveDestroyView.as_view()` |
| `/api/menu/` | `'menu-items/'` | `menu_item_list_create_view` |
| `/api/menu/` | `'menu-items/reorder/'` | `menu_item_reorder` |
| `/api/menu/` | `'menu-items/&lt;int:pk&gt;/'` | `MenuItemRetrieveUpdateDestroyView.as_view()` |
| `/api/menu/` | `'production/'` | `production_list_create` |
| `/api/menu/` | `'production/pdf/'` | `production_pdf_report` |
| `/api/menu/` | `'production/&lt;int:pk&gt;/'` | `production_detail` |
| `/api/menu/` | `'stations/'` | `station_list_create` |
| `/api/menu/` | `'stations/&lt;int:pk&gt;/'` | `StationRetrieveUpdateDestroyView.as_view()` |
| `/api/menu/` | `'menu-item-sales/'` | `menu_item_sales` |
| `/api/menu/` | `'menu-print/'` | `MenuPrintView.as_view()` |
| `/api/menu/` | `'reviews/'` | `review_list_create` |
| `/api/menu/` | `'reviews/&lt;int:pk&gt;/'` | `ReviewRetrieveDestroyView.as_view()` |
| `/api/menu/` | `'send-review/&lt;slug:restaurant_slug&gt;/&lt;slug:branch_slug&gt;/'` | `send_review` |
| `/api/menu/` | `'send-review/&lt;str:slug&gt;/'` | `send_review` |
| `/api/menu/` | `'public/&lt;slug:restaurant_slug&gt;/&lt;slug:branch_slug&gt;/categories/'` | `public_categories` |
| `/api/menu/` | `'public/&lt;slug:restaurant_slug&gt;/&lt;slug:branch_slug&gt;/menu-items/'` | `public_menu_items` |
| `/api/menu/` | `'public/&lt;slug:restaurant_slug&gt;/&lt;slug:branch_slug&gt;/menu-items/&lt;int:pk&gt;/'` | `public_menu_item_detail` |
| `/api/menu/` | `'public/&lt;str:slug&gt;/categories/'` | `public_categories` |
| `/api/menu/` | `'public/&lt;str:slug&gt;/menu-items/'` | `public_menu_items` |
| `/api/menu/` | `'public/&lt;str:slug&gt;/menu-items/&lt;int:pk&gt;/'` | `public_menu_item_detail` |
| `/api/menu/` | `'platters/'` | `platter_list_create_view` |
| `/api/menu/` | `'platters/&lt;int:pk&gt;/'` | `PlatterRetrieveUpdateDestroyView.as_view()` |
| `/api/menu/` | `'public/&lt;slug:restaurant_slug&gt;/&lt;slug:branch_slug&gt;/platters/'` | `public_platters` |
| `/api/menu/` | `'public/&lt;slug:restaurant_slug&gt;/&lt;slug:branch_slug&gt;/platters/&lt;int:pk&gt;/'` | `public_platter_detail` |
| `/api/menu/` | `'public/&lt;slug:slug&gt;/platters/'` | `public_platters` |
| `/api/menu/` | `'public/&lt;slug:slug&gt;/platters/&lt;int:pk&gt;/'` | `public_platter_detail` |
| `/api/orders/` | `'orders/'` | `order_list_create` |
| `/api/orders/` | `'orders/&lt;int:pk&gt;/'` | `OrderRetrieveDestroyView.as_view()` |
| `/api/orders/` | `'orders/&lt;int:pk&gt;/update_status/'` | `update_order_status` |
| `/api/orders/` | `'orders/&lt;int:pk&gt;/bulk-update-items/'` | `bulk_update_order_items` |
| `/api/orders/` | `'orders/&lt;int:pk&gt;/add-items/'` | `add_items_to_order` |
| `/api/orders/` | `'order-items/&lt;int:pk&gt;/cancel/'` | `cancel_order_item` |
| `/api/orders/` | `'orders/&lt;int:pk&gt;/change-table/'` | `change_order_table` |
| `/api/orders/` | `'order-items/&lt;int:pk&gt;/status/'` | `update_order_item_status` |
| `/api/orders/` | `'orders/&lt;int:order_id&gt;/discount-request/'` | `request_discount` |
| `/api/orders/` | `'discount-requests/'` | `all_discount_requests` |
| `/api/orders/` | `'discounts/&lt;int:pk&gt;/approveOrReject/'` | `approve_discount_or_reject` |
| `/api/orders/` | `'kitchen-orders/'` | `kitchen_orders` |
| `/api/orders/` | `'ready-kitchen-orders/'` | `ready_kitchen_orders` |
| `/api/orders/` | `'kitchen/&lt;int:order_id&gt;/mark-items-printed/'` | `mark_items_printed_to_kitchen` |
| `/api/orders/` | `'tables/'` | `table_list_create` |
| `/api/orders/` | `'tables/&lt;int:pk&gt;/'` | `TableRetrieveUpdateDestroyView.as_view()` |
| `/api/orders/` | `'orders/&lt;int:pk&gt;/assign-delivery/'` | `assign_delivery` |
| `/api/orders/` | `'cashier/orders/'` | `cashier_orders` |
| `/api/orders/` | `'&lt;int:pk&gt;/cancel/'` | `cancel_order` |
| `/api/orders/` | `'print/&lt;int:pk&gt;/'` | `handle_order_bill_print` |
| `/api/orders/` | `'manager/discount-requests/pending/'` | `manager_pending_discount_requests` |
| `/api/orders/` | `'admin/discount-requests/pending/'` | `admin_pending_discount_requests` |
| `/api/orders/` | `'online-orders/&lt;slug:restaurant_slug&gt;/&lt;slug:branch_slug&gt;/'` | `create_online_order` |
| `/api/orders/` | `'online-orders/&lt;slug:restaurant_slug&gt;/&lt;slug:branch_slug&gt;/&lt;int:pk&gt;/cancel/'` | `cancel_online_order` |
| `/api/orders/` | `'online-orders/&lt;slug:slug&gt;/'` | `create_online_order` |
| `/api/orders/` | `'online-orders/&lt;slug:slug&gt;/&lt;int:pk&gt;/cancel/'` | `cancel_online_order` |
| `/api/orders/` | `'reservations/'` | `reservation_list_create` |
| `/api/orders/` | `'reservations/&lt;int:pk&gt;/'` | `ReservationRetrieveUpdateDestroyView.as_view()` |
| `/api/orders/` | `'cancel-reservation/&lt;int:pk&gt;/'` | `cancel_reservation` |
| `/api/orders/` | `'cashier/reservations/'` | `cashier_reservations` |
| `/api/orders/` | `'cashier/reservations/&lt;int:pk&gt;/arrive/'` | `mark_reservation_arrived` |
| `/api/orders/` | `'cashier/reservations/&lt;int:pk&gt;/no_show/'` | `mark_reservation_no_show` |
| `/api/orders/` | `'discount-cards/'` | `discount_cards` |
| `/api/orders/` | `'discount-cards/&lt;int:pk&gt;/'` | `discount_card_details` |
| `/api/orders/` | `'discount-cards-actions/&lt;int:pk&gt;/'` | `discount_card_actions` |
| `/api/orders/` | `'discount-cards/&lt;int:pk&gt;/apply/'` | `apply_discount_card` |
| `/api/reports/` | `'notifications/'` | `NotificationListView.as_view()` |
| `/api/reports/` | `'notifications/&lt;int:pk&gt;/read/'` | `MarkAsReadView.as_view()` |
| `/api/reports/` | `'dashboard-summary/'` | `DashboardSummaryAPIView.as_view()` |
| `/api/reports/` | `'dashboard-sales/'` | `DashboardSalesAPIView.as_view()` |
| `/api/reports/` | `'generate_report/'` | `generate_report` |
| `/api/reports/` | `'finance-pdf/'` | `finance_pdf_report` |
| `/api/reports/` | `'orders-pdf/'` | `orders_pdf_report` |
| `/api/reports/` | `'inventory-pdf/'` | `inventory_pdf_report` |
| `/api/reports/` | `'staff-pdf/'` | `staff_pdf_report` |
| `/api/reports/` | `'menu-items-pdf/'` | `menu_item_sales_pdf` |
| `/api/users/` | `'staff/'` | `staffApi` |
| `/api/users/` | `'staff/&lt;int:id&gt;/'` | `staffDetailsView.as_view()` |
| `/api/users/` | `'shift/'` | `shiftApi` |
| `/api/users/` | `'shift/&lt;int:id&gt;/'` | `ShiftDetailsView.as_view()` |
| `/api/users/` | `'attendance/mark/&lt;int:shift_id&gt;/'` | `mark_attendance_view` |
| `/api/users/` | `'payrolls/'` | `payrollView` |
| `/api/users/` | `'payrolls/dashboard/'` | `payroll_dashboard_view` |
| `/api/users/` | `'payrolls/generate/'` | `payroll_generate_view` |
| `/api/users/` | `'payrolls/&lt;int:pk&gt;/approve/'` | `payroll_approve_view` |
| `/api/users/` | `'payroll-payments/'` | `payroll_payment_list_create` |
| `/api/users/` | `'salary-advances/'` | `salary_advance_list_create` |
| `/api/users/` | `'salary-advances/&lt;int:id&gt;/'` | `SalaryAdvanceDetailsView.as_view()` |
| `/api/users/` | `'staff/&lt;int:pk&gt;/payroll-history/'` | `staff_payroll_history_view` |
| `/api/users/` | `'deliveryBoys/'` | `DeliveryBoyListView` |
| `/api/users/` | `'payrolls/&lt;int:id&gt;/'` | `PayrollDetailsView.as_view()` |
| `/api/users/` | `'token/'` | `MyTokenObtainPairView.as_view()` |
| `/api/users/` | `'token/refresh/'` | `SessionTokenRefreshView.as_view()` |
| `/api/users/` | `'activity/heartbeat/'` | `heartbeat` |
| `/api/users/` | `'activity/overview/'` | `activity_overview` |
| `/api/users/` | `'activity/sessions/'` | `activity_sessions` |
| `/api/users/` | `'activity/history/'` | `activity_history` |
| `/api/users/` | `'activity/socket-ticket/'` | `activity_socket_ticket` |
| `/api/users/` | `'activity/sessions/&lt;uuid:session_id&gt;/revoke/'` | `revoke_session` |
| `/api/users/` | `'activity/users/&lt;int:user_id&gt;/revoke/'` | `revoke_user_sessions` |
| `/api/users/` | `'activity/logout/'` | `logout_session` |
| `/api/users/` | `'security/login-rate-limit/'` | `login_rate_limit_config_view` |
| `/api/users/` | `'attendance/recent/'` | `recent_month_attendance` |
| `/api/users/` | `''` | `include(router.urls)` |
| `/api/system/` | `'restaurant-info/'` | `RestaurantInfoCreateListView` |
| `/api/system/` | `'restaurant-info/&lt;int:pk&gt;/'` | `ResInfoRetrieveDestroyView.as_view()` |
| `/api/system/` | `'restaurant-info/slug/&lt;slug:slug&gt;/'` | `RestaurantInfoBySlugView.as_view()` |
| `/api/inventory/` | `'ingredients/'` | `IngredientListCreateView.as_view()` |
| `/api/inventory/` | `'ingredientsPages/'` | `IngredientPaginatedView.as_view()` |
| `/api/inventory/` | `'ingredients/&lt;int:pk&gt;/'` | `IngredientRetrieveUpdateDestroyView.as_view()` |
| `/api/inventory/` | `'ingredients/&lt;int:pk&gt;/purchase-history/'` | `ingredient_purchase_history_view` |
| `/api/inventory/` | `'recipes/'` | `MenuItemIngredientListCreateView.as_view()` |
| `/api/inventory/` | `'recipes/&lt;int:pk&gt;/'` | `MenuItemIngredientDeleteView.as_view()` |
| `/api/inventory/` | `'stock-movements/'` | `StockMovementListView.as_view()` |
| `/api/inventory/` | `'stock-movements/&lt;int:pk&gt;/edit/'` | `edit_stock_movement_view` |
| `/api/inventory/` | `'suppliers/'` | `SupplierListCreateView.as_view()` |
| `/api/inventory/` | `'suppliers/&lt;int:pk&gt;/'` | `SupplierRetrieveUpdateView.as_view()` |
| `/api/inventory/` | `'suppliers/&lt;int:pk&gt;/ledger/'` | `supplier_ledger_view` |
| `/api/inventory/` | `'purchase-invoices/'` | `purchase_invoice_list_create` |
| `/api/inventory/` | `'purchase-invoices/&lt;int:pk&gt;/'` | `purchase_invoice_detail` |
| `/api/inventory/` | `'purchase-invoices/&lt;int:pk&gt;/approve/'` | `purchase_invoice_approve` |
| `/api/inventory/` | `'purchase-invoices/&lt;int:pk&gt;/attachments/'` | `purchase_invoice_attachment_list_create` |
| `/api/inventory/` | `'purchase-invoices/&lt;int:pk&gt;/attachments/&lt;int:attachment_pk&gt;/download/'` | `purchase_invoice_attachment_download` |
| `/api/inventory/` | `'purchase-invoices/&lt;int:pk&gt;/attachments/&lt;int:attachment_pk&gt;/'` | `purchase_invoice_attachment_delete` |
| `/api/inventory/` | `'supplier-payments/'` | `supplier_payment_list_create` |
| `/api/inventory/` | `'supplier-payments/&lt;int:pk&gt;/'` | `supplier_payment_detail` |
| `/api/inventory/` | `'supplier-payments/&lt;int:pk&gt;/voucher/'` | `supplier_payment_voucher` |
| `/api/inventory/` | `'supplier-payments/&lt;int:pk&gt;/voucher-pdf/'` | `supplier_payment_voucher_pdf` |
| `/api/inventory/` | `'stock-transfers/'` | `stock_transfer_list_create` |
| `/api/inventory/` | `'stock-transfers/&lt;int:pk&gt;/action/'` | `stock_transfer_action` |
| `/api/inventory/` | `'low-stock/'` | `low_stock_items` |
| `/api/inventory/` | `'purchases/'` | `add_stock_view` |
| `/api/inventory/` | `'adjust-stock/'` | `adjust_stock_view` |
| `/api/inventory/` | `'inventory-summary/'` | `inventory_dashboard_summary` |
| `/api/inventory/` | `'inventory-pdf/'` | `inventory_pdf` |
| `/api/inventory/` | `'ingredient-usage/'` | `search_ingredient_usage_view` |
| `/api/procurement/` | `'suppliers/'` | `SupplierListCreateView.as_view()` |
| `/api/procurement/` | `'suppliers/&lt;int:pk&gt;/'` | `SupplierRetrieveUpdateView.as_view()` |
| `/api/procurement/` | `'suppliers/&lt;int:pk&gt;/ledger/'` | `supplier_ledger_view` |
| `/api/procurement/` | `'purchase-invoices/'` | `purchase_invoice_list_create` |
| `/api/procurement/` | `'purchase-invoices/&lt;int:pk&gt;/'` | `purchase_invoice_detail` |
| `/api/procurement/` | `'purchase-invoices/&lt;int:pk&gt;/approve/'` | `purchase_invoice_approve` |
| `/api/procurement/` | `'purchase-invoices/&lt;int:pk&gt;/attachments/'` | `purchase_invoice_attachment_list_create` |
| `/api/procurement/` | `'purchase-invoices/&lt;int:pk&gt;/attachments/&lt;int:attachment_pk&gt;/download/'` | `purchase_invoice_attachment_download` |
| `/api/procurement/` | `'purchase-invoices/&lt;int:pk&gt;/attachments/&lt;int:attachment_pk&gt;/'` | `purchase_invoice_attachment_delete` |
| `/api/procurement/` | `'supplier-payments/'` | `supplier_payment_list_create` |
| `/api/procurement/` | `'supplier-payments/&lt;int:pk&gt;/'` | `supplier_payment_detail` |
| `/api/procurement/` | `'supplier-payments/&lt;int:pk&gt;/voucher/'` | `supplier_payment_voucher` |
| `/api/procurement/` | `'supplier-payments/&lt;int:pk&gt;/voucher-pdf/'` | `supplier_payment_voucher_pdf` |
| `/api/contractors/` | `'summary/'` | `contractor_summary` |
| `/api/contractors/` | `'contractors/'` | `ContractorListCreateView.as_view()` |
| `/api/contractors/` | `'contractors/&lt;int:pk&gt;/'` | `ContractorRetrieveUpdateView.as_view()` |
| `/api/contractors/` | `'contractors/&lt;int:pk&gt;/ledger/'` | `contractor_ledger_view` |
| `/api/contractors/` | `'contracts/'` | `ServiceContractListCreateView.as_view()` |
| `/api/contractors/` | `'contracts/&lt;int:pk&gt;/'` | `ServiceContractRetrieveUpdateView.as_view()` |
| `/api/contractors/` | `'invoices/'` | `contractor_invoice_list_create` |
| `/api/contractors/` | `'invoices/&lt;int:pk&gt;/'` | `contractor_invoice_detail` |
| `/api/contractors/` | `'invoices/&lt;int:pk&gt;/approve/'` | `contractor_invoice_approve` |
| `/api/contractors/` | `'invoices/&lt;int:pk&gt;/attachments/'` | `contractor_invoice_attachment_list_create` |
| `/api/contractors/` | `'invoices/&lt;int:pk&gt;/attachments/&lt;int:attachment_pk&gt;/download/'` | `contractor_invoice_attachment_download` |
| `/api/contractors/` | `'invoices/&lt;int:pk&gt;/attachments/&lt;int:attachment_pk&gt;/'` | `contractor_invoice_attachment_delete` |
| `/api/contractors/` | `'payments/'` | `contractor_payment_list_create` |
| `/api/contractors/` | `'payments/&lt;int:pk&gt;/'` | `contractor_payment_detail` |
| `/api/otp/` | `'send/'` | `SendOTPView.as_view()` |
| `/api/otp/` | `'verify/'` | `VerifyOTPView.as_view()` |
| `/api/restaurant/` | `'discovery/'` | `restaurant_discovery` |
| `/api/restaurant/` | `'public/&lt;slug:restaurant_slug&gt;/branches/'` | `public_restaurant_branches` |
| `/api/restaurant/` | `'public/&lt;slug:restaurant_slug&gt;/&lt;slug:branch_slug&gt;/'` | `public_branch_detail` |
| `/api/restaurant/` | `'public/&lt;slug:restaurant_slug&gt;/'` | `public_restaurant_entry` |
| `/api/restaurant/` | `'restaurants/'` | `restaurant_list_create` |
| `/api/restaurant/` | `'restaurants/&lt;int:pk&gt;/'` | `RestaurantDetailView.as_view()` |
| `/api/restaurant/` | `'disable-subscription/&lt;int:restaurant_id&gt;/'` | `disable_subscription` |
| `/api/restaurant/` | `'me/'` | `my_restaurant` |
| `/api/restaurant/` | `'branches/'` | `branch_list_create` |
| `/api/restaurant/` | `'branches/my/'` | `my_branches` |
| `/api/restaurant/` | `'branches/active/'` | `active_branch_view` |
| `/api/restaurant/` | `'branches/active/settings/'` | `active_branch_settings` |
| `/api/restaurant/` | `'branch-data-migrations/'` | `branch_data_migrations` |
| `/api/restaurant/` | `'branches/&lt;int:branch_id&gt;/copy/'` | `branch_copy` |
| `/api/restaurant/` | `'branches/&lt;int:branch_id&gt;/regenerate-qr/'` | `branch_regenerate_qr` |
| `/api/restaurant/` | `'branches/&lt;int:branch_id&gt;/'` | `branch_detail` |
| `/api/restaurant/` | `'enterprise-settings/'` | `enterprise_settings` |
| `/api/restaurant/` | `'subscriptions/'` | `subscription_list_create` |
| `/api/restaurant/` | `'subscriptions/&lt;int:pk&gt;/'` | `SubscriptionDetailView.as_view()` |
| `/api/restaurant/` | `'restaurant/'` | `restaurant_detail` |
| `/api/expenses/` | `'expenses/'` | `expensesApi` |
| `/api/expenses/` | `'expenses/&lt;int:id&gt;/'` | `ExpenseDetailsView.as_view()` |
| `/api/expenses/` | `'expense-history/'` | `ExpenseHistoryApiView.as_view()` |
| `/api/audit-logs/` | `'production-movements/'` | `ProductionMovementListView.as_view()` |
| `/api/audit-logs/` | `''` | `AuditLogListView.as_view()` |

## Related operating procedures

- [Sign in, choose a branch, and navigate](../../navigation/application_navigation.md)
