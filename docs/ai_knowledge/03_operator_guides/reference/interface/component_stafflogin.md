---
id: "operator_reference_interface_component_stafflogin"
title: "Staff Login — controls and fields"
module: "interface_reference"
description: "Staff Login — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["interface_reference", "staff", "login", "controls", "fields"]
roles: ["Public/customer"]
related_docs: ["operator_navigation_common_interface_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/login", "/staff-login"]
source_references: ["frontend/src/component/StaffLogin.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Staff Login — controls and fields

This reference records the controls and fields declared by `StaffLogin`. Use [common interface controls](../../navigation/common_interface_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/StaffLogin.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Run service with clarity from the first login.`, `Staff sign in`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Username Password

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Username Password |
| Location | StaffLogin; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Username Password.  |
| Handler / destination | handleSubmit |
| Local UI result | setLoading |

Trace symbols: `formatRetryAfter`, `getFriendlyError`, `handleSubmit`.

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | StaffLogin; JSX button; handler () =&gt; setShowPassword((value) =&gt; !value) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setShowPassword((value) =&gt; !value) |
| Local UI result | setShowPassword |

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Logging in... Login

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Logging in... Login |
| Location | StaffLogin; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Logging in... Login.  |
| Handler / destination | handleSubmit |
| Local UI result | setLoading |

Trace symbols: `formatRetryAfter`, `getFriendlyError`, `handleSubmit`.

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Username | text; username | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Password | showPassword ? "text" : "password"; password | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

- `handleSubmit`: `if (data.requires_branch_selection) { nav("/select-branch", { state: { redirectPath } }); } else { nav(redirectPath); } } catch (err) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.success` | Welcome back! Redirecting... |
| `toast.error` | friendlyMessage, { duration: 4000, style: { background: "var(--theme-secondary)", color: "var(--theme-surface)", border: "1px solid var(--theme-danger)", }, iconTheme: { primary: "var(--theme-danger)", secondary: "var(--theme-surface)", }, } |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `login.hidePassword` | Hide password | پنهان کردن رمز عبور | پټ نوم پټ کړئ |
| `login.showPassword` | Show password | نمایش رمز عبور | پټ نوم ښکاره کړئ |
| `login.loading` | Logging in... | در حال ورود... | ننوتل روان دي... |
| `login.button` | Login | ورود | ننوتل |
| `login.usernamePlaceholder` | Enter username | نام کاربری را وارد کنید | کارن نوم ولیکئ |
| `login.passwordPlaceholder` | Enter password | رمز عبور را وارد کنید | پټ نوم ولیکئ |
