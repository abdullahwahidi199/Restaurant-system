---
id: "operator_modules_administration_platform"
title: "Platform restaurant, subscription, and login-security administration"
module: "administration"
description: "Create or edit restaurants and subscriptions and configure login protection in the SuperAdmin portal; distinguishes platform authority from restaurant administration."
keywords: ["administration", "platform", "restaurant", "subscription", "login", "security", "restaurant onboarding", "subscription expiry", "login lockout"]
roles: ["SuperAdmin"]
related_docs: ["operator_modules_branches_branches", "operator_modules_settings_restaurant_branch_settings", "operator_troubleshooting_verification_register", "operator_reference_interface_superadmin_superadminmain", "operator_reference_interface_superadmin_restaurantmodal", "operator_reference_interface_superadmin_restaurantcard", "operator_reference_interface_superadmin_subscriptionmodal", "operator_reference_backend_restaurants_fields", "operator_reference_backend_restaurants_validation", "operator_reference_backend_restaurants_access"]
frontend_routes: ["/super-admin"]
source_references: ["frontend/src/superAdmin/SuperAdminMain.jsx", "frontend/src/superAdmin/RestaurantModal.jsx", "frontend/src/superAdmin/RestaurantCard.jsx", "frontend/src/superAdmin/SubscriptionModal.jsx", "backend/backend/restaurants/serializers.py:RestaurantSerializer", "backend/backend/restaurants/models.py:Subscription", "backend/backend/restaurants/views.py:restaurant_list_create", "backend/backend/users/serializers.py:LoginRateLimitConfigSerializer", "backend/backend/users/views.py:login_rate_limit_config_view", "backend/backend/restaurants/tests.py:RestaurantCreationTests"]
status: "source_verified"
---

# Platform restaurant, subscription, and login-security administration

## SuperAdmin workspace

`/super-admin` requires frontend role SuperAdmin. The platform permission class checks authenticated `is_superuser`; role text and superuser flag are not interchangeable. Tabs **Restaurants** and **Security** switch local workspace. This page is separate from an Admin’s restaurant settings.

## Restaurant create/edit/delete

**+ Add Restaurant** opens RestaurantModal. Create inputs: **Restaurant name***, **Restaurant email***, **Restaurant phone***, **Restaurant address***, optional logo, **Active**, and **Administrator username***, **Administrator email***, **Administrator phone***, optional temporary password. Frontend marks/checks required values in custom handler; backend validates account fields and existing identities. Admin username uses UnicodeUsernameValidator and max150. Restaurant fields obey actual model types/lengths.

Create submits multipart data. Backend atomically creates restaurant, main branch, administrator user and staff/branch associations; subscription is a separate record/workflow. On success list refreshes and modal closes. Duplicate administrator identities return field errors; unexpected create failure is transactionally rolled back. Initial/default credential literal values are deliberately excluded from the documentation. Enter an approved initial password or follow the organization’s account-provisioning procedure; do not publish or reuse account defaults.

Edit reuses restaurant modal with existing values; create-only administrator fields differ by mode. **Update** changes the existing restaurant fields accepted by serializer, not a new restaurant or independent branch. Active toggle affects access via active-restaurant guards. Delete asks **Are you sure you want to delete this restaurant?**; deletion can cascade restaurant-owned data and has no restore UI. This guide describes existing control; it is not authorization to perform a real deletion.

## Subscription

Restaurant card subscription create/edit action opens SubscriptionModal. **Start Date** and **Expiry Date** required dates; **Maximum Branches** required number; **Subscription Active** checkbox. Create/update saves subscription for selected restaurant. Validity depends on active flag and inclusive date interval, with restaurant activation separate. A paid financial transaction/subscription checkout is not implemented by this form.

Disable subscription control, where rendered on card, changes subscription activation; resulting staff access may redirect to inactive screen. Editing dates/active flag can restore legitimate subscription validity; it does not repair network errors. Branch count limitations include existing branches, not just the current filtered active list. Errors use serializer details or **Error saving subscription.**; no automatic rollback of unrelated external payments exists.

## Login Security

**Security** tab shows enabled checkbox, **Maximum Failed Attempts** (integer1–100), **Window Minutes** (1–1440), **Lockout Minutes** (1–1440). **Save** persists LoginRateLimitConfig; **Saving...** disables repeats. These configure server login protection, not staff role/permission grants. Invalid limits return **Must be between 1 and 100.** / **Must be between 1 and 1440.**; UI can show **Error saving security settings.**

The repository also contains framework Django admin URLs and bootstrap/debug helpers. Those are not mounted React operator workflows, and their credentials or low-level operations are not included. See [branches](../branches/branches.md), [restaurant branch settings](../settings/restaurant_branch_settings.md) and [verification register](../../troubleshooting/verification_register.md).

## Detailed controls, fields, and server rules

- [Super Admin Main — controls and fields](../../reference/interface/superadmin_superadminmain.md)
- [Restaurant Modal — controls and fields](../../reference/interface/superadmin_restaurantmodal.md)
- [Restaurant Card — controls and fields](../../reference/interface/superadmin_restaurantcard.md)
- [Subscription Modal — controls and fields](../../reference/interface/superadmin_subscriptionmodal.md)
- [Restaurants — backend fields reference](../../reference/backend/restaurants_fields.md)
- [Restaurants — backend validation reference](../../reference/backend/restaurants_validation.md)
- [Restaurants — backend access reference](../../reference/backend/restaurants_access.md)
