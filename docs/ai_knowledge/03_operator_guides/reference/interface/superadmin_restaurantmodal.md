---
id: "operator_reference_interface_superadmin_restaurantmodal"
title: "Restaurant Modal — controls and fields"
module: "administration"
description: "Restaurant Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["administration", "restaurant", "modal", "controls", "fields"]
roles: ["SuperAdmin"]
related_docs: ["operator_modules_administration_platform", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/super-admin"]
source_references: ["frontend/src/superAdmin/RestaurantModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Restaurant Modal — controls and fields

This reference records the controls and fields declared by `RestaurantModal`. Use [platform](../../modules/administration/platform.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/superAdmin/RestaurantModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Edit Restaurant Add New Restaurant`, `Restaurant details`, `Restaurant administrator`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | RestaurantModal; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | handleSubmit |
| Local UI result | setFieldErrors, setFormError, setSubmitting |

Trace symbols: `firstMessage`, `handleSubmit`, `parseApiErrors`, `validate`.

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | RestaurantModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | submitting |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Update Create

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Update Create |
| Location | RestaurantModal; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | submitting |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Update Create.  |
| Handler / destination | handleSubmit |
| Local UI result | setFieldErrors, setFormError, setSubmitting |

Trace symbols: `firstMessage`, `handleSubmit`, `parseApiErrors`, `validate`.

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Restaurant name * | text; name | Not declared; see submit validation | formData.name | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Restaurant email * | email; email | Not declared; see submit validation | formData.email | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Restaurant phone * | tel; phone | Not declared; see submit validation | formData.phone | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Restaurant logo (optional) | file; handleFileChange | Not declared; see submit validation | Parent/state supplied | accept=image/* | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Restaurant address * | textarea; address | Not declared; see submit validation | formData.address | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-6"></a> F6: Restaurant is active Active restaurants can use their permitted management features. | checkbox; is_active | Not declared; see submit validation | formData.is_active | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-7"></a> F7: Administrator username * | text; admin_name | Not declared; see submit validation | formData.admin_name | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when !editData |
| <a id="field-8"></a> F8: Administrator email * | email; admin_email | Not declared; see submit validation | formData.admin_email | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when !editData |
| <a id="field-9"></a> F9: Administrator phone * | tel; admin_phone | Not declared; see submit validation | formData.admin_phone | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when !editData |
| <a id="field-10"></a> F10: Temporary password (optional) | password; admin_password | Not declared; see submit validation | formData.admin_password | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when !editData |

## Submission and validation evidence

- `validate`: `if (!editData) {`; `if (!String(formData[field] \|\| "").trim()) errors[field] = message; }); if (formData.email.trim() && !EMAIL_PATTERN.test(formData.email.trim())) {`; `if ( !editData && formData.admin_email.trim() && !EMAIL_PATTERN.test(formData.admin_email.trim()) ) {`
- `handleSubmit`: `if (submitting) return; const errors = validate(); if (Object.keys(errors).length) {`; `if (!editData) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `inventory_manager.common.update` | Update | به‌روزرسانی | تازه کول |
| `inventory_manager.common.create` | Create | ایجاد | جوړول |
