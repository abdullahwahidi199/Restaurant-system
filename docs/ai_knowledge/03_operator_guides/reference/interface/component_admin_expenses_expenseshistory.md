---
id: "operator_reference_interface_component_admin_expenses_expenseshistory"
title: "Expenses History — controls and fields"
module: "expenses"
description: "Expenses History — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["expenses", "history", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "InventoryManager", "OperationsManager"]
related_docs: ["operator_modules_expenses_expenses", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/expenses/history", "/inventory-manager/expenses/history", "/finance-manager/expenses/history", "/operations-manager/expenses/history"]
source_references: ["frontend/src/component/Admin/Expenses/ExpensesHistory.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Expenses History — controls and fields

This reference records the controls and fields declared by `ExpensesHistory`. Use [expenses](../../modules/expenses/expenses.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/Expenses/ExpensesHistory.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Expense Audit History`, `No history entries found`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Expense | `See parent row data and linked procedure.` |
| th | Amount | `See parent row data and linked procedure.` |
| th | Action | `See parent row data and linked procedure.` |
| th | Date & Time | `See parent row data and linked procedure.` |
| th | Changes | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Back to Expenses

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Back to Expenses |
| Location | ExpensesHistory; JSX Link; handler `${dashboardBase}/expenses` |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Back to Expenses.  |
| Handler / destination | `${dashboardBase}/expenses` |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | ExpensesHistory; JSX button; handler () =&gt; setSearchTerm("") |
| Appears when | searchTerm |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | () =&gt; setSearchTerm("") |
| Local UI result | setSearchTerm |

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Reset

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reset |
| Location | ExpensesHistory; JSX button; handler resetFilters |
| Appears when | hasActiveFilters |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reset.  |
| Handler / destination | resetFilters |
| Local UI result | setSearchTerm, setActionFilter, setDateFrom, setDateTo |

Trace symbols: `resetFilters`.

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Try again

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Try again |
| Location | ExpensesHistory; JSX button; handler () =&gt; fetchHistory(1) |
| Appears when | error [true branch] AND loading && history.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Try again.  |
| Handler / destination | () =&gt; fetchHistory(1) |
| Local UI result | setLoading, setError, setHistory, setPagination |

Trace symbols: `fetchHistory`.

Requests made by this handler or local helpers:

- `instance.get("/expenses/expense-history/", { params,`

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Reset Filters

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Reset Filters |
| Location | ExpensesHistory; JSX button; handler resetFilters |
| Appears when | hasActiveFilters AND history.length === 0 [true branch] AND error [false branch] AND loading && history.length === 0 [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, InventoryManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Reset Filters.  |
| Handler / destination | resetFilters |
| Local UI result | setSearchTerm, setActionFilter, setDateFrom, setDateTo |

Trace symbols: `resetFilters`.

Record/status result, downstream effects, failure recovery, and reversal: [expenses](../../modules/expenses/expenses.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Search expense name... | text; searchTerm | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: actionFilter | select; actionFilter | Not declared; see submit validation | "all" | ; choices: All Actions [all], Created [created], Updated [updated], Deleted [deleted] | read-only=false; disabled=false |
| <a id="field-3"></a> F3: dateFrom | date; dateFrom | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: dateTo | date; dateTo | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | Failed to load history |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.back_to_expenses_732b199b` | Back to Expenses | بازگشت به هزینه ها | بېرته لګښتونو ته |
| `legacy.reset_all_filters_2cef9452` | Reset all filters | همه فیلترها را ریست کنید | ټول فلټرونه بیا تنظیم کړئ |
| `inventory_manager.common.reset` | Reset | بازنشانی | بیا تنظیم |
| `landing.marketplace.discovery.retry` | Try again | تلاش دوباره | بیا هڅه وکړئ |
| `legacy.reset_filters_5be69856` | Reset Filters | فیلترهای بازنشانی | ریسیټ فلټرونه |
| `legacy.search_expense_name_685bcc99` | Search expense name... | نام هزینه جستجو... | د لګښت نوم لټون... |
| `legacy.all_actions_902f1999` | All Actions | تمام اقدامات | ټولې کړنې |
| `legacy.created_accf40c8` | Created | ایجاد شده | جوړ شوی |
| `legacy.updated_f2f8570d` | Updated | به روزرسانی شده | تازه شوی |
| `legacy.deleted_441bda6c` | Deleted | حذف شده | حذف شو |
| `legacy.from_date_3b5d11ae` | From date | از تاریخ | له نیټې څخه |
| `legacy.to_date_af244da3` | To date | تا به امروز | تر اوسه |
