---
id: "operator_reference_interface_component_customer_menupage"
title: "Menu Page — controls and fields"
module: "public_ordering"
description: "Menu Page — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["public_ordering", "menu", "page", "controls", "fields"]
roles: ["Public/customer"]
related_docs: ["operator_modules_public_ordering_customer_handoff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/:restaurantSlug/:branchSlug", "/:slug"]
source_references: ["frontend/src/component/Customer/MenuPage.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Menu Page — controls and fields

This reference records the controls and fields declared by `MenuPage`. Use [customer handoff](../../modules/public_ordering/customer_handoff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Customer/MenuPage.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Restaurant`, `{item.name}`, `{item.name}`, `No menu items found.`, `Your Cart`, `Your cart is empty.`, `{item.name}`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Grid view

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Grid view |
| Location | MenuPage; JSX button; handler () =&gt; setViewMode("grid") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Grid view.  |
| Handler / destination | () =&gt; setViewMode("grid") |
| Local UI result | setViewMode |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: List view

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | List view |
| Location | MenuPage; JSX button; handler () =&gt; setViewMode("list") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate List view.  |
| Handler / destination | () =&gt; setViewMode("list") |
| Local UI result | setViewMode |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | MenuPage; JSX button; handler () =&gt; setSelectedCategory(cat) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setSelectedCategory(cat) |
| Local UI result | setSelectedCategory |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | MenuPage; JSX div; handler () =&gt; { if (item.type === "platter") { navigate(getPlatterPath(publicContext, item.id)); } else { navigate(getMenuItemPath(publicContext, item.id)); } } |
| Appears when | viewMode === "grid" [true branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; { if (item.type === "platter") { navigate(getPlatterPath(publicContext, item.id)); } else { navigate(getMenuItemPath(publicContext, item.id)); } } |
| Local UI result | Navigation: getPlatterPath(publicContext, item.id)) getMenuItemPath(publicContext, item.id)) |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | MenuPage; JSX button; handler (e) =&gt; { e.stopPropagation(); toggleFavorite(item.id); } |
| Appears when | viewMode === "grid" [true branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); toggleFavorite(item.id); } |
| Local UI result | setFavorites |

Trace symbols: `toggleFavorite`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Rate

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Rate |
| Location | MenuPage; JSX button; handler (e) =&gt; { e.stopPropagation(); setReviewItemId(item.id); } |
| Appears when | user && item.type === "menu_item" AND viewMode === "grid" [true branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Rate.  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); setReviewItemId(item.id); } |
| Local UI result | setReviewItemId |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | MenuPage; JSX button; handler (e) =&gt; { e.stopPropagation(); addToCart(item); } |
| Appears when | qty === 0 [true branch] AND viewMode === "grid" [true branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | !item.final_availability \|\| orderingClosed |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); addToCart(item); } |
| Local UI result | setTimeout, setCart |

Trace symbols: `addToCart`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Minus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Minus icon (no text label) |
| Location | MenuPage; JSX button; handler (e) =&gt; { e.stopPropagation(); decrementItem(item.id, item.type); } |
| Appears when | qty === 0 [false branch] AND viewMode === "grid" [true branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Minus icon (no text label).  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); decrementItem(item.id, item.type); } |
| Local UI result | setCart |

Trace symbols: `decrementItem`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | MenuPage; JSX button; handler (e) =&gt; { e.stopPropagation(); incrementItem(item.id, item.type); } |
| Appears when | qty === 0 [false branch] AND viewMode === "grid" [true branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); incrementItem(item.id, item.type); } |
| Local UI result | setCart |

Trace symbols: `incrementItem`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | MenuPage; JSX div; handler () =&gt; { if (item.type === "platter") { navigate(getPlatterPath(publicContext, item.id)); } else { navigate(getMenuItemPath(publicContext, item.id)); } } |
| Appears when | viewMode === "grid" [false branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; { if (item.type === "platter") { navigate(getPlatterPath(publicContext, item.id)); } else { navigate(getMenuItemPath(publicContext, item.id)); } } |
| Local UI result | Navigation: getPlatterPath(publicContext, item.id)) getMenuItemPath(publicContext, item.id)) |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-11"></a>

### Action 11: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | MenuPage; JSX button; handler (e) =&gt; { e.stopPropagation(); toggleFavorite(item.id); } |
| Appears when | viewMode === "grid" [false branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); toggleFavorite(item.id); } |
| Local UI result | setFavorites |

Trace symbols: `toggleFavorite`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-12"></a>

### Action 12: Rate

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Rate |
| Location | MenuPage; JSX button; handler (e) =&gt; { e.stopPropagation(); setReviewItemId(item.id); } |
| Appears when | user && item.type === "menu_item" AND viewMode === "grid" [false branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Rate.  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); setReviewItemId(item.id); } |
| Local UI result | setReviewItemId |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-13"></a>

### Action 13: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | MenuPage; JSX button; handler (e) =&gt; { e.stopPropagation(); addToCart(item); } |
| Appears when | qty === 0 [true branch] AND viewMode === "grid" [false branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | !item.final_availability \|\| orderingClosed |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); addToCart(item); } |
| Local UI result | setTimeout, setCart |

Trace symbols: `addToCart`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-14"></a>

### Action 14: Minus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Minus icon (no text label) |
| Location | MenuPage; JSX button; handler (e) =&gt; { e.stopPropagation(); decrementItem(item.id, item.type); } |
| Appears when | qty === 0 [false branch] AND viewMode === "grid" [false branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Minus icon (no text label).  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); decrementItem(item.id, item.type); } |
| Local UI result | setCart |

Trace symbols: `decrementItem`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-15"></a>

### Action 15: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | MenuPage; JSX button; handler (e) =&gt; { e.stopPropagation(); incrementItem(item.id, item.type); } |
| Appears when | qty === 0 [false branch] AND viewMode === "grid" [false branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); incrementItem(item.id, item.type); } |
| Local UI result | setCart |

Trace symbols: `incrementItem`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-16"></a>

### Action 16: AFN {cartTotals.total.toFixed(2)}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | AFN {cartTotals.total.toFixed(2)} |
| Location | MenuPage; JSX button; handler () =&gt; setShowCart(true) |
| Appears when | cartTotals.itemCount &gt; 0 |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate AFN {cartTotals.total.toFixed(2)}.  |
| Handler / destination | () =&gt; setShowCart(true) |
| Local UI result | setShowCart |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-17"></a>

### Action 17: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | MenuPage; JSX div; handler () =&gt; setShowCart(false) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; setShowCart(false) |
| Local UI result | setShowCart |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-18"></a>

### Action 18: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | MenuPage; JSX button; handler () =&gt; setShowCart(false) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | () =&gt; setShowCart(false) |
| Local UI result | setShowCart |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-19"></a>

### Action 19: Browse Menu

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Browse Menu |
| Location | MenuPage; JSX button; handler () =&gt; setShowCart(false) |
| Appears when | cart.length === 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Browse Menu.  |
| Handler / destination | () =&gt; setShowCart(false) |
| Local UI result | setShowCart |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-20"></a>

### Action 20: Trash2 icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Trash2 icon (no text label) |
| Location | MenuPage; JSX button; handler () =&gt; removeFromCart(item.id, item.type) |
| Appears when | cart.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Trash2 icon (no text label).  |
| Handler / destination | () =&gt; removeFromCart(item.id, item.type) |
| Local UI result | setCart |

Trace symbols: `removeFromCart`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-21"></a>

### Action 21: Minus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Minus icon (no text label) |
| Location | MenuPage; JSX button; handler () =&gt; decrementItem(item.id, item.type) |
| Appears when | cart.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Minus icon (no text label).  |
| Handler / destination | () =&gt; decrementItem(item.id, item.type) |
| Local UI result | setCart |

Trace symbols: `decrementItem`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-22"></a>

### Action 22: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | MenuPage; JSX button; handler () =&gt; incrementItem(item.id, item.type) |
| Appears when | cart.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | () =&gt; incrementItem(item.id, item.type) |
| Local UI result | setCart |

Trace symbols: `incrementItem`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-23"></a>

### Action 23: Clear Cart

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Clear Cart |
| Location | MenuPage; JSX button; handler clearCart |
| Appears when | cart.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Clear Cart.  |
| Handler / destination | clearCart |
| Local UI result | setCart |

Trace symbols: `clearCart`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-24"></a>

### Action 24: Checkout

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Checkout |
| Location | MenuPage; JSX button; handler handleCheckout |
| Appears when | cart.length &gt; 0 |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Checkout.  |
| Handler / destination | handleCheckout |
| Local UI result | setShowCheckout |

Trace symbols: `handleCheckout`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-25"></a>

### Action 25: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | MenuPage; JSX CheckoutForm; handler handlePlaceOrder |
| Appears when | showCheckout |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | handlePlaceOrder |
| Local UI result | setOrders, setShowCart, setShowCheckout, setCart |

Trace symbols: `clearCart`, `handlePlaceOrder`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search menu... | text; searchQuery | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: sortOption | select; sortOption | Not declared; see submit validation | t("menu.sort.default") | ; choices: Default [], Price: Low to High [], Price: High to Low [] | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.error` | Failed to load menu data |
| `toast.success` | added to cart |
| `toast.error` | Not enough remaining quantity |
| `toast.error` | Your cart is empty! |
| `toast.error` | message |
| `toast.success` | Order placed successfully! |
| `toast.error` | Network error. Please try again. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.grid_view_d44ec861` | Grid view | نمای شبکه ای | د شبکې لید |
| `legacy.list_view_694bbd75` | List view | نمای فهرست | لیست لید |
| `menu.rate` | Rate | امتیاز دهید | امتیاز ورکړئ |
| `menu.buttons.add` | Add to Cart | افزودن به سبد | کارټ ته اضافه کړئ |
| `menu.unavailable` | Unavailable | ناموجود | شتون نلري |
| `menu.cart.title` | Your Cart | سبد خرید شما | ستاسو کارټ |
| `labels.afn` | AFN | افغانی | افغانۍ |
| `legacy.browse_menu_523bd7c9` | Browse Menu | منوی مرور | د مینو لټون وکړئ |
| `legacy.clear_cart_610fd81a` | Clear Cart | چرخ دستی پاک | پاکه ګاډی |
| `menu.cart.checkout` | Checkout | پرداخت | تادیه |
| `menu.search` | Search menu... | جستجوی غذا... | مینو ولټوئ... |
| `menu.sort.default` | Default | پیش‌فرض | اصلي |
| `menu.sort.low_high` | Price: Low to High | قیمت: کم به زیاد | بیه: ټیټه تر لوړه |
| `menu.sort.high_low` | Price: High to Low | قیمت: زیاد به کم | بیه: لوړه تر ټیټه |

## Related interface references

- [component customer checkoutform](component_customer_checkoutform.md)
- [component customer reviewpage](component_customer_reviewpage.md)
