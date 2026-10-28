---
id: "operator_reference_interface_component_cashier_components_reservationprintmodal"
title: "Reservation Print Modal — controls and fields"
module: "reservations"
description: "Reservation Print Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["reservations", "reservation", "print", "modal", "controls", "fields"]
roles: ["Cashier"]
related_docs: ["operator_modules_reservations_reservations", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/cashier/reservations"]
source_references: ["frontend/src/component/Cashier/components/ReservationPrintModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Reservation Print Modal — controls and fields

This reference records the controls and fields declared by `ReservationPrintModal`. Use [reservations](../../modules/reservations/reservations.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Cashier/components/ReservationPrintModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{restaurantDetails.name}`, `Reservation Receipt`

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
| Location | ReservationPrintModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate ✕.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Close

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close |
| Location | ReservationPrintModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Print Receipt

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Print Receipt |
| Location | ReservationPrintModal; JSX button; handler handlePrint |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Print Receipt. Review the confirmation before accepting. |
| Handler / destination | handlePrint |
| Local UI result | setTimeout |

Trace symbols: `escapeHtml`, `formatDate`, `formatDateTime`, `formatTime`, `generateHtml`, `handlePrint`.

Dialog content: `Pop-up blocked. Please allow pop-ups to print.)`; `Could not open the print window.)`.

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `alert` | Pop-up blocked. Please allow pop-ups to print. |
| `alert` | Could not open the print window. |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `menuDetails.close` | Close | بستن | بندول |
| `legacy.print_receipt_4e896ec2` | Print Receipt | رسید چاپ | د چاپ رسید |
