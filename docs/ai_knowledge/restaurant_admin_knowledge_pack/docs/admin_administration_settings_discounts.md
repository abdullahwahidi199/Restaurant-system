---
id: admin_administration_settings_discounts
title: Administration > Settings > Discounts
module: administration
namespace: admin
status: current_observed_behavior
summary: Restaurant-wide percentage thresholds for manual discount-request decision authority, not AFN amounts, automatic
  customer discounts or branch-specific limits. New restaurant defaults are...
roles:
- Admin
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- admin
- administration
- approval
- discount
- discounts
- limit
- manager
- percentage
- settings
related_docs:
- admin_operations_discount_requests
routes: []
source_refs:
- uploaded_admin_reference:lines_641-646
tool_hints:
- configuration.get
metric_ids: []
---

### Administration > Settings > Discounts

- **Manager / Admin Discount Limits:** Restaurant-wide percentage thresholds for manual discount-request decision authority, not AFN amounts, automatic customer discounts or branch-specific limits. New restaurant defaults are 10% and 100% respectively; existing restaurants use their saved values. Authority bands, request limits and charge replacement are defined under Operations > Discount Requests.
- **Current versus historical effect:** Decision checks use current limits, including for requests already waiting. Changing a limit does not itself apply a discount, remove an already approved order percentage or reprice historical sales. Discount-card percentages follow their separate entitlement/application rules rather than these manual-request bands.
- **Ordering / range limitation:** Settings do not enforce 0–100% values or Manager limit ≤ Admin limit. The Manager check is evaluated first, so a higher Manager limit can permit a request above the lower Admin limit; Admin is not an unconditional ceiling in that configuration. A request above both limits currently cannot even be rejected through the normal decision rule. Intended configuration constraints are unverified.
