---
id: "operator_reference_interface_component_publicmenu_publicmenu"
title: "Public Menu — controls and fields"
module: "public_ordering"
description: "Public Menu — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["public_ordering", "public", "menu", "controls", "fields"]
roles: ["Public/customer"]
related_docs: ["operator_modules_public_ordering_customer_handoff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/menu/:slug"]
source_references: ["frontend/src/component/PublicMenu/PublicMenu.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Public Menu — controls and fields

This reference records the controls and fields declared by `PublicMenu`. Use [customer handoff](../../modules/public_ordering/customer_handoff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/PublicMenu/PublicMenu.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Menu Unavailable`, `{restaurantInfo?.name \|\| ( &lt;ShimmerText&gt; {slug ?.replace(/-/g, " ") .replace(/\b\w/g, (c) =&gt; c.toUpp … [see named source symbol]`, `{getLocalizedCategoryName(selectedCategory)}`, `{getLocalizedItemName(item)}`, `{getLocalizedItemName(item)}`, `No Items Found`, `Your Order`, `Your Cart is Empty`, `{i18n.language === "fa" ? item.name_dari \|\| item.name : i18n.language === "ps" ? item.name_pashto \|\| … [see named source symbol]`

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
| Location | PublicMenu; JSX button; handler () =&gt; setIsOpen((v) =&gt; !v) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setIsOpen((v) =&gt; !v) |
| Local UI result | setIsOpen |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | PublicMenu; JSX button; handler () =&gt; handleChange(lang.code) |
| Appears when | isOpen |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; handleChange(lang.code) |
| Local UI result | setIsOpen |

Trace symbols: `handleChange`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Try Again

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Try Again |
| Location | PublicMenu; JSX button; handler fetchMenuItems |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Try Again.  |
| Handler / destination | fetchMenuItems |
| Local UI result | setLoading, setError, setCategories |

Trace symbols: `fetchMenuItems`, `normalizeMenuCollection`, `normalizePublicCategories`.

Requests made by this handler or local helpers:

- `instance.get(′/menu/public/${slug}/categories/′)`

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | PublicMenu; JSX button; handler () =&gt; setSearchQuery("") |
| Appears when | searchQuery |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | () =&gt; setSearchQuery("") |
| Local UI result | setSearchQuery |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | PublicMenu; JSX button; handler () =&gt; setViewMode("grid") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; setViewMode("grid") |
| Local UI result | setViewMode |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | PublicMenu; JSX button; handler () =&gt; setViewMode("list") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; setViewMode("list") |
| Local UI result | setViewMode |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | PublicMenu; JSX button; handler () =&gt; setIsCartOpen(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setIsCartOpen(true) |
| Local UI result | setIsCartOpen |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | PublicMenu; JSX button; handler () =&gt; setSelectedCategory(category) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setSelectedCategory(category) |
| Local UI result | setSelectedCategory |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | PublicMenu; JSX button; handler () =&gt; setViewMode("grid") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; setViewMode("grid") |
| Local UI result | setViewMode |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | PublicMenu; JSX button; handler () =&gt; setViewMode("list") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; setViewMode("list") |
| Local UI result | setViewMode |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-11"></a>

### Action 11: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | PublicMenu; JSX div; handler () =&gt; { if (item.type === "platter") { navigate(`/menu/${slug}/platter/${item.id}/`); } else { navigate(`/menu/${slug}/item/${item.id}/`); } } |
| Appears when | viewMode === "grid" [true branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; { if (item.type === "platter") { navigate(`/menu/${slug}/platter/${item.id}/`); } else { navigate(`/menu/${slug}/item/${item.id}/`); } } |
| Local UI result | Navigation: `/menu/${slug}/platter/${item.id}/`) `/menu/${slug}/item/${item.id}/`) |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-12"></a>

### Action 12: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | PublicMenu; JSX button; handler (e) =&gt; { e.stopPropagation(); addToCart(item); } |
| Appears when | qty === 0 [true branch] AND viewMode === "grid" [true branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | !item.final_availability |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); addToCart(item); } |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-13"></a>

### Action 13: Minus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Minus icon (no text label) |
| Location | PublicMenu; JSX button; handler (e) =&gt; { e.stopPropagation(); decrementItem(getCartKey(item)); } |
| Appears when | qty === 0 [false branch] AND viewMode === "grid" [true branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Minus icon (no text label).  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); decrementItem(getCartKey(item)); } |
| Local UI result | setCart |

Trace symbols: `decrementItem`, `getCartKey`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-14"></a>

### Action 14: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | PublicMenu; JSX button; handler (e) =&gt; { e.stopPropagation(); incrementItem(getCartKey(item)); } |
| Appears when | qty === 0 [false branch] AND viewMode === "grid" [true branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); incrementItem(getCartKey(item)); } |
| Local UI result | setCart |

Trace symbols: `getCartKey`, `getMenuItem`, `incrementItem`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-15"></a>

### Action 15: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | PublicMenu; JSX div; handler () =&gt; { if (item.type === "platter") { navigate(`/menu/${slug}/platter/${item.id}/`); } else { navigate(`/menu/${slug}/item/${item.id}/`); } } |
| Appears when | viewMode === "grid" [false branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; { if (item.type === "platter") { navigate(`/menu/${slug}/platter/${item.id}/`); } else { navigate(`/menu/${slug}/item/${item.id}/`); } } |
| Local UI result | Navigation: `/menu/${slug}/platter/${item.id}/`) `/menu/${slug}/item/${item.id}/`) |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-16"></a>

### Action 16: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | PublicMenu; JSX button; handler (e) =&gt; { e.stopPropagation(); addToCart(item); } |
| Appears when | qty === 0 [true branch] AND viewMode === "grid" [false branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | !item.final_availability |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); addToCart(item); } |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-17"></a>

### Action 17: Minus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Minus icon (no text label) |
| Location | PublicMenu; JSX button; handler (e) =&gt; { e.stopPropagation(); decrementItem(getCartKey(item)); } |
| Appears when | qty === 0 [false branch] AND viewMode === "grid" [false branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Minus icon (no text label).  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); decrementItem(getCartKey(item)); } |
| Local UI result | setCart |

Trace symbols: `decrementItem`, `getCartKey`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-18"></a>

### Action 18: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | PublicMenu; JSX button; handler (e) =&gt; { e.stopPropagation(); incrementItem(getCartKey(item)); } |
| Appears when | qty === 0 [false branch] AND viewMode === "grid" [false branch] AND filteredItems.length &gt; 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); incrementItem(getCartKey(item)); } |
| Local UI result | setCart |

Trace symbols: `getCartKey`, `getMenuItem`, `incrementItem`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-19"></a>

### Action 19: AFN {cartTotals.total.toFixed(2)}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | AFN {cartTotals.total.toFixed(2)} |
| Location | PublicMenu; JSX button; handler () =&gt; setIsCartOpen(true) |
| Appears when | cartTotals.itemCount &gt; 0 |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate AFN {cartTotals.total.toFixed(2)}.  |
| Handler / destination | () =&gt; setIsCartOpen(true) |
| Local UI result | setIsCartOpen |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-20"></a>

### Action 20: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | PublicMenu; JSX div; handler () =&gt; setIsCartOpen(false) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; setIsCartOpen(false) |
| Local UI result | setIsCartOpen |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-21"></a>

### Action 21: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | PublicMenu; JSX button; handler () =&gt; setIsCartOpen(false) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | () =&gt; setIsCartOpen(false) |
| Local UI result | setIsCartOpen |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-22"></a>

### Action 22: Explore Menu

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Explore Menu |
| Location | PublicMenu; JSX button; handler () =&gt; setIsCartOpen(false) |
| Appears when | cart.length === 0 [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Explore Menu.  |
| Handler / destination | () =&gt; setIsCartOpen(false) |
| Local UI result | setIsCartOpen |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-23"></a>

### Action 23: Trash2 icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Trash2 icon (no text label) |
| Location | PublicMenu; JSX button; handler () =&gt; removeFromCart( item.cartKey \|\| `${item.type \|\| "menu_item"}:${item.id}`, ) |
| Appears when | cart.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Trash2 icon (no text label).  |
| Handler / destination | () =&gt; removeFromCart( item.cartKey \|\| `${item.type \|\| "menu_item"}:${item.id}`, ) |
| Local UI result | setCart |

Trace symbols: `removeFromCart`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-24"></a>

### Action 24: Minus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Minus icon (no text label) |
| Location | PublicMenu; JSX button; handler () =&gt; decrementItem( item.cartKey \|\| `${item.type \|\| "menu_item"}:${item.id}`, ) |
| Appears when | cart.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Minus icon (no text label).  |
| Handler / destination | () =&gt; decrementItem( item.cartKey \|\| `${item.type \|\| "menu_item"}:${item.id}`, ) |
| Local UI result | setCart |

Trace symbols: `decrementItem`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-25"></a>

### Action 25: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | PublicMenu; JSX button; handler () =&gt; incrementItem( item.cartKey \|\| `${item.type \|\| "menu_item"}:${item.id}`, ) |
| Appears when | cart.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | () =&gt; incrementItem( item.cartKey \|\| `${item.type \|\| "menu_item"}:${item.id}`, ) |
| Local UI result | setCart |

Trace symbols: `getCartKey`, `getMenuItem`, `incrementItem`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-26"></a>

### Action 26: Clear All

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Clear All |
| Location | PublicMenu; JSX button; handler clearCart |
| Appears when | cart.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Clear All.  |
| Handler / destination | clearCart |
| Local UI result | setCart |

Trace symbols: `clearCart`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search our menu... \|\| Search our menu... | text; searchQuery | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Unable to load menu. Please try again later. |
| `toast.error` | Not enough remaining quantity |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.change_language_789b14df` | Change language | تغییر زبان | ژبه بدل کړه |
| `labels.try_again` | Try Again | تلاش دوباره | بیا هڅه وکړئ |
| `labels.cart` | Cart | سبد | کارټ |
| `labels.add_to_order` | Add to Order | افزودن به سفارش | آرډر ته اضافه کړئ |
| `labels.unavailable` | Unavailable | ناموجود | شتون نلري |
| `no_data` | N/A | ندارد | نه شته |
| `labels.view_cart` | View Cart | مشاهده سبد | کارټ وګورئ |
| `labels.afn` | AFN | افغانی | افغانۍ |
| `labels.explore_menu` | Explore Menu | مشاهده منو | مینو وګورئ |
| `labels.clear_all` | Clear All | پاک کردن همه | ټول پاک کړئ |
| `labels.search_menu` | Search our menu... | جستجو در منو... | مینو کې لټون... |
