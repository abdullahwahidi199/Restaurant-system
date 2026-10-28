---
id: "operator_reference_interface_component_admin_dailyproduction_productioncard"
title: "Production Card — controls and fields"
module: "production"
description: "Production Card — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["production", "card", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "Kitchen_manager", "OperationsManager"]
related_docs: ["operator_modules_production_daily_production", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/daily_production", "/inventory-manager/daily-production", "/operations-manager/daily_production", "/kitchen/daily-production", "/kitchen/daily_production"]
source_references: ["frontend/src/component/Admin/DailyProduction/ProductionCard.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Production Card — controls and fields

This reference records the controls and fields declared by `ProductionCard`. Use [daily production](../../modules/production/daily_production.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/DailyProduction/ProductionCard.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{item.name}`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: + Cook

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | + Cook |
| Location | ProductionCard; JSX button; handler () =&gt; onIncrement(qty) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate + Cook.  |
| Handler / destination | () =&gt; onIncrement(qty) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: − Reduce

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | − Reduce |
| Location | ProductionCard; JSX button; handler () =&gt; onDecrement(qty) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | !hasProd |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate − Reduce.  |
| Handler / destination | () =&gt; onDecrement(qty) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Clear

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Clear |
| Location | ProductionCard; JSX button; handler () =&gt; onClear(false) |
| Appears when | hasProd |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Clear.  |
| Handler / destination | () =&gt; onClear(false) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Quantity | number; qty | Not declared; see submit validation | 1 | min=1 | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.cook_more_add_to_batch_66e39279` | Cook more / add to batch | بیشتر بپز / به دسته اضافه کنید | نور پخې کړئ / په ډله کې یې اضافه کړئ |
| `legacy.cook_d8402b40` | + Cook | + آشپز | + پخلی |
| `legacy.reduce_batch_0c0db485` | Reduce batch | دسته کاهش | ریکمینګ بیچ |
| `legacy.reduce_24267c81` | − Reduce | − کاهش | − کمښت |
| `legacy.clear_production_b938db48` | Clear production | تولید شفاف | روښانه تولید |
| `legacy.clear_719ea396` | Clear | پاک | پاکه |
| `inventory_manager.common.quantity` | Quantity | مقدار | مقدار |
