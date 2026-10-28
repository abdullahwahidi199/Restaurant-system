---
id: "operator_reference_interface_component_operationsmanager_operationsmanagerlayout"
title: "Operations Manager Layout — controls and fields"
module: "interface_reference"
description: "Operations Manager Layout — controls and fields — current Pakhlai operator behavior, controls, validation, and evidence."
keywords: ["interface_reference", "operations", "manager", "layout", "controls", "fields"]
roles: ["OperationsManager"]
related_docs: ["operator_navigation_common_interface_controls", "operator_navigation_page_directory", "operator_reference_backend_index"]
frontend_routes: ["/operations-manager"]
source_references: ["frontend/src/component/OperationsManager/OperationsManagerLayout.jsx", "frontend/src/i18n.js"]
status: "source_verified"
---

# Operations Manager Layout — controls and fields

This reference records the controls and fields declared by `OperationsManagerLayout`. Use [common interface controls](../../navigation/common_interface_controls.md) for the operating procedure and [page directory](../../navigation/page_directory.md) for exact routes and portal access. A component may be reused in several pages; a listed route is a parent page that imports it, not a claim that every control appears there in every state.

Source: `frontend/src/component/OperationsManager/OperationsManagerLayout.jsx`. Labels are resolved from `i18n.js` resources where available. Dynamic labels and icons are identified explicitly. Backend permissions and validation take precedence over a visible control; see [index](../backend/index.md).

## Open and use this interface

1. Open a permitted parent route from the page directory and select the intended branch where applicable.
2. Use the linked module procedure to open this drawer, modal, tab, or detail view.
3. Locate the control by its label below. Set dependent fields before a create/update submit; view, close, cancel, and filter controls do not generally require form completion.
4. Wait for a submitted request to finish. On failure, preserve the form, correct the reported field or prerequisite, and refresh the affected list before retrying a record-changing action.

## Actions and conditions

An action ID identifies a source control, including repeated controls in mobile and desktop layouts. `false branch` means the condition is false. Conditions are source expressions retained to avoid inventing broader permissions.

<a id="action-1"></a>

### Action 1: X icon (no text label)

| Property | Implemented behavior |
|---|---|
| Visible label / accessible name | X icon (no text label) |
| Location | OperationsManagerLayout; JSX button; handler () =&gt; setIsWarningDismissed(true) |
| Appears when | alert && !isWarningDismissed |
| Disabled when | No explicit disabled property on this control. |
| Permission | Parent route role plus endpoint enforcement. OperationsManager |
| Operator steps | Locate this control on the described interface; for a create/update submission complete its required fields, then activate X icon (no text label).  |
| Handler / destination | () =&gt; setIsWarningDismissed(true) |
| Local UI result | setIsWarningDismissed |

Record/status result, downstream effects, failure recovery, and reversal: [common interface controls](../../navigation/common_interface_controls.md). The backend contract contains exact server rejections; this UI reference does not infer an undo operation from an Edit/Cancel label.


## Related interface references

- [component operationsmanager operationsmanagertopheader](component_operationsmanager_operationsmanagertopheader.md)
- [component operationsmanager operationsmanagernavbar](component_operationsmanager_operationsmanagernavbar.md)
