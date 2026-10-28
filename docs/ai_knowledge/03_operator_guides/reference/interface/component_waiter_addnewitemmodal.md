---
id: "operator_reference_interface_component_waiter_addnewitemmodal"
title: "Add New Item Modal — controls and fields"
module: "orders"
description: "Add New Item Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["orders", "item", "modal", "controls", "fields"]
roles: ["Cashier", "Waiter"]
related_docs: ["operator_modules_orders_waiter_tables", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/waiter", "/cashier"]
source_references: ["frontend/src/component/waiter/AddNewItemModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Add New Item Modal — controls and fields

This reference records the controls and fields declared by `AddNewItemModal`. Use [waiter tables](../../modules/orders/waiter_tables.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/waiter/AddNewItemModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Add Items to Order # {orderId}`, `Categories`, `{activeCategory} {filteredItems.length} item {filteredItems.length !== 1 && "s"}`, `{item.name}`, `Order Summary`

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
| Location | AddNewItemModal; JSX button; handler () =&gt; setShowSummary((v) =&gt; !v) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setShowSummary((v) =&gt; !v) |
| Local UI result | setShowSummary |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | AddNewItemModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | AddNewItemModal; JSX button; handler () =&gt; setActiveCategory(cat) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setActiveCategory(cat) |
| Local UI result | setActiveCategory |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | AddNewItemModal; JSX button; handler () =&gt; setSearchQuery("") |
| Appears when | searchQuery |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | () =&gt; setSearchQuery("") |
| Local UI result | setSearchQuery |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Minus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Minus icon (no text label) |
| Location | AddNewItemModal; JSX button; handler () =&gt; handleDecrement(item.id) |
| Appears when | isSelected [true branch] AND filteredItems.length === 0 [false branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Minus icon (no text label).  |
| Handler / destination | () =&gt; handleDecrement(item.id) |
| Local UI result | setSelectedItems |

Trace symbols: `handleDecrement`, `handleRemoveItem`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | AddNewItemModal; JSX button; handler () =&gt; { if (!item.final_availability) return; handleIncrement(item); } |
| Appears when | isSelected [true branch] AND filteredItems.length === 0 [false branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | () =&gt; { if (!item.final_availability) return; handleIncrement(item); } |
| Local UI result | setSelectedItems, setShowSummary |

Trace symbols: `handleIncrement`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Add

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add |
| Location | AddNewItemModal; JSX button; handler () =&gt; { if (!item.final_availability) return; handleIncrement(item); } |
| Appears when | isSelected [false branch] AND filteredItems.length === 0 [false branch] AND loading [false branch] |
| Disabled when | !item.final_availability |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add.  |
| Handler / destination | () =&gt; { if (!item.final_availability) return; handleIncrement(item); } |
| Local UI result | setSelectedItems, setShowSummary |

Trace symbols: `handleIncrement`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Hide cart

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Hide cart |
| Location | AddNewItemModal; JSX button; handler () =&gt; setShowSummary(false) |
| Appears when | showSummary |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Hide cart.  |
| Handler / destination | () =&gt; setShowSummary(false) |
| Local UI result | setShowSummary |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: Minus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Minus icon (no text label) |
| Location | AddNewItemModal; JSX button; handler () =&gt; handleDecrement(item.menu_item.id) |
| Appears when | selectedItems.length === 0 [false branch] AND showSummary |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Minus icon (no text label).  |
| Handler / destination | () =&gt; handleDecrement(item.menu_item.id) |
| Local UI result | setSelectedItems |

Trace symbols: `handleDecrement`, `handleRemoveItem`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | AddNewItemModal; JSX button; handler () =&gt; handleIncrement(item.menu_item) |
| Appears when | selectedItems.length === 0 [false branch] AND showSummary |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | () =&gt; handleIncrement(item.menu_item) |
| Local UI result | setSelectedItems, setShowSummary |

Trace symbols: `handleIncrement`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-11"></a>

### Action 11: Trash2 icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Trash2 icon (no text label) |
| Location | AddNewItemModal; JSX button; handler () =&gt; handleRemoveItem(item.menu_item.id) |
| Appears when | selectedItems.length === 0 [false branch] AND showSummary |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Trash2 icon (no text label).  |
| Handler / destination | () =&gt; handleRemoveItem(item.menu_item.id) |
| Local UI result | setSelectedItems |

Trace symbols: `handleRemoveItem`.

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-12"></a>

### Action 12: Adding... Add Item — Afs

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Adding... Add Item — Afs |
| Location | AddNewItemModal; JSX button; handler handleAddItems |
| Appears when | selectedItems.length &gt; 0 AND showSummary |
| Disabled when | submitting |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Adding... Add Item — Afs.  |
| Handler / destination | handleAddItems |
| Local UI result | setSubmitting |

Trace symbols: `handleAddItems`.

Requests made by this handler or local helpers:

- `instance.patch(′/orders/orders/${orderId}/add-items/′, payload)`

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-13"></a>

### Action 13: {totalItems} item {totalItems !== 1 && "s"} Afs {totalAmount.toLocaleString()}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {totalItems} item {totalItems !== 1 && "s"} Afs {totalAmount.toLocaleString()} |
| Location | AddNewItemModal; JSX button; handler () =&gt; setShowSummary(true) |
| Appears when | !showSummary && totalItems &gt; 0 |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Waiter |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {totalItems} item {totalItems !== 1 && "s"} Afs {totalAmount.toLocaleString()}.  |
| Handler / destination | () =&gt; setShowSummary(true) |
| Local UI result | setShowSummary |

Record/status result, downstream effects, failure recovery, and reversal: [waiter tables](../../modules/orders/waiter_tables.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search menu items... | text; searchQuery | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Item note... | textarea; item.note \|\| "" | Not declared; see submit validation | item.note \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when selectedItems.length === 0 [false branch] AND showSummary |
| <a id="field-3"></a> F3: item.quantity | number; item.quantity | Not declared; see submit validation | item.quantity | min=1 | read-only=false; disabled=false; shown when selectedItems.length === 0 [false branch] AND showSummary |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.error` | Failed to load menu |
| `toast.error` | `Only ${remaining} available` |
| `toast.error` | `Only ${remaining} available` |
| `toast.error` | Please select at least one item |
| `toast.success` | Items added successfully! |
| `toast.error` | Failed to add items |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.hide_order_summary_216f89e5` | Hide order summary | مخفی کردن ترتیب خلاصه | د پټ ترتیب لنډیز |
| `legacy.show_order_summary_c4a6844f` | Show order summary | خلاصه ترتیب برنامه ها | د خپرونې ترتیب لنډیز |
| `legacy.hide_cart_95e00ace` | Hide Cart | چرخ دستی مخفی | پټ ګاډی |
| `legacy.show_cart_4448a2e9` | Show Cart | کارت نمایش | شو کارټ |
| `add` | Add | افزودن | اضافه |
| `legacy.hide_cart_42a4dfc7` | Hide cart | چرخ دستی مخفی | پټ ګاډی |
| `adding` | Adding... | در حال افزودن... | اضافه کېږي... |
| `legacy.item_ecdda59a` | Item | آیتم | توکی |
| `legacy.afs_7e6dc0b4` | — Afs | — AFS | — AFS |
| `labels.item` | item | آیتم | توکی |
| `legacy.afs_2050680c` | Afs | Afs | Afs |
| `search_menu_items` | Search menu items... | جستجوی آیتم‌های منو... | د مېنو توکي ولټوئ... |
| `legacy.item_note_75dbac71` | Item note... | نکته مورد... | د توکی یادونه... |
