---
id: "operator_reference_interface_component_customer_onlineplatterdetails"
title: "Online Platter Details — controls and fields"
module: "public_ordering"
description: "Online Platter Details — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["public_ordering", "online", "platter", "details", "controls", "fields"]
roles: ["Public/customer"]
related_docs: ["operator_modules_public_ordering_customer_handoff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/:restaurantSlug/:branchSlug/menu/platter/:id", "/:slug/menu/platter/:id"]
source_references: ["frontend/src/component/Customer/OnlinePlatterDetails.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Online Platter Details — controls and fields

This reference records the controls and fields declared by `OnlinePlatterDetails`. Use [customer handoff](../../modules/public_ordering/customer_handoff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Customer/OnlinePlatterDetails.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Platter Not Found`, `{platter.name}`, `{platter.name}`, `What's Inside`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Try Again

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Try Again |
| Location | OnlinePlatterDetails; JSX button; handler fetchPlatterDetails |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Try Again.  |
| Handler / destination | fetchPlatterDetails |
| Local UI result | setLoading, setError, setPlatter |

Trace symbols: `fetchPlatterDetails`.

Requests made by this handler or local helpers:

- `instance.get(′${menuApiBase}/platters/${id}/′)`

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Go back

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Go back |
| Location | OnlinePlatterDetails; JSX button; handler () =&gt; navigate(-1) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Go back.  |
| Handler / destination | () =&gt; navigate(-1) |
| Local UI result | Navigation: -1) |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Minus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Minus icon (no text label) |
| Location | OnlinePlatterDetails; JSX button; handler () =&gt; setQuantity((q) =&gt; Math.max(1, q - 1)) |
| Appears when | platter.final_availability |
| Disabled when | quantity &lt;= 1 |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Minus icon (no text label).  |
| Handler / destination | () =&gt; setQuantity((q) =&gt; Math.max(1, q - 1)) |
| Local UI result | setQuantity |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | OnlinePlatterDetails; JSX button; handler () =&gt; setQuantity((q) =&gt; q + 1) |
| Appears when | platter.final_availability |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | () =&gt; setQuantity((q) =&gt; q + 1) |
| Local UI result | setQuantity |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Added to Cart Add to Cart — AFN

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Added to Cart Add to Cart — AFN |
| Location | OnlinePlatterDetails; JSX button; handler handleAddToCart |
| Appears when | platter.final_availability |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Added to Cart Add to Cart — AFN.  |
| Handler / destination | handleAddToCart |
| Local UI result | setItem, setAdded, setTimeout |

Trace symbols: `handleAddToCart`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Unable to load platter details. Please try again. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `labels.try_again` | Try Again | تلاش دوباره | بیا هڅه وکړئ |
| `legacy.go_back_e84712fb` | Go back | پس برو | بیرته لاړ شه |
| `labels.added_to_cart` | Added to Cart | به سبد اضافه شد | کارټ ته اضافه شو |
| `legacy.add_to_cart_d2403740` | Add to Cart — | به کارت اضافه کنید — | کارت ته اضافه کړه — |
| `labels.afn` | AFN | افغانی | افغانۍ |
