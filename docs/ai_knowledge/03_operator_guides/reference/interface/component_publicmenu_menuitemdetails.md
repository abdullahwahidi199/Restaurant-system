---
id: "operator_reference_interface_component_publicmenu_menuitemdetails"
title: "Menu Item Details — controls and fields"
module: "public_ordering"
description: "Menu Item Details — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["public_ordering", "menu", "item", "details", "controls", "fields"]
roles: ["Public/customer"]
related_docs: ["operator_modules_public_ordering_customer_handoff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/menu/:slug/item/:id"]
source_references: ["frontend/src/component/PublicMenu/MenuItemDetails.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Menu Item Details — controls and fields

This reference records the controls and fields declared by `MenuItemDetails`. Use [customer handoff](../../modules/public_ordering/customer_handoff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/PublicMenu/MenuItemDetails.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Item Not Found`, `{getLocalizedName(itemDetails)}`, `{getLocalizedName(itemDetails)}`, `Customer Reviews`

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
| Location | MenuItemDetails; JSX button; handler fetchItemDetails |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Try Again.  |
| Handler / destination | fetchItemDetails |
| Local UI result | setLoading, setError, setItemDetails |

Trace symbols: `fetchItemDetails`.

Requests made by this handler or local helpers:

- `instance.get(′/menu/public/${slug}/menu-items/${id}/′)`

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Go Back

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Go Back |
| Location | MenuItemDetails; JSX button; handler () =&gt; navigate(-1) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Go Back.  |
| Handler / destination | () =&gt; navigate(-1) |
| Local UI result | Navigation: -1) |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Go Back

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Go Back |
| Location | MenuItemDetails; JSX button; handler () =&gt; navigate(-1) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Go Back.  |
| Handler / destination | () =&gt; navigate(-1) |
| Local UI result | Navigation: -1) |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Minus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Minus icon (no text label) |
| Location | MenuItemDetails; JSX button; handler () =&gt; setQuantity((q) =&gt; Math.max(1, q - 1)) |
| Appears when | itemDetails.final_availability |
| Disabled when | quantity &lt;= 1 |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Minus icon (no text label).  |
| Handler / destination | () =&gt; setQuantity((q) =&gt; Math.max(1, q - 1)) |
| Local UI result | setQuantity |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | MenuItemDetails; JSX button; handler () =&gt; setQuantity((q) =&gt; q + 1) |
| Appears when | itemDetails.final_availability |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | () =&gt; setQuantity((q) =&gt; q + 1) |
| Local UI result | setQuantity |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Added to Cart Add to Cart AFN

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Added to Cart Add to Cart AFN |
| Location | MenuItemDetails; JSX button; handler handleAddToCart |
| Appears when | itemDetails.final_availability |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Added to Cart Add to Cart AFN.  |
| Handler / destination | handleAddToCart |
| Local UI result | setItem, setAdded, setTimeout |

Trace symbols: `handleAddToCart`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | This item is unavailable right now. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `labels.try_again` | Try Again | تلاش دوباره | بیا هڅه وکړئ |
| `labels.go_back` | Go Back | بازگشت | شاته ولاړ شئ |
| `labels.added_to_cart` | Added to Cart | به سبد اضافه شد | کارټ ته اضافه شو |
| `labels.add_to_cart` | Add to Cart | افزودن به سبد | کارټ ته اضافه کړئ |
| `labels.afn` | AFN | افغانی | افغانۍ |
