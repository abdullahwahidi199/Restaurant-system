---
id: admin_operations_shared_interpretation
title: Operations > Shared Interpretation
module: operations
namespace: admin
status: current_observed_behavior
summary: Operations pages normally show the selected branch. Counts, charges and statuses reflect current records; a
  historical date filter does not reconstruct their values as they stood then. Sc...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- interpretation
- operations
- shared
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_63-67
tool_hints:
- records.list
- records.get
- analytics.aggregate
metric_ids: []
---

### Operations > Shared Interpretation

- **Scope:** Operations pages normally show the selected branch. Counts, charges and statuses reflect current records; a historical date filter does not reconstruct their values as they stood then. Screen timestamps follow the device's timezone; timestamp-based date filters use Asia/Kabul.
- **Money:** Amounts are AFN. The shared order-value and reservation-charge calculations are defined under Dashboard > Shared Sales Meaning; page-specific differences below take precedence.
