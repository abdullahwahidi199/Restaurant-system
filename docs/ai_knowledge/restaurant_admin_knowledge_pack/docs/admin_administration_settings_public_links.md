---
id: admin_administration_settings_public_links
title: Administration > Settings > Public Links
module: administration
namespace: admin
status: current_observed_behavior
summary: Generated customer menu-entry address and its QR image, not the external Website field, a unique visitor count
  or ordering-performance metric. Open Website here opens that generated menu...
roles:
- Admin
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- QR
- URL
- administration
- branch
- customer
- links
- menu
- public
- settings
related_docs:
- admin_administration_branches
routes: []
source_refs:
- uploaded_admin_reference:lines_654-659
tool_hints:
- configuration.get
metric_ids: []
---

### Administration > Settings > Public Links

- **Brand URL / QR:** Generated customer menu-entry address and its QR image, not the external Website field, a unique visitor count or ordering-performance metric. Open Website here opens that generated menu address. Copying/opening/downloading a reference does not publish a new site or create a transaction.
- **Branch Overview / count:** Full current restaurant branch list, including inactive branches; the badge counts loaded branches, not active locations, remaining subscription slots or scans. Active/Inactive is the stored branch configuration status. The list has no date filter or 100-record cap, but a loading failure can leave an empty count; it is not proof the restaurant has no branches.
- **Branch references:** Individual rows show links and available QR files even for inactive records. The common restaurant-level destination and branch-QR limitation are defined under Administration > Branches; a branch-labelled image/link does not guarantee direct selection of that branch or customer-order eligibility. No scan analytics or QR-attributed sales are calculated here.
