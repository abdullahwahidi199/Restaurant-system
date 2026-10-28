---
id: "operator_reference_interface_component_admin_settings_components_deliverysettings"
title: "Delivery Settings — controls and fields"
module: "settings"
description: "Delivery Settings — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["settings", "delivery", "controls", "fields"]
roles: ["Admin", "BranchAdmin"]
related_docs: ["operator_modules_settings_restaurant_branch_settings", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/settings", "/admin/dashboard/settings/:sectionId"]
source_references: ["frontend/src/component/Admin/settings/components/DeliverySettings.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Delivery Settings — controls and fields

This reference records the controls and fields declared by `DeliverySettings`. Use [restaurant branch settings](../../modules/settings/restaurant_branch_settings.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/settings/components/DeliverySettings.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| SettingsSection | Delivery Settings | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Saving... / Save Changes (conditional text)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Saving... / Save Changes (conditional text) |
| Location | DeliverySettings; JSX SettingsSaveButton; handler () =&gt; settings.saveRestaurantSettings( "delivery", fields, t("settings_center.messages.delivery_saved"), ) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Saving... / Save Changes (conditional text).  |
| Handler / destination | () =&gt; settings.saveRestaurantSettings( "delivery", fields, t("settings_center.messages.delivery_saved"), ) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [restaurant branch settings](../../modules/settings/restaurant_branch_settings.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Delivery Radius (km) | number; delivery_radius_km | Not declared; see submit validation | settings.formData.delivery_radius_km | step=0.1 | read-only=false; disabled=false |
| <a id="field-2"></a> F2: Base Delivery Fee | number; base_delivery_fee | Not declared; see submit validation | settings.formData.base_delivery_fee | step=0.01 | read-only=false; disabled=false |
| <a id="field-3"></a> F3: Price per km | number; price_per_km | Not declared; see submit validation | settings.formData.price_per_km | step=0.01 | read-only=false; disabled=false |
| <a id="field-4"></a> F4: Minimum Order Amount | number; min_order_amount | Not declared; see submit validation | settings.formData.min_order_amount | step=0.01 | read-only=false; disabled=false |
| <a id="field-5"></a> F5: Delivery Available | checkbox; delivery_available | Not declared; see submit validation | Boolean(settings.formData.delivery_available) | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `settings_center.messages.delivery_saved` | Delivery settings updated successfully. | تنظیمات تحویل با موفقیت به روزرسانی شد. | د تحویلی تنظیمات په بریالیتوب سره تازه شول. |
| `saving` | Saving... | در حال ذخیره... | خوندي کېږي... |
| `save_changes` | Save Changes | ذخیره تغییرات | بدلونونه خوندي کړئ |
| `settings_center.fields.delivery_radius` | Delivery Radius (km) | شعاع تحویل (کیلومتر) | د تحویلی شعاع (کیلومتر) |
| `settings_center.fields.base_delivery_fee` | Base Delivery Fee | هزینه پایه تحویل | د بنسټیز تحویلی فیس |
| `settings_center.fields.price_per_km` | Price per km | قیمت به ازای هر کیلومتر | په هر کیلومتره قیمت |
| `settings_center.fields.minimum_order` | Minimum Order Amount | حداقل مبلغ سفارش | د فرمایش لږ تر لږه اندازه |

## Related interface references

- [component admin settings forminput](component_admin_settings_forminput.md)
- [component admin settings components settingsprimitives](component_admin_settings_components_settingsprimitives.md)
