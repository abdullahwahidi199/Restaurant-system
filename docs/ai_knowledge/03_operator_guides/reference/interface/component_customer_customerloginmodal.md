---
id: "operator_reference_interface_component_customer_customerloginmodal"
title: "Customer Login Modal — controls and fields"
module: "public_ordering"
description: "Customer Login Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["public_ordering", "customer", "login", "modal", "controls", "fields"]
roles: ["Public/customer"]
related_docs: ["operator_modules_public_ordering_customer_handoff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/login"]
source_references: ["frontend/src/component/Customer/CustomerLoginModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Customer Login Modal — controls and fields

This reference records the controls and fields declared by `CustomerLoginModal`. Use [customer handoff](../../modules/public_ordering/customer_handoff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Customer/CustomerLoginModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Create a customer account

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Create a customer account |
| Location | CustomerLoginModal; JSX Link; handler /signup |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Create a customer account.  |
| Handler / destination | /signup |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | CustomerLoginModal; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleSubmit |
| Local UI result | setError, setLoading, setItem |

Trace symbols: `formatRetryAfter`, `handleSubmit`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | CustomerLoginModal; JSX button; handler () =&gt; setShowPassword((visible) =&gt; !visible) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setShowPassword((visible) =&gt; !visible) |
| Local UI result | setShowPassword |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Signing you in... Sign in to Pakhlai

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Signing you in... Sign in to Pakhlai |
| Location | CustomerLoginModal; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Signing you in... Sign in to Pakhlai.  |
| Handler / destination | handleSubmit |
| Local UI result | setError, setLoading, setItem |

Trace symbols: `formatRetryAfter`, `handleSubmit`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Username | text; username | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=loading |
| <a id="field-2"></a> F2: Password | showPassword ? "text" : "password"; password | true | ""  | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=loading |

## Submission and validation evidence

- `handleSubmit`: `if (requestError.response?.status === 429) {`; `if (requestError.response?.status === 503) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Too many login attempts. Please try again in {{duration}}. |
| `setError` | Login is temporarily unavailable. Please try again shortly. |
| `setError` | Invalid username or password. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `customerAuth.login.createAccount` | Create a customer account | ساخت حساب مشتری | د پېرېدونکي حساب جوړ کړئ |
| `customerAuth.shared.hidePassword` | Hide password | پنهان‌کردن رمز عبور | پټنوم پټ کړئ |
| `customerAuth.shared.showPassword` | Show password | نمایش رمز عبور | پټنوم ښکاره کړئ |
| `customerAuth.login.loading` | Signing you in... | در حال ورود... | د ننوتلو په حال کې... |
| `customerAuth.login.submit` | Sign in to Pakhlai | ورود به پخلای | پخلای ته ننوتل |
| `customerAuth.login.usernamePlaceholder` | Enter your username | نام کاربری‌تان را وارد کنید | خپل کارن نوم ولیکئ |
| `customerAuth.login.passwordPlaceholder` | Enter your password | رمز عبور‌تان را وارد کنید | خپل پټنوم ولیکئ |

## Related interface references

- [component customer customerauthlayout](component_customer_customerauthlayout.md)
