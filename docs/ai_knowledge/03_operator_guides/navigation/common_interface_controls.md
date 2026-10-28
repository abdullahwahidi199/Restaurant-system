---
id: "operator_navigation_common_interface_controls"
title: "Search, filters, dialogs, language, printing, and shared controls"
module: "navigation"
description: "Use common search, filters, pagination, dialogs, language/theme controls, printing and downloads while distinguishing local UI changes from saved records."
keywords: ["navigation", "search", "filters", "dialogs", "language", "printing", "shared", "controls", "disabled button", "search filter", "print dialog"]
roles: []
related_docs: ["operator_modules_billing_cashier", "operator_modules_kitchen_preparation", "operator_reference_backend_index"]
frontend_routes: []
source_references: ["frontend/src/modules/shared/erp/components/Modal.jsx", "frontend/src/modules/shared/erp/components/ConfirmModal.jsx", "frontend/src/modules/shared/erp/components/ActionButton.jsx", "frontend/src/modules/shared/erp/components/DataTable.jsx", "frontend/src/modules/shared/erp/components/TablePagination.jsx", "frontend/src/component/ui/PaginationControls.jsx", "frontend/src/component/ui/ConfirmationDialog.jsx", "frontend/src/i18n.js", "frontend/src/theme/ThemeContext.jsx", "frontend/src/component/Admin/GlobalSearch.jsx"]
status: "source_verified"
---

# Search, filters, dialogs, language, printing, and shared controls

## Find and filter information

Use the current page’s search field for its records; use header/global search for navigation to modules. Search scope differs: the order list backend searches customer name/phone; reservation lists also support table and reservation number; audit search includes descriptions, objects and actors. A search icon does not imply every column is searchable.

Set dropdown filters and date bounds, then use **Run** only on pages that require it. Most operational lists refresh as filters change. Procurement searches debounce about 400 ms; payroll searches about 350 ms. These workspaces initially request at most 100 records; client pagination cannot reveal records the server did not return. See the verification register before treating these lists as exhaustive.

**Reset**, **Reset Filters**, or **Clear filters** resets that component’s filters, not the underlying records. **Previous**, **Next**, page numbers, and page-size selectors change the displayed slice. End-of-list controls are disabled. Sorting may be client-side; menu drag sorting persists through a separate reorder request. Do not assume column headings sort unless the component supplies a click/sort handler.

## Dialogs and local editing

**View** or an eye icon opens a detail modal/drawer/page. **Edit** preloads values. **Cancel**, **Close**, an X icon, Escape, or clicking the backdrop closes a dialog only where that component explicitly implements it. Closing generally discards local unsaved changes. Some row cancellations send an immediate request before **Save Changes**; see order editing.

During **Saving...**, **Creating...**, **Updating...**, or **Downloading...**, a button may be disabled. Also check missing selection, unavailable stock, role restrictions, and status requirements in that control’s reference. A hidden control and a disabled control have different causes. Generic dialog components delegate their real action to the parent callback.

Confirmation dialogs display a proposed action before a delete, approval, migration, clear, or session revocation. Read the record identifier and branch, then confirm once. Canceling a confirmation does not reverse an action already submitted. Most financial and terminal order operations have no general Undo action.

## Language and theme

The main interface supports `en`, `fa`, and `ps`. Select the available language control; Dari/Persian and Pashto use right-to-left layout. `i18n.js` normalizes language codes, falls back to English, and updates document direction. Customer components also contain their own locale files; their labels may differ. Some messages remain literal English or are always Dari. The reference’s language table only claims labels found in configured resources. A missing key can appear literally when no fallback exists.

Theme controls change the displayed theme; they do not grant permissions or change restaurant records. Responsive sidebars may collapse to icons or require the menu toggle. Hover titles/accessibility names can identify icon buttons.

## Print and download

Printing opens a browser window/iframe and uses browser print controls. Allow the required print popup and choose the intended printer or browser PDF destination. Downloads create a local browser file; exporting a table does not change records. Menu CSV export, server PDF reports, customer receipts, kitchen tickets, reservation slips, supplier payment vouchers, and expense vouchers are different outputs.

Customer bill printing is an exception to “read-only output”: its handler marks `is_printed`. Kitchen printing can mark lines `is_printed_to_kitchen`. Neither proves that physical paper was printed. Canceling the operating-system print dialog may leave those flags set. Verify the receipt preview and queue before proceeding; see [cashier](../modules/billing/cashier.md) and [preparation](../modules/kitchen/preparation.md).

## Failure and recovery

Required HTML inputs can stop submission before an API request; custom validation can show a toast or field error. Backend validation can still reject accepted input. The component references retain exact feedback text and bindings; [index](../reference/backend/index.md) records server rules. Some handlers only log a technical failure and show no message. An unchanged list or spinner is not proof that no write occurred: refresh and locate the record before retrying a create or payment.
