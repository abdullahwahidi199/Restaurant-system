---
id: "operator_reference_backend_system_fields"
title: "System — backend fields reference"
module: "settings"
description: "Static system implementation evidence for model and serializer field types, defaults, choices and read-only constraints; use linked operating guides for supported UI procedures."
keywords: ["system", "backend", "fields", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_settings_restaurant_branch_settings"]
frontend_routes: []
source_references: ["backend/backend/system/models.py", "backend/backend/system/serializers.py", "backend/backend/system/views.py"]
status: "source_verified"
---

# System — backend fields reference

Static implementation reference for `system`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/system/models.py`

### RestaurantInfo

| Field | Actual type, defaults and constraints |
|---|---|
| `logo` | `models.ImageField(upload_to='logo/',blank=True,null=True)` |
| `name` | `models.CharField(max_length=30)` |
| `address` | `models.CharField(max_length=255)` |
| `phone` | `models.CharField(max_length=10,blank=True,null=True)` |
| `email` | `models.EmailField(blank=True, null=True)` |
| `website` | `models.URLField(blank=True, null=True)` |
| `opening_hours` | `models.CharField(max_length=100, blank=True, null=True)` |
| `opening_hours` | `models.CharField(max_length=100, blank=True, null=True)` |
| `restaurant` | `models.OneToOneField(Restaurant, on_delete=models.CASCADE,null=True,blank=True)` |
| `facebook` | `models.URLField(blank=True, null=True)` |
| `instagram` | `models.URLField(blank=True, null=True)` |
| `x` | `models.URLField(blank=True, null=True)` |
| `delivery_available` | `models.BooleanField(default=True)` |
| `created_at` | `models.DateTimeField(auto_now_add=True)` |
| `updated_at` | `models.DateTimeField(auto_now=True)` |

## `backend/backend/system/serializers.py`

### ResInfoSerializer

Serializer/model rules: `model=RestaurantInfo`; `fields="__all__"`.



A model default does not necessarily make a UI field optional. `blank=True` permits an empty model-form/serializer value; `null=True` permits database null; explicit serializer `required`, `read_only_fields`, validators, and create services can change the API requirement. Model fields without blank/null/default are ordinarily required by an automatic ModelSerializer field unless overridden. `SerializerMethodField`, `ReadOnlyField`, auto timestamps and explicitly read-only fields are calculated/server-owned. Dynamic querysets restrict choices to the current restaurant/branch. A model `clean()` method is not automatically a DRF validator.

## Related operating procedures

- [Restaurant settings, delivery defaults, branding, and branch overrides](../../modules/settings/restaurant_branch_settings.md)

Mounting boundary: this legacy `system` namespace is implementation evidence, not an alternate settings form. Current staff settings use restaurant/active-branch endpoints; do not infer an operator RestaurantInfo editor from these declarations.
