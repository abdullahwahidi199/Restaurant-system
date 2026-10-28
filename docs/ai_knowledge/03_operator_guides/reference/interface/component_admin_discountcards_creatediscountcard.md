---
id: "operator_reference_interface_component_admin_discountcards_creatediscountcard"
title: "Create Discount Card — controls and fields"
module: "discounts"
description: "Create Discount Card — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["discounts", "create", "discount", "card", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_discounts_discount_cards", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/create-discount-cards"]
source_references: ["frontend/src/component/Admin/DiscountCards/CreateDiscountCard.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Create Discount Card — controls and fields

This reference records the controls and fields declared by `CreateDiscountCard`. Use [discount cards](../../modules/discounts/discount_cards.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/DiscountCards/CreateDiscountCard.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Create Discount Card`, `Success!`, `Card Information`, `Customer Information`, `Discount Details`, `Validity & Usage Limits`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | CreateDiscountCard; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleSubmit |
| Local UI result | setSuccess, setLoading, setFormData, setTouched, setErrors |

Trace symbols: `handleSubmit`, `validateField`, `validateForm`.

Requests made by this handler or local helpers:

- `instance.post("/orders/discount-cards/", payload)`

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Generate random card number

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Generate random card number |
| Location | CreateDiscountCard; JSX button; handler generateCardNumber |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Generate random card number.  |
| Handler / destination | generateCardNumber |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Reset Form

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reset Form |
| Location | CreateDiscountCard; JSX button; handler () =&gt; { setFormData(initialFormState); setErrors({}); setTouched({}); setSuccess(false); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reset Form.  |
| Handler / destination | () =&gt; { setFormData(initialFormState); setErrors({}); setTouched({}); setSuccess(false); } |
| Local UI result | setFormData, setErrors, setTouched, setSuccess |

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Creating... / Create Discount Card (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Creating... / Create Discount Card (conditional text) |
| Location | CreateDiscountCard; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Creating... / Create Discount Card (conditional text).  |
| Handler / destination | handleSubmit |
| Local UI result | setSuccess, setLoading, setFormData, setTouched, setErrors |

Trace symbols: `handleSubmit`, `validateField`, `validateForm`.

Requests made by this handler or local helpers:

- `instance.post("/orders/discount-cards/", payload)`

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Card Name * | text; card_name | Not declared; see submit validation | formData.card_name | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Card Number * | text; card_number | Not declared; see submit validation | formData.card_number | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Status | select; status | Not declared; see submit validation | formData.status | ; choices: Active [active], Inactive [inactive], Expired [expired] | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Customer Name * | text; customer_name | Not declared; see submit validation | formData.customer_name | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Phone Number | tel; customer_phone | Not declared; see submit validation | formData.customer_phone | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-6"></a> F6: Discount Percentage * | number; discount_percentage | Not declared; see submit validation | formData.discount_percentage | min=0; max=100; step=0.01 | read-only=false; disabled=false |
| <a id="field-7"></a> F7: Minimum Order Amount | number; minimum_order_amount | Not declared; see submit validation | formData.minimum_order_amount | min=0; step=0.01 | read-only=false; disabled=false |
| <a id="field-8"></a> F8: Valid From * | date; valid_from | Not declared; see submit validation | formData.valid_from | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Valid Until * | date; valid_until | Not declared; see submit validation | formData.valid_until | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-10"></a> F10: Usage Limit | number; usage_limit | Not declared; see submit validation | formData.usage_limit | min=1 | read-only=false; disabled=false |
| <a id="field-11"></a> F11: Notes | textarea; notes | Not declared; see submit validation | formData.notes | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

- `validateField`: `error = "Card name must be at least 2 characters"`; `error = "Card number is required"`; `error = "Card number must be at least 5 characters"`; `if (!value) error = "Customer name is required"; break; case "customer_phone": if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {`; `error = "Invalid phone number format"`; `error = "Discount percentage is required"`; `error = "Must be between 0 and 100"`; `error = "Start date is required"`; `if (!value) error = "End date is required"; else if ( formData.valid_from && new Date(value) &lt;= new Date(formData.valid_from) ) {`; `error = "End date must be after start date"`; `error = "Usage limit must be at least 1"`
- `validateForm`: `if (!validateField(field, formData[field])) {`; `if (formData.valid_from && formData.valid_until) { const start = new Date(formData.valid_from); const end = new Date(formData.valid_until); if (end &lt;= start) {`
- `handleSubmit`: `if (responseErrors && typeof responseErrors === "object") {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.generate_random_card_number_4fc48226` | Generate random card number | تولید شماره کارت تصادفی | تصادفی کارت شمېره تولید کړئ |
| `legacy.reset_form_6c3b2103` | Reset Form | فرم بازنشانی | فورم بیا تنظیم کړئ |
| `legacy.creating_28ea7667` | Creating... | خلق کردن... | جوړول... |
| `legacy.create_discount_card_51aab7fe` | Create Discount Card | ایجاد کارت تخفیف | د تخفیف کارت جوړول |
| `legacy.e_g_gold_member_discount_a6591849` | e.g., Gold Member Discount | برای مثال، تخفیف عضویت طلایی | لکه، د سرو زرو غړی تخفیف |
| `legacy.dc_xxxxxxxx_b5671b86` | DC-XXXXXXXX | DC-XXXXXXXX | DC-XXXXXXXX |
| `staff.status.active` | Active | فعال | فعال |
| `staff.status.inactive` | Inactive | غیرفعال | غیر فعال |
| `legacy.expired_a689a999` | Expired | منقضی شده | ختم شوی |
| `legacy.ali_93f0a0d8` | Ali | علی | علی |
| `legacy.unlimited_b8bef37b` | Unlimited | نامحدود | نامحدود |
| `legacy.additional_notes_about_this_discount_card_1de88868` | Additional notes about this discount card... | یادداشت های اضافی درباره این کارت تخفیف... | د دې تخفیف کارت په اړه اضافی یادښتونه... |
