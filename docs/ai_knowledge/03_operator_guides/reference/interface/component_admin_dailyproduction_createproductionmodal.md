---
id: "operator_reference_interface_component_admin_dailyproduction_createproductionmodal"
title: "Create Production Modal — controls and fields"
module: "production"
description: "Create Production Modal declarations without a mounted App import path; retained for source explanation, not current operator instructions."
keywords: ["production", "create", "modal", "controls", "fields"]
roles: []
related_docs: ["operator_modules_production_daily_production", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: []
source_references: ["frontend/src/component/Admin/DailyProduction/CreateProductionModal.jsx", "frontend/src/i18n.js"]
status: "needs_verification"
availability: "unmounted"
---

# Create Production Modal — controls and fields

This reference records the controls and fields declared by `CreateProductionModal`. Use [daily production](../../modules/production/daily_production.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/DailyProduction/CreateProductionModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Adjust Production Create Production`

## Mounting status: Needs Verification

No rendered App route was traced to this component. It may be unused/legacy or only reachable through a runtime reference not resolved by static imports. The declarations below are inventory evidence, not an implemented navigation procedure. Do not teach its controls as available until a mounted caller is verified.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | CreateProductionModal; JSX form; handler submit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | submit |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `submit`.

Requests made by this handler or local helpers:

- `instance.patch(′/menu/production/${production.id}/′, { quantity: form.quantity, notes: form.notes,`
- `instance.post("/menu/production/", form)`

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | CreateProductionModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Save

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Save |
| Location | CreateProductionModal; JSX button; handler submit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Save.  |
| Handler / destination | submit |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `submit`.

Requests made by this handler or local helpers:

- `instance.patch(′/menu/production/${production.id}/′, { quantity: form.quantity, notes: form.notes,`
- `instance.post("/menu/production/", form)`

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Unlabelled control (see binding) | Select; (selected) =&gt; setForm({ ...form, menu_item: selected.value, }) | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when !production |
| <a id="field-2"></a> F2: Quantity Produced | number; form.quantity | Not declared; see submit validation | form.quantity | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Notes | textarea; form.notes | Not declared; see submit validation | form.notes | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

- `submit`: `if (production) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `legacy.save_efc007a3` | Save | ذخیره | ژغورنه |
| `legacy.quantity_produced_d9759867` | Quantity Produced | مقدار تولید شده | تولید شوی مقدار |
| `inventory_manager.common.notes` | Notes | یادداشت‌ها | یادښتونه |
