---
id: "operator_reference_backend_otp_fields"
title: "Otp — backend fields reference"
module: "public_ordering"
description: "Static otp implementation evidence for model and serializer field types, defaults, choices and read-only constraints; use linked operating guides for supported UI procedures."
keywords: ["otp", "backend", "fields", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_public_ordering_customer_handoff"]
frontend_routes: []
source_references: ["backend/backend/otp/models.py", "backend/backend/otp/serializers.py", "backend/backend/otp/services.py", "backend/backend/otp/views.py"]
status: "source_verified"
---

# Otp — backend fields reference

Static implementation reference for `otp`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/otp/models.py`

### OTPVerification

Accepted choice values: `PURPOSE_CHOICES = [ ('signup', 'Signup'), ('checkout', 'Checkout'), ]`.

Serializer/model rules: `ordering = ['-created_at']`; `indexes = [ models.Index(fields=['phone', 'purpose', 'is_verified']), models.Index(fields=['created_at']), ]`.

| Field | Actual type, defaults and constraints |
|---|---|
| `phone` | `models.CharField(max_length=15)` |
| `otp` | `models.CharField(max_length=6)` |
| `purpose` | `models.CharField(max_length=20, choices=PURPOSE_CHOICES)` |
| `is_verified` | `models.BooleanField(default=False)` |
| `attempts` | `models.IntegerField(default=0)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |

## `backend/backend/otp/serializers.py`

### SendOTPSerializer

| Field | Actual type, defaults and constraints |
|---|---|
| `phone` | `serializers.CharField(max_length=15)` |
| `purpose` | `serializers.ChoiceField(choices=['signup', 'checkout'])` |

### VerifyOTPSerializer

| Field | Actual type, defaults and constraints |
|---|---|
| `phone` | `serializers.CharField(max_length=15)` |
| `otp` | `serializers.CharField(max_length=6, min_length=4)` |
| `purpose` | `serializers.ChoiceField(choices=['signup', 'checkout'])` |


A model default does not necessarily make a UI field optional. `blank=True` permits an empty model-form/serializer value; `null=True` permits database null; explicit serializer `required`, `read_only_fields`, validators, and create services can change the API requirement. Model fields without blank/null/default are ordinarily required by an automatic ModelSerializer field unless overridden. `SerializerMethodField`, `ReadOnlyField`, auto timestamps and explicitly read-only fields are calculated/server-owned. Dynamic querysets restrict choices to the current restaurant/branch. A model `clean()` method is not automatically a DRF validator.

## Related operating procedures

- [Understand public menus and customer order handoff](../../modules/public_ordering/customer_handoff.md)
