---
id: "operator_reference_interface_component_admin_discountcards_discountcarddetails"
title: "Discount Card Details — controls and fields"
module: "discounts"
description: "Discount Card Details — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["discounts", "discount", "card", "details", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_discounts_discount_cards", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/discount-cards/:id"]
source_references: ["frontend/src/component/Admin/DiscountCards/DiscountCardDetails.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Discount Card Details — controls and fields

This reference records the controls and fields declared by `DiscountCardDetails`. Use [discount cards](../../modules/discounts/discount_cards.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/DiscountCards/DiscountCardDetails.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{card.card_name}`, `Card Information`, `Orders Used`, `Delete Card`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Order # | `See parent row data and linked procedure.` |
| th | Total | `See parent row data and linked procedure.` |
| th | Discount | `See parent row data and linked procedure.` |
| th | Date | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Go Back

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Go Back |
| Location | DiscountCardDetails; JSX button; handler () =&gt; navigate(-1) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Go Back.  |
| Handler / destination | () =&gt; navigate(-1) |
| Local UI result | Navigation: -1) |

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Back

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Back |
| Location | DiscountCardDetails; JSX button; handler () =&gt; navigate(-1) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Back.  |
| Handler / destination | () =&gt; navigate(-1) |
| Local UI result | Navigation: -1) |

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Edit

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Edit |
| Location | DiscountCardDetails; JSX button; handler () =&gt; navigate(`/admin/dashboard/discount-cards/${id}/edit`) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Edit.  |
| Handler / destination | () =&gt; navigate(`/admin/dashboard/discount-cards/${id}/edit`) |
| Local UI result | Navigation: `/admin/dashboard/discount-cards/${id}/edit`) |

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Delete

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Delete |
| Location | DiscountCardDetails; JSX button; handler () =&gt; setShowDeleteModal(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Delete.  |
| Handler / destination | () =&gt; setShowDeleteModal(true) |
| Local UI result | setShowDeleteModal |

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | DiscountCardDetails; JSX button; handler () =&gt; setShowDeleteModal(false) |
| Appears when | showDeleteModal |
| Disabled when | deleting |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setShowDeleteModal(false) |
| Local UI result | setShowDeleteModal |

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Deleting... Delete Card

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Deleting... Delete Card |
| Location | DiscountCardDetails; JSX button; handler handleDelete |
| Appears when | showDeleteModal |
| Disabled when | deleting |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Deleting... Delete Card. Review the confirmation before accepting. |
| Handler / destination | handleDelete |
| Local UI result | setDeleting, setShowDeleteModal |

Trace symbols: `handleDelete`.

Requests made by this handler or local helpers:

- `instance.delete(′/orders/discount-cards-actions/${id}/′)`

Dialog content: `"Failed to delete card.")`.

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `alert` | "Failed to delete card." |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `labels.go_back` | Go Back | بازگشت | شاته ولاړ شئ |
| `legacy.back_b52b36b7` | Back | بازگشت | بېرته |
| `staff.table.edit` | Edit | ویرایش | سمول |
| `staff.table.delete` | Delete | حذف | ړنګول |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `legacy.deleting_e16cac65` | Deleting... | در حال حذف... | پاکول... |
| `legacy.delete_card_ce3dcb91` | Delete Card | حذف کارت | کارت حذف کړه |
