---
id: "operator_reference_interface_modules_shared_erp_components_fileuploader"
title: "File Uploader — controls and fields"
module: "interface_reference"
description: "File Uploader — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["interface_reference", "file", "uploader", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "FinanceManager", "OperationsManager"]
related_docs: ["operator_navigation_common_interface_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/contractors", "/admin/dashboard/contractors/invoices", "/admin/dashboard/contractors/invoices/new", "/admin/dashboard/contractors/invoices/:id", "/admin/dashboard/contractors/contractors", "/admin/dashboard/contractors/contractors/:id", "/admin/dashboard/contractors/contracts", "/admin/dashboard/contractors/payments", "/admin/dashboard/contractors/payables", "/admin/dashboard/procurement", "/admin/dashboard/procurement/purchase-invoices", "/admin/dashboard/procurement/purchase-invoices/new", "/admin/dashboard/procurement/purchase-invoices/:id", "/admin/dashboard/procurement/suppliers", "/admin/dashboard/procurement/suppliers/:id", "/admin/dashboard/procurement/supplier-payments", "/admin/dashboard/procurement/payables", "/finance-manager/contractors", "/finance-manager/contractors/invoices", "/finance-manager/contractors/invoices/new", "/finance-manager/contractors/invoices/:id", "/finance-manager/contractors/contractors", "/finance-manager/contractors/contractors/:id", "/finance-manager/contractors/contracts", "/finance-manager/contractors/payments", "/finance-manager/contractors/payables", "/finance-manager/procurement", "/finance-manager/procurement/purchase-invoices", "/finance-manager/procurement/purchase-invoices/new", "/finance-manager/procurement/purchase-invoices/:id", "/finance-manager/procurement/suppliers", "/finance-manager/procurement/suppliers/:id", "/finance-manager/procurement/supplier-payments", "/finance-manager/procurement/payables", "/operations-manager/procurement", "/operations-manager/procurement/purchase-invoices", "/operations-manager/procurement/purchase-invoices/new", "/operations-manager/procurement/purchase-invoices/:id", "/operations-manager/procurement/suppliers", "/operations-manager/procurement/suppliers/:id", "/operations-manager/procurement/supplier-payments", "/operations-manager/procurement/payables"]
source_references: ["frontend/src/modules/shared/erp/components/FileUploader.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# File Uploader — controls and fields

This reference records the controls and fields declared by `FileUploader`. Use [common interface controls](../../navigation/common_interface_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/modules/shared/erp/components/FileUploader.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Drop files here or choose attachments PDF, JPG, and PNG supported | file; (event) =&gt; { onFiles?.(event.target.files); event.target.value = ""; } | Not declared; see submit validation | Parent/state supplied | multiple=true | read-only=false; disabled=disabled |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.
