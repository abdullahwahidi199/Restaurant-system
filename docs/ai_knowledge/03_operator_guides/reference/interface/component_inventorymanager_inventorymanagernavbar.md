---
id: "operator_reference_interface_component_inventorymanager_inventorymanagernavbar"
title: "Inventory Manager Navbar — controls and fields"
module: "interface_reference"
description: "Inventory Manager Navbar — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["interface_reference", "inventory", "manager", "navbar", "controls", "fields"]
roles: ["InventoryManager"]
related_docs: ["operator_navigation_common_interface_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/inventory-manager"]
source_references: ["frontend/src/component/InventoryManager/InventoryManagerNavbar.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Inventory Manager Navbar — controls and fields

This reference records the controls and fields declared by `InventoryManagerNavbar`. Use [common interface controls](../../navigation/common_interface_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/InventoryManager/InventoryManagerNavbar.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Close navigation

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close navigation |
| Location | InventoryManagerNavbar; JSX button; handler onCloseMobile |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. InventoryManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close navigation.  |
| Handler / destination | onCloseMobile |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | InventoryManagerNavbar; JSX button; handler onToggleCollapse |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. InventoryManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | onToggleCollapse |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Close sidebar

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close sidebar |
| Location | InventoryManagerNavbar; JSX button; handler onCloseMobile |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. InventoryManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close sidebar.  |
| Handler / destination | onCloseMobile |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | InventoryManagerNavbar; JSX NavLink; handler onCloseMobile |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. InventoryManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | onCloseMobile |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Language | select; i18n.language | Not declared; see submit validation | i18n.language | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `inventory_manager.a11y.close_navigation` | Close navigation | بستن ناوبری | لارښود بند کړئ |
| `inventory_manager.a11y.expand_sidebar` | Expand sidebar | باز کردن نوار کناری | اړخ پټه پراخه کړئ |
| `inventory_manager.a11y.collapse_sidebar` | Collapse sidebar | جمع کردن نوار کناری | اړخ پټه راټوله کړئ |
| `inventory_manager.a11y.close_sidebar` | Close sidebar | بستن نوار کناری | اړخ پټه بند کړئ |
| `inventory_manager.languages.language` | Language | زبان | ژبه |
