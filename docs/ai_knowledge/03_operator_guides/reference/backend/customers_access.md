---
id: "operator_reference_backend_customers_access"
title: "Customers — backend access reference"
module: "customers"
description: "Static customers implementation evidence for endpoint permissions and read/write role declarations; use linked operating guides for supported UI procedures."
keywords: ["customers", "backend", "access", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_public_ordering_customer_handoff"]
frontend_routes: []
source_references: ["backend/backend/customers/models.py", "backend/backend/customers/serializers.py", "backend/backend/customers/views.py"]
status: "source_verified"
---

# Customers — backend access reference

Static implementation reference for `customers`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/customers/views.py`

### CustomerProfileView

`[IsAuthenticated]`

### CustomerOrdersView

`[IsAuthenticated]`

### MarketplaceCheckoutValidationView

`[IsAuthenticated]`

### CustomerOrderDetailView

`[IsAuthenticated]`

### CustomerAddressListCreateView

`[IsAuthenticated]`

### CustomerAddressDetailView

`[IsAuthenticated]`

### CustomerReviewsView

`[IsAuthenticated]`

### SignupView

`[AllowAny]`

### LoginView

`[AllowAny]`

### CustomerReviewsView

`[IsAuthenticated]`

## Related operating procedures

- [Understand public menus and customer order handoff](../../modules/public_ordering/customer_handoff.md)
