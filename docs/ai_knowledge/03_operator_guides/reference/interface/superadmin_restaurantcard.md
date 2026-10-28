---
id: "operator_reference_interface_superadmin_restaurantcard"
title: "Restaurant Card — controls and fields"
module: "administration"
description: "Restaurant Card — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["administration", "restaurant", "card", "controls", "fields"]
roles: ["SuperAdmin"]
related_docs: ["operator_modules_administration_platform", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/super-admin"]
source_references: ["frontend/src/superAdmin/RestaurantCard.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Restaurant Card — controls and fields

This reference records the controls and fields declared by `RestaurantCard`. Use [platform](../../modules/administration/platform.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/superAdmin/RestaurantCard.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{restaurant.name}`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: End

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | End |
| Location | RestaurantCard; JSX button; handler () =&gt; endSubscription(restaurant.id) |
| Appears when | subscription [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate End.  |
| Handler / destination | () =&gt; endSubscription(restaurant.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `endSubscription`.

Requests made by this handler or local helpers:

- `instance.post(′restaurant/disable-subscription/${restaurantId}/′)`

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: `Show ${restaurant.name} on the landing page`

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | `Show ${restaurant.name} on the landing page` |
| Location | RestaurantCard; JSX button; handler () =&gt; onLandingVisibilityChange(restaurant, !isShownOnLanding) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | isLandingVisibilityPending |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate `Show ${restaurant.name} on the landing page`.  |
| Handler / destination | () =&gt; onLandingVisibilityChange(restaurant, !isShownOnLanding) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Subscription

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Subscription |
| Location | RestaurantCard; JSX button; handler () =&gt; onManageSub(restaurant) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Subscription.  |
| Handler / destination | () =&gt; onManageSub(restaurant) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Edit

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Edit |
| Location | RestaurantCard; JSX button; handler () =&gt; onEdit(restaurant) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Edit.  |
| Handler / destination | () =&gt; onEdit(restaurant) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Delete

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Delete |
| Location | RestaurantCard; JSX button; handler () =&gt; onDelete(restaurant.id) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. SuperAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Delete.  |
| Handler / destination | () =&gt; onDelete(restaurant.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [platform](../../modules/administration/platform.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.end_a2bb9d34` | End | پایان | پای |
| `legacy.subscription_8fde48f3` | Subscription | اشتراک | ګډون |
| `staff.table.edit` | Edit | ویرایش | سمول |
| `staff.table.delete` | Delete | حذف | ړنګول |
