---
id: "operator_reference_interface_component_cashier_components_takeawayorderform"
title: "Take Away Order Form — controls and fields"
module: "billing"
description: "Take Away Order Form — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["billing", "take", "away", "order", "form", "controls", "fields"]
roles: ["Cashier"]
related_docs: ["operator_modules_billing_cashier", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/cashier", "/cashier/takeaway"]
source_references: ["frontend/src/component/Cashier/components/TakeAwayOrderForm.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Take Away Order Form — controls and fields

This reference records the controls and fields declared by `TakeAwayOrderForm`. Use [cashier](../../modules/billing/cashier.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Cashier/components/TakeAwayOrderForm.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Takeaway Order`, `{group.category} {group.items.length} item {group.items.length !== 1 && "s"}`, `{item.name}`, `Your Cart`

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
| Location | TakeAwayOrderForm; JSX button; handler () =&gt; setShowCart(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setShowCart(true) |
| Local UI result | setShowCart |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | TakeAwayOrderForm; JSX button; handler () =&gt; setSearchQuery("") |
| Appears when | searchQuery |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | () =&gt; setSearchQuery("") |
| Local UI result | setSearchQuery |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | TakeAwayOrderForm; JSX button; handler () =&gt; setActiveCategory(cat) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; setActiveCategory(cat) |
| Local UI result | setActiveCategory |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | TakeAwayOrderForm; JSX motion.div; handler () =&gt; item.final_availability && handleIncrement(item) |
| Appears when | filteredItems.length === 0 [false branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; item.final_availability && handleIncrement(item) |
| Local UI result | setCart |

Trace symbols: `handleIncrement`.

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: {qty}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {qty} |
| Location | TakeAwayOrderForm; JSX div; handler (e) =&gt; e.stopPropagation() |
| Appears when | isSelected [true branch] AND filteredItems.length === 0 [false branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {qty}.  |
| Handler / destination | (e) =&gt; e.stopPropagation() |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Minus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Minus icon (no text label) |
| Location | TakeAwayOrderForm; JSX button; handler (e) =&gt; { e.stopPropagation(); handleDecrement(item.id); } |
| Appears when | isSelected [true branch] AND filteredItems.length === 0 [false branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Minus icon (no text label).  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); handleDecrement(item.id); } |
| Local UI result | setCart |

Trace symbols: `handleDecrement`.

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | TakeAwayOrderForm; JSX button; handler (e) =&gt; { e.stopPropagation(); handleIncrement(item); } |
| Appears when | isSelected [true branch] AND filteredItems.length === 0 [false branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); handleIncrement(item); } |
| Local UI result | setCart |

Trace symbols: `handleIncrement`.

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | TakeAwayOrderForm; JSX button; handler (e) =&gt; { e.stopPropagation(); handleIncrement(item); } |
| Appears when | isSelected [false branch] AND filteredItems.length === 0 [false branch] AND loading [false branch] |
| Disabled when | !item.final_availability |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | (e) =&gt; { e.stopPropagation(); handleIncrement(item); } |
| Local UI result | setCart |

Trace symbols: `handleIncrement`.

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | TakeAwayOrderForm; JSX button; handler () =&gt; setShowCart(false) |
| Appears when | showCart |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | () =&gt; setShowCart(false) |
| Local UI result | setShowCart |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: Minus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Minus icon (no text label) |
| Location | TakeAwayOrderForm; JSX button; handler () =&gt; handleDecrement(item.id) |
| Appears when | cart.length === 0 [false branch] AND showCart |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Minus icon (no text label).  |
| Handler / destination | () =&gt; handleDecrement(item.id) |
| Local UI result | setCart |

Trace symbols: `handleDecrement`.

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-11"></a>

### Action 11: Plus icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Plus icon (no text label) |
| Location | TakeAwayOrderForm; JSX button; handler () =&gt; handleIncrement(item) |
| Appears when | cart.length === 0 [false branch] AND showCart |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Plus icon (no text label).  |
| Handler / destination | () =&gt; handleIncrement(item) |
| Local UI result | setCart |

Trace symbols: `handleIncrement`.

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-12"></a>

### Action 12: Trash2 icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Trash2 icon (no text label) |
| Location | TakeAwayOrderForm; JSX button; handler () =&gt; handleRemoveFromCart(item.id) |
| Appears when | cart.length === 0 [false branch] AND showCart |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Trash2 icon (no text label).  |
| Handler / destination | () =&gt; handleRemoveFromCart(item.id) |
| Local UI result | setCart |

Trace symbols: `handleRemoveFromCart`.

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-13"></a>

### Action 13: Creating Order... Create Order • Afs

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Creating Order... Create Order • Afs |
| Location | TakeAwayOrderForm; JSX button; handler handleSubmitOrder |
| Appears when | cart.length &gt; 0 AND showCart |
| Disabled when | submitting |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Creating Order... Create Order • Afs.  |
| Handler / destination | handleSubmitOrder |
| Local UI result | setSubmitting, setCart, setShowCart, setFormData |

Trace symbols: `handleSubmitOrder`.

Requests made by this handler or local helpers:

- `instance.post("/orders/orders/", payload)`

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search menu... | text; searchQuery | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Item note... | textarea; item.note \|\| "" | Not declared; see submit validation | item.note \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when cart.length === 0 [false branch] AND showCart |
| <a id="field-3"></a> F3: item.qty | number; item.qty | Not declared; see submit validation | item.qty | min=1 | read-only=false; disabled=false; shown when cart.length === 0 [false branch] AND showCart |
| <a id="field-4"></a> F4: Customer Name * | text; formData.name | true | formData.name | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when cart.length &gt; 0 AND showCart |
| <a id="field-5"></a> F5: Phone Number(optional) | tel; formData.phone | Not declared; see submit validation | formData.phone | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when cart.length &gt; 0 AND showCart |
| <a id="field-6"></a> F6: Note (optional) | textarea; formData.note | Not declared; see submit validation | formData.note | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when cart.length &gt; 0 AND showCart |

## Submission and validation evidence

- `handleSubmitOrder`: `if (cart.length === 0) { toast.error(Your cart is empty!); return; } if (!formData.name.trim()) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.error` | Failed to load menu data |
| `toast.error` | `Only ${remaining} available` |
| `toast.error` | Your cart is empty! |
| `toast.error` | Please fill in customer name |
| `toast.success` | Order placed successfully! |
| `toast.error` | Failed to place order |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `menu.unavailable` | Unavailable | ناموجود | شتون نلري |
| `legacy.afs_2050680c` | Afs | Afs | Afs |
| `legacy.creating_order_7fe1d7f0` | Creating Order... | ایجاد نظم... | نظم جوړول... |
| `legacy.create_order_afs_3f443c63` | Create Order • Afs | ایجاد ترتیب • Afs | ترتیب جوړول • Afs |
| `menu.search` | Search menu... | جستجوی غذا... | مینو ولټوئ... |
| `legacy.item_note_75dbac71` | Item note... | نکته مورد... | د توکی یادونه... |
| `legacy.customer_name_e25608b4` | Customer Name * | نام مشتری * | د پیرودونکی نوم * |
| `legacy.phone_number_optional_bf0a4f3f` | Phone Number(optional) | شماره تلفن (اختیاری) | د تلیفون شمېره (اختیاری) |
| `legacy.note_optional_4e395670` | Note (optional) | یادداشت (اختیاری) | یادونه (اختیاری) |
