---
id: "operator_reference_interface_superadmin_superadminmain"
title: "Super Admin Main — controls and fields"
module: "administration"
description: "Super Admin Main — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["administration", "super", "admin", "main", "controls", "fields"]
roles: ["SuperAdmin"]
related_docs: ["operator_modules_administration_platform", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/super-admin"]
source_references: ["frontend/src/superAdmin/SuperAdminMain.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Super Admin Main — controls and fields

This reference records the controls and fields declared by `SuperAdminMain`. Use [platform](../../modules/administration/platform.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/superAdmin/SuperAdminMain.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Super Admin Dashboard`, `Login Rate Limiting`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Restaurants

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Restaurants |
| Location | SuperAdminMain; JSX button; handler () =&gt; setActiveTab("restaurants") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Restaurants.  |
| Handler / destination | () =&gt; setActiveTab("restaurants") |
| Local UI result | setActiveTab |

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Security

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Security |
| Location | SuperAdminMain; JSX button; handler () =&gt; setActiveTab("security") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Security.  |
| Handler / destination | () =&gt; setActiveTab("security") |
| Local UI result | setActiveTab |

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: + Add Restaurant

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | + Add Restaurant |
| Location | SuperAdminMain; JSX button; handler handleOpenAdd |
| Appears when | activeTab === "restaurants" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate + Add Restaurant.  |
| Handler / destination | handleOpenAdd |
| Local UI result | setEditRestaurant, setIsRestModalOpen |

Trace symbols: `handleOpenAdd`.

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Loading security settings... Failed attempts Window minutes Lockout minutes Saving... / Save (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Loading security settings... Failed attempts Window minutes Lockout minutes Saving... / Save (conditional text) |
| Location | SuperAdminMain; JSX form; handler handleSaveSecurity |
| Appears when | activeTab === "security" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Loading security settings... Failed attempts Window minutes Lockout minutes Saving... / Save (conditional text). Review the confirmation before accepting. |
| Handler / destination | handleSaveSecurity |
| Local UI result | setSecuritySaving, setSecuritySettings |

Trace symbols: `handleSaveSecurity`.

Requests made by this handler or local helpers:

- `instance.patch( "/users/security/login-rate-limit/", payload,`

Dialog content: `"Error saving security settings.")`.

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Saving... / Save (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Saving... / Save (conditional text) |
| Location | SuperAdminMain; JSX button; handler handleSaveSecurity |
| Appears when | securityLoading \|\| !securitySettings [false branch] AND activeTab === "security" |
| Disabled when | securitySaving |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Saving... / Save (conditional text). Review the confirmation before accepting. |
| Handler / destination | handleSaveSecurity |
| Local UI result | setSecuritySaving, setSecuritySettings |

Trace symbols: `handleSaveSecurity`.

Requests made by this handler or local helpers:

- `instance.patch( "/users/security/login-rate-limit/", payload,`

Dialog content: `"Error saving security settings.")`.

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Enabled | checkbox; Boolean(securitySettings?.enabled) | Not declared; see submit validation | Boolean(securitySettings?.enabled) | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=securityLoading \|\| !securitySettings; shown when activeTab === "security" |
| <a id="field-2"></a> F2: Failed attempts | number; securitySettings.max_failed_attempts | Not declared; see submit validation | securitySettings.max_failed_attempts | min=1; max=100 | read-only=false; disabled=false; shown when securityLoading \|\| !securitySettings [false branch] AND activeTab === "security" |
| <a id="field-3"></a> F3: Window minutes | number; securitySettings.window_minutes | Not declared; see submit validation | securitySettings.window_minutes | min=1; max=1440 | read-only=false; disabled=false; shown when securityLoading \|\| !securitySettings [false branch] AND activeTab === "security" |
| <a id="field-4"></a> F4: Lockout minutes | number; securitySettings.lockout_minutes | Not declared; see submit validation | securitySettings.lockout_minutes | min=1; max=1440 | read-only=false; disabled=false; shown when securityLoading \|\| !securitySettings [false branch] AND activeTab === "security" |

## Submission and validation evidence

- `handleSaveRestaurant`: `if (id) {`
- `handleSaveSubscription`: `if (existingId) {`
- `handleSaveSecurity`: See the named handler and the module procedure for custom validation.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `window.confirm` | "Are you sure you want to delete this restaurant?" |
| `alert` | "Error saving subscription." |
| `alert` | "Error saving security settings." |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `landing.marketplace.nav.restaurants` | Restaurants | رستورانت‌ها | رستورانتونه |
| `legacy.security_f25ce1b8` | Security | امنیت | امنیت |
| `legacy.add_restaurant_c51e6e4b` | + Add Restaurant | + رستورانت Add | + رستورانت Add |
| `saving` | Saving... | در حال ذخیره... | خوندي کېږي... |
| `legacy.save_efc007a3` | Save | ذخیره | ژغورنه |

## Related interface references

- [superadmin restaurantcard](superadmin_restaurantcard.md)
- [superadmin restaurantmodal](superadmin_restaurantmodal.md)
- [superadmin subscriptionmodal](superadmin_subscriptionmodal.md)
