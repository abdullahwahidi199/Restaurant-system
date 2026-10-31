---
id: admin_administration_settings_general
title: Administration > Settings > General
module: administration
namespace: admin
status: current_observed_behavior
summary: Restaurant-wide brand identity, not branch names, menu categories or a performance measure. Name changes can
  change the public menu address and regenerate restaurant/branch QR files; prev...
roles:
- Admin
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- administration
- email
- general
- name
- phone
- restaurant
- settings
- website
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_616-620
tool_hints:
- configuration.get
metric_ids: []
---

### Administration > Settings > General

- **Name / Slogan:** Restaurant-wide brand identity, not branch names, menu categories or a performance measure. Name changes can change the public menu address and regenerate restaurant/branch QR files; previously distributed links or printed QR codes do not update themselves. Existing business record IDs are not new transactions because the brand was renamed.
- **Phone / Email / Address / Website:** Restaurant contact and public-information defaults, not employee login details, branch-specific contacts, delivery eligibility or revenue. Website is a supplied external address, distinct from the generated restaurant menu link in Public Links. Changing textual Address does not automatically update geographic coordinates.
