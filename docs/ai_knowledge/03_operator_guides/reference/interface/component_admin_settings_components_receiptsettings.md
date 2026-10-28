---
id: "operator_reference_interface_component_admin_settings_components_receiptsettings"
title: "Receipt Settings — controls and fields"
module: "settings"
description: "Receipt Settings declarations without a mounted App import path; retained for source explanation, not current operator instructions."
keywords: ["settings", "receipt", "controls", "fields"]
roles: []
related_docs: ["operator_modules_settings_restaurant_branch_settings", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: []
source_references: ["frontend/src/component/Admin/settings/components/ReceiptSettings.jsx", "frontend/src/i18n.js"]
status: "needs_verification"
availability: "unmounted"
---

# Receipt Settings — controls and fields

This reference records the controls and fields declared by `ReceiptSettings`. Use [restaurant branch settings](../../modules/settings/restaurant_branch_settings.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/settings/components/ReceiptSettings.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| SettingsSection | Receipt & POS | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Mounting status: Needs Verification

No rendered App route was traced to this component. It may be unused/legacy or only reachable through a runtime reference not resolved by static imports. The declarations below are inventory evidence, not an implemented navigation procedure. Do not teach its controls as available until a mounted caller is verified.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Saving... / Save Changes (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Saving... / Save Changes (conditional text) |
| Location | ReceiptSettings; JSX SettingsSaveButton; handler () =&gt; settings.saveBranchSettings( "receipt", fields, t("settings_center.messages.receipt_saved"), ) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | !settings.branchSettingsLoaded |
| Permission | Parent route role plus endpoint enforcement.  |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Saving... / Save Changes (conditional text).  |
| Handler / destination | () =&gt; settings.saveBranchSettings( "receipt", fields, t("settings_center.messages.receipt_saved"), ) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [restaurant branch settings](../../modules/settings/restaurant_branch_settings.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Receipt Header | FormInput; receipt_header | Not declared; see submit validation | settings.branchSettings.receipt_header ?? "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when settings.branchSettingsLoading [false branch] |
| <a id="field-2"></a> F2: Kitchen Printer | FormInput; kitchen_printer | Not declared; see submit validation | settings.branchSettings.kitchen_printer ?? "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when settings.branchSettingsLoading [false branch] |
| <a id="field-3"></a> F3: Tax Rate (%) | number; tax_rate | Not declared; see submit validation | settings.branchSettings.tax_rate ?? "" | step=0.001 | read-only=false; disabled=false; shown when settings.branchSettingsLoading [false branch] |
| <a id="field-4"></a> F4: Service Charge (%) | number; service_charge_rate | Not declared; see submit validation | settings.branchSettings.service_charge_rate ?? "" | step=0.001 | read-only=false; disabled=false; shown when settings.branchSettingsLoading [false branch] |
| <a id="field-5"></a> F5: Cash Drawer Name | FormInput; cash_drawer_name | Not declared; see submit validation | settings.branchSettings.cash_drawer_name ?? "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when settings.branchSettingsLoading [false branch] |
| <a id="field-6"></a> F6: Cash drawer enabled | checkbox; cash_drawer_enabled | Not declared; see submit validation | Boolean(settings.branchSettings.cash_drawer_enabled) | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when settings.branchSettingsLoading [false branch] |
| <a id="field-7"></a> F7: Receipt Footer | textarea; receipt_footer | Not declared; see submit validation | settings.branchSettings.receipt_footer ?? "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when settings.branchSettingsLoading [false branch] |
| <a id="field-8"></a> F8: Receipt Template | textarea; receipt_template | Not declared; see submit validation | settings.branchSettings.receipt_template ?? "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when settings.branchSettingsLoading [false branch] |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `settings_center.messages.receipt_saved` | Receipt and POS settings updated successfully. | رسید و تنظیمات POS با موفقیت به روزرسانی شدند. | رسید او POS تنظیمات په بریالیتوب سره تازه شول. |
| `saving` | Saving... | در حال ذخیره... | خوندي کېږي... |
| `save_changes` | Save Changes | ذخیره تغییرات | بدلونونه خوندي کړئ |
| `settings_center.fields.receipt_header` | Receipt Header | سربرگ رسید | رسید سرلیک |
| `settings_center.fields.kitchen_printer` | Kitchen Printer | چاپگر آشپزخانه | د پخلنځی پرنټر |
| `settings_center.fields.tax_rate` | Tax Rate (%) | نرخ مالیات (٪) | د مالیې نرخ (٪) |
| `settings_center.fields.service_charge` | Service Charge (%) | هزینه خدمات (٪) | د خدمت فیس (٪) |
| `settings_center.fields.cash_drawer_name` | Cash Drawer Name | نام کش درو | د نغدو پیسو دراو نوم |

## Related interface references

- [component admin settings forminput](component_admin_settings_forminput.md)
- [component admin settings components settingsprimitives](component_admin_settings_components_settingsprimitives.md)
