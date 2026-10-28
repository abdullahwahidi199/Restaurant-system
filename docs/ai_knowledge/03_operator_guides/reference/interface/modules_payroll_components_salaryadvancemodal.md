---
id: "operator_reference_interface_modules_payroll_components_salaryadvancemodal"
title: "Salary Advance Modal — controls and fields"
module: "payroll"
description: "Salary Advance Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["payroll", "salary", "advance", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager"]
related_docs: ["operator_modules_payroll_payroll", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/payroll", "/admin/dashboard/payroll/run", "/admin/dashboard/payroll/records", "/admin/dashboard/payroll/records/:id", "/admin/dashboard/payroll/advances", "/admin/dashboard/payroll/payments", "/admin/dashboard/payroll/employees/:id", "/finance-manager/payroll", "/finance-manager/payroll/run", "/finance-manager/payroll/records", "/finance-manager/payroll/records/:id", "/finance-manager/payroll/advances", "/finance-manager/payroll/payments", "/finance-manager/payroll/employees/:id"]
source_references: ["frontend/src/modules/payroll/components/SalaryAdvanceModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Salary Advance Modal — controls and fields

This reference records the controls and fields declared by `SalaryAdvanceModal`. Use [payroll](../../modules/payroll/payroll.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/payroll/components/SalaryAdvanceModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

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
| Location | SalaryAdvanceModal; JSX form; handler onSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | onSubmit |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | SalaryAdvanceModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Save Advance

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Save Advance |
| Location | SalaryAdvanceModal; JSX button; handler onSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | saving |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Save Advance.  |
| Handler / destination | onSubmit |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [payroll](../../modules/payroll/payroll.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Employee | Field;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Employee | select; form.staff_id | true | form.staff_id | ; choices: Select employee [] | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Date | Field;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Date | date; form.date | true | form.date | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Amount | Field;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-6"></a> F6: Amount | number; form.amount | true | form.amount | min=0; step=0.01 | read-only=false; disabled=false |
| <a id="field-7"></a> F7: Reason | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-8"></a> F8: Reason | input; form.reason | Not declared; see submit validation | form.reason | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Notes | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-10"></a> F10: Notes | textarea; form.notes | Not declared; see submit validation | form.notes | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `legacy.save_advance_c7e0e386` | Save Advance | ذخیره پیش پرداخت | Save Advance |
| `legacy.employee_079711ea` | Employee | کارمند | کارکوونکی |
| `legacy.select_employee_c70121d9` | Select employee | کارمند منتخب | ټاکل شوی کارکوونکی |
| `table.date` | Date | تاریخ | نېټه |
| `legacy.amount_43dc8532` | Amount | مقدار | مقدار |
| `legacy.reason_f219cc06` | Reason | دلیل | دلیل |
| `inventory_manager.common.notes` | Notes | یادداشت‌ها | یادښتونه |

## Related interface references

- [modules shared erp components modal](modules_shared_erp_components_modal.md)
