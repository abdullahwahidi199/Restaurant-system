---
id: "operator_reference_interface_component_cashier_components_deliveryassignmentmodal"
title: "Delivery Assignment Modal — controls and fields"
module: "billing"
description: "Delivery Assignment Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["billing", "delivery", "assignment", "modal", "controls", "fields"]
roles: ["Cashier"]
related_docs: ["operator_modules_billing_cashier", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/cashier"]
source_references: ["frontend/src/component/Cashier/components/DeliveryAssignmentModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Delivery Assignment Modal — controls and fields

This reference records the controls and fields declared by `DeliveryAssignmentModal`. Use [cashier](../../modules/billing/cashier.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Cashier/components/DeliveryAssignmentModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`🔄 Reassign Order 🚚 Assign Order`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: ✕

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | ✕ |
| Location | DeliveryAssignmentModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate ✕.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: SELECTED {person.name} {person.phone}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | SELECTED {person.name} {person.phone} |
| Location | DeliveryAssignmentModal; JSX button; handler () =&gt; setSelectedPersonId(String(person.id)) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate SELECTED {person.name} {person.phone}.  |
| Handler / destination | () =&gt; setSelectedPersonId(String(person.id)) |
| Local UI result | setSelectedPersonId |

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: ✅ Copied! 📋 Copy

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | ✅ Copied! 📋 Copy |
| Location | DeliveryAssignmentModal; JSX button; handler handleCopy |
| Appears when | selectedPerson |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate ✅ Copied! 📋 Copy. Review the confirmation before accepting. |
| Handler / destination | handleCopy |
| Local UI result | setCopied, setTimeout |

Trace symbols: `handleCopy`.

Dialog content: `"Select a delivery boy first")`; `"Copy failed")`.

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Send & Assign

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Send & Assign |
| Location | DeliveryAssignmentModal; JSX button; handler handleSendAndAssign |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | !selectedPersonId \|\| isLoading |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Send & Assign. Review the confirmation before accepting. |
| Handler / destination | handleSendAndAssign |
| Local UI result | setIsLoading |

Trace symbols: `assignOnBackend`, `handleSendAndAssign`.

Requests made by this handler or local helpers:

- `instance.patch( ′/orders/orders/${order.id}/assign-delivery/′, { delivery_person_id: selectedPersonId },`

Dialog content: `"Please select a delivery person")`; `"Selected delivery person has no phone number")`; `"❌ Assignment failed. Order was NOT sent to delivery boy.")`.

Record/status result, downstream effects, failure recovery, and reversal: [cashier](../../modules/billing/cashier.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search name or phone... | text; searchTerm | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `alert` | "❌ Assignment failed. Order was NOT sent to delivery boy." |
| `alert` | "Please select a delivery person" |
| `alert` | "Selected delivery person has no phone number" |
| `alert` | "Select a delivery boy first" |
| `alert` | "Copy failed" |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `menuDetails.close` | Close | بستن | بندول |
| `legacy.selected_9106ca27` | SELECTED | منتخب | ټاکل شوی |
| `legacy.copied_e0f4b5f5` | ✅ Copied! | ✅ کپی شد! | ✅ کاپی شو! |
| `legacy.copy_7baadff9` | 📋 Copy | 📋 کپی | 📋 کاپی |
| `legacy.send_assign_bdac0010` | Send & Assign | ارسال و تخصیص | Send & Assign |
| `legacy.search_name_or_phone_235fb762` | Search name or phone... | نام جستجو یا تلفن... | د لټون نوم یا تلیفون... |
