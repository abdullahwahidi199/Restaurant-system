---
id: "operator_reference_interface_component_admin_expenses_individualexpense"
title: "Individual Expense — controls and fields"
module: "expenses"
description: "Individual Expense — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["expenses", "individual", "expense", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_expenses_expenses", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/expenses/:id", "/inventory-manager/expenses/:id", "/finance-manager/expenses/:id", "/operations-manager/expenses/:id"]
source_references: ["frontend/src/component/Admin/Expenses/IndividualExpense.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Individual Expense — controls and fields

This reference records the controls and fields declared by `IndividualExpense`. Use [expenses](../../modules/expenses/expenses.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/Expenses/IndividualExpense.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`{expense.name}`, `Audit History`, `Edit Expense`, `Delete Expense`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Back to expenses

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Back to expenses |
| Location | IndividualExpense; JSX Link; handler expensesPath |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Back to expenses.  |
| Handler / destination | expensesPath |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Back to Expenses

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Back to Expenses |
| Location | IndividualExpense; JSX Link; handler expensesPath |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Back to Expenses.  |
| Handler / destination | expensesPath |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Print Voucher

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Print Voucher |
| Location | IndividualExpense; JSX button; handler () =&gt; printVoucher(expense, restaurant?.name, restaurant?.logo) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Print Voucher.  |
| Handler / destination | () =&gt; printVoucher(expense, restaurant?.name, restaurant?.logo) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Edit

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Edit |
| Location | IndividualExpense; JSX button; handler openEdit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Edit.  |
| Handler / destination | openEdit |
| Local UI result | setEditForm, setEditFormDisplay |

Trace symbols: `openEdit`.

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Delete

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Delete |
| Location | IndividualExpense; JSX button; handler () =&gt; setConfirmDelete(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Delete.  |
| Handler / destination | () =&gt; setConfirmDelete(true) |
| Local UI result | setConfirmDelete |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | IndividualExpense; JSX form; handler handleExpenseEdit |
| Appears when | editFormDisplay |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label]. Review the confirmation before accepting. |
| Handler / destination | handleExpenseEdit |
| Local UI result | setSubmitting, setEditFormDisplay, setLoading, setExpense, setError |

Trace symbols: `fetchExpense`, `handleExpenseEdit`.

Requests made by this handler or local helpers:

- `instance.patch(′/expenses/expenses/${id}/′, payload)`
- `instance.get(′/expenses/expenses/${id}/′)`

Dialog content: `"Failed to update expense")`.

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | IndividualExpense; JSX button; handler () =&gt; setEditFormDisplay(false) |
| Appears when | editFormDisplay |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | () =&gt; setEditFormDisplay(false) |
| Local UI result | setEditFormDisplay |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | IndividualExpense; JSX button; handler () =&gt; setEditFormDisplay(false) |
| Appears when | editFormDisplay |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setEditFormDisplay(false) |
| Local UI result | setEditFormDisplay |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: Saving... / Save Changes (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Saving... / Save Changes (conditional text) |
| Location | IndividualExpense; JSX button; handler handleExpenseEdit |
| Appears when | editFormDisplay |
| Disabled when | submitting |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Saving... / Save Changes (conditional text). Review the confirmation before accepting. |
| Handler / destination | handleExpenseEdit |
| Local UI result | setSubmitting, setEditFormDisplay, setLoading, setExpense, setError |

Trace symbols: `fetchExpense`, `handleExpenseEdit`.

Requests made by this handler or local helpers:

- `instance.patch(′/expenses/expenses/${id}/′, payload)`
- `instance.get(′/expenses/expenses/${id}/′)`

Dialog content: `"Failed to update expense")`.

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | IndividualExpense; JSX button; handler () =&gt; setConfirmDelete(false) |
| Appears when | confirmDelete |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setConfirmDelete(false) |
| Local UI result | setConfirmDelete |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-11"></a>

### Action 11: Delete

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Delete |
| Location | IndividualExpense; JSX button; handler handleDelete |
| Appears when | confirmDelete |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Delete. Review the confirmation before accepting. |
| Handler / destination | handleDelete |
| Local UI result | Navigation: expensesPath) |

Trace symbols: `handleDelete`.

Requests made by this handler or local helpers:

- `instance.delete(′/expenses/expenses/${id}/′)`

Dialog content: `"Failed to delete expense")`.

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Name | EditField;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when editFormDisplay |
| <a id="field-2"></a> F2: Name | text; name | true | editForm.name | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when editFormDisplay |
| <a id="field-3"></a> F3: Date | EditField;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when editFormDisplay |
| <a id="field-4"></a> F4: Date | date; date | true | editForm.date | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when editFormDisplay |
| <a id="field-5"></a> F5: Amount | EditField;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when editFormDisplay |
| <a id="field-6"></a> F6: Amount | number; amount | true | editForm.amount | step=0.01 | read-only=false; disabled=false; shown when editFormDisplay |
| <a id="field-7"></a> F7: Currency | EditField;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when editFormDisplay |
| <a id="field-8"></a> F8: Currency | select; currency | Not declared; see submit validation | editForm.currency | ; choices: AFN - Afghani [AFN], USD - US Dollar [USD] | read-only=false; disabled=false; shown when editFormDisplay |
| <a id="field-9"></a> F9: Exchange Rate (1 USD = ? AFN) | EditField;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when editForm.currency === "USD" AND editFormDisplay |
| <a id="field-10"></a> F10: Exchange Rate (1 USD = ? AFN) | number; exchange_rate | Not declared; see submit validation | editForm.exchange_rate | step=0.01 | read-only=false; disabled=false; shown when editForm.currency === "USD" AND editFormDisplay |
| <a id="field-11"></a> F11: Description | EditField;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when editFormDisplay |
| <a id="field-12"></a> F12: Description | textarea; description | Not declared; see submit validation | editForm.description | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when editFormDisplay |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Failed to load expense |
| `alert` | "Failed to update expense" |
| `alert` | "Failed to delete expense" |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.back_to_expenses_6ab10edd` | Back to expenses | بازگشت به هزینه ها | بېرته لګښتونو ته |
| `legacy.back_to_expenses_732b199b` | Back to Expenses | بازگشت به هزینه ها | بېرته لګښتونو ته |
| `legacy.print_voucher_e313002f` | Print Voucher | کوپن چاپ | چاپ واؤچر |
| `staff.table.edit` | Edit | ویرایش | سمول |
| `staff.table.delete` | Delete | حذف | ړنګول |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `saving` | Saving... | در حال ذخیره... | خوندي کېږي... |
| `save_changes` | Save Changes | ذخیره تغییرات | بدلونونه خوندي کړئ |
| `attendance.table.name` | Name | نام | نوم |
| `table.date` | Date | تاریخ | نېټه |
| `legacy.amount_43dc8532` | Amount | مقدار | مقدار |
| `legacy.currency_e070de22` | Currency | واحد پول | اسعار |
| `legacy.afn_afghani_96edf857` | AFN - Afghani | AFN - افغانی | AFN - افغانی |
| `legacy.usd_us_dollar_2d6f254e` | USD - US Dollar | دلار آمریکا - دلار آمریکا | USD - د امریکا ډالر |
| `legacy.exchange_rate_1_usd_afn_64ac5dcc` | Exchange Rate (1 USD = ? AFN) | نرخ تبدیل (۱ دلار = ؟ AFN) | د تبادلې نرخ (۱ USD = ؟ AFN) |
| `description` | Description | توضیحات | تشریح |
