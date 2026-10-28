---
id: "operator_reference_interface_component_admin_settings_languageswitcher"
title: "Language Switcher — controls and fields"
module: "settings"
description: "Language Switcher declarations without a mounted App import path; retained for source explanation, not current operator instructions."
keywords: ["settings", "language", "switcher", "controls", "fields"]
roles: []
related_docs: ["operator_modules_settings_restaurant_branch_settings", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: []
source_references: ["frontend/src/component/Admin/settings/LanguageSwitcher.jsx", "frontend/src/i18n.js"]
status: "needs_verification"
availability: "unmounted"
---

# Language Switcher — controls and fields

This reference records the controls and fields declared by `LanguageSwitcher`. Use [restaurant branch settings](../../modules/settings/restaurant_branch_settings.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/settings/LanguageSwitcher.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Mounting status: Needs Verification

No rendered App route was traced to this component. It may be unused/legacy or only reachable through a runtime reference not resolved by static imports. The declarations below are inventory evidence, not an implemented navigation procedure. Do not teach its controls as available until a mounted caller is verified.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Unlabelled control (see binding) | select; handleChange | Not declared; see submit validation | i18n.language | ; choices: English [en], دری [fa], پښتو [ps] | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.languages.english` | English | انگلیسی | انګلیسي |
