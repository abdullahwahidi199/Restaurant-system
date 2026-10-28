---
id: "operator_reference_backend_contractors_access"
title: "Contractors — backend access reference"
module: "contractors"
description: "Static contractors implementation evidence for endpoint permissions and read/write role declarations; use linked operating guides for supported UI procedures."
keywords: ["contractors", "backend", "access", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_contractors_services"]
frontend_routes: []
source_references: ["backend/backend/contractors/models.py", "backend/backend/contractors/serializers.py", "backend/backend/contractors/services.py", "backend/backend/contractors/views.py"]
status: "source_verified"
---

# Contractors — backend access reference

Static implementation reference for `contractors`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/contractors/views.py`

Permission set definitions: `CONTRACTOR_PERMISSIONS = [IsRestaurantAdmin \| IsInventoryManager \| IsOperationsManager \| IsFinanceManager, IsSameRestaurant, IsRestaurantActive]`

### ContractorListCreateView

`CONTRACTOR_PERMISSIONS`

### ContractorRetrieveUpdateView

`CONTRACTOR_PERMISSIONS`

### ServiceContractListCreateView

`CONTRACTOR_PERMISSIONS`

### ServiceContractRetrieveUpdateView

`CONTRACTOR_PERMISSIONS`

### contractor_summary

`api_view(["GET"])`; `permission_classes(CONTRACTOR_PERMISSIONS)`

### contractor_invoice_list_create

`api_view(["GET", "POST"])`; `permission_classes(CONTRACTOR_PERMISSIONS)`

### contractor_invoice_detail

`api_view(["GET"])`; `permission_classes(CONTRACTOR_PERMISSIONS)`

### contractor_invoice_approve

`api_view(["POST"])`; `permission_classes(CONTRACTOR_PERMISSIONS)`

### contractor_invoice_attachment_list_create

`api_view(["GET", "POST"])`; `permission_classes(CONTRACTOR_PERMISSIONS)`

### contractor_invoice_attachment_download

`api_view(["GET"])`; `permission_classes(CONTRACTOR_PERMISSIONS)`

### contractor_invoice_attachment_delete

`api_view(["DELETE"])`; `permission_classes(CONTRACTOR_PERMISSIONS)`

### contractor_payment_list_create

`api_view(["GET", "POST"])`; `permission_classes(CONTRACTOR_PERMISSIONS)`

### contractor_payment_detail

`api_view(["GET"])`; `permission_classes(CONTRACTOR_PERMISSIONS)`

### contractor_ledger_view

`api_view(["GET"])`; `permission_classes(CONTRACTOR_PERMISSIONS)`

## Related operating procedures

- [Manage contractors, service contracts, invoices, and payments](../../modules/contractors/services.md)
