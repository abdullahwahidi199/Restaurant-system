---
id: "operator_reference_interface_component_admin_expenses_expensesmain"
title: "Expenses Main — controls and fields"
module: "expenses"
description: "Expenses Main — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["expenses", "main", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_expenses_expenses", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/expenses", "/inventory-manager/expenses", "/finance-manager", "/finance-manager/expenses", "/operations-manager/expenses"]
source_references: ["frontend/src/component/Admin/Expenses/ExpensesMain.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Expenses Main — controls and fields

This reference records the controls and fields declared by `ExpensesMain`. Use [expenses](../../modules/expenses/expenses.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/Expenses/ExpensesMain.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Expenses`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| PageHeader | Expenses | `See parent row data and linked procedure.` |
| th | Name | `See parent row data and linked procedure.` |
| th | Date | `See parent row data and linked procedure.` |
| th | Amount | `See parent row data and linked procedure.` |
| th | AFN Equivalent | `See parent row data and linked procedure.` |
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

### Action 1: History

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | History |
| Location | ExpensesMain; JSX SharedActionButton; handler () =&gt; navigate("history/") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate History.  |
| Handler / destination | () =&gt; navigate("history/") |
| Local UI result | Navigation: "history/") |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: New Expense

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | New Expense |
| Location | ExpensesMain; JSX SharedActionButton; handler () =&gt; setAddModalOpen(true) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate New Expense.  |
| Handler / destination | () =&gt; setAddModalOpen(true) |
| Local UI result | setAddModalOpen |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Reset

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reset |
| Location | ExpensesMain; JSX SharedActionButton; handler resetFilters |
| Appears when | hasActiveFilters |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reset.  |
| Handler / destination | resetFilters |
| Local UI result | setSearchTerm, setCurrencyFilter, setDateFrom, setDateTo, setSortBy |

Trace symbols: `resetFilters`.

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Try again

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Try again |
| Location | ExpensesMain; JSX SharedActionButton; handler () =&gt; fetchExpenses(1) |
| Appears when | error [true branch] AND loading && expenses.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Try again.  |
| Handler / destination | () =&gt; fetchExpenses(1) |
| Local UI result | setLoading, setError, setExpenses, setPagination, setStats |

Trace symbols: `fetchExpenses`.

Requests made by this handler or local helpers:

- `instance.get("/expenses/expenses/", { params })`

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Reset Filters

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reset Filters |
| Location | ExpensesMain; JSX SharedActionButton; handler resetFilters |
| Appears when | stats.total_count &gt; 0 [true branch] AND expenses.length === 0 [true branch] AND error [false branch] AND loading && expenses.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reset Filters.  |
| Handler / destination | resetFilters |
| Local UI result | setSearchTerm, setCurrencyFilter, setDateFrom, setDateTo, setSortBy |

Trace symbols: `resetFilters`.

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: New Expense

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | New Expense |
| Location | ExpensesMain; JSX SharedActionButton; handler () =&gt; setAddModalOpen(true) |
| Appears when | stats.total_count &gt; 0 [false branch] AND expenses.length === 0 [true branch] AND error [false branch] AND loading && expenses.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate New Expense.  |
| Handler / destination | () =&gt; setAddModalOpen(true) |
| Local UI result | setAddModalOpen |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: View Details

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | View Details |
| Location | ExpensesMain; JSX IconActionButton; handler () =&gt; navigate(`${expense.id}/`) |
| Appears when | expenses.length === 0 [false branch] AND error [false branch] AND loading && expenses.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate View Details.  |
| Handler / destination | () =&gt; navigate(`${expense.id}/`) |
| Local UI result | Navigation: `${expense.id}/`) |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Print Voucher

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Print Voucher |
| Location | ExpensesMain; JSX IconActionButton; handler () =&gt; printVoucher( expense, restaurant?.name, restaurant?.logo, ) |
| Appears when | expenses.length === 0 [false branch] AND error [false branch] AND loading && expenses.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Print Voucher.  |
| Handler / destination | () =&gt; printVoucher( expense, restaurant?.name, restaurant?.logo, ) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: Delete

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Delete |
| Location | ExpensesMain; JSX IconActionButton; handler () =&gt; setDeleteId(expense.id) |
| Appears when | expenses.length === 0 [false branch] AND error [false branch] AND loading && expenses.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Delete.  |
| Handler / destination | () =&gt; setDeleteId(expense.id) |
| Local UI result | setDeleteId |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | ExpensesMain; JSX form; handler addNewExpense |
| Appears when | addModalOpen |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label]. Review the confirmation before accepting. |
| Handler / destination | addNewExpense |
| Local UI result | setSubmitting, setNewExpense, setAddModalOpen, setLoading, setError, setExpenses, setPagination, setStats |

Trace symbols: `addNewExpense`, `fetchExpenses`.

Requests made by this handler or local helpers:

- `instance.post("/expenses/expenses/", payload)`
- `instance.get("/expenses/expenses/", { params })`

Dialog content: `"Failed to create expense. Please check the fields.")`.

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-11"></a>

### Action 11: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | ExpensesMain; JSX SharedActionButton; handler () =&gt; setAddModalOpen(false) |
| Appears when | addModalOpen |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | () =&gt; setAddModalOpen(false) |
| Local UI result | setAddModalOpen |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-12"></a>

### Action 12: Saving... / Save Expense (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Saving... / Save Expense (conditional text) |
| Location | ExpensesMain; JSX SharedActionButton; handler addNewExpense |
| Appears when | addModalOpen |
| Disabled when | submitting |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Saving... / Save Expense (conditional text). Review the confirmation before accepting. |
| Handler / destination | addNewExpense |
| Local UI result | setSubmitting, setNewExpense, setAddModalOpen, setLoading, setError, setExpenses, setPagination, setStats |

Trace symbols: `addNewExpense`, `fetchExpenses`.

Requests made by this handler or local helpers:

- `instance.post("/expenses/expenses/", payload)`
- `instance.get("/expenses/expenses/", { params })`

Dialog content: `"Failed to create expense. Please check the fields.")`.

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-13"></a>

### Action 13: {icon}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {icon} |
| Location | ExpensesMain; JSX button; handler onClick |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {icon}.  |
| Handler / destination | onClick |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search by name or description... | SharedField;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Search by name or description... | SearchBox; searchTerm | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Currency | SharedField;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Currency | select; currencyFilter | Not declared; see submit validation | "all" | ; choices: All Currencies [all], AFN [AFN], USD [USD] | read-only=false; disabled=false |
| <a id="field-5"></a> F5: From date | SharedField;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-6"></a> F6: From date | date; dateFrom | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-7"></a> F7: To date | SharedField;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-8"></a> F8: To date | date; dateTo | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Sort by | SharedField;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-10"></a> F10: Sort by | select; sortBy | Not declared; see submit validation | "-date" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-11"></a> F11: Expense Name | SharedField;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when addModalOpen |
| <a id="field-12"></a> F12: Expense Name | text; name | true | newExpense.name | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when addModalOpen |
| <a id="field-13"></a> F13: Date | SharedField;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when addModalOpen |
| <a id="field-14"></a> F14: Date | date; date | true | newExpense.date | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when addModalOpen |
| <a id="field-15"></a> F15: Amount | SharedField;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when addModalOpen |
| <a id="field-16"></a> F16: Amount | number; amount | true | newExpense.amount | step=0.01 | read-only=false; disabled=false; shown when addModalOpen |
| <a id="field-17"></a> F17: Currency | SharedField;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when addModalOpen |
| <a id="field-18"></a> F18: Currency | select; currency | Not declared; see submit validation | newExpense.currency | ; choices: AFN - Afghani [AFN], USD - US Dollar [USD] | read-only=false; disabled=false; shown when addModalOpen |
| <a id="field-19"></a> F19: Exchange Rate (1 USD = ? AFN) | SharedField;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when newExpense.currency === "USD" AND addModalOpen |
| <a id="field-20"></a> F20: Exchange Rate (1 USD = ? AFN) | number; exchange_rate | Not declared; see submit validation | newExpense.exchange_rate | step=0.01 | read-only=false; disabled=false; shown when newExpense.currency === "USD" AND addModalOpen |
| <a id="field-21"></a> F21: Description | SharedField;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when addModalOpen |
| <a id="field-22"></a> F22: Description | textarea; description | Not declared; see submit validation | newExpense.description | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when addModalOpen |

## Submission and validation evidence

- `addNewExpense`: See the named handler and the module procedure for custom validation.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Failed to load expenses |
| `alert` | "Failed to create expense. Please check the fields." |
| `alert` | "Failed to delete expense" |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.history_90ccd649` | History | تاریخچه | تاریخچه |
| `legacy.new_expense_7c3ae05c` | New Expense | هزینه جدید | نوی لګښت |
| `legacy.reset_filters_56553100` | Reset filters | فیلترهای بازنشانی | فلټرونه بیا تنظیم کړئ |
| `inventory_manager.common.reset` | Reset | بازنشانی | بیا تنظیم |
| `landing.marketplace.discovery.retry` | Try again | تلاش دوباره | بیا هڅه وکړئ |
| `legacy.reset_filters_5be69856` | Reset Filters | فیلترهای بازنشانی | ریسیټ فلټرونه |
| `legacy.view_details_907b3bee` | View Details | جزئیات را ببینید | تفصیلات وګورئ |
| `legacy.print_voucher_e313002f` | Print Voucher | کوپن چاپ | چاپ واؤچر |
| `staff.table.delete` | Delete | حذف | ړنګول |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `saving` | Saving... | در حال ذخیره... | خوندي کېږي... |
| `legacy.save_expense_b89a5c08` | Save Expense | صرفه جویی در هزینه ها | لګښتونه سپما کړئ |
| `legacy.search_by_name_or_description_5b22616a` | Search by name or description... | جستجو بر اساس نام یا توصیف... | د نوم یا تشریح له مخې لټون وکړه... |
| `legacy.currency_e070de22` | Currency | واحد پول | اسعار |
| `legacy.all_currencies_f41665a4` | All Currencies | تمام ارزها | ټولې اسعار |
| `labels.afn` | AFN | افغانی | افغانۍ |
| `legacy.usd_57814cfb` | USD | دلار آمریکا | USD |
| `legacy.from_date_3b5d11ae` | From date | از تاریخ | له نیټې څخه |
| `legacy.to_date_af244da3` | To date | تا به امروز | تر اوسه |
| `legacy.sort_by` | Sort by | missing; fallback applies | missing; fallback applies |
| `legacy.expense_name_866f5080` | Expense Name | نام هزینه | د لګښت نوم |
| `legacy.e_g_office_supplies_3a60cc40` | e.g., Office Supplies | مثلاً لوازم اداری | لکه، د دفتر سامانونه |
| `table.date` | Date | تاریخ | نېټه |
| `legacy.amount_43dc8532` | Amount | مقدار | مقدار |
| `legacy.afn_afghani_96edf857` | AFN - Afghani | AFN - افغانی | AFN - افغانی |
| `legacy.usd_us_dollar_2d6f254e` | USD - US Dollar | دلار آمریکا - دلار آمریکا | USD - د امریکا ډالر |
| `legacy.exchange_rate_1_usd_afn_64ac5dcc` | Exchange Rate (1 USD = ? AFN) | نرخ تبدیل (۱ دلار = ؟ AFN) | د تبادلې نرخ (۱ USD = ؟ AFN) |
| `legacy.e_g_70_50_7ce1e013` | e.g., 70.50 | مثلاً ۷۰.۵۰ | مثلاً، 70.50 |
| `description` | Description | توضیحات | تشریح |
| `legacy.additional_details_04831c63` | Additional details... | جزئیات اضافی... | نور جزیات... |

## Related interface references

- [modules shared erp components pageheader](modules_shared_erp_components_pageheader.md)
- [modules shared erp components actionbutton](modules_shared_erp_components_actionbutton.md)
- [modules shared erp components toolbar](modules_shared_erp_components_toolbar.md)
- [modules shared erp components searchbox](modules_shared_erp_components_searchbox.md)
- [modules shared erp components alert](modules_shared_erp_components_alert.md)
- [modules shared erp components modal](modules_shared_erp_components_modal.md)
- [modules shared erp components confirmmodal](modules_shared_erp_components_confirmmodal.md)
