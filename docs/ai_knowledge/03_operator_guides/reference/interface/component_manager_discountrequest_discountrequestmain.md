---
id: "operator_reference_interface_component_manager_discountrequest_discountrequestmain"
title: "Discount Request Main — controls and fields"
module: "discounts"
description: "Discount Request Main — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["discounts", "discount", "request", "main", "controls", "fields"]
roles: ["Manager"]
related_docs: ["operator_modules_discounts_requests", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/manager/discount-requests"]
source_references: ["frontend/src/component/Manager/DiscountRequest/DiscountRequestMain.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Discount Request Main — controls and fields

This reference records the controls and fields declared by `DiscountRequestMain`. Use [requests](../../modules/discounts/requests.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Manager/DiscountRequest/DiscountRequestMain.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Reset

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reset |
| Location | DiscountRequestMain; JSX button; handler () =&gt; { setPage(1); setSearch(""); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reset.  |
| Handler / destination | () =&gt; { setPage(1); setSearch(""); } |
| Local UI result | setPage, setSearch |

Record/status result, downstream effects, failure recovery, and reversal: [requests](../../modules/discounts/requests.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search order, table, customer, reason... | search; search | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | error.message |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.common.reset` | Reset | بازنشانی | بیا تنظیم |
| `legacy.search_order_table_customer_reason_d05d8939` | Search order, table, customer, reason... | سفارش جستجو، میز، مشتری، دلیل... | د لټون امر، میز، پیرودونکی، دلیل... |

## Related interface references

- [component manager discountrequest discountrequestcard](component_manager_discountrequest_discountrequestcard.md)
