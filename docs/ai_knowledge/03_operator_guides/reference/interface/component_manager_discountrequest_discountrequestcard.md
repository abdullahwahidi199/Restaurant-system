---
id: "operator_reference_interface_component_manager_discountrequest_discountrequestcard"
title: "Discount Request Card — controls and fields"
module: "discounts"
description: "Discount Request Card — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["discounts", "discount", "request", "card", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "Manager"]
related_docs: ["operator_modules_discounts_requests", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/pending-discount-requests", "/manager/discount-requests"]
source_references: ["frontend/src/component/Manager/DiscountRequest/DiscountRequestCard.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Discount Request Card — controls and fields

This reference records the controls and fields declared by `DiscountRequestCard`. Use [requests](../../modules/discounts/requests.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Manager/DiscountRequest/DiscountRequestCard.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`# {request.order_number}`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| dt | Original | `See parent row data and linked procedure.` |
| dt | Discount | `See parent row data and linked procedure.` |
| dt | Final | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

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
| Location | DiscountRequestCard; JSX button; handler () =&gt; onApprove(request.id) |
| Appears when | request.status === "pending" |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; onApprove(request.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [requests](../../modules/discounts/requests.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Reject

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reject |
| Location | DiscountRequestCard; JSX button; handler () =&gt; onReject(request.id) |
| Appears when | request.status === "pending" |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reject.  |
| Handler / destination | () =&gt; onReject(request.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [requests](../../modules/discounts/requests.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.common.approve` | Approve | تایید | منل |
| `inventory_manager.common.reject` | Reject | رد | ردول |
