---
id: "operator_reference_backend_system_effects"
title: "System — backend effects reference"
module: "settings"
description: "Static system implementation evidence for record mutations, named effect helpers and transaction boundaries; use linked operating guides for supported UI procedures."
keywords: ["system", "backend", "effects", "reference"]
roles: []
related_docs: ["operator_reference_backend_index", "operator_troubleshooting_errors_and_recovery", "operator_modules_settings_restaurant_branch_settings"]
frontend_routes: []
source_references: ["backend/backend/system/models.py", "backend/backend/system/serializers.py", "backend/backend/system/views.py"]
status: "source_verified"
---

# System — backend effects reference

Static implementation reference for `system`. Read the linked operator procedures before acting. These are server contracts and evidence, not additional screens or an invitation to use APIs directly.

## `backend/backend/system/views.py`

### RestaurantInfoCreateListView

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `serializer.save()`

### ResInfoRetrieveDestroyView.update

Transaction evidence: no explicit atomic decorator/block in this symbol; callers/services/model hooks can differ.

The following are implementation write expressions, not a separate operator input procedure. Model save/signal hooks may add further effects; consult the linked operating guide before interpreting a mutation.

- `super().update(request, *args, **kwargs)`

## Related operating procedures

- [Restaurant settings, delivery defaults, branding, and branch overrides](../../modules/settings/restaurant_branch_settings.md)

Mounting boundary: this legacy `system` namespace is implementation evidence, not an alternate settings form. Current staff settings use restaurant/active-branch endpoints; do not infer an operator RestaurantInfo editor from these declarations.
