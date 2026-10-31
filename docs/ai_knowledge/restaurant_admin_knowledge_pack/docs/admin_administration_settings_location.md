---
id: admin_administration_settings_location
title: Administration > Settings > Location
module: administration
namespace: admin
status: current_observed_behavior
summary: Restaurant's geographic delivery-origin defaults, not its written address or a customer's destination. Customer
  delivery distance uses branch coordinates where supplied, with restaurant f...
roles:
- Admin
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- administration
- delivery
- distance
- geographic
- latitude
- location
- longitude
- origin
- settings
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_626-631
tool_hints:
- configuration.get
metric_ids: []
---

### Administration > Settings > Location

- **Latitude / Longitude:** Restaurant's geographic delivery-origin defaults, not its written address or a customer's destination. Customer delivery distance uses branch coordinates where supplied, with restaurant fallback for each missing coordinate. Both effective coordinates are needed for location-based customer delivery; changing address text does not geocode them.
- **Distance meaning:** Customer distance is a straight-line geographic estimate between the effective origin and delivery address, not a mapped road route, travel time or actual rider mileage. Staff-entered delivery orders use their entered distance instead, so the same destination need not produce identical charges across those entry methods.
- **Validation limitation:** Restaurant and branch configuration currently do not enforce geographic coordinate bounds or require a complete coordinate pair. Numeric values alone do not establish a correct location; intended location safeguards are unverified.
