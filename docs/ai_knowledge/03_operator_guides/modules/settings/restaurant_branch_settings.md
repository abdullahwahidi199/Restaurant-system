---
id: "operator_modules_settings_restaurant_branch_settings"
title: "Restaurant settings, delivery defaults, branding, and branch overrides"
module: "settings"
description: "Edit restaurant identity, branding, delivery defaults and discount limits or active-branch overrides; explains BranchAdmin scope and unmounted receipt settings."
keywords: ["settings", "restaurant", "delivery", "defaults", "branding", "branch", "overrides", "restaurant settings", "delivery fee", "branch override", "discount limit"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_reference_backend_restaurants_fields", "operator_troubleshooting_verification_register", "operator_modules_branches_branches", "operator_modules_public_ordering_customer_handoff", "operator_reference_interface_component_admin_settings_components_generalsettings", "operator_reference_interface_component_admin_settings_components_brandingsettings", "operator_reference_interface_component_admin_settings_components_locationsettings", "operator_reference_interface_component_admin_settings_components_deliverysettings", "operator_reference_interface_component_admin_settings_components_discountsettings", "operator_reference_interface_component_admin_settings_components_branchsettings", "operator_reference_interface_component_admin_settings_components_publiclinkssettings", "operator_reference_interface_component_admin_settings_components_socialmediasettings", "operator_reference_backend_restaurants_validation", "operator_reference_backend_restaurants_access"]
frontend_routes: ["/admin/dashboard/settings", "/admin/dashboard/settings/:sectionId"]
source_references: ["frontend/src/component/Admin/settings/settingsConfig.js", "frontend/src/component/Admin/settings/hooks/useRestaurantSettings.js", "frontend/src/component/Admin/settings/components/GeneralSettings.jsx", "frontend/src/component/Admin/settings/components/BrandingSettings.jsx", "frontend/src/component/Admin/settings/components/LocationSettings.jsx", "frontend/src/component/Admin/settings/components/DeliverySettings.jsx", "frontend/src/component/Admin/settings/components/DiscountSettings.jsx", "frontend/src/component/Admin/settings/components/BranchSettings.jsx", "frontend/src/component/Admin/settings/components/PublicLinksSettings.jsx", "frontend/src/component/Admin/settings/components/SocialMediaSettings.jsx", "frontend/src/component/Admin/settings/components/ReceiptSettings.jsx", "backend/backend/restaurants/views.py:active_branch_settings", "backend/backend/orders/models.py:Order.get_total"]
status: "source_verified"
---

# Restaurant settings, delivery defaults, branding, and branch overrides

## Open and scope

Admin/BranchAdmin `/admin/dashboard/settings` or `/admin/dashboard/settings/:sectionId`. Settings is hidden in sidebar navigation data but reachable via top-header/search where offered. Admin sees **General**, **Branding**, **Location**, **Delivery**, **Discounts**, **Branch**, **Public Links**, **Social** section IDs `general`, `branding`, `location`, `delivery`, `discounts`, `branch`, `public-links`, `social`. BranchAdmin sees only Branch (other sections marked restaurantOnly); restaurant save helper also refuses BranchAdmin changes.

Each section saves its own field subset. The loading/reload/saving state is section-specific, not proof that all forms are saved. Demo guard opens restricted-action feedback before mutation. Blank restaurant strings are omitted from multipart payload, so an empty text field does not reliably clear an existing restaurant value. Branch nullable override fields are explicitly sent as null when blank; those are different semantics.

## Restaurant sections

| Section | Editable inputs / output | Save effect and limits |
|---|---|---|
| General | Name, address, phone, email, website, slogan as rendered | Changes restaurant identity/contact fields through restaurant update; browser email/URL types and backend model constraints apply. Existing order IDs do not change. |
| Branding | Logo and cover image uploads/previews | Preview before saving; backend image validation/storage applies. A selected file is not uploaded until save. Removing local preview need not delete stored server file unless handler sends that operation. |
| Location | Latitude, longitude | Restaurant delivery origin defaults. Numeric input; no geocoding/map movement is implied. |
| Delivery | Delivery available checkbox, radius km, base fee, price/km, minimum order | Affects future staff/customer delivery validation/quotes when branch has no override. Does not rewrite delivery fees on existing orders. |
| Discounts | Manager discount limit, Admin discount limit | Determines new/manual approval authority checks, including requests already awaiting decision when approved. Does not apply a discount by itself. |
| Public Links | Brand URL, QR, branch overview links, copy/open/download controls | Output/navigation and QR files; does not publish a new application build. |
| Social | Facebook, Instagram, X/website fields as rendered | Updates stored public URLs. Selecting a URL does not post messages externally. |

Exact form labels, input steps/min/max/required and handlers are in each component reference; backend constraints in [restaurants fields](../../reference/backend/restaurants_fields.md). Do not invent required-field or percentage-ordering validation absent from serializers. Section Save/Cancel/Reset behaviors are determined by its handlers; successful response replaces local restaurant state and success toast. On failure, retain fields and use displayed error/fallback.

## Branch section

Branch settings loads `/restaurant/branches/active/settings/`, after checking active branch. Inputs currently mounted by `BranchSettings` include branch coordinates and delivery overrides (enabled/disabled/use restaurant default; radius; base fee; price/km; minimum order) and **Opening Hours** text input. No receipt/printer/cash-drawer controls are mounted in this section. Full field inventory is in the BranchSettings reference.

Nullable branch fields: tax_rate, service_charge_rate, latitude, longitude, delivery_available, delivery_radius_km, base_delivery_fee, price_per_km, min_order_amount. A blank nullable override uses restaurant default in consumers that implement fallback. Other stored fields (receipt header/footer/template, printer, opening hours and cash-drawer settings) exist in model/hook; a separate ReceiptSettings component is not registered in SETTINGS_SECTIONS. Do not tell an operator there is a Receipt tab merely because the file exists.

Saving branch settings changes only the allowed branch fields for current active branch. Restaurant-wide save and branch save call different endpoints. Changing branch resets cached local branch settings; verify branch title again before saving.

## Stored configuration versus working integration

Receipt template, tax/service charge, kitchen printer and cash drawer values are not proof of an active hardware integration or automatic tax calculation. Order.get_total currently does not apply branch tax/service charge; cashier receipt uses backend total when supplied and its own template code. Opening-hours storage is not evidence of a complete staff scheduling system. These limitations require manual acceptance and are recorded in [verification register](../../troubleshooting/verification_register.md).

Branch QR currently points to restaurant menu; public delivery branch selection is a separate flow. See [branches](../branches/branches.md) and [customer handoff](../public_ordering/customer_handoff.md).

## Detailed controls, fields, and server rules

- [General Settings — controls and fields](../../reference/interface/component_admin_settings_components_generalsettings.md)
- [Branding Settings — controls and fields](../../reference/interface/component_admin_settings_components_brandingsettings.md)
- [Location Settings — controls and fields](../../reference/interface/component_admin_settings_components_locationsettings.md)
- [Delivery Settings — controls and fields](../../reference/interface/component_admin_settings_components_deliverysettings.md)
- [Discount Settings — controls and fields](../../reference/interface/component_admin_settings_components_discountsettings.md)
- [Branch Settings — controls and fields](../../reference/interface/component_admin_settings_components_branchsettings.md)
- [Public Links Settings — controls and fields](../../reference/interface/component_admin_settings_components_publiclinkssettings.md)
- [Social Media Settings — controls and fields](../../reference/interface/component_admin_settings_components_socialmediasettings.md)
- [Restaurants — backend fields reference](../../reference/backend/restaurants_fields.md)
- [Restaurants — backend validation reference](../../reference/backend/restaurants_validation.md)
- [Restaurants — backend access reference](../../reference/backend/restaurants_access.md)
