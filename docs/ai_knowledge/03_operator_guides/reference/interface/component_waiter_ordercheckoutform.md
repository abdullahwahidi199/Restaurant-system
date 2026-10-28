---
id: "operator_reference_interface_component_waiter_ordercheckoutform"
title: "Order Checkout Form — controls and fields"
module: "orders"
description: "Order Checkout Form declarations without a mounted App import path; retained for source explanation, not current operator instructions."
keywords: ["orders", "order", "checkout", "form", "controls", "fields"]
roles: []
related_docs: ["operator_modules_orders_waiter_tables", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: []
source_references: ["frontend/src/component/waiter/OrderCheckoutForm.jsx", "frontend/src/i18n.js"]
status: "needs_verification"
availability: "unmounted"
---

# Order Checkout Form — controls and fields

This reference records the controls and fields declared by `OrderCheckoutForm`. Use [waiter tables](../../modules/orders/waiter_tables.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/waiter/OrderCheckoutForm.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Review your information`

## Mounting status: Needs Verification

No rendered App route was traced to this component. It may be unused/legacy or only reachable through a runtime reference not resolved by static imports. The declarations below are inventory evidence, not an implemented navigation procedure. Do not teach its controls as available until a mounted caller is verified.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: ✕

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | ✕ |
| Location | OrderCheckoutForm; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate ✕.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Place Order

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Place Order |
| Location | OrderCheckoutForm; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Place Order.  |
| Handler / destination | handleSubmit |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `handleSubmit`, `validateName`, `validatePhone`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Full Name | text; name | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: `${Phone Number} (${Optional})` | text; phone | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Enter your suggesstion here... | textarea; note | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

- `validateName`: See the named handler and the module procedure for custom validation.
- `validatePhone`: See the named handler and the module procedure for custom validation.
- `handleSubmit`: `if (!formData.name.trim()) { return toast.error(Name is required!); } if (!validateName(formData.name)) {`; `if (formData.phone.trim() && !validatePhone(formData.phone)) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.error` | Name is required! |
| `toast.error` | Name can only contain letters! |
| `toast.error` | Phone number must be 7–15 digits! |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `checkout.placeOrder` | Place Order | ثبت سفارش | سفارش ورکړئ |
| `checkout.name` | Full Name | نام کامل | بشپړ نوم |
| `checkout.phone` | Phone Number | شماره تماس | د ټیلیفون شمېره |
| `customerAuth.shared.optional` | Optional | اختیاری | اختیاري |
| `legacy.enter_your_suggesstion_here_33944da1` | Enter your suggesstion here... | اینجا درخواست خود را وارد کنید... | دلته خپل مشوره داخل کړئ... |
