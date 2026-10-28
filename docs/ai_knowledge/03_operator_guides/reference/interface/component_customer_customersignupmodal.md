---
id: "operator_reference_interface_component_customer_customersignupmodal"
title: "Customer Signup Modal — controls and fields"
module: "public_ordering"
description: "Customer Signup Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["public_ordering", "customer", "signup", "modal", "controls", "fields"]
roles: ["Public/customer"]
related_docs: ["operator_modules_public_ordering_customer_handoff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/signup"]
source_references: ["frontend/src/component/Customer/CustomerSignupModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Customer Signup Modal — controls and fields

This reference records the controls and fields declared by `CustomerSignupModal`. Use [customer handoff](../../modules/public_ordering/customer_handoff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Customer/CustomerSignupModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

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
| Location | CustomerSignupModal; JSX button; handler toggle |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | toggle |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Sign in

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Sign in |
| Location | CustomerSignupModal; JSX Link; handler /login |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Sign in.  |
| Handler / destination | /login |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | CustomerSignupModal; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleSubmit |
| Local UI result | setError, setLoading, setItem |

Trace symbols: `getApiError`, `handleSubmit`, `validate`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Terms

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Terms |
| Location | CustomerSignupModal; JSX Link; handler /terms |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Terms.  |
| Handler / destination | /terms |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Privacy Policy

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Privacy Policy |
| Location | CustomerSignupModal; JSX Link; handler /privacy |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Privacy Policy.  |
| Handler / destination | /privacy |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Creating your account... Create customer account

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Creating your account... Create customer account |
| Location | CustomerSignupModal; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Creating your account... Create customer account.  |
| Handler / destination | handleSubmit |
| Local UI result | setError, setLoading, setItem |

Trace symbols: `getApiError`, `handleSubmit`, `validate`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Username | text; username | true | "" | minLength=2; maxLength=30 | read-only=false; disabled=loading |
| <a id="field-2"></a> F2: Email address Optional | email; email | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=loading |
| <a id="field-3"></a> F3: Password | showPassword ? "text" : "password"; password | true | "" | minLength=6 | read-only=false; disabled=loading |
| <a id="field-4"></a> F4: Confirm password | showConfirmPassword ? "text" : "password"; confirm_password | true | "" | minLength=6 | read-only=false; disabled=loading |
| <a id="field-5"></a> F5: Phone number | tel; phone | true | "" | minLength=7; maxLength=15 | read-only=false; disabled=loading |
| <a id="field-6"></a> F6: Date of birth | date; date_of_birth | true | "" | max=today | read-only=false; disabled=loading |
| <a id="field-7"></a> F7: Delivery address | text; address | true | "" | minLength=5 | read-only=false; disabled=loading |

## Submission and validation evidence

- `validate`: `if ( username.length &lt; 2 \|\| !/^[\p{L}\p{N}@.+_-]+$/u.test(username) ) {`; `if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { return Enter a valid email address.; } if (formData.password.length &lt; 6) {`; `if (formData.password !== formData.confirm_password) { return Passwords do not match.; } if (!/^[0-9]{7,15}$/.test(formData.phone)) {`; `if (formData.address.trim().length &lt; 5) {`
- `handleSubmit`: `if (loading) return; const validationError = validate(); if (validationError) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | validationError |
| `setError` | We could not create your account. Please try again. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `customerAuth.shared.hidePassword` | Hide password | پنهان‌کردن رمز عبور | پټنوم پټ کړئ |
| `customerAuth.shared.showPassword` | Show password | نمایش رمز عبور | پټنوم ښکاره کړئ |
| `customerAuth.signup.signIn` | Sign in | وارد شوید | ننوځئ |
| `customerAuth.signup.terms` | Terms | شرایط استفاده | شرایطو |
| `customerAuth.signup.privacy` | Privacy Policy | سیاست حریم خصوصی موافقت می‌کنید | د محرمیت له تګلارې سره موافقه کوئ |
| `customerAuth.signup.loading` | Creating your account... | در حال ساخت حساب... | حساب جوړېږي... |
| `customerAuth.signup.submit` | Create customer account | ساخت حساب مشتری | د پېرېدونکي حساب جوړول |
| `customerAuth.signup.usernamePlaceholder` | Choose a username | یک نام کاربری انتخاب کنید | یو کارن نوم وټاکئ |
| `customerAuth.signup.emailPlaceholder` | you@example.com | you@example.com | you@example.com |
| `customerAuth.signup.passwordPlaceholder` | At least 6 characters | حداقل ۶ نویسه | لږ تر لږه ۶ توري |
| `customerAuth.signup.confirmPlaceholder` | Enter it again | رمز عبور را دوباره وارد کنید | پټنوم بیا ولیکئ |
| `customerAuth.signup.phonePlaceholder` | 7 to 15 digits | ۷ تا ۱۵ رقم | له ۷ تر ۱۵ شمېرو |
| `customerAuth.signup.addressPlaceholder` | Street, area, or neighborhood | سرک، ناحیه یا محله | کوڅه، سیمه یا ګاونډ |

## Related interface references

- [component customer customerauthlayout](component_customer_customerauthlayout.md)
