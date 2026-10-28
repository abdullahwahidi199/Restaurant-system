---
id: "operator_modules_public_ordering_customer_handoff"
title: "Understand public menus and customer order handoff"
module: "public_ordering"
description: "Explain public menu, web and mobile customer ordering handoffs to staff; distinguishes customer quote, location and cancellation flows from staff operations."
keywords: ["public_ordering", "understand", "public", "menus", "customer", "order", "handoff", "online order", "customer checkout", "mobile ordering", "delivery location"]
roles: ["Public/customer", "Staff explaining handoff"]
related_docs: ["operator_modules_billing_cashier", "operator_modules_customers_feedback", "operator_reference_interface_component_publicmenu_publicmenu", "operator_reference_interface_component_publicmenu_menuitemdetails", "operator_reference_interface_component_customer_homepage", "operator_reference_interface_component_customer_checkoutform", "operator_reference_interface_component_customer_orders", "operator_reference_backend_customers_fields", "operator_reference_backend_customers_validation", "operator_reference_backend_customers_access"]
frontend_routes: ["/menu/:slug", "/:slug", "/:restaurantSlug/:branchSlug", "/signup", "/login", "/profile", "/orders"]
source_references: ["frontend/src/component/PublicMenu/PublicMenu.jsx", "frontend/src/component/PublicMenu/MenuItemDetails.jsx", "frontend/src/component/Customer/HomePage.jsx", "frontend/src/component/Customer/CheckoutForm.jsx", "frontend/src/component/Customer/Orders.jsx", "frontend/src/routing/AppDomainGuard.jsx", "backend/backend/customers/views.py", "backend/backend/customers/serializers.py", "backend/backend/orders/views.py:create_online_order", "backend/backend/orders/views.py:cancel_online_order", "app/lib/app/router/app_router.dart", "app/lib/features/checkout/presentation/checkout_screen.dart", "app/lib/features/orders/data/order_repository.dart", "app/lib/features/orders/data/pending_order_store.dart"]
status: "source_verified"
---

# Understand public menus and customer order handoff

## What staff can explain

Public QR menu routes `/menu/:slug`, `/menu/:slug/item/:id`, `/menu/:slug/platter/:id` differ from online ordering routes `/:slug` and `/:restaurantSlug/:branchSlug` with item/platter children. Customer signup/login/profile/orders at `/signup`, `/login`, `/profile`, `/orders` are not staff portals. App domain guard may redirect between public/staff domains. Staff should give customers the URL supplied by the restaurant/public-link controls rather than constructing unverified branch links.

Public menu controls include category/search, language, item/platter details, quantity and Add to Cart where mounted. A public display component is not proof of staff mutation access. Menu visibility/availability comes from branch/menu data. Branch public URLs/QR currently share restaurant-level `/menu/{slug}`; online branch selection is separate. Confirm destination by scanning QR.

## Web order handoff

Online customer cart/checkout uses customer identity/contact/address/location fields; delivery requires supported coordinates. Browser geolocation can fail or be denied; customer must use the supported location/address flow. Staff delivery form instead accepts entered distance and does not use the same coordinate requirement. Customer checkout validates delivery origin, location/radius/minimum with server branch context. An accepted order becomes pending, enters kitchen flow and later appears in cashier’s delivery queue when ready.

Legacy public order-create/cancel routes in orders.views differ from authenticated marketplace endpoints in customers.views. The legacy online cancel is delivery-only, requires ≤2 minutes since create and blocks in_progress/out_for_delivery/terminal states. Do not apply that rule blindly to customer marketplace cancellation; the authenticated customer API enforces ownership and its own eligibility/quote contract. Staff cancellation has different role/status rules. See backend orders/customers validation references for exact endpoint behavior.

## Mobile client

`app/lib` is a Flutter customer marketplace application, not an additional waiter/cashier portal. Routes include startup, login/register/forgot-password, restaurant, cart, checkout, saved addresses, order success/detail, home/search/orders/profile. Checkout supports customer delivery/takeaway, validates contact/address, rechecks cart and reviews a server quote before placing. Pending order store/client-generated IDs handle customer submission retry differently from staff create. Address editing and customer profile changes are customer operations, not staff administration.

A mobile order uses customer-scoped API paths and can share kitchen/cashier downstream records. Saved-address/geolocation, SMS/OTP, mobile realtime/polling, app-download availability and devices require deployment verification. Do not claim a card gateway charge merely because the UI shows Payment Method: current customer checkout presents its supported offline payment arrangement.

## Staff response to customer issues

Ask for order number and restaurant/branch, then locate it in the permitted staff order list. Do not ask the customer for password/OTP. If customer says placement failed, check for existing order before helping place a second. If an item is unavailable, use an actually available substitute with customer agreement or wait for authorized restock/production; do not override inventory flags. Settlement is [cashier](../billing/cashier.md), and customer feedback appears in [feedback](../customers/feedback.md).

Public/mobile end-customer account screens are inventoried as context, not role training for staff to impersonate customers. The interface index includes web customer controls; mobile routes and source boundaries are explicitly accounted for in coverage.

## Detailed controls, fields, and server rules

- [Public Menu — controls and fields](../../reference/interface/component_publicmenu_publicmenu.md)
- [Menu Item Details — controls and fields](../../reference/interface/component_publicmenu_menuitemdetails.md)
- [Home Page — controls and fields](../../reference/interface/component_customer_homepage.md)
- [Checkout Form — controls and fields](../../reference/interface/component_customer_checkoutform.md)
- [Orders — controls and fields](../../reference/interface/component_customer_orders.md)
- [Customers — backend fields reference](../../reference/backend/customers_fields.md)
- [Customers — backend validation reference](../../reference/backend/customers_validation.md)
- [Customers — backend access reference](../../reference/backend/customers_access.md)
