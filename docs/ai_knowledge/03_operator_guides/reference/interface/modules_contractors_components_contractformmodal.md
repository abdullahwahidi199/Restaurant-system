---
id: "operator_reference_interface_modules_contractors_components_contractformmodal"
title: "Contract Form Modal — controls and fields"
module: "contractors"
description: "Contract Form Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["contractors", "contract", "form", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager"]
related_docs: ["operator_modules_contractors_services", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/contractors", "/admin/dashboard/contractors/invoices", "/admin/dashboard/contractors/invoices/new", "/admin/dashboard/contractors/invoices/:id", "/admin/dashboard/contractors/contractors", "/admin/dashboard/contractors/contractors/:id", "/admin/dashboard/contractors/contracts", "/admin/dashboard/contractors/payments", "/admin/dashboard/contractors/payables", "/finance-manager/contractors", "/finance-manager/contractors/invoices", "/finance-manager/contractors/invoices/new", "/finance-manager/contractors/invoices/:id", "/finance-manager/contractors/contractors", "/finance-manager/contractors/contractors/:id", "/finance-manager/contractors/contracts", "/finance-manager/contractors/payments", "/finance-manager/contractors/payables"]
source_references: ["frontend/src/modules/contractors/components/ContractFormModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Contract Form Modal — controls and fields

This reference records the controls and fields declared by `ContractFormModal`. Use [services](../../modules/contractors/services.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/contractors/components/ContractFormModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

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
| Location | ContractFormModal; JSX form; handler onSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | onSubmit |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | ContractFormModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Save Contract

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Save Contract |
| Location | ContractFormModal; JSX button; handler onSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | saving |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Save Contract.  |
| Handler / destination | onSubmit |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [services](../../modules/contractors/services.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Contractor | Field;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Contractor | select; form.contractor | true | form.contractor | ; choices: Select contractor [] | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Title | Field;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Title | input; form.title | true | form.title | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Start Date | Field;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-6"></a> F6: Start Date | date; form.start_date | true | form.start_date | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-7"></a> F7: End Date | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-8"></a> F8: End Date | date; form.end_date | Not declared; see submit validation | form.end_date | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Contract Value | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-10"></a> F10: Contract Value | number; form.contract_value | Not declared; see submit validation | form.contract_value | step=0.01 | read-only=false; disabled=false |
| <a id="field-11"></a> F11: Status | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-12"></a> F12: Status | select; form.status | Not declared; see submit validation | form.status | ; choices: Active [active], Draft [draft], Completed [completed], Cancelled [cancelled], Expired [expired] | read-only=false; disabled=false |
| <a id="field-13"></a> F13: Notes | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-14"></a> F14: Notes | textarea; form.notes | Not declared; see submit validation | form.notes | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `legacy.save_contract_fd3ae03e` | Save Contract | قرارداد ذخیره | سیو کنټراکټ |
| `legacy.contractor_76bb2328` | Contractor | پیمانکار | قراردادی |
| `legacy.select_contractor_12a14b97` | Select contractor | پیمانکار منتخب | ټاکل شوی قراردادی |
| `legacy.title_768e0c1c` | Title | عنوان | سرلیک |
| `inventory_manager.reports.start_date` | Start Date | تاریخ شروع | د پیل نېټه |
| `inventory_manager.reports.end_date` | End Date | تاریخ ختم | د پای نېټه |
| `legacy.contract_value_48834ab5` | Contract Value | ارزش قرارداد | د قرارداد ارزښت |
| `table.status` | Status | وضعیت | حالت |
| `staff.status.active` | Active | فعال | فعال |
| `landing.mockups.inventory.values.purchase` | Draft | مسوده | مسوده |
| `stats.completed` | Completed | تکمیل شده | بشپړ شوي |
| `status.cancelled` | Cancelled | لغو شده | لغوه شوی |
| `legacy.expired_a689a999` | Expired | منقضی شده | ختم شوی |
| `inventory_manager.common.notes` | Notes | یادداشت‌ها | یادښتونه |

## Related interface references

- [modules shared erp components modal](modules_shared_erp_components_modal.md)
