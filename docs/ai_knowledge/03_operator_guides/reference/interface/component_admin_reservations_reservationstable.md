---
id: "operator_reference_interface_component_admin_reservations_reservationstable"
title: "Reservations Table — controls and fields"
module: "reservations"
description: "Reservations Table — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["reservations", "table", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_reservations_reservations", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/reservations"]
source_references: ["frontend/src/component/Admin/Reservations/ReservationsTable.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Reservations Table — controls and fields

This reference records the controls and fields declared by `ReservationsTable`. Use [reservations](../../modules/reservations/reservations.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/Reservations/ReservationsTable.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{reservation.customer_name}`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Actions | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: View Details

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View Details |
| Location | ReservationsTable; JSX button; handler () =&gt; setSelectedReservation(reservation) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View Details.  |
| Handler / destination | () =&gt; setSelectedReservation(reservation) |
| Local UI result | setSelectedReservation |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: View Details

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View Details |
| Location | ReservationsTable; JSX button; handler () =&gt; setSelectedReservation(reservation) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View Details.  |
| Handler / destination | () =&gt; setSelectedReservation(reservation) |
| Local UI result | setSelectedReservation |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.view_details_907b3bee` | View Details | جزئیات را ببینید | تفصیلات وګورئ |

## Related interface references

- [component admin reservations reservationdetails](component_admin_reservations_reservationdetails.md)
