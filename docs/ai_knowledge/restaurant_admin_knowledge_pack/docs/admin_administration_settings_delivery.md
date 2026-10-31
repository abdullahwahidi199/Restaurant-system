---
id: admin_administration_settings_delivery
title: Administration > Settings > Delivery
module: administration
namespace: admin
status: current_observed_behavior
summary: Restaurant default for whether delivery orders may be accepted, unless explicitly overridden by the branch.
  A branch Enabled/Disabled value takes precedence, including Disabled when the r...
roles:
- Admin
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- administration
- availability
- base
- delivery
- fee
- km
- minimum
- order
- per
- radius
- settings
related_docs:
- admin_administration_settings_scope
- admin_administration_settings_location
- admin_operations_orders
routes: []
source_refs:
- uploaded_admin_reference:lines_632-640
tool_hints:
- configuration.get
metric_ids: []
---

### Administration > Settings > Delivery

- **Delivery Available:** Restaurant default for whether delivery orders may be accepted, unless explicitly overridden by the branch. A branch Enabled/Disabled value takes precedence, including Disabled when the restaurant default is enabled. This does not deactivate the branch or disable takeaway/dine-in, assign a driver or promise driver capacity.
- **Delivery Radius:** Maximum permitted distance in kilometres for delivery validation. Distance equal to the radius is allowed; greater distance is rejected. Customer ordering uses the geographic estimate above, while staff delivery validation uses the entered distance. Not a delivery-time promise or automatically drawn road-service area.
- **Base Delivery Fee / Price per km:** Estimated delivery charge = effective base fee in AFN + distance in km × effective AFN rate per km. Fractional distance is used, not rounded-up whole kilometres; saved/quoted money is rounded to cents. Base fee applies once per delivery order, not per product or kilometre. Zero base fee removes only the fixed part; delivery is free only when the resulting whole formula is zero.
- **Minimum Order:** Required dish/platter subtotal in AFN for a delivery order, before order discounts and excluding delivery/reservation charges. Equality qualifies. It is an eligibility threshold, not an extra charge; delivery fees cannot bring an otherwise insufficient item subtotal up to the minimum. It is not applied as a general takeaway/dine-in minimum.
- **Effect on charges:** Defaults/overrides affect new validations and quotes; they do not automatically reprice saved delivery fees on existing orders. The fee is an order charge, not a recorded rider payment or ordinary expense. Subsequent order discount/revenue treatment follows Dashboard > Shared Sales Meaning; a configured rate alone creates no revenue or cash collection.
- **Validation limitation:** Settings currently permit negative fees/rates, radius and minimum amounts; there is no enforced nonnegative business bound. These values should not be interpreted as approved refunds, credits or special delivery policies. Intended safeguards are unverified; the formulas above describe the actual calculation rather than validating the configuration's business suitability.
