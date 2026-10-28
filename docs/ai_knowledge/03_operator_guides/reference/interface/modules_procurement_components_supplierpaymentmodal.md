---
id: "operator_reference_interface_modules_procurement_components_supplierpaymentmodal"
title: "Supplier Payment Modal — controls and fields"
module: "procurement"
description: "Supplier Payment Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["procurement", "supplier", "payment", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager"]
related_docs: ["operator_modules_procurement_purchasing", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/procurement", "/admin/dashboard/procurement/purchase-invoices", "/admin/dashboard/procurement/purchase-invoices/new", "/admin/dashboard/procurement/purchase-invoices/:id", "/admin/dashboard/procurement/suppliers", "/admin/dashboard/procurement/suppliers/:id", "/admin/dashboard/procurement/supplier-payments", "/admin/dashboard/procurement/payables", "/finance-manager/procurement", "/finance-manager/procurement/purchase-invoices", "/finance-manager/procurement/purchase-invoices/new", "/finance-manager/procurement/purchase-invoices/:id", "/finance-manager/procurement/suppliers", "/finance-manager/procurement/suppliers/:id", "/finance-manager/procurement/supplier-payments", "/finance-manager/procurement/payables", "/operations-manager/procurement", "/operations-manager/procurement/purchase-invoices", "/operations-manager/procurement/purchase-invoices/new", "/operations-manager/procurement/purchase-invoices/:id", "/operations-manager/procurement/suppliers", "/operations-manager/procurement/suppliers/:id", "/operations-manager/procurement/supplier-payments", "/operations-manager/procurement/payables"]
source_references: ["frontend/src/modules/procurement/components/SupplierPaymentModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Supplier Payment Modal — controls and fields

This reference records the controls and fields declared by `SupplierPaymentModal`. Use [purchasing](../../modules/procurement/purchasing.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/procurement/components/SupplierPaymentModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: - balance

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | - balance |
| Location | SupplierPaymentModal; JSX form; handler onSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate - balance.  |
| Handler / destination | onSubmit |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [purchasing](../../modules/procurement/purchasing.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | SupplierPaymentModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [purchasing](../../modules/procurement/purchasing.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Record Payment

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Record Payment |
| Location | SupplierPaymentModal; JSX button; handler onSubmit |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | saving |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, FinanceManager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Record Payment.  |
| Handler / destination | onSubmit |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [purchasing](../../modules/procurement/purchasing.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Supplier | Field;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Supplier | Select; supplierOptions.find((option) =&gt; String(option.value) === String(form.supplier)) \|\| null | Not declared; see submit validation | supplierOptions.find((option) =&gt; String(option.value) === String(form.supplier)) \|\| null | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Purchase Invoice | Field;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Purchase Invoice | Select; invoiceOptions.find((option) =&gt; String(option.value) === String(form.purchase_invoice)) \|\| null | Not declared; see submit validation | invoiceOptions.find((option) =&gt; String(option.value) === String(form.purchase_invoice)) \|\| null | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Payment Date | Field;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-6"></a> F6: Payment Date | date; form.date | true | form.date | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-7"></a> F7: Amount | Field;  | true | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-8"></a> F8: Amount | number; form.amount | true | form.amount | step=0.01 | read-only=false; disabled=false |
| <a id="field-9"></a> F9: Payment Method | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-10"></a> F10: Payment Method | select; form.payment_method | Not declared; see submit validation | form.payment_method | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-11"></a> F11: Reference Number | Field;  | Not declared; see submit validation | Parent/state supplied | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-12"></a> F12: Reference Number | input; form.reference_number | Not declared; see submit validation | form.reference_number | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
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
| `legacy.record_payment_6577ced3` | Record Payment | پرداخت رکورد | ریکارډ تادیه |
| `inventory_manager.common.supplier` | Supplier | تامین‌کننده | عرضه کوونکی |
| `legacy.select_supplier_cfce5268` | Select supplier | تأمین کننده را انتخاب کنید | انتخاب عرضه کوونکی |
| `legacy.purchase_invoice_6cc4cd0f` | Purchase Invoice | فاکتور خرید | د پیرود رسید |
| `legacy.select_unpaid_invoice_070a3e32` | Select unpaid invoice | فاکتور پرداخت نشده را انتخاب کنید | غیر تادیه شوی رسید انتخاب کړئ |
| `legacy.payment_date_4b0bd4b9` | Payment Date | تاریخ پرداخت | د پیسو ورکولو نېټه |
| `legacy.amount_43dc8532` | Amount | مقدار | مقدار |
| `legacy.payment_method_f383f6a2` | Payment Method | روش پرداخت | د پیسو ورکولو طریقه |
| `legacy.reference_number_74195db5` | Reference Number | شماره مرجع | د حوالې شمېره |
| `inventory_manager.common.notes` | Notes | یادداشت‌ها | یادښتونه |

## Related interface references

- [modules shared erp components modal](modules_shared_erp_components_modal.md)
