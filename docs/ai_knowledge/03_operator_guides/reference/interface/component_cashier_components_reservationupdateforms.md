---
id: "operator_reference_interface_component_cashier_components_reservationupdateforms"
title: "Reservation Update Forms — controls and fields"
module: "reservations"
description: "Reservation Update Forms — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["reservations", "reservation", "update", "forms", "controls", "fields"]
roles: ["Cashier", "Manager"]
related_docs: ["operator_modules_reservations_reservations", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/manager/reservations", "/cashier/reservations"]
source_references: ["frontend/src/component/Cashier/components/ReservationUpdateForms.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Reservation Update Forms — controls and fields

This reference records the controls and fields declared by `ReservationUpdateForms`. Use [reservations](../../modules/reservations/reservations.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Cashier/components/ReservationUpdateForms.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`✦ New Reservation`, `Existing Bookings on {form.reservation_date}`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Close

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close |
| Location | ReservationUpdateForms; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | ReservationUpdateForms; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleSubmit |
| Local UI result | setLoading, setFieldErrors, setForm |

Trace symbols: `handleSubmit`, `parseBackendErrors`, `validateForm`.

Requests made by this handler or local helpers:

- `instance.patch(′orders/reservations/${reservation.id}/′, payload, { headers: { Authorization: ′Bearer ${localStorage.getItem("access_token")}′, },`

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | ReservationUpdateForms; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Cashier, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Saving... / Save Reservation (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Saving... / Save Reservation (conditional text) |
| Location | ReservationUpdateForms; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Cashier, Manager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Saving... / Save Reservation (conditional text).  |
| Handler / destination | handleSubmit |
| Local UI result | setLoading, setFieldErrors, setForm |

Trace symbols: `handleSubmit`, `parseBackendErrors`, `validateForm`.

Requests made by this handler or local helpers:

- `instance.patch(′orders/reservations/${reservation.id}/′, payload, { headers: { Authorization: ′Bearer ${localStorage.getItem("access_token")}′, },`

Record/status result, downstream effects, failure recovery, and reversal: [reservations](../../modules/reservations/reservations.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Table * | select; table | true | reservation.table | ; choices: — Select a table — [] | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Customer Name * | text; customer_name | true | reservation.customer_name | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Phone Number | tel; phone | Not declared; see submit validation | reservation.phone | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Number of Guests | number; guests | Not declared; see submit validation | reservation.guests | min=1; max=selectedTable?.capacity \|\| 50 | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Start Time * | datetime-local; start_time | true | reservation.start_time | min=`${todayStr}T00:00` | read-only=false; disabled=false |
| <a id="field-6"></a> F6: Duration (min) | select; duration_minutes | Not declared; see submit validation | reservation.duration_minutes | ; choices: 30 min [30], 1 hour [60], 1.5 hours [90], 2 hours [120], 3 hours [180], 4 hours [240], 5 hours [300], 6 hours [360], 8 hours [480] | read-only=false; disabled=false |
| <a id="field-7"></a> F7: reservation_date | hidden; reservation_date | Not declared; see submit validation | reservation.reservation_date | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-8"></a> F8: Reservation Type | select; reservation_type | Not declared; see submit validation | reservation.reservation_type | ; choices: 💲 Fee-Based (pay on arrival) [fee], 💳 Prepaid [prepaid] | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Prepaid Amount | number; paid_amount | Not declared; see submit validation | reservation.paid_amount | min=0; max=estimatedPrice \|\| undefined | read-only=false; disabled=false; shown when form.reservation_type === "prepaid" |
| <a id="field-10"></a> F10: Special Notes | textarea; notes | Not declared; see submit validation | reservation.notes | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

- `validateForm`: `if (form.duration_minutes &lt; 30) errs.duration_minutes = "Minimum 30 minutes"; if (selectedTable && form.guests &gt; selectedTable.capacity) {`; `if (form.start_time) { const startDate = new Date(form.start_time); if (startDate &lt; new Date()) {`; `if (Object.keys(errs).length &gt; 0) {`
- `handleSubmit`: `if (onReservationSaved) onReservationSaved(); if (onClose) onClose(); } catch (error) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.error` | Failed to load tables |
| `toast.error` | first |
| `toast.error` | data |
| `toast.error` | data.detail |
| `toast.error` | msg |
| `toast.error` | `${label}${msg}` |
| `toast.success` | Reservation created successfully! |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `menuDetails.close` | Close | بستن | بندول |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `saving` | Saving... | در حال ذخیره... | خوندي کېږي... |
| `legacy.save_reservation_c6d70141` | Save Reservation | ذخیره رزرو | خوندی ریزرویشن |
| `legacy.select_a_table_94a81f25` | — Select a table — | — یک جدول انتخاب کنید — | — یو جدول انتخاب کړئ — |
| `legacy.table_0424f6e7` | Table | جدول | جدول |
| `legacy.seats_05d560fe` | seats | کرسی ها | څوکۍ |
| `legacy.free_aaf7e02c` | — Free | — رایگان | — وړیا |
| `legacy.enter_name_5df85959` | Enter name | نام را وارد کنید | نوم داخل کړئ |
| `legacy.enter_phone_afe4ff5a` | Enter phone | ورود تلفن | تلیفون داخل شو |
| `legacy.30_min_d3ddf7a3` | 30 min | ۳۰ دقیقه | ۳۰ دقیقې |
| `legacy.1_hour_f030c3d6` | 1 hour | ۱ ساعت | ۱ ساعت |
| `legacy.1_5_hours_6bc4eb60` | 1.5 hours | ۱.۵ ساعت | ۱.۵ ساعته |
| `legacy.2_hours_2046e49e` | 2 hours | ۲ ساعت | ۲ ساعته |
| `legacy.3_hours_63d26e82` | 3 hours | ۳ ساعت | ۳ ساعته |
| `legacy.4_hours_7b47150d` | 4 hours | ۴ ساعت | ۴ ساعته |
| `legacy.5_hours_1fe288aa` | 5 hours | ۵ ساعت | ۵ ساعته |
| `legacy.6_hours_1e35c222` | 6 hours | ۶ ساعت | ۶ ساعته |
| `legacy.8_hours_191800b7` | 8 hours | ۸ ساعت | ۸ ساعته |
| `legacy.free_3e80dce3` | 🆓 Free | 🆓 رایگان | 🆓 وړیا |
| `legacy.fee_based_pay_on_arrival_afed3d87` | 💲 Fee-Based (pay on arrival) | 💲 پرداخت بر اساس هزینه (پرداخت هنگام ورود) | 💲 فیس پر بنسټ (د رسیدو پر مهال پیسې ورکول) |
| `legacy.prepaid_73b7e76f` | 💳 Prepaid | 💳 پیش پرداخت | 💳 مخکې تادیه شوی |
| `legacy.enter_amount_01f20462` | Enter amount | مقدار را وارد کنید | مقدار داخل کړئ |
| `legacy.any_special_requests_74eb7ed0` | Any special requests… | درخواست ویژه ای هست... | کومه ځانګړې غوښتنه... |
