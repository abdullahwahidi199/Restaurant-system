---
id: admin_administration_settings_branch
title: Administration > Settings > Branch
module: administration
namespace: admin
status: current_observed_behavior
summary: Current working branch's latitude/longitude, delivery availability, radius, base fee, price per km and minimum
  order. The same financial/distance definitions above apply; blank numeric ov...
roles:
- Admin
- BranchAdmin
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- administration
- branch
- closed
- delivery
- hours
- open
- opening
- overrides
- settings
- status
related_docs:
- admin_administration_settings_scope
- admin_administration_settings_delivery
routes: []
source_refs:
- uploaded_admin_reference:lines_647-653
tool_hints:
- configuration.get
metric_ids: []
---

### Administration > Settings > Branch

- **Override fields:** Current working branch's latitude/longitude, delivery availability, radius, base fee, price per km and minimum order. The same financial/distance definitions above apply; blank numeric overrides and Use Restaurant Default inherit, while zero and Disabled override. No branch-specific discount-limit, branding or social fields are mounted here; this section does not change branch name, quota or employment assignments.
- **Opening Hours:** Free-text public information, not a parsed weekly schedule, employee shift plan or automatic time-of-day cutoff. Blank branch text falls back to restaurant opening-hours text for the public open-status check; the current General section does not expose a restaurant opening-hours input.
- **Open / Closed interpretation:** After ignoring case and repeated spaces, explicit English values Open, Open Now, Always Open, 24/7 or 24 Hours mean open; Closed or Closed Today mean closed. An inactive branch is closed. Other text, including ordinary time ranges such as 09:00–21:00, means unknown rather than automatically open/closed according to the clock. It is not a measured service-status KPI.
- **Ordering implication:** Explicitly closed branches are rejected by customer marketplace checkout. Ordinary time-range text does not enforce that schedule, and this flag is not a universal lock on staff order entry. An enabled delivery setting alone does not override customer checks for an inactive/closed branch, valid subscription, product availability, location, radius or minimum order.
