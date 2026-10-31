---
id: admin_administration_settings_social
title: Administration > Settings > Social
module: administration
namespace: admin
status: current_observed_behavior
summary: Restaurant-wide public profile URLs, not usernames for staff access, connected social accounts, follower counts
  or campaign results. Website is configured separately under General; these...
roles:
- Admin
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- administration
- facebook
- instagram
- settings
- social
- website
- x
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_660-663
tool_hints:
- configuration.get
metric_ids: []
---

### Administration > Settings > Social

- **Facebook / Instagram / X:** Restaurant-wide public profile URLs, not usernames for staff access, connected social accounts, follower counts or campaign results. Website is configured separately under General; these fields identify external destinations.
- **Effect / limits:** Saving a URL changes stored public contact information; it does not post content, message customers, import reviews or establish ownership of the linked account. Blank entries currently do not reliably clear previously saved restaurant links, as described under Settings: Scope and Inheritance.
