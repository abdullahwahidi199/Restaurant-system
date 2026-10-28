---
id: "operator_reference_interface_component_cashier_components_reservationslist"
title: "Reservations List — controls and fields"
module: "reservations"
description: "Reservations List — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["reservations", "list", "controls", "fields"]
roles: ["Cashier"]
related_docs: ["operator_modules_reservations_reservations", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/cashier/reservations"]
source_references: ["frontend/src/component/Cashier/components/ReservationsList.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Reservations List — controls and fields

This reference records the controls and fields declared by `ReservationsList`. Use [reservations](../../modules/reservations/reservations.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Cashier/components/ReservationsList.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Reservations`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Customer | `See parent row data and linked procedure.` |
| th | Table | `See parent row data and linked procedure.` |
| th | Time | `See parent row data and linked procedure.` |
| th | Guests | `See parent row data and linked procedure.` |
| th | Status | `See parent row data and linked procedure.` |
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

### Action 1: + Add Reservation

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | + Add Reservation |
| Location | ReservationsList; JSX button; handler () =&gt; setIsAddModalOpen(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate + Add Reservation.  |
| Handler / destination | () =&gt; setIsAddModalOpen(true) |
| Local UI result | setIsAddModalOpen |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Reset

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reset |
| Location | ReservationsList; JSX button; handler resetFilters |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reset.  |
| Handler / destination | resetFilters |
| Local UI result | setPage, setFilters |

Trace symbols: `resetFilters`.

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Arrived

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Arrived |
| Location | ReservationsList; JSX button; handler () =&gt; markArrived(r.id) |
| Appears when | r.status === "reserved" AND reservations.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Arrived.  |
| Handler / destination | () =&gt; markArrived(r.id) |
| Local UI result | setReservations, setPagination |

Trace symbols: `fetchReservations`, `markArrived`, `normalizePaginatedResponse`.

Requests made by this handler or local helpers:

- `instance.post(′/orders/cashier/reservations/${id}/arrive/′)`

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | ReservationsList; JSX button; handler () =&gt; setReservationToCancel(r) |
| Appears when | r.status === "reserved" AND reservations.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setReservationToCancel(r) |
| Local UI result | setReservationToCancel |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: ✏️ Edit

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | ✏️ Edit |
| Location | ReservationsList; JSX button; handler () =&gt; setSelectedReservation(r) |
| Appears when | reservations.length === 0 [false branch] |
| Disabled when | [                             "completed",                             "cancelled",                             "no_show",                           ].includes(r.status) |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate ✏️ Edit.  |
| Handler / destination | () =&gt; setSelectedReservation(r) |
| Local UI result | setSelectedReservation |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: 🖨 Print

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | 🖨 Print |
| Location | ReservationsList; JSX button; handler () =&gt; setPrintReservation(r) |
| Appears when | reservations.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate 🖨 Print.  |
| Handler / destination | () =&gt; setPrintReservation(r) |
| Local UI result | setPrintReservation |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search name, phone, table... | search; filters.search | Not declared; see submit validation | filters.search | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: filters.status | select; filters.status | Not declared; see submit validation | filters.status | ; choices: Active status [], Reserved [reserved], Arrived [arrived] | read-only=false; disabled=false |
| <a id="field-3"></a> F3: filters.start | date; filters.start | Not declared; see submit validation | filters.start | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: filters.end | date; filters.end | Not declared; see submit validation | filters.end | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.error` | Failed to fetch reservations |
| `toast.success` | Marked as arrived |
| `toast.error` | Failed to update reservation status |
| `toast.success` | Reservation cancelled |
| `toast.error` | Failed to cancel reservation |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.add_reservation_4ba52ffb` | Add Reservation | افزودن رزرو | ریزرویشن اضافه کړئ |
| `inventory_manager.common.reset` | Reset | بازنشانی | بیا تنظیم |
| `legacy.arrived_a22d66c8` | Arrived | رسیدند | ورسېد |
| `legacy.cancel_reservation_bb3c1d62` | Cancel reservation | لغو رزرو | ریزرویشن لغوه کړئ |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `legacy.edit_46d11d96` | ✏️ Edit | ✏️ ویرایش | ✏️ سمون |
| `legacy.print_d21878f0` | 🖨 Print | 🖨 چاپ | 🖨 چاپ |
| `legacy.search_name_phone_table_7703d5f9` | Search name, phone, table... | نام جستجو، تلفن، میز... | د لټون نوم، تلیفون، میز... |
| `legacy.active_status_bde34d02` | Active status | وضعیت فعال | فعال حالت |
| `legacy.reserved_67a6ff10` | Reserved | محفوظ | محفوظ |

## Related interface references

- [component cashier components addreservation](component_cashier_components_addreservation.md)
- [component cashier components reservationupdateforms](component_cashier_components_reservationupdateforms.md)
- [component cashier components reservationcancellationtoast](component_cashier_components_reservationcancellationtoast.md)
- [component cashier components reservationprintmodal](component_cashier_components_reservationprintmodal.md)
