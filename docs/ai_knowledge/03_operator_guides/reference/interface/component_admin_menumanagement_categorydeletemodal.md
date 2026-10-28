---
id: "operator_reference_interface_component_admin_menumanagement_categorydeletemodal"
title: "Category Delete Modal — controls and fields"
module: "menu"
description: "Category Delete Modal — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["menu", "category", "delete", "modal", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "Kitchen_manager", "Manager", "OperationsManager"]
related_docs: ["operator_modules_menu_menu", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/menu", "/manager/menu", "/inventory-manager/menu", "/operations-manager/menu", "/kitchen/menu"]
source_references: ["frontend/src/component/Admin/MenuManagement/CategoryDeleteModal.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Category Delete Modal — controls and fields

This reference records the controls and fields declared by `CategoryDeleteModal`. Use [menu](../../modules/menu/menu.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/MenuManagement/CategoryDeleteModal.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`Confirm Delete`

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | CategoryDeleteModal; JSX div; handler (event) =&gt; { if (event.target === event.currentTarget) onClose(); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | (event) =&gt; { if (event.target === event.currentTarget) onClose(); } |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: Close delete confirmation

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Close delete confirmation |
| Location | CategoryDeleteModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Close delete confirmation.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: Cancel

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Cancel |
| Location | CategoryDeleteModal; JSX button; handler onClose |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Cancel.  |
| Handler / destination | onClose |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | CategoryDeleteModal; JSX button; handler handleDelete |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | loading |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handleDelete |
| Local UI result | setShowRestriction, setLoading |

Trace symbols: `handleDelete`.

Requests made by this handler or local helpers:

- `instance.delete(′/menu/categories/${categoryId}/′)`

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.close_delete_confirmation_7d6e51db` | Close delete confirmation | تأیید حذف بستن | د حذف تایید بند کړئ |
| `cancel` | Cancel | لغو | لغوه |
| `delete` | Delete | حذف | ړنګول |
