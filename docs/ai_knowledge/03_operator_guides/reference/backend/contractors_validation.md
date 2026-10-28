---
id: "operator_reference_backend_contractors_validation"
title: "Contractors — backend validation reference"
module: "contractors"
description: "Static contractors implementation evidence for server validation triggers and rejection messages; use linked operating guides for supported UI procedures."
keywords: ["contractors", "backend", "validation", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_contractors_services"]
frontend_routes: []
source_references: ["backend/backend/contractors/models.py", "backend/backend/contractors/serializers.py", "backend/backend/contractors/services.py", "backend/backend/contractors/views.py"]
status: "source_verified"
---

# Contractors — backend validation reference

Static implementation reference for `contractors`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/contractors/serializers.py`

### ServiceContractSerializer.validate

| Trigger / condition | Server result or message |
|---|---|
| `contractor and branch and contractor.branch_id != branch.id` | `serializers.ValidationError( {"contractor": "This contractor belongs to another branch."} )` |

## `backend/backend/contractors/services.py`

### _contractor_for_invoice

| Trigger / condition | Server result or message |
|---|---|
| `not contractor_id` | `ValueError("Contractor is required.")` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `ValueError("Contractor not found for this branch.")` |

### _contract_for_invoice

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `ValueError("Service contract not found for this contractor.")` |

### _invoice_lines_from_payload

| Trigger / condition | Server result or message |
|---|---|
| `not service_type` | `ValueError(f"Line {index}: service type is required.")` |
| `not description` | `ValueError(f"Line {index}: description is required.")` |
| `quantity &lt;= 0` | `ValueError(f"Line {index}: quantity must be greater than zero.")` |
| `unit_price &lt; 0` | `ValueError(f"Line {index}: unit price cannot be negative.")` |
| `not lines` | `ValueError("At least one invoice line is required.")` |

### create_contractor_invoice

| Trigger / condition | Server result or message |
|---|---|
| `not branch` | `ValueError("An active branch is required to create a contractor invoice.")` |
| `initial_paid &gt; invoice.total_amount` | `ValueError("Initial payment cannot exceed invoice total.")` |
| `is_draft and initial_paid &gt; 0` | `ValueError("Draft invoices cannot receive payments.")` |

### create_contractor_payment

| Trigger / condition | Server result or message |
|---|---|
| `not contractor_id or not invoice_id` | `ValueError("Contractor and invoice are required.")` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `ValueError("Contractor not found.")` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `ValueError("Contractor invoice not found for this contractor.")` |
| `branch and invoice.branch_id != branch.id` | `ValueError("Contractor invoice belongs to another branch.")` |
| `invoice.status == ContractorInvoice.STATUS_DRAFT` | `ValueError("Draft invoices cannot receive payments.")` |
| `amount &lt;= 0` | `ValueError("Payment amount must be greater than zero.")` |
| `amount &gt; invoice.remaining_balance` | `ValueError("Payment amount cannot exceed the remaining balance.")` |

## `backend/backend/contractors/views.py`

### contractor_invoice_list_create

| Trigger / condition | Server result or message |
|---|---|
| `request.method == "POST"` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |

### contractor_invoice_detail

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Contractor invoice not found."}, status=404)` |

### contractor_invoice_approve

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Contractor invoice not found."}, status=404)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |

### _validate_attachment_file

| Trigger / condition | Server result or message |
|---|---|
| `extension not in ALLOWED_ATTACHMENT_EXTENSIONS` | `ValueError("Only JPG, JPEG, PNG, and PDF files are supported.")` |

### contractor_invoice_attachment_list_create

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Contractor invoice not found."}, status=404)` |
| `not files` | `Response( {"detail": "Select at least one attachment."}, status=status.HTTP_400_BAD_REQUEST, )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |

### contractor_invoice_attachment_download

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Attachment not found."}, status=404)` |

### contractor_invoice_attachment_delete

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Attachment not found."}, status=404)` |

### contractor_payment_list_create

| Trigger / condition | Server result or message |
|---|---|
| `request.method == "POST"` | `Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)` |

### contractor_payment_detail

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Contractor payment not found."}, status=404)` |

### contractor_ledger_view

| Trigger / condition | Server result or message |
|---|---|
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({"detail": "Contractor not found."}, status=404)` |

## Related operating procedures

- [Manage contractors, service contracts, invoices, and payments](../../modules/contractors/services.md)
