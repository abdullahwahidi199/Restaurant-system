---
id: "operator_reference_interface_component_admin_discountcards_discountcardsmain"
title: "Discount Cards Main — controls and fields"
module: "discounts"
description: "Discount Cards Main — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["discounts", "discount", "cards", "main", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_discounts_discount_cards", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/discount-cards"]
source_references: ["frontend/src/component/Admin/DiscountCards/DiscountCardsMain.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Discount Cards Main — controls and fields

This reference records the controls and fields declared by `DiscountCardsMain`. Use [discount cards](../../modules/discounts/discount_cards.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/DiscountCards/DiscountCardsMain.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Discount Cards`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| PageHeader | Discount Cards | `See parent row data and linked procedure.` |
| dt | Customer | `See parent row data and linked procedure.` |
| dt | Discount % | `See parent row data and linked procedure.` |
| dt | Valid Until | `See parent row data and linked procedure.` |
| dt | Usage | `See parent row data and linked procedure.` |
| th | Card Name | `See parent row data and linked procedure.` |
| th | Card Number | `See parent row data and linked procedure.` |
| th | Customer | `See parent row data and linked procedure.` |
| th | Discount % | `See parent row data and linked procedure.` |
| th | Status | `See parent row data and linked procedure.` |
| th | Valid Until | `See parent row data and linked procedure.` |
| th | Usage | `See parent row data and linked procedure.` |
| th | Action | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: + Create Discount Card

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | + Create Discount Card |
| Location | DiscountCardsMain; JSX button; handler () =&gt; navigate("/admin/dashboard/create-discount-cards") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate + Create Discount Card.  |
| Handler / destination | () =&gt; navigate("/admin/dashboard/create-discount-cards") |
| Local UI result | Navigation: "/admin/dashboard/create-discount-cards") |

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Details

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Details |
| Location | DiscountCardsMain; JSX button; handler () =&gt; navigate(`/admin/dashboard/discount-cards/${card.id}`) |
| Appears when | discountCards.length [true branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Details.  |
| Handler / destination | () =&gt; navigate(`/admin/dashboard/discount-cards/${card.id}`) |
| Local UI result | Navigation: `/admin/dashboard/discount-cards/${card.id}`) |

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Details

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Details |
| Location | DiscountCardsMain; JSX button; handler () =&gt; navigate(`/admin/dashboard/discount-cards/${card.id}`) |
| Appears when | loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Details.  |
| Handler / destination | () =&gt; navigate(`/admin/dashboard/discount-cards/${card.id}`) |
| Local UI result | Navigation: `/admin/dashboard/discount-cards/${card.id}`) |

Record/status result, downstream effects, failure recovery, and reversal: [discount cards](../../modules/discounts/discount_cards.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Could not load discount cards. Please try again. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.create_discount_card_c29e4d2c` | + Create Discount Card | + ایجاد کارت تخفیف | + د تخفیف کارت جوړول |
| `inventory_manager.common.details` | Details | جزئیات | تفصیل |

## Related interface references

- [modules shared erp components pageheader](modules_shared_erp_components_pageheader.md)
