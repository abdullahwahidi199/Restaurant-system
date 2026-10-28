---
id: "operator_reference_backend_system_validation"
title: "System — backend validation reference"
module: "settings"
description: "Static system implementation evidence for server validation triggers and rejection messages; use linked operating guides for supported UI procedures."
keywords: ["system", "backend", "validation", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_settings_restaurant_branch_settings"]
frontend_routes: []
source_references: ["backend/backend/system/models.py", "backend/backend/system/serializers.py", "backend/backend/system/views.py"]
status: "source_verified"
---

# System — backend validation reference

Static implementation reference for `system`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/system/views.py`

### RestaurantInfoCreateListView

| Trigger / condition | Server result or message |
|---|---|
| `NOT (request.method == "GET") AND request.method == "POST" AND request.user.staff_profile.is_demo` | `Response({"detail":"Action restricted in demo mode!"},status=403)` |
| `NOT (request.method == "GET") AND request.method == "POST"` | `Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)` |

### ResInfoRetrieveDestroyView.update

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response({'detail': 'Action restricted in demo mode.'}, status=403)` |

### ResInfoRetrieveDestroyView.destroy

| Trigger / condition | Server result or message |
|---|---|
| `request.user.staff_profile.is_demo` | `Response({'detail': 'Action restricted in demo mode.'}, status=403)` |

### RestaurantInfoBySlugView.get

| Trigger / condition | Server result or message |
|---|---|
| `not is_active` | `NotFound("Restaurant not found")` |

## Related operating procedures

- [Restaurant settings, delivery defaults, branding, and branch overrides](../../modules/settings/restaurant_branch_settings.md)

Mounting boundary: this legacy `system` namespace is implementation evidence, not an alternate settings form. Current staff settings use restaurant/active-branch endpoints; do not infer an operator RestaurantInfo editor from these declarations.
