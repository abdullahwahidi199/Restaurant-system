---
id: "operator_reference_interface_component_admin_tables_tableaddmodal"
title: "Table Add Modal — controls and fields"
module: "tables"
description: "Table Add Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["tables", "table", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_tables_table_setup", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/tables", "/inventory-manager/tables", "/operations-manager/tables"]
source_references: ["frontend/src/component/Admin/tables/TableAddModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Table Add Modal — controls and fields

This reference records the controls and fields declared by `TableAddModal`. Use [table setup](../../modules/tables/table_setup.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/tables/TableAddModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Add New Table`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | TableAddModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [table setup](../../modules/tables/table_setup.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | TableAddModal; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleSubmit |
| Local UI result | setShowRestriction, setError, setLoading |

Trace symbols: `handleSubmit`.

Requests made by this handler or local helpers:

- `instance.post(′/orders/tables/′, { name: tableName, capacity: capacity, note: note,`

Record/status result, downstream effects, failure recovery, and reversal: [table setup](../../modules/tables/table_setup.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Adding... Add Table

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Adding... Add Table |
| Location | TableAddModal; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Adding... Add Table.  |
| Handler / destination | handleSubmit |
| Local UI result | setShowRestriction, setError, setLoading |

Trace symbols: `handleSubmit`.

Requests made by this handler or local helpers:

- `instance.post(′/orders/tables/′, { name: tableName, capacity: capacity, note: note,`

Record/status result, downstream effects, failure recovery, and reversal: [table setup](../../modules/tables/table_setup.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Allow free reservation | text; tableName | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Allow free reservation | number; capacity | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Allow free reservation | number; pricePerHour | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Allow free reservation | text; note | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Allow free reservation | checkbox; allowFreeReservation | Not declared; see submit validation | allowFreeReservation | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

- `handleSubmit`: `if (isDemo) { setShowRestriction(true); return; } if (!tableName) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Table must have name! |
| `setError` | error |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `adding` | Adding... | در حال افزودن... | اضافه کېږي... |
| `add_table` | Add Table | افزودن میز | مېز اضافه کړئ |
| `legacy.name_6ae99955` | name | نام | نوم |
| `capacity` | Capacity | ظرفیت | ظرفیت |
| `legacy.price_per_hour_reservations_5e07b004` | Price per hour(Reservations) | قیمت هر ساعت (رزروها) | په ساعت کې بیه (ریزرویشنونه) |
| `note` | Note | یادداشت | یادښت |
