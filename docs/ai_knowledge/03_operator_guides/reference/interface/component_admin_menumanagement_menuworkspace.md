---
id: "operator_reference_interface_component_admin_menumanagement_menuworkspace"
title: "Menu Workspace — controls and fields"
module: "menu"
description: "Menu Workspace — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["menu", "workspace", "controls", "fields"]
roles: ["Admin", "BranchAdmin", "InventoryManager", "Kitchen_manager", "Manager", "OperationsManager"]
related_docs: ["operator_modules_menu_menu", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/admin/dashboard/menu", "/manager/menu", "/inventory-manager/menu", "/operations-manager/menu", "/kitchen/menu"]
source_references: ["frontend/src/component/Admin/MenuManagement/MenuWorkspace.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Menu Workspace — controls and fields

This reference records the controls and fields declared by `MenuWorkspace`. Use [menu](../../modules/menu/menu.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/Admin/MenuManagement/MenuWorkspace.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Displayed sections

`No menu items yet`, `{item.name}`, `{title}`, `All menu records Menu items`

## Tables, panels, and displayed data

| Display declaration | Label / title | Columns / tabs from source |
|---|---|---|
| th | Parent supplied | `See parent row data and linked procedure.` |
| th | Item | `See parent row data and linked procedure.` |
| th | Category | `See parent row data and linked procedure.` |
| th | Status | `See parent row data and linked procedure.` |
| th | Price | `See parent row data and linked procedure.` |
| th | Parent supplied | `See parent row data and linked procedure.` |

Column expressions identify what is shown, including dynamic row renderers. They are not additional editable fields unless a rendered input/action is inventoried below.

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: {children}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {children} |
| Location | MenuWorkspace; JSX button; handler  |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {children}.  |
| Handler / destination |  |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-2"></a>

### Action 2: {children}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {children} |
| Location | MenuWorkspace; JSX button; handler  |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {children}.  |
| Handler / destination |  |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-3"></a>

### Action 3: {children}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {children} |
| Location | MenuWorkspace; JSX button; handler  |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {children}.  |
| Handler / destination |  |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-4"></a>

### Action 4: Add category

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add category |
| Location | MenuWorkspace; JSX SecondaryButton; handler onAddCategory |
| Appears when | canManage |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add category.  |
| Handler / destination | onAddCategory |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-5"></a>

### Action 5: Add first item

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Add first item |
| Location | MenuWorkspace; JSX PrimaryButton; handler onAddItem |
| Appears when | canManage |
| Disabled when | !hasCategory |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Add first item.  |
| Handler / destination | onAddItem |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-6"></a>

### Action 6: All categories Complete menu

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | All categories Complete menu |
| Location | MenuWorkspace; JSX button; handler () =&gt; onSelect("all") |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate All categories Complete menu.  |
| Handler / destination | () =&gt; onSelect("all") |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-7"></a>

### Action 7: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | MenuWorkspace; JSX button; handler () =&gt; onSelect(category.id) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | () =&gt; onSelect(category.id) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-8"></a>

### Action 8: `Edit ${category.name}`

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | `Edit ${category.name}` |
| Location | MenuWorkspace; JSX button; handler () =&gt; onEdit(category) |
| Appears when | canManage |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate `Edit ${category.name}`.  |
| Handler / destination | () =&gt; onEdit(category) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-9"></a>

### Action 9: `Open actions for ${item.name}`

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | `Open actions for ${item.name}` |
| Location | MenuWorkspace; JSX IconButton; handler (event) =&gt; { event.preventDefault(); event.stopPropagation(); setOpen((value) =&gt; !value); } |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate `Open actions for ${item.name}`.  |
| Handler / destination | (event) =&gt; { event.preventDefault(); event.stopPropagation(); setOpen((value) =&gt; !value); } |
| Local UI result | setOpen |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-10"></a>

### Action 10: Edit details View details View only Move to

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Edit details View details View only Move to |
| Location | MenuWorkspace; JSX Motion.div; handler (event) =&gt; event.stopPropagation() |
| Appears when | open |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Edit details View details View only Move to.  |
| Handler / destination | (event) =&gt; event.stopPropagation() |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-11"></a>

### Action 11: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | MenuWorkspace; JSX Link; handler detailPath |
| Appears when | detailPath [true branch] AND open |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | detailPath |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-12"></a>

### Action 12: Export row

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Export row |
| Location | MenuWorkspace; JSX button; handler () =&gt; exportCsv([item]) |
| Appears when | open |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Export row.  |
| Handler / destination | () =&gt; exportCsv([item]) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `exportCsv`, `getStatus`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-13"></a>

### Action 13: `Drag ${item.name}`

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | `Drag ${item.name}` |
| Location | MenuWorkspace; JSX button; handler  |
| Appears when | canManage |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate `Drag ${item.name}`.  |
| Handler / destination |  |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-14"></a>

### Action 14: [icon or dynamic label]

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | [icon or dynamic label] |
| Location | MenuWorkspace; JSX label; handler (event) =&gt; event.stopPropagation() |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate [icon or dynamic label].  |
| Handler / destination | (event) =&gt; event.stopPropagation() |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-15"></a>

### Action 15: {item.name}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {item.name} |
| Location | MenuWorkspace; JSX Link; handler detailPath |
| Appears when | detailPath [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {item.name}.  |
| Handler / destination | detailPath |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-16"></a>

### Action 16: {item.name}

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | {item.name} |
| Location | MenuWorkspace; JSX Link; handler detailPath |
| Appears when | detailPath [true branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate {item.name}.  |
| Handler / destination | detailPath |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-17"></a>

### Action 17: Refresh

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Refresh |
| Location | MenuWorkspace; JSX SecondaryButton; handler onRefresh |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Refresh.  |
| Handler / destination | onRefresh |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-18"></a>

### Action 18: Export

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Export |
| Location | MenuWorkspace; JSX SecondaryButton; handler () =&gt; exportCsv(visibleItems) |
| Appears when | No enclosing conditional in this source; parent component may still restrict rendering. |
| Disabled when | !visibleItems.length |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Export.  |
| Handler / destination | () =&gt; exportCsv(visibleItems) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `exportCsv`, `getStatus`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-19"></a>

### Action 19: Dynamic/container content; use the control location and handler below

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Dynamic/container content; use the control location and handler below |
| Location | MenuWorkspace; JSX SecondaryButton; handler handlePrint |
| Appears when | showPrintActions |
| Disabled when | printing \|\|                     (printMode === "category" &&                       (!selectedCategoryId \|\| selectedCategoryId === "all")) |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Dynamic/container content; use the control location and handler below.  |
| Handler / destination | handlePrint |
| Local UI result | setPrinting |

Trace symbols: `handlePrint`.

Requests made by this handler or local helpers:

- `instance.get(url, { responseType: "blob" })`

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-20"></a>

### Action 20: New item

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | New item |
| Location | MenuWorkspace; JSX PrimaryButton; handler () =&gt; setShowAddItem(true) |
| Appears when | canManage |
| Disabled when | !selectedManageCategoryId |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate New item.  |
| Handler / destination | () =&gt; setShowAddItem(true) |
| Local UI result | setShowAddItem |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-21"></a>

### Action 21: Grid view

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Grid view |
| Location | MenuWorkspace; JSX button; handler () =&gt; setViewMode("grid") |
| Appears when | loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Grid view.  |
| Handler / destination | () =&gt; setViewMode("grid") |
| Local UI result | setViewMode |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-22"></a>

### Action 22: List view

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | List view |
| Location | MenuWorkspace; JSX button; handler () =&gt; setViewMode("list") |
| Appears when | loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate List view.  |
| Handler / destination | () =&gt; setViewMode("list") |
| Local UI result | setViewMode |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-23"></a>

### Action 23: Clear filters

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Clear filters |
| Location | MenuWorkspace; JSX button; handler clearFilters |
| Appears when | filtersActive AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Clear filters.  |
| Handler / destination | clearFilters |
| Local UI result | setSearchTerm, setAvailabilityFilter, setStatusFilter, setSortBy, setStationFilter |

Trace symbols: `clearFilters`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-24"></a>

### Action 24: Category

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Category |
| Location | MenuWorkspace; JSX SecondaryButton; handler () =&gt; setShowAddCategory(true) |
| Appears when | canManage AND loading [false branch] |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Category.  |
| Handler / destination | () =&gt; setShowAddCategory(true) |
| Local UI result | setShowAddCategory |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-25"></a>

### Action 25: Delete category

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Delete category |
| Location | MenuWorkspace; JSX SecondaryButton; handler () =&gt; setShowDeleteCategory(true) |
| Appears when | canManage AND loading [false branch] |
| Disabled when | !selectedCategory \|\|                           String(selectedCategoryId) === "all" |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Delete category.  |
| Handler / destination | () =&gt; setShowDeleteCategory(true) |
| Local UI result | setShowDeleteCategory |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-26"></a>

### Action 26: Platter

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Platter |
| Location | MenuWorkspace; JSX SecondaryButton; handler () =&gt; setShowAddPlatter(true) |
| Appears when | canManage AND loading [false branch] |
| Disabled when | !selectedManageCategoryId |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Platter.  |
| Handler / destination | () =&gt; setShowAddPlatter(true) |
| Local UI result | setShowAddPlatter |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-27"></a>

### Action 27: Export selected

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Export selected |
| Location | MenuWorkspace; JSX SecondaryButton; handler () =&gt; exportCsv(selectedItems) |
| Appears when | selectedItems.length &gt; 0 |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Export selected.  |
| Handler / destination | () =&gt; exportCsv(selectedItems) |
| Local UI result | Delegated to the named handler/parent; follow the linked module procedure. |

Trace symbols: `exportCsv`, `getStatus`.

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

<a id="action-28"></a>

### Action 28: Clear

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | Clear |
| Location | MenuWorkspace; JSX SecondaryButton; handler () =&gt; setSelectedKeys([]) |
| Appears when | selectedItems.length &gt; 0 |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. Admin, BranchAdmin, InventoryManager, Kitchen_manager, Manager, OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate Clear.  |
| Handler / destination | () =&gt; setSelectedKeys([]) |
| Local UI result | setSelectedKeys |

Record/status result, downstream effects, failure recovery, and reversal: [menu](../../modules/menu/menu.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.

## Field reference

Required below means the rendered control declares a requirement. Custom submit validation can require additional values; backend requirements are separate in the module guide and backend reference. A blank/default expression is retained where the value comes from a record or parent. `Field` entries describe a wrapper; the following input may be its child, not a second field.

| ID / label | Type / binding | Frontend required | Default or displayed value | Limits / choices | Editability / dependency |
|---|---|---|---|---|---|
| <a id="field-1"></a> F1: Move to | select; item.categoryId \|\| "" | Not declared; see submit validation | item.categoryId \|\| "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when canManage && onMoveItem AND open |
| <a id="field-2"></a> F2: `Select ${item.name}` | checkbox; selected | Not declared; see submit validation | selected | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-3"></a> F3: `Select ${item.name}` | checkbox; selectedKeys.includes(item.stableKey) | Not declared; see submit validation | selectedKeys.includes(item.stableKey) | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false |
| <a id="field-4"></a> F4: / / / / | input; searchTerm | Not declared; see submit validation | "" | No explicit HTML limit here; backend may enforce more. | read-only=false; disabled=false; shown when loading [false branch] |
| <a id="field-5"></a> F5: / / / / | select; stationFilter | Not declared; see submit validation | "all" | ; choices: All stations [all] | read-only=false; disabled=false; shown when loading [false branch] |
| <a id="field-6"></a> F6: / / / / | select; availabilityFilter | Not declared; see submit validation | "all" | ; choices: All availability [all], Available [available], Unavailable [unavailable], Production items [production], Platters [platter] | read-only=false; disabled=false; shown when loading [false branch] |
| <a id="field-7"></a> F7: / / / / | select; statusFilter | Not declared; see submit validation | "all" | ; choices: All visibility [all], Visible [visible], Hidden [hidden] | read-only=false; disabled=false; shown when loading [false branch] |
| <a id="field-8"></a> F8: / / / / | select; sortBy | Not declared; see submit validation | "menu_order" | ; choices: Menu order [menu_order], Name A-Z [name], Name Z-A [name_desc], Price high-low [price_high], Price low-high [price_low], Availability [availability] | read-only=false; disabled=false; shown when loading [false branch] |
| <a id="field-9"></a> F9: PDF export mode | select; printMode | Not declared; see submit validation | "all" | ; choices: PDF: all [all], PDF: available [available], PDF: unavailable [unavailable], PDF: category [category] | read-only=false; disabled=false; shown when showPrintActions AND loading [false branch] |

## Submission and validation evidence

Submission is handled by the parent/imported callback shown in the action table.

On success, follow the module’s next step; closing a modal is not evidence that an unacknowledged request succeeded. On failure, the feedback below and backend reference identify the available messages.

## Messages and feedback

| UI mechanism | Message or exact runtime source |
|---|---|
| `toast.error` | Failed to save menu order |
| `toast.error` | Failed to save menu order |

Cause and operator resolution: [errors and recovery](../../troubleshooting/errors_and_recovery.md) and the module procedure. Runtime expressions indicate the UI displays a server value; they are not invented fixed error messages.

## Verified language labels

`fa` is the repository’s Dari/Persian resource; `ps` is Pashto. A missing resource is shown as “missing; fallback applies.”

| Key | English | fa | ps |
|---|---|---|---|
| `legacy.add_category_d169b7f3` | Add category | افزودن دسته بندی | Add Category |
| `legacy.add_first_item_fe1b5250` | Add first item | اولین مورد را اضافه کنید | لومړی توکی اضافه کړئ |
| `legacy.all_categories_060be00f` | All categories | تمام دسته ها | ټولې کټګورۍ |
| `legacy.complete_menu_c78f38fa` | Complete menu | منوی کامل | بشپړ مینو |
| `labels.item` | item | آیتم | توکی |
| `legacy.edit_details_4173a96a` | Edit details | جزئیات ویرایش | د سمون جزئیات |
| `legacy.view_details_badd3851` | View details | مشاهده جزئیات | تفصیلات وګورئ |
| `legacy.view_only_5559dd04` | View only | فقط مشاهده | یوازې لیدل |
| `legacy.export_row_80fb7b19` | Export row | ردیف صادراتی | صادراتی قطار |
| `legacy.move_to_349f807a` | Move to | انتقال به | انتقال ته |
| `legacy.refresh_56e3badc` | Refresh | تازه سازی | تازه کول |
| `legacy.export_f3e4fadb` | Export | صادرات | صادرات |
| `legacy.pdf_d613d88c` | PDF | PDF | PDF |
| `legacy.new_item_4a91d6da` | New item | آیتم جدید | نوې توکی |
| `legacy.grid_view_d44ec861` | Grid view | نمای شبکه ای | د شبکې لید |
| `legacy.list_view_694bbd75` | List view | نمای فهرست | لیست لید |
| `legacy.clear_filters_41222671` | Clear filters | فیلترهای شفاف | پاکه فلټرونه |
| `menu_item_sales.category` | Category | دسته‌بندی | کټګوري |
| `legacy.delete_category_a82b0f89` | Delete category | دسته بندی حذف | کټګوری حذف کړئ |
| `labels.platter` | Platter | پلیتر | پلیټر |
| `legacy.export_selected_7a6e835d` | Export selected | صادرات انتخاب شده | صادرات ټاکل شوی |
| `legacy.clear_719ea396` | Clear | پاک | پاکه |
| `legacy.search_dishes_platters_categories_88613ecd` | Search dishes, platters, categories... | بشقاب ها، سینی ها، دسته بندی ها را جستجو کنید... | د لټون لوښی، پلیټرونه، کټګوری... |
| `legacy.all_stations_19238dd3` | All stations | تمام ایستگاه ها | ټول سټیشنونه |
| `legacy.default_c32f3c82` | (Default) | (پیش فرض) | (ډیفالټ) |
| `legacy.all_availability_fafe3022` | All availability | تمام موجودی ها | ټولې شتون |
| `available` | Available | موجود | شتون لري |
| `menu.unavailable` | Unavailable | ناموجود | شتون نلري |
| `legacy.production_items_ed179751` | Production items | اقلام تولیدی | تولیدی توکی |
| `legacy.platters_84cf7710` | Platters | پلاترها | پلیټرونه |
| `legacy.all_visibility_058d9fce` | All visibility | دید کامل | ټول لید |
| `legacy.visible_1fe59390` | Visible | قابل مشاهده | ښکاره |
| `legacy.hidden_d4c2792a` | Hidden | پنهان | پټ |
| `legacy.menu_order_76a6fe43` | Menu order | ترتیب منو | د مینو ترتیب |
| `legacy.name_a_z_257c1c4b` | Name A-Z | نام: الف تا ی | نوم: A-Z |
| `legacy.name_z_a_daabfb6a` | Name Z-A | نام Z-A | نوم: Z-A |
| `legacy.price_high_low_b2b28e4a` | Price high-low | قیمت بالا-پایین | قیمت لوړ-ټیټ |
| `legacy.price_low_high_bb74a1c2` | Price low-high | قیمت پایین-بالا | بیه ټیټه-لوړه |
| `legacy.availability_681b5b5a` | Availability | دسترس پذیری | موجودیت |
| `legacy.pdf_export_mode_991d8583` | PDF export mode | حالت صادر کردن PDF | د PDF صادراتو حالت |
| `legacy.pdf_all_cef3595f` | PDF: all | PDF: همه | PDF: ټول |
| `legacy.pdf_available_0ac1592e` | PDF: available | PDF: موجود است | PDF: شتون لری |
| `legacy.pdf_unavailable_284340d3` | PDF: unavailable | PDF: در دسترس نیست | PDF: شتون نلری |
| `legacy.pdf_category_5ca79ba9` | PDF: category | PDF: دسته بندی | PDF: کټګوری |

## Related interface references

- [component admin menumanagement addcategorymodal](component_admin_menumanagement_addcategorymodal.md)
- [component admin menumanagement additemmodal](component_admin_menumanagement_additemmodal.md)
- [component admin menumanagement categorydeletemodal](component_admin_menumanagement_categorydeletemodal.md)
- [component admin menumanagement editcategorymodal](component_admin_menumanagement_editcategorymodal.md)
- [component admin menumanagement platteraddmodal](component_admin_menumanagement_platteraddmodal.md)
