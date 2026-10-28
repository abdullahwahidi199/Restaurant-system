---
id: "operator_reference_interface_component_customer_reviewpage"
title: "Review Page — controls and fields"
module: "public_ordering"
description: "Review Page — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["public_ordering", "review", "page", "controls", "fields"]
roles: ["Public/customer"]
related_docs: ["operator_modules_public_ordering_customer_handoff", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/:restaurantSlug/:branchSlug", "/:slug", "/orders"]
source_references: ["frontend/src/component/Customer/ReviewPage.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Review Page — controls and fields

This reference records the controls and fields declared by `ReviewPage`. Use [customer handoff](../../modules/public_ordering/customer_handoff.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Customer/ReviewPage.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Leave a Review`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | ReviewPage; JSX X; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: ★

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | ★ |
| Location | ReviewPage; JSX button; handler () =&gt; setRating(star) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate ★.  |
| Handler / destination | () =&gt; setRating(star) |
| Local UI result | setRating |

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Submitting... / Submit Review (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Submitting... / Submit Review (conditional text) |
| Location | ReviewPage; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Public/customer |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Submitting... / Submit Review (conditional text).  |
| Handler / destination | handleSubmit |
| Local UI result | setLoading, setRating, setComment |

Trace symbols: `handleSubmit`.

Record/status result, downstream effects, failure recovery, and reversal: [customer handoff](../../modules/public_ordering/customer_handoff.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Write your comment... | textarea; comment | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

- `handleSubmit`: `if (!rating) return toast.error(Please select a rating!); if (!user) return toast.error(You must sign up before you can rate!); if (!publicContext.restaurantSlug) {`; `if (res.ok) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.error` | Please select a rating! |
| `toast.error` | You must sign up before you can rate! |
| `toast.error` | Failed to submit review |
| `toast.success` | Review submitted successfully! |
| `toast.error` | Failed to submit review |
| `toast.error` | Error while submitting review |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `review.submitting` | Submitting... | در حال ارسال... | لېږل کېږي... |
| `review.submit` | Submit Review | ارسال نظر | نظر واستوئ |
| `review.comment_placeholder` | Write your comment... | نظر خود را بنویسید... | خپل نظر ولیکئ... |
