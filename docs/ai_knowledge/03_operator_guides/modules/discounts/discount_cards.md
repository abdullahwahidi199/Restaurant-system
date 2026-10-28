---
id: "operator_modules_discounts_discount_cards"
title: "Create, edit, inspect, and apply discount cards"
module: "discounts"
description: "Create or edit discount cards and apply a valid card at cashier checkout; covers phone matching, expiry, usage limits, minimum amounts and validation differences."
keywords: ["discounts", "create", "edit", "inspect", "apply", "discount", "cards", "loyalty card", "card number", "usage limit", "minimum order"]
roles: ["Admin", "BranchAdmin", "Cashier"]
related_docs: ["operator_modules_discounts_requests", "operator_modules_billing_cashier", "operator_reference_interface_component_admin_discountcards_discountcardsmain", "operator_reference_interface_component_admin_discountcards_creatediscountcard", "operator_reference_interface_component_admin_discountcards_discountcarddetails", "operator_reference_interface_component_admin_discountcards_discountcardedit", "operator_reference_interface_component_cashier_components_discountrequestmodal", "operator_reference_backend_orders_fields", "operator_reference_backend_orders_validation", "operator_reference_backend_orders_access"]
frontend_routes: ["/admin/dashboard/discount-cards", "/admin/dashboard/create-discount-cards", "/admin/dashboard/discount-cards/:id", "/admin/dashboard/discount-cards/:id/edit"]
source_references: ["frontend/src/component/Admin/DiscountCards/DiscountCardsMain.jsx", "frontend/src/component/Admin/DiscountCards/CreateDiscountCard.jsx", "frontend/src/component/Admin/DiscountCards/DiscountCardDetails.jsx", "frontend/src/component/Admin/DiscountCards/DiscountCardEdit.jsx", "frontend/src/component/Cashier/components/DiscountRequestModal.jsx", "backend/backend/orders/models.py:DiscountCard", "backend/backend/orders/seriailizers.py:DiscountCardSerializer", "backend/backend/orders/views.py:apply_discount_card"]
status: "source_verified"
---

# Create, edit, inspect, and apply discount cards

## Open and manage cards

Admin/BranchAdmin: **Operations → Discount Cards**, `/admin/dashboard/discount-cards`. Open the create action for `/admin/dashboard/create-discount-cards`, a card detail at `/admin/dashboard/discount-cards/:id`, or edit at `/:id/edit`. Cards belong to the restaurant/current branch. Card numbers are globally unique in the model, not merely unique in one branch.

List search, status/date controls, row details/edit/delete and pagination are enumerated in the corresponding interface references. Open a card’s detail before editing to check usage and validity. A delete action removes the card record; existing order foreign keys use SET_NULL. It does not remove an order’s already written discount percentage. No restore control exists.

## Create field reference

| Label | Required | Type/default | Actual constraints / effect |
|---|---|---|---|
| Card Name | Yes | Text, empty | Frontend ≥2 chars; backend max100. |
| Card Number | Yes | Text, empty | Frontend ≥5 chars; backend max50, unique. Random-number icon generates `DC-...`; generation is local and does not save or guarantee server uniqueness. |
| Status | Yes/default | Dropdown, active | active/inactive/expired. Does not automatically extend validity dates. |
| Customer Name | Yes | Text, empty | Backend max100. |
| Customer Phone | Backend yes; create validateForm omits full required check | Text, empty | Max20; optional format check allows digits, spaces, dash, plus, parentheses. Exact string later must match card application phone. |
| Discount Percentage | Yes | Number, empty | Frontend 0–100 inclusive; backend Decimal(5,2), no equivalent custom percent-range validator in plain ModelSerializer. |
| Minimum Order Amount | No | Number, empty→0 | Decimal(10,2); compared against current order total before application. |
| Valid From | Yes | Date, empty | Required server DateField; application endpoint currently does not enforce this start date. |
| Valid Until | Yes | Date, empty | Frontend strictly later than from; application rejects dates before today, permits today. No matching serializer cross-date check is defined. |
| Usage Limit | Optional | Number, empty→null | Frontend checks at least1 on relevant field validation; model positive integer. Null means unlimited. |
| Notes | Optional | Text area | Empty allowed. |
| Used Count / Created At / Restaurant / Branch | Automatic | Read-only | Used count starts0 and increments after successful application. |

Use **Reset Form** to discard entered values. **Create Discount Card** validates, posts, resets and navigates back. On failure, field errors are mapped from DRF or a general failure is shown; remain in form and correct the flagged field.

## Edit differences

Edit loads the existing record, leaves usage/count/timestamps as server-owned, and **Update Discount Card** submits changes. Its Reset Form handler uses the initial empty form rather than restoring fetched values; reload/cancel edit to recover original values. Editing percentage/phone/validity affects future applications. It does not recalculate old orders. See the separate `DiscountCardEdit` control/field reference for edit-state behavior.

## Apply at checkout

Cashier opens **Discount → Discount Card** (default tab), enters **Card Number** and **Customer Phone**, then **Submit Request**. Despite that common button label, the card branch applies immediately; no manager request is created. Both inputs are trimmed for presence, but sent as entered. Backend finds card in the same branch/restaurant, compares phone exactly, checks active status, expiry, usage limit, minimum total, and existing discount. Success writes card/percentage onto order and increments used_count within the transaction.

Failures: **Invalid card number**, **Phone number does not match**, **Card is not active**, **Card expired**, **Usage limit reached**, **Minimum order amount is {amount}**, **Order already discounted**. Verify the actual card and order; do not change phone or minimum just to defeat a rejection. There is no operator unapply/refund-use-count action. Applying to a terminal order is blocked. The UI’s parent success toast may say a request was submitted even though the card was already applied; inspect the order’s applied percentage.

See [requests](requests.md) for approval discounts and [cashier](../billing/cashier.md) for payment.

## Detailed controls, fields, and server rules

- [Discount Cards Main — controls and fields](../../reference/interface/component_admin_discountcards_discountcardsmain.md)
- [Create Discount Card — controls and fields](../../reference/interface/component_admin_discountcards_creatediscountcard.md)
- [Discount Card Details — controls and fields](../../reference/interface/component_admin_discountcards_discountcarddetails.md)
- [Discount Card Edit — controls and fields](../../reference/interface/component_admin_discountcards_discountcardedit.md)
- [Discount Request Modal — controls and fields](../../reference/interface/component_cashier_components_discountrequestmodal.md)
- [Orders — backend fields reference](../../reference/backend/orders_fields.md)
- [Orders — backend validation reference](../../reference/backend/orders_validation.md)
- [Orders — backend access reference](../../reference/backend/orders_access.md)
