---
id: "operator_reference_interface_component_admin_feedbacks_feedbacksdisplaymodel"
title: "Feedbacks Display Model — controls and fields"
module: "customers"
description: "Feedbacks Display Model — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["customers", "feedbacks", "display", "model", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_customers_feedback", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/feedbacks"]
source_references: ["frontend/src/component/Admin/Feedbacks/FeedbacksDisplayModel.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Feedbacks Display Model — controls and fields

This reference records the controls and fields declared by `FeedbacksDisplayModel`. Use [feedback](../../modules/customers/feedback.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/Feedbacks/FeedbacksDisplayModel.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Submitting... / Submit (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Submitting... / Submit (conditional text) |
| Location | FeedbacksDisplayModel; JSX button; handler () =&gt; handleRespond(review.id) |
| Appears when | activeReviewId === review.id [true branch] AND review.response [false branch] AND reviews.length === 0 [false branch] |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Submitting... / Submit (conditional text).  |
| Handler / destination | () =&gt; handleRespond(review.id) |
| Local UI result | setLoading, setResponseText, setActiveReviewId |

Trace symbols: `handleRespond`.

Requests made by this handler or local helpers:

- `instance.patch(′/menu/reviews/${reviewId}/′, { response: responseText,responded_at: now})`

Record/status result, downstream effects, failure recovery, and reversal: [feedback](../../modules/customers/feedback.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | FeedbacksDisplayModel; JSX button; handler () =&gt; setActiveReviewId(null) |
| Appears when | activeReviewId === review.id [true branch] AND review.response [false branch] AND reviews.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setActiveReviewId(null) |
| Local UI result | setActiveReviewId |

Record/status result, downstream effects, failure recovery, and reversal: [feedback](../../modules/customers/feedback.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Response

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Response |
| Location | FeedbacksDisplayModel; JSX button; handler () =&gt; setActiveReviewId(review.id) |
| Appears when | activeReviewId === review.id [false branch] AND review.response [false branch] AND reviews.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Response.  |
| Handler / destination | () =&gt; setActiveReviewId(review.id) |
| Local UI result | setActiveReviewId |

Record/status result, downstream effects, failure recovery, and reversal: [feedback](../../modules/customers/feedback.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Write your response... | textarea; responseText | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when activeReviewId === review.id [true branch] AND review.response [false branch] AND reviews.length === 0 [false branch] |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.error` | Response cannot be empty! |
| `toast.success` | Response submitted! |
| `toast.error` | Failed to submit response |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `submitting` | Submitting... | در حال ارسال... | لیږل... |
| `submit` | Submit | ارسال | وسپارئ |
| `cancel` | Cancel | لغو | لغوه |
| `response` | Response | پاسخ | ځواب |
| `write_response` | Write your response... | پاسخ خود را اینجا بنویسید... | خپل ځواب دلته ولیکئ... |
