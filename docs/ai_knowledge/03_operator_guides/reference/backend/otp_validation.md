---
id: "operator_reference_backend_otp_validation"
title: "Otp — backend validation reference"
module: "public_ordering"
description: "Static otp implementation evidence for server validation triggers and rejection messages; use linked operating guides for supported UI procedures."
keywords: ["otp", "backend", "validation", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_public_ordering_customer_handoff"]
frontend_routes: []
source_references: ["backend/backend/otp/models.py", "backend/backend/otp/serializers.py", "backend/backend/otp/services.py", "backend/backend/otp/views.py"]
status: "source_verified"
---

# Otp — backend validation reference

Static implementation reference for `otp`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/otp/views.py`

### SendOTPView.post

| Trigger / condition | Server result or message |
|---|---|
| `recent_exists` | `Response( {'error': 'Please wait 60 seconds before requesting another OTP'}, status=status.HTTP_429_TOO_MANY_REQUESTS, )` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response( {'message': 'OTP sent successfully'}, status=status.HTTP_200_OK, )` |

### VerifyOTPView.post

| Trigger / condition | Server result or message |
|---|---|
| `success` | `Response({'message': message}, status=status.HTTP_200_OK)` |
| `Exception handler, delegated validation, or unconditional branch; see symbol.` | `Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)` |

## Related operating procedures

- [Understand public menus and customer order handoff](../../modules/public_ordering/customer_handoff.md)
