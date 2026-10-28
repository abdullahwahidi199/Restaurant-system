---
id: "operator_forms_form_submission_reference"
title: "How form requirements, create/edit modes, and validation differ"
module: "forms"
description: "Compare required, default, omitted, blank and read-only values across create/edit forms and understand browser, custom and server validation."
keywords: ["forms", "form", "requirements", "create", "edit", "modes", "validation", "differ", "form validation", "required field", "create versus edit"]
roles: []
related_docs: ["operator_coverage_matrix", "operator_reference_backend_index", "operator_troubleshooting_verification_register"]
frontend_routes: []
source_references: ["frontend/src/component/Admin/staff/StaffFormModal.jsx", "frontend/src/component/Admin/MenuManagement/AddItemModal.jsx", "frontend/src/component/Admin/DiscountCards/DiscountCardEdit.jsx", "frontend/src/modules/procurement/hooks/useProcurementWorkspace.js", "frontend/src/modules/payroll/hooks/usePayrollWorkspace.js", "frontend/src/component/Admin/settings/hooks/useRestaurantSettings.js", "backend/backend/orders/seriailizers.py", "backend/backend/inventory/services.py"]
status: "source_verified"
---

# How form requirements, create/edit modes, and validation differ

Every meaningful rendered field is catalogued by component and stable F-number in [coverage matrix](../coverage_matrix.md) and its interface reference. Each lists exact label/placeholder or dynamic source, input type, binding, required flag, displayed/default value, disabled/read-only state, options and HTML limits. Backend field declarations/serializer read-only lists/validation are linked separately in [index](../reference/backend/index.md). Do not interpret a wrapper Field and its child input as two distinct business fields.

## Use a create form

1. Open its module page through a permitted portal and active branch.
2. Prepare dependencies: table/menu for order, table/rate for reservation, ingredient definitions for recipes/purchases, contractor for service invoice, active staff/profile for payroll.
3. Use the module’s exact create action. Enter required/conditional values in the order described; dependent dropdowns can clear amounts/choices.
4. Check calculations/read-only summaries; those are previews, server recomputes critical amounts.
5. Submit once; wait for saving state and server response. A native form can invoke browser required/type/min/max validation; a custom button can bypass it unless handler repeats checks.
6. On acknowledged success, inspect created record/list/status and continue next workflow. Multi-request item/recipe or invoice/attachment operations can partly succeed; inspect before repeating create.
7. On failure, read field/toast/banner message, correct real input/prerequisite, and retry only after checking for a saved record when response was ambiguous.

## Edit differences that matter

| Form | Create | Edit / caveat |
|---|---|---|
| Staff | Identity/role/profile/account creation; branch assignment | Password blank omitted, existing image preserved if no new file; branch-admin restrictions still apply. |
| Menu item | Category required; item and recipe requests may be separate | Update item/recipe operations; changing price does not rewrite existing price snapshots. |
| Platter | At least one positive composition line | Items list still required; add/remove composition affects future stock logic. |
| Ingredient | Quantity/cost forcibly0 | Definition/unit/threshold edit; no automatic stock unit conversion. |
| Table | Frontend name/capacity/rate required; available default | Rate edit affects computed reservation price; delete protected active relations. |
| Reservation | Future-time validation, booking overlap/capacity | Server past-create check does not apply identically on edit; charge recalculates; state can block edit. |
| Discount card | Create resets/navigates back | Edit Reset Form clears to initial blanks rather than restoring fetched values. |
| Supplier/Contractor | Active true by default | Edits identity/future availability, not existing payment amounts. |
| Purchase/contractor invoice | Draft/non-draft create | No general mounted invoice edit/void; approval, payments, attachments are separate actions. |
| Payroll | Generate draft for exact period/eligible staff | Regeneration can reset approved unpaid records; paid/any-payment records skipped. Profile edit affects future generation. |
| Expense | Creates derived AFN + history snapshot | Update recalculates conversion and writes changed-field history. |
| Settings | Existing restaurant record sectional updates | Empty restaurant values omitted; nullable branch overrides can clear to null. |

Server model defaults, serializer defaults and UI defaults are different layers. `null`, blank string, omitted field and zero are not interchangeable. For example, zero stock adjustment fails “All fields are required,” blank supplier means cash purchase, blank payroll staff selection means all eligible, blank usage limit means unlimited, and blank nullable branch override means inherit where consumed.

No generalized browser validation text is invented in this knowledge base: browser wording is environment-dependent. Fixed messages copied from code are identified in interface/backend reference. Source expressions mark dynamic messages/labels and their unresolved runtime values. See [verification register](../troubleshooting/verification_register.md) for manual verification boundaries.
