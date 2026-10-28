---
id: "operator_reference_backend_otp_access"
title: "Otp — backend access reference"
module: "public_ordering"
description: "Static otp implementation evidence for endpoint permissions and read/write role declarations; use linked operating guides for supported UI procedures."
keywords: ["otp", "backend", "access", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_public_ordering_customer_handoff"]
frontend_routes: []
source_references: ["backend/backend/otp/models.py", "backend/backend/otp/serializers.py", "backend/backend/otp/services.py", "backend/backend/otp/views.py"]
status: "source_verified"
---

# Otp — backend access reference

Static implementation reference for `otp`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/otp/views.py`

### SendOTPView

`[AllowAny]`

### VerifyOTPView

`[AllowAny]`

## Related operating procedures

- [Understand public menus and customer order handoff](../../modules/public_ordering/customer_handoff.md)
