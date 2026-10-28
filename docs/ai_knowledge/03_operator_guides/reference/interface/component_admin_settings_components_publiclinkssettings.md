---
id: "operator_reference_interface_component_admin_settings_components_publiclinkssettings"
title: "Public Links Settings — controls and fields"
module: "settings"
description: "Public Links Settings — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["settings", "public", "links", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_settings_restaurant_branch_settings", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/settings", "/admin/dashboard/settings/:sectionId"]
source_references: ["frontend/src/component/Admin/settings/components/PublicLinksSettings.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Public Links Settings — controls and fields

This reference records the controls and fields declared by `PublicLinksSettings`. Use [restaurant branch settings](../../modules/settings/restaurant_branch_settings.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/settings/components/PublicLinksSettings.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Branch Overview`, `{branch.name}`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| SettingsSection | Public Links & QR | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Copy Brand Link

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Copy Brand Link |
| Location | PublicLinksSettings; JSX button; handler () =&gt; settings.copyLink(settings.brandUrl) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Copy Brand Link.  |
| Handler / destination | () =&gt; settings.copyLink(settings.brandUrl) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [restaurant branch settings](../../modules/settings/restaurant_branch_settings.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Open Website

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Open Website |
| Location | PublicLinksSettings; JSX a; handler settings.brandUrl |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Open Website.  |
| Handler / destination | settings.brandUrl |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [restaurant branch settings](../../modules/settings/restaurant_branch_settings.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Download Brand QR

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Download Brand QR |
| Location | PublicLinksSettings; JSX button; handler () =&gt; settings.downloadQR( settings.qrCode, `${settings.restaurant?.slug \|\| "restaurant"}_brand_qr.png`, ) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | !settings.qrCode |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Download Brand QR.  |
| Handler / destination | () =&gt; settings.downloadQR( settings.qrCode, `${settings.restaurant?.slug \|\| "restaurant"}_brand_qr.png`, ) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [restaurant branch settings](../../modules/settings/restaurant_branch_settings.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Copy Link

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Copy Link |
| Location | PublicLinksSettings; JSX button; handler () =&gt; settings.copyLink(branch.public_url) |
| Appears when | settings.branchOverview.length [true branch] AND settings.branchOverviewLoading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Copy Link.  |
| Handler / destination | () =&gt; settings.copyLink(branch.public_url) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [restaurant branch settings](../../modules/settings/restaurant_branch_settings.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Open Menu

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Open Menu |
| Location | PublicLinksSettings; JSX a; handler branch.public_url |
| Appears when | settings.branchOverview.length [true branch] AND settings.branchOverviewLoading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Open Menu.  |
| Handler / destination | branch.public_url |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [restaurant branch settings](../../modules/settings/restaurant_branch_settings.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Download QR

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Download QR |
| Location | PublicLinksSettings; JSX button; handler () =&gt; settings.downloadQR( branchQr, `${branch.slug \|\| branch.code}_menu_qr.png`, ) |
| Appears when | settings.branchOverview.length [true branch] AND settings.branchOverviewLoading [false branch] |
| Disabled when | !branchQr |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Download QR.  |
| Handler / destination | () =&gt; settings.downloadQR( branchQr, `${branch.slug \|\| branch.code}_menu_qr.png`, ) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [restaurant branch settings](../../modules/settings/restaurant_branch_settings.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `settings_center.actions.copy_brand_link` | Copy Brand Link | کپی لینک برند | د برانډ کاپی لینک |
| `settings_center.actions.open_website` | Open Website | وب سایت باز | پرانیستې ویب پاڼه |
| `settings_center.actions.download_brand_qr` | Download Brand QR | دانلود QR برند | د برانډ QR ډاونلوډ کړئ |
| `settings_center.actions.copy_link` | Copy Link | لینک کپی | کاپی لینک |
| `settings_center.actions.open_menu` | Open Menu | منوی باز | خلاصه مینو |
| `settings_center.actions.download_qr` | Download QR | دانلود QR | QR ډاونلوډ کړئ |

## Related interface references

- [component admin settings components settingsprimitives](component_admin_settings_components_settingsprimitives.md)
