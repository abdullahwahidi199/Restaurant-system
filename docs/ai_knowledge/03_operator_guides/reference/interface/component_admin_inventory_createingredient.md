---
id: "operator_reference_interface_component_admin_inventory_createingredient"
title: "Create Ingredient — controls and fields"
module: "inventory"
description: "Create Ingredient — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["inventory", "create", "ingredient", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_inventory_stock", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/inventory", "/admin/dashboard/inventory/ingredients", "/admin/dashboard/inventory/stock-levels", "/admin/dashboard/inventory/stock-movements", "/admin/dashboard/inventory/stock-adjustments", "/admin/dashboard/inventory/low-stock", "/admin/dashboard/inventory/reports", "/inventory-manager", "/inventory-manager/inventory", "/inventory-manager/inventory/ingredients", "/inventory-manager/inventory/stock-levels", "/inventory-manager/inventory/stock-movements", "/inventory-manager/inventory/stock-adjustments", "/inventory-manager/inventory/low-stock", "/inventory-manager/inventory/reports", "/operations-manager/inventory", "/operations-manager/inventory/ingredients", "/operations-manager/inventory/stock-levels", "/operations-manager/inventory/stock-movements", "/operations-manager/inventory/stock-adjustments", "/operations-manager/inventory/low-stock", "/operations-manager/inventory/reports"]
source_references: ["frontend/src/component/Admin/Inventory/CreateIngredient.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Create Ingredient — controls and fields

This reference records the controls and fields declared by `CreateIngredient`. Use [stock](../../modules/inventory/stock.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/Inventory/CreateIngredient.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Add New Ingredient`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | CreateIngredient; JSX form; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | handleSubmit |
| Local UI result | setLoading, setError |

Trace symbols: `handleSubmit`.

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | CreateIngredient; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Saving... / Create (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Saving... / Create (conditional text) |
| Location | CreateIngredient; JSX button; handler handleSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Saving... / Create (conditional text).  |
| Handler / destination | handleSubmit |
| Local UI result | setLoading, setError |

Trace symbols: `handleSubmit`.

Record/status result, downstream effects, failure recovery, and reversal: [stock](../../modules/inventory/stock.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Ingredient Name | text; name | true | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Unit | select; unit | Not declared; see submit validation | "kg" | ; choices: Kilogram [kg], Gram [g], Liter [l], Milliliter [ml], Pieces [pcs] | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Minimum Threshold | number; minimum_threshold | Not declared; see submit validation | "" | step=0.001 | read-only=false; disabled=false |

## Submission and validation evidence

- `handleSubmit`: See the named handler and the module procedure for custom validation.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Failed to create ingredient |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.common.cancel` | Cancel | لغو | لغوه |
| `inventory_manager.common.saving` | Saving... | در حال ذخیره... | ساتل کېږي... |
| `inventory_manager.common.create` | Create | ایجاد | جوړول |
| `inventory_manager.units.kilogram` | Kilogram | کیلوگرام | کیلوګرام |
| `inventory_manager.units.gram` | Gram | گرام | ګرام |
| `inventory_manager.units.liter` | Liter | لیتر | لیټر |
| `inventory_manager.units.milliliter` | Milliliter | میلی‌لیتر | میلي لیټر |
| `inventory_manager.units.pieces` | Pieces | عدد | دانې |
