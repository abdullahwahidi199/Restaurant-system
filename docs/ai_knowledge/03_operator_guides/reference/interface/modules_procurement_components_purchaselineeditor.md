---
id: "operator_reference_interface_modules_procurement_components_purchaselineeditor"
title: "Purchase Line Editor — controls and fields"
module: "procurement"
description: "Purchase Line Editor — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["procurement", "purchase", "line", "editor", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager"]
related_docs: ["operator_modules_procurement_purchasing", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/procurement", "/admin/dashboard/procurement/purchase-invoices", "/admin/dashboard/procurement/purchase-invoices/new", "/admin/dashboard/procurement/purchase-invoices/:id", "/admin/dashboard/procurement/suppliers", "/admin/dashboard/procurement/suppliers/:id", "/admin/dashboard/procurement/supplier-payments", "/admin/dashboard/procurement/payables", "/finance-manager/procurement", "/finance-manager/procurement/purchase-invoices", "/finance-manager/procurement/purchase-invoices/new", "/finance-manager/procurement/purchase-invoices/:id", "/finance-manager/procurement/suppliers", "/finance-manager/procurement/suppliers/:id", "/finance-manager/procurement/supplier-payments", "/finance-manager/procurement/payables", "/operations-manager/procurement", "/operations-manager/procurement/purchase-invoices", "/operations-manager/procurement/purchase-invoices/new", "/operations-manager/procurement/purchase-invoices/:id", "/operations-manager/procurement/suppliers", "/operations-manager/procurement/suppliers/:id", "/operations-manager/procurement/supplier-payments", "/operations-manager/procurement/payables"]
source_references: ["frontend/src/modules/procurement/components/PurchaseLineEditor.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Purchase Line Editor — controls and fields

This reference records the controls and fields declared by `PurchaseLineEditor`. Use [purchasing](../../modules/procurement/purchasing.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/procurement/components/PurchaseLineEditor.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Ingredient | `See parent row data and linked procedure.` |
| th | Quantity | `See parent row data and linked procedure.` |
| th | Unit Price | `See parent row data and linked procedure.` |
| th | Line Total | `See parent row data and linked procedure.` |
| th | Action | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Remove line

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Remove line |
| Location | PurchaseLineEditor; JSX button; handler () =&gt; onRemoveLine(line.key) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Remove line.  |
| Handler / destination | () =&gt; onRemoveLine(line.key) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [purchasing](../../modules/procurement/purchasing.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Add Line

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add Line |
| Location | PurchaseLineEditor; JSX button; handler onAddLine |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add Line.  |
| Handler / destination | onAddLine |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [purchasing](../../modules/procurement/purchasing.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Select ingredient | Select; line.ingredient ? { value: line.ingredient, label: `${ingredient?.name \|\| "Ingredient"} (${displayUnit(ingredient?.unit)})`, } : null | Not declared; see submit validation | line.ingredient                           ? {                               value: line.ingredient,                               label: `${ingredient?.name \|\| "Ingredient"} (${displayUnit(ingredient?.unit)})`,                             }                           : null | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: line.quantity | number; line.quantity | Not declared; see submit validation | line.quantity | step=0.001 | read-only=false; disabled=false |
| <a id="field-3"></a> F3: line.unit_price | number; line.unit_price | Not declared; see submit validation | line.unit_price | step=0.0001 | read-only=false; disabled=false |
| <a id="field-4"></a> F4: line.total_price | number; line.total_price | Not declared; see submit validation | line.total_price | step=0.01 | read-only=false; disabled=false |

## Submission and validation evidence

- `preventEnterSubmit`: See the named handler and the module procedure for custom validation.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.remove_line_c54cf886` | Remove line | خط را حذف کنید | کرښه لرې کړه |
| `legacy.add_line_63dcfb67` | Add Line | افزودن خط | Add Line |
| `legacy.select_ingredient_c80652c3` | Select ingredient | انتخاب ماده اولیه | انتخاب اجزاوو |
