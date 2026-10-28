---
id: "operator_reference_interface_component_manager_reservations_managerreservationstable"
title: "Manager Reservations Table — controls and fields"
module: "reservations"
description: "Manager Reservations Table — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["reservations", "manager", "table", "controls", "fields"]
roles: ["Manager"]
related_docs: ["operator_modules_reservations_reservations", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/manager/reservations"]
source_references: ["frontend/src/component/Manager/reservations/ManagerReservationsTable.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Manager Reservations Table — controls and fields

This reference records the controls and fields declared by `ManagerReservationsTable`. Use [reservations](../../modules/reservations/reservations.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Manager/reservations/ManagerReservationsTable.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

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

### Action 1: ✏️ Edit

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | ✏️ Edit |
| Location | ManagerReservationsTable; JSX button; handler () =&gt; setEditReservation(reservation) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | [                           "completed",                           "cancelled",                           "no_show",                         ].includes(reservation.status) |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate ✏️ Edit.  |
| Handler / destination | () =&gt; setEditReservation(reservation) |
| Local UI result | setEditReservation |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Arrived

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Arrived |
| Location | ManagerReservationsTable; JSX button; handler () =&gt; markArrived(reservation.id) |
| Appears when | reservation.status === "reserved" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Arrived.  |
| Handler / destination | () =&gt; markArrived(reservation.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `markArrived`.

Requests made by this handler or local helpers:

- `instance.post(′/orders/cashier/reservations/${id}/arrive/′)`

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: No Show

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | No Show |
| Location | ManagerReservationsTable; JSX button; handler () =&gt; markNOShow(reservation.id) |
| Appears when | canMarkNoShow [true branch] AND reservation.status === "reserved" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate No Show.  |
| Handler / destination | () =&gt; markNOShow(reservation.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `markNOShow`.

Requests made by this handler or local helpers:

- `instance.post(′/orders/cashier/reservations/${id}/no_show/′)`

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | ManagerReservationsTable; JSX button; handler () =&gt; setReservationToCancel(reservation) |
| Appears when | canMarkNoShow [false branch] AND reservation.status === "reserved" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setReservationToCancel(reservation) |
| Local UI result | setReservationToCancel |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: View Details

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View Details |
| Location | ManagerReservationsTable; JSX button; handler () =&gt; setViewReservation(reservation) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View Details.  |
| Handler / destination | () =&gt; setViewReservation(reservation) |
| Local UI result | setViewReservation |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Arrived

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Arrived |
| Location | ManagerReservationsTable; JSX button; handler () =&gt; markArrived(reservation.id) |
| Appears when | reservation.status === "reserved" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Arrived.  |
| Handler / destination | () =&gt; markArrived(reservation.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `markArrived`.

Requests made by this handler or local helpers:

- `instance.post(′/orders/cashier/reservations/${id}/arrive/′)`

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: No Show

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | No Show |
| Location | ManagerReservationsTable; JSX button; handler () =&gt; markNOShow(reservation.id) |
| Appears when | canMarkNoShow [true branch] AND reservation.status === "reserved" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate No Show.  |
| Handler / destination | () =&gt; markNOShow(reservation.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `markNOShow`.

Requests made by this handler or local helpers:

- `instance.post(′/orders/cashier/reservations/${id}/no_show/′)`

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | ManagerReservationsTable; JSX button; handler () =&gt; markCancel(reservation.id) |
| Appears when | canMarkNoShow [false branch] AND reservation.status === "reserved" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; markCancel(reservation.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `markCancel`.

Requests made by this handler or local helpers:

- `instance.patch(′/orders/cancel-reservation/${id}/′)`

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: View Details

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View Details |
| Location | ManagerReservationsTable; JSX button; handler () =&gt; setViewReservation(reservation) |
| Appears when | reservation.status !== "reserved" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View Details.  |
| Handler / destination | () =&gt; setViewReservation(reservation) |
| Local UI result | setViewReservation |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: ✏️ Edit

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | ✏️ Edit |
| Location | ManagerReservationsTable; JSX button; handler () =&gt; setEditReservation(reservation) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | ["completed", "cancelled", "no_show"].includes(                     reservation.status,                   ) |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate ✏️ Edit.  |
| Handler / destination | () =&gt; setEditReservation(reservation) |
| Local UI result | setEditReservation |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-11"></a>

### Action 11: View Details

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View Details |
| Location | ManagerReservationsTable; JSX button; handler () =&gt; setViewReservation(reservation) |
| Appears when | reservation.status === "reserved" |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View Details.  |
| Handler / destination | () =&gt; setViewReservation(reservation) |
| Local UI result | setViewReservation |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search customer... | text; searchName | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when showLocalFilters |
| <a id="field-2"></a> F2: statusFilter | select; statusFilter | Not declared; see submit validation | "" | ; choices: All Status [], Reserved [reserved], Completed [completed], Cancelled [cancelled], No Show [no_show] | read-only=false; disabled=false; shown when showLocalFilters |
| <a id="field-3"></a> F3: startDate | date; startDate | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when showLocalFilters |
| <a id="field-4"></a> F4: endDate | date; endDate | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when showLocalFilters |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.success` | Marked as arrived |
| `toast.error` | Failed to update reservation status |
| `toast.success` | Marked as No Show |
| `toast.error` | Failed to mark as No Show |
| `toast.success` | Reservation cancelled |
| `toast.error` | Failed to cancel reservation |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.edit_46d11d96` | ✏️ Edit | ✏️ ویرایش | ✏️ سمون |
| `legacy.arrived_a22d66c8` | Arrived | رسیدند | ورسېد |
| `legacy.no_show_7ed172ed` | No Show | بدون حضور | حاضر نه شو |
| `legacy.cancel_reservation_bb3c1d62` | Cancel reservation | لغو رزرو | ریزرویشن لغوه کړئ |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `legacy.view_details_907b3bee` | View Details | جزئیات را ببینید | تفصیلات وګورئ |
| `legacy.search_customer_2b6cb473` | Search customer... | مشتری را جستجو کن... | د لټون پیرودونکی... |
| `legacy.all_status_6b308de7` | All Status | همه وضعیت ها | ټول حالتونه |
| `legacy.reserved_67a6ff10` | Reserved | محفوظ | محفوظ |
| `stats.completed` | Completed | تکمیل شده | بشپړ شوي |
| `status.cancelled` | Cancelled | لغو شده | لغوه شوی |

## Related interface references

- [component admin reservations reservationdetails](component_admin_reservations_reservationdetails.md)
- [component cashier components reservationupdateforms](component_cashier_components_reservationupdateforms.md)
- [component cashier components reservationcancellationtoast](component_cashier_components_reservationcancellationtoast.md)
