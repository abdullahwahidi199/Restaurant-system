---
id: "operator_reference_interface_component_cashier_components_discountrequestmodal"
title: "Discount Request Modal — controls and fields"
module: "discounts"
description: "Discount Request Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["discounts", "discount", "request", "modal", "controls", "fields"]
roles: ["Cashier"]
related_docs: ["operator_modules_discounts_requests", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/cashier"]
source_references: ["frontend/src/component/Cashier/components/DiscountRequestModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Discount Request Modal — controls and fields

This reference records the controls and fields declared by `DiscountRequestModal`. Use [requests](../../modules/discounts/requests.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Cashier/components/DiscountRequestModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Discount Request`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | DiscountRequestModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [requests](../../modules/discounts/requests.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Discount Card

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Discount Card |
| Location | DiscountRequestModal; JSX button; handler () =&gt; setActiveTab("card") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Discount Card.  |
| Handler / destination | () =&gt; setActiveTab("card") |
| Local UI result | setActiveTab |

Record/status result, downstream effects, failure recovery, and reversal: [requests](../../modules/discounts/requests.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Request Discount

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Request Discount |
| Location | DiscountRequestModal; JSX button; handler () =&gt; setActiveTab("request") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Request Discount.  |
| Handler / destination | () =&gt; setActiveTab("request") |
| Local UI result | setActiveTab |

Record/status result, downstream effects, failure recovery, and reversal: [requests](../../modules/discounts/requests.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | DiscountRequestModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [requests](../../modules/discounts/requests.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Submitting... / Submit Request (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Submitting... / Submit Request (conditional text) |
| Location | DiscountRequestModal; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Submitting... / Submit Request (conditional text).  |
| Handler / destination | handleSubmit |
| Local UI result | setError, setLoading |

Trace symbols: `handleSubmit`.

Requests made by this handler or local helpers:

- `instance.post( ′/orders/discount-cards/${order.id}/apply/′, { card_number: cardNumber, customer_phone: customerPhone, },`
- `instance.post(′/orders/orders/${order.id}/discount-request/′, { discount_percent: discountPercent, reason,`

Record/status result, downstream effects, failure recovery, and reversal: [requests](../../modules/discounts/requests.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Discount Percentage | number; discountPercent | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when activeTab === "request" |
| <a id="field-2"></a> F2: Reason | textarea; reason | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when activeTab === "request" |
| <a id="field-3"></a> F3: Card Number | text; cardNumber | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when activeTab === "card" |
| <a id="field-4"></a> F4: Customer Phone | text; customerPhone | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when activeTab === "card" |

## Submission and validation evidence

- `handleSubmit`: `if (activeTab === "card") { if (!cardNumber.trim()) { setError(Card number is required); return; } if (!customerPhone.trim()) {`; `if (onSuccess) { onSuccess(); } } catch (err) {`; `if (!discountPercent \|\| Number(discountPercent) &lt;= 0) { setError(Please enter a valid discount percentage); return; } if (!reason.trim()) {`; `if (onSuccess) { onSuccess(); } onClose(); } catch (err) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Card number is required |
| `setError` | Customer phone number is required |
| `setError` | err?.response?.data?.detail \|\| err?.response?.data?.error \|\| "Failed to apply discount card" |
| `setError` | Please enter a valid discount percentage |
| `setError` | Reason is required |
| `setError` | data?.detail \|\| data?.error \|\| data?.non_field_errors?.[0] \|\| Object.values(data \|\| {})?.[0]?.[0] \|\| "Failed to apply discount card" |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.discount_card_21f25b27` | Discount Card | کارت تخفیف | تخفیف کارت |
| `legacy.request_discount_ed453809` | Request Discount | درخواست تخفیف | د تخفیف غوښتنه |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `submitting` | Submitting... | در حال ارسال... | لیږل... |
| `legacy.submit_request_d0015743` | Submit Request | درخواست ارسال | درخواست وسپارئ |
| `legacy.enter_discount_538f54ad` | Enter discount % | درصد تخفیف را وارد کنید | تخفیف ٪ داخل کړئ |
| `legacy.explain_why_this_discount_is_needed_c9b75537` | Explain why this discount is needed... | توضیح بده چرا این تخفیف لازم است... | تشریح کړه چې ولې دا تخفیف ته اړتیا ده... |
| `legacy.enter_card_number_7b6a18c5` | Enter card number | شماره کارت را وارد کنید | د کارت شمېره داخل کړئ |
| `legacy.enter_phone_number_a2260785` | Enter phone number | شماره تلفن را وارد کنید | د تلیفون شمېره داخل کړئ |
