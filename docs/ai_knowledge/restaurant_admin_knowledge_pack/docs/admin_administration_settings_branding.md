---
id: admin_administration_settings_branding
title: Administration > Settings > Branding
module: administration
namespace: admin
status: current_observed_behavior
summary: Restaurant-wide brand images used by public/customer displays; not separate branch logos, menu-product images
  or QR codes. The logo identifies the restaurant and the cover provides its la...
roles:
- Admin
access_note: Real access must be checked against Django permissions and the selected branch; empty roles means no inferred
  allowlist.
keywords:
- administration
- branding
- cover
- image
- logo
- restaurant
- settings
related_docs: []
routes: []
source_refs:
- uploaded_admin_reference:lines_621-625
tool_hints:
- configuration.get
metric_ids: []
---

### Administration > Settings > Branding

- **Logo / Cover Image:** Restaurant-wide brand images used by public/customer displays; not separate branch logos, menu-product images or QR codes. The logo identifies the restaurant and the cover provides its larger promotional image; neither measures reach, ratings or sales.
- **Preview / limits:** A selected preview is not proof that the stored public image changed. Existing saved images remain until replaced; this section has no explicit stored-image removal control. Branding changes do not publish a new application build or alter order charges.
