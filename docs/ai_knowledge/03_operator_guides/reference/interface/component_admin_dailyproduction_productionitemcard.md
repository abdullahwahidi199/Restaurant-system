---
id: "operator_reference_interface_component_admin_dailyproduction_productionitemcard"
title: "Production Item Card — controls and fields"
module: "production"
description: "Production Item Card declarations without a mounted App import path; retained for source explanation, not current operator instructions."
keywords: ["production", "item", "card", "controls", "fields"]
roles: []
related_docs: ["operator_modules_production_daily_production", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: []
source_references: ["frontend/src/component/Admin/DailyProduction/ProductionItemCard.jsx", "frontend/src/i18n.js"]
status: "needs_verification"
availability: "unmounted"
---

# Production Item Card — controls and fields

This reference records the controls and fields declared by `ProductionItemCard`. Use [daily production](../../modules/production/daily_production.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/DailyProduction/ProductionItemCard.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{item.name}`

## Mounting status: Needs Verification

No rendered App route was traced to this component. It may be unused/legacy or only reachable through a runtime reference not resolved by static imports. The declarations below are inventory evidence, not an implemented navigation procedure. Do not teach its controls as available until a mounted caller is verified.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: + Cook

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | + Cook |
| Location | ProductionItemCard; JSX button; handler onIncrement |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate + Cook.  |
| Handler / destination | onIncrement |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: - Remove

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | - Remove |
| Location | ProductionItemCard; JSX button; handler onDecrement |
| Appears when | hasProduction |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate - Remove.  |
| Handler / destination | onDecrement |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Hide custom amount Custom amount...

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Hide custom amount Custom amount... |
| Location | ProductionItemCard; JSX button; handler () =&gt; setShowCustom(!showCustom) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Hide custom amount Custom amount....  |
| Handler / destination | () =&gt; setShowCustom(!showCustom) |
| Local UI result | setShowCustom |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Apply

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Apply |
| Location | ProductionItemCard; JSX button; handler () =&gt; { onCustomAmount(customAmount, customAction); setShowCustom(false); } |
| Appears when | showCustom |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Apply.  |
| Handler / destination | () =&gt; { onCustomAmount(customAmount, customAction); setShowCustom(false); } |
| Local UI result | setShowCustom |

Record/status result, downstream effects, failure recovery, and reversal: [daily production](../../modules/production/daily_production.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: customAction | select; customAction | Not declared; see submit validation | "increment" | ; choices: Cook More [increment], Remove [decrement] | read-only=false; disabled=false; shown when showCustom |
| <a id="field-2"></a> F2: customAmount | number; customAmount | Not declared; see submit validation | 1 | min=1 | read-only=false; disabled=false; shown when showCustom |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.cook_d8402b40` | + Cook | + آشپز | + پخلی |
| `legacy.remove_d74a7695` | - Remove | - حذف | - لرې کول |
| `legacy.hide_custom_amount_89727160` | Hide custom amount | مقدار سفارشی را پنهان کنید | د ځانګړی مقدار پټول |
| `legacy.custom_amount_9251757a` | Custom amount... | مقدار سفارشی... | ځانګړی اندازه... |
| `filters.apply` | Apply | اعمال | پلي کول |
| `legacy.cook_more_3a116871` | Cook More | آشپزی بیشتر | کوک مور |
| `legacy.remove_e963907d` | Remove | حذف | لرې کول |
