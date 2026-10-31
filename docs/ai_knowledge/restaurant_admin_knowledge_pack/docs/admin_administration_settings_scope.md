---
id: admin_administration_settings_scope
title: 'Administration > Settings: Scope and Inheritance'
module: administration
namespace: admin
status: current_observed_behavior
summary: Current configuration, not a financial dashboard or historical-period report. Admin sees General, Branding,
  Location, Delivery, Discounts, Branch, Public Links and Social. Branch Admin se...
roles: []
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- administration
- and
- branch
- defaults
- inheritance
- override
- restaurant
- scope
- settings
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_608-615
tool_hints:
- configuration.get
metric_ids: []
---

### Administration > Settings: Scope and Inheritance

- **Purpose / sections:** Current configuration, not a financial dashboard or historical-period report. Admin sees General, Branding, Location, Delivery, Discounts, Branch, Public Links and Social. Branch Admin sees only Branch settings for the assigned branch; restaurant-wide defaults remain outside that role's Settings scope.
- **Restaurant versus branch:** General/Branding/Location/Delivery/Discounts/Social are restaurant-wide; switching the working branch does not turn them into branch-specific values. Branch settings instead follow the current working branch. A restaurant default affects branches that inherit it, not branches with their own overrides.
- **Inheritance:** For branch coordinates and delivery settings, blank means use the restaurant default; an explicit zero or Disabled is a real override, not missing data. Fallback is per field: a branch can inherit its base fee but override its per-kilometre rate, or combine one branch coordinate with the other restaurant coordinate. Raw blank branch inputs need not show the effective value used for quotes.
- **Saved versus displayed:** Unsaved field/image previews are not effective business configuration. Each section concerns its own settings, not a whole-page financial transaction. Blank restaurant fields currently preserve existing saved values rather than reliably clearing them; blank nullable branch overrides restore inheritance. There is no effective-from date, scheduled change or historical-settings selector.
- **Unavailable controls:** No Receipt tab is registered. Receipt templates, tax/service-charge rates, printer and cash-drawer settings are not mounted controls in the current Settings sections. Stored configuration elsewhere does not establish hardware integration or automatic charges; ordinary order/revenue totals do not add branch tax/service-charge rates, as defined under Dashboard > Shared Sales Meaning.
