---
id: "operator_reference_interface_component_customer_checkoutform"
title: "Checkout Form — controls and fields"
module: "public_ordering"
description: "Checkout Form — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["public_ordering", "checkout", "form", "controls", "fields"]
roles: ["Public/customer"]
related_docs: ["operator_modules_public_ordering_customer_handoff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/:restaurantSlug/:branchSlug", "/:slug"]
source_references: ["frontend/src/component/Customer/CheckoutForm.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Checkout Form — controls and fields

This reference records the controls and fields declared by `CheckoutForm`. Use [customer handoff](../../modules/public_ordering/customer_handoff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Customer/CheckoutForm.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Review your information`

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
| Location | CheckoutForm; JSX div; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | CheckoutForm; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleSubmit |
| Local UI result | setLoading, setErrors, setTouched |

Trace symbols: `handleSubmit`, `isValidCoordinate`, `validate`, `validateEmail`, `validateName`, `validatePhone`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Close

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close |
| Location | CheckoutForm; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | CheckoutForm; JSX button; handler getAccurateCurrentLocation |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | locationLoading |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | getAccurateCurrentLocation |
| Local UI result | setLocationLoading, setLocation, setMapInput, setTimeout, setFormData, setTouched, setErrors |

Trace symbols: `applyLocation`, `clearLocationWatch`, `finish`, `getAccurateCurrentLocation`, `getGoogleMapsUrl`, `isValidCoordinate`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Select Map

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Select Map |
| Location | CheckoutForm; JSX button; handler openMapSelector |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Select Map.  |
| Handler / destination | openMapSelector |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `getGoogleMapsUrl`, `isValidCoordinate`, `openMapSelector`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Placing Order... Place Order

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Placing Order... Place Order |
| Location | CheckoutForm; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Placing Order... Place Order.  |
| Handler / destination | handleSubmit |
| Local UI result | setLoading, setErrors, setTouched |

Trace symbols: `handleSubmit`, `isValidCoordinate`, `validate`, `validateEmail`, `validateName`, `validatePhone`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Full Name | input; name | Not declared; see submit validation | user?.username \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when !user |
| <a id="field-2"></a> F2: Phone Number | input; phone | Not declared; see submit validation | user?.phone \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Email Address | email; email | Not declared; see submit validation | user?.email \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Delivery Address | input; address | Not declared; see submit validation | user?.address \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: t( "checkout.location.pasteHint", "Paste Google Maps link or lat,lng", ) | text; mapInput | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

- `validateName`: See the named handler and the module procedure for custom validation.
- `validatePhone`: See the named handler and the module procedure for custom validation.
- `validateEmail`: See the named handler and the module procedure for custom validation.
- `validateField`: See the named handler and the module procedure for custom validation.
- `validate`: See the named handler and the module procedure for custom validation.
- `handleSubmit`: `if (loading) return; if (!validate()) return; if (!isValidCoordinate(location.lat, location.lng)) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.error` | Could not detect location properly. |
| `toast.success` | `Current location set${accuracyText}` |
| `toast.error` | Your browser does not support location detection. |
| `toast.error` | Could not detect your current location. |
| `toast.error` | `Current location is too approximate (${Math.round( accuracy, )}m). Please use Map and choose your exact pin.`, { duration: 6000 } |
| `toast.error` | Location permission was denied. |
| `toast.error` | Your current location is unavailable. |
| `toast.error` | Location detection timed out. |
| `toast.error` | Could not detect your current location. |
| `toast.error` | Invalid location format |
| `toast.error` | Please set your delivery location. |
| `toast.error` | Failed to place order |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.common.close` | Close | بستن | بندول |
| `checkout.location.detecting` | Detecting... | در حال تشخیص... | تشخیص کېږي... |
| `checkout.location.current` | Current | موقعیت فعلی | اوسنی موقعیت |
| `checkout.location.selectMap` | Select Map | انتخاب نقشه | نقشه وټاکئ |
| `checkout.order.placing` | Placing Order... | در حال ثبت سفارش... | امر ثبت کېږي... |
| `checkout.placeOrder` | Place Order | ثبت سفارش | سفارش ورکړئ |
| `legacy.john_doe_ae6e4d12` | John Doe | جان دو | جان دو |
| `legacy.07xxxxxxxx_89a2e30b` | 07XXXXXXXX | ۰۷XXXXXXXX | ۰۷XXXXXXXX |
| `customerAuth.signup.emailPlaceholder` | you@example.com | you@example.com | you@example.com |
| `legacy.street_district_city_03447b04` | Street, District, City | خیابان، ناحیه، شهر | سړک، ولسوالۍ، ښار |
| `checkout.location.pasteHint` | Paste Google Maps link or lat,lng | لینک گوگل مپ یا مختصات را وارد کنید | د ګوګل مپ لینک یا lat,lng پیسټ کړئ |
