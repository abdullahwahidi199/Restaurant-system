---
id: "operator_reference_interface_component_admin_branches_branchmanagement"
title: "Branch Management — controls and fields"
module: "branches"
description: "Branch Management — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["branches", "branch", "management", "controls", "fields"]
roles: ["Admin"]
related_docs: ["operator_modules_branches_branches", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/branches"]
source_references: ["frontend/src/component/Admin/branches/BranchManagement.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Branch Management — controls and fields

This reference records the controls and fields declared by `BranchManagement`. Use [branches](../../modules/branches/branches.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/branches/BranchManagement.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Branch management`, `Data Migration`, `{title}`, `Edit branch Add branch`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Branch | `See parent row data and linked procedure.` |
| th | Contact | `See parent row data and linked procedure.` |
| th | Public Menu | `See parent row data and linked procedure.` |
| th | Staff | `See parent row data and linked procedure.` |
| th | Status | `See parent row data and linked procedure.` |
| th | Actions | `See parent row data and linked procedure.` |
| th | Type | `See parent row data and linked procedure.` |
| th | Source | `See parent row data and linked procedure.` |
| th | Destination | `See parent row data and linked procedure.` |
| th | Imported | `See parent row data and linked procedure.` |
| th | Skipped | `See parent row data and linked procedure.` |
| th | Status | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Add branch

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add branch |
| Location | BranchManagement; JSX button; handler openCreate |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | branchLimit.branches_remaining &lt;= 0 |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add branch.  |
| Handler / destination | openCreate |
| Local UI result | setError, setEditingBranch, setFormData, setFormOpen |

Trace symbols: `createEmptyForm`, `openCreate`.

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Copy

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Copy |
| Location | BranchManagement; JSX button; handler () =&gt; copyBranchLink(branch) |
| Appears when | branches.length [true branch] AND loading [false branch] |
| Disabled when | !branch.public_url |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Copy.  |
| Handler / destination | () =&gt; copyBranchLink(branch) |
| Local UI result | setError |

Trace symbols: `copyBranchLink`.

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Open

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Open |
| Location | BranchManagement; JSX a; handler branch.public_url \|\| "#" |
| Appears when | branches.length [true branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Open.  |
| Handler / destination | branch.public_url \|\| "#" |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: QR

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | QR |
| Location | BranchManagement; JSX button; handler () =&gt; downloadBranchQr(branch) |
| Appears when | branches.length [true branch] AND loading [false branch] |
| Disabled when | !branch.qr_code |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate QR.  |
| Handler / destination | () =&gt; downloadBranchQr(branch) |
| Local UI result | setError |

Trace symbols: `downloadBranchQr`.

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Regenerate

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Regenerate |
| Location | BranchManagement; JSX button; handler () =&gt; regenerateBranchQr(branch) |
| Appears when | branches.length [true branch] AND loading [false branch] |
| Disabled when | regeneratingBranchId === branch.id |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Regenerate.  |
| Handler / destination | () =&gt; regenerateBranchQr(branch) |
| Local UI result | setError, setRegeneratingBranchId, setLoading, setBranches, setBranchLimit, setMigrationLogs |

Trace symbols: `fetchBranches`, `fetchMigrationLogs`, `regenerateBranchQr`, `reloadBranchState`.

Requests made by this handler or local helpers:

- `instance.post(′/restaurant/branches/${branch.id}/regenerate-qr/′)`
- `instance.get( "/restaurant/branches/?include_inactive=true",`
- `instance.get("/restaurant/branch-data-migrations/")`

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: Edit branch

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Edit branch |
| Location | BranchManagement; JSX button; handler () =&gt; openEdit(branch) |
| Appears when | branches.length [true branch] AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Edit branch.  |
| Handler / destination | () =&gt; openEdit(branch) |
| Local UI result | setEditingBranch, setFormData, setError, setFormOpen |

Trace symbols: `openEdit`.

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: branch.is_active ? Deactivate : Activate

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | branch.is_active ? Deactivate : Activate |
| Location | BranchManagement; JSX button; handler () =&gt; toggleActive(branch) |
| Appears when | branches.length [true branch] AND loading [false branch] |
| Disabled when | branch.is_main_branch |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate branch.is_active ? Deactivate : Activate.  |
| Handler / destination | () =&gt; toggleActive(branch) |
| Local UI result | setError, setLoading, setBranches, setBranchLimit, setMigrationLogs |

Trace symbols: `fetchBranches`, `fetchMigrationLogs`, `reloadBranchState`, `toggleActive`.

Requests made by this handler or local helpers:

- `instance.patch(′/restaurant/branches/${branch.id}/′, { is_active: !branch.is_active,`
- `instance.get( "/restaurant/branches/?include_inactive=true",`
- `instance.get("/restaurant/branch-data-migrations/")`

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: Delete branch

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Delete branch |
| Location | BranchManagement; JSX button; handler () =&gt; setBranchPendingDelete(branch) |
| Appears when | branches.length [true branch] AND loading [false branch] |
| Disabled when | !branch.can_delete |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Delete branch.  |
| Handler / destination | () =&gt; setBranchPendingDelete(branch) |
| Local UI result | setBranchPendingDelete |

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: Migrating... Migrate

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Migrating... Migrate |
| Location | BranchManagement; JSX button; handler () =&gt; openMigrationConfirmation(type) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | !migrationSourceId \|\|                   !activeBranch?.id \|\|                   Boolean(migratingType) |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Migrating... Migrate.  |
| Handler / destination | () =&gt; openMigrationConfirmation(type) |
| Local UI result | setMigrationError, setPendingMigrationType |

Trace symbols: `openMigrationConfirmation`.

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: Close

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close |
| Location | BranchManagement; JSX button; handler closeForm |
| Appears when | formOpen |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close.  |
| Handler / destination | closeForm |
| Local UI result | setFormOpen, setEditingBranch, setFormData |

Trace symbols: `closeForm`, `createEmptyForm`.

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-11"></a>

### Action 11: Address Active branch

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Address Active branch |
| Location | BranchManagement; JSX form; handler handleSubmit |
| Appears when | formOpen |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Address Active branch.  |
| Handler / destination | handleSubmit |
| Local UI result | setSaving, setError, setFormOpen, setEditingBranch, setFormData, setLoading, setBranches, setBranchLimit, setMigrationLogs |

Trace symbols: `closeForm`, `createEmptyForm`, `fetchBranches`, `fetchMigrationLogs`, `handleSubmit`, `reloadBranchState`.

Requests made by this handler or local helpers:

- `instance.patch( ′/restaurant/branches/${editingBranch.id}/′, payload,`
- `instance.post("/restaurant/branches/", payload)`
- `instance.get( "/restaurant/branches/?include_inactive=true",`
- `instance.get("/restaurant/branch-data-migrations/")`

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-12"></a>

### Action 12: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | BranchManagement; JSX button; handler closeForm |
| Appears when | formOpen |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | closeForm |
| Local UI result | setFormOpen, setEditingBranch, setFormData |

Trace symbols: `closeForm`, `createEmptyForm`.

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-13"></a>

### Action 13: Saving... / Save (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Saving... / Save (conditional text) |
| Location | BranchManagement; JSX button; handler handleSubmit |
| Appears when | formOpen |
| Disabled when | saving |
| Permission | Parent route role plus endpoint enforcement. Admin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Saving... / Save (conditional text).  |
| Handler / destination | handleSubmit |
| Local UI result | setSaving, setError, setFormOpen, setEditingBranch, setFormData, setLoading, setBranches, setBranchLimit, setMigrationLogs |

Trace symbols: `closeForm`, `createEmptyForm`, `fetchBranches`, `fetchMigrationLogs`, `handleSubmit`, `reloadBranchState`.

Requests made by this handler or local helpers:

- `instance.patch( ′/restaurant/branches/${editingBranch.id}/′, payload,`
- `instance.post("/restaurant/branches/", payload)`
- `instance.get( "/restaurant/branches/?include_inactive=true",`
- `instance.get("/restaurant/branch-data-migrations/")`

Record/status result, downstream effects, failure recovery, and reversal: [branches](../../modules/branches/branches.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Source Branch | select; migrationSourceId | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Name | input; name | true | formData.name | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when formOpen |
| <a id="field-3"></a> F3: Code | input; code | true | formData.code | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when formOpen |
| <a id="field-4"></a> F4: Address | textarea; address | Not declared; see submit validation | formData.address | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when formOpen |
| <a id="field-5"></a> F5: Phone | input; phone | Not declared; see submit validation | formData.phone | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when formOpen |
| <a id="field-6"></a> F6: Email | email; email | Not declared; see submit validation | formData.email | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when formOpen |
| <a id="field-7"></a> F7: Latitude | number; latitude | Not declared; see submit validation | formData.latitude | step=any | read-only=false; disabled=false; shown when formOpen |
| <a id="field-8"></a> F8: Longitude | number; longitude | Not declared; see submit validation | formData.longitude | step=any | read-only=false; disabled=false; shown when formOpen |
| <a id="field-9"></a> F9: Active branch | checkbox; is_active | Not declared; see submit validation | formData.is_active | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when editingBranch && !editingBranch.is_main_branch AND formOpen |

## Submission and validation evidence

- `handleSubmit`: `if (editingBranch) {`

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `setError` | err.response?.data?.detail \|\| "Failed to load branches." |
| `setError` | `Your subscription allows only ${branchLimit.max_branches} branches. Upgrade your subscription to add more branches.` |
| `setError` | data?.detail \|\| Object.values(data \|\| {}) ?.flat?.() ?.join(" ") \|\| "Could not save branch." |
| `setError` | data?.detail \|\| Object.values(data \|\| {}) ?.flat?.() ?.join(" ") \|\| "Could not update branch status." |
| `setError` | Could not copy branch link. |
| `setError` | Could not download branch QR code. |
| `setError` | data?.detail \|\| Object.values(data \|\| {}) ?.flat?.() ?.join(" ") \|\| "Could not regenerate branch QR code." |
| `setError` | Array.isArray(detail) ? detail.join(" ") : detail \|\| "Could not delete branch." |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.add_branch_e25a5e29` | Add branch | افزودن شاخه | څانګه اضافه کړئ |
| `legacy.copy_link_2f84eea5` | Copy link | کپی لینک | کاپی لینک |
| `legacy.copy_af74f7c5` | Copy | کپی | کاپی |
| `landing.marketplace.nav.openMenu` | Open menu | باز کردن منو | مېنو پرانییزئ |
| `landing.marketplace.card.open` | Open | باز | پرانیستی |
| `settings_center.actions.download_qr` | Download QR | دانلود QR | QR ډاونلوډ کړئ |
| `legacy.qr_45e7a1c3` | QR | کیو آر | QR |
| `legacy.regenerate_qr_83560ea5` | Regenerate QR | بازیابی QR | د QR ریجنټریټ |
| `legacy.regenerate_b04c991e` | Regenerate | بازسازی | بیا رغونه |
| `legacy.edit_branch_e2d4790d` | Edit branch | ویرایش شاخه | څانګه ایډیټ کړئ |
| `legacy.deactivate_d65ded94` | Deactivate | غیرفعال کردن | غیر فعال کول |
| `legacy.activate_92ef0832` | Activate | فعال سازی | فعال کړه |
| `legacy.delete_branch_5478e60c` | Delete branch | حذف شاخه | څانګه حذف کړه |
| `legacy.migrating_9722b42d` | Migrating... | مهاجرت... | کډول... |
| `legacy.migrate_929ecd9d` | Migrate | مهاجرت | مهاجرت |
| `menuDetails.close` | Close | بستن | بندول |
| `staff.cancel` | Cancel | لغو | لغوه کول |
| `saving` | Saving... | در حال ذخیره... | خوندي کېږي... |
| `legacy.save_efc007a3` | Save | ذخیره | ژغورنه |
| `legacy.no_source_branch_400f44fe` | No source branch | شاخه بدون منبع | هیڅ سرچینه څانګه نشته |

## Related interface references

- [component ui confirmationdialog](component_ui_confirmationdialog.md)
