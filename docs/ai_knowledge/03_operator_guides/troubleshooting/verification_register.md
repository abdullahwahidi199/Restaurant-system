---
id: "operator_troubleshooting_verification_register"
title: "Implementation discrepancies and manual verification register"
module: "troubleshooting"
description: "Track source-visible discrepancies, unsupported workflows and required runtime acceptance checks; this register is QA context, not an active feature catalog."
keywords: ["troubleshooting", "implementation", "discrepancies", "manual", "verification", "register", "implementation discrepancy", "manual verification", "unmounted component"]
roles: []
related_docs: []
frontend_routes: []
source_references: ["frontend/src/App.jsx", "frontend/src/component/Admin/Inventory/InventoryPages.jsx", "frontend/src/component/Admin/settings/settingsConfig.js", "backend/backend/orders/models.py", "backend/backend/orders/views.py", "backend/backend/orders/tests.py", "backend/backend/inventory/services.py", "backend/backend/inventory/views.py", "backend/backend/users/payroll_services.py", "backend/backend/restaurants/data_migration.py", "backend/backend/restaurants/models.py", "frontend/src/component/kitchen/OrderDetailSidebar.jsx", "frontend/src/component/Admin/DailyProduction/ProductionCard.jsx", "frontend/src/api/ReauireAuth.jsx", "frontend/src/rootLayout.jsx", "frontend/src/component/Manager/orders/ManagerOrdersBase.jsx"]
status: "needs_verification"
---

# Implementation discrepancies and manual verification register

**Status: Needs Verification for runtime acceptance.** The discrepancies below are visible in inspected implementation; verification means confirm their user-visible impact in a suitable test deployment. They are not features to invent or defects fixed by this documentation task.

| ID | Source-verified observation | Operational guidance / missing runtime evidence |
|---|---|---|
| V01 | Frontend exact-role guards, two different HasStaffRole implementations, component `canManage`, per-method conditions and endpoint permissions differ. | Test each portal with real role fixtures; API permission is not guaranteed by visible route. |
| V02 | InventoryManager has Tables route; table API permits Admin/Manager/Waiter/Cashier/OperationsManager, excluding InventoryManager. | Treat Tables for InventoryManager as unavailable pending implementation verification. |
| V03 | InventoryManager lacks Procurement routes, while low-stock link constructs inventory-manager/procurement path; some detail links hardcode /admin/dashboard. | Do not teach broken cross-portal navigation as a valid workflow; permitted staff uses own mounted portal. |
| V04 | FinanceManager payroll approval icon can be rendered; approval endpoint only IsRestaurantAdmin. | Finance prepares; Admin/BranchAdmin approves. |
| V05 | Manager has User activity route/menu but no automatic monitor permission. | Explicit `users.monitor_user_activity` required; verify no default authorization assumed. |
| V06 | Several order status/item mutation endpoints use IsAuthenticated with scoped lookups rather than screen-specific roles; generic table APIs permit broader roles than visible setup UI. | Describe supported portal controls only; record policy discrepancy without bypass instructions. |
| V07 | Completed orders permit pending manual discount approval (test explicitly covers); delivered/cancelled block it. | Changes discount/total without refund or paid-metadata reversal; requires authorized review. |
| V08 | Bill printing sets printed flag; physical print cannot be confirmed, and payment is separate. Kitchen printed flags are per-line. | Test blocked/cancelled print dialogs, repeated print, stale flag updates and receipt output on real browser/printer. |
| V09 | Initial stock deduction iterates all lines including cancelled. Added lines deduct immediately, even on pending orders, without a per-line initial-deduction exclusion. Whole-order cancellation has no stock refund path. | Verify movement accounting in isolated fixtures; do not promise cancellation refund or exact-once deduction. |
| V10 | Pending quantity update skips nonpending IDs and ignores deleted_items; it does not reconcile every stock effect. Added items do not explicitly reset every progressed overall status. | Use dedicated line cancellation; verify ready/served-plus-added-line handoff and ledger before correction. |
| V11 | Frontend unavailable Add/empty cart/positive checks are not mirrored uniformly in generic create/add serializer. Delivery button handler does not invoke native form validation for all required-looking fields. | Enter complete real details and positive portions; test missing/negative inputs only in isolated environment. |
| V12 | Reservation.total_price ignores free type and reads current table rate; stored amount is0 for free, Order excludes free fee, display/deposit properties may differ. | Verify receipt vs server remaining for free bookings and changed table rates. |
| V13 | Reservation past-time prohibition is create-only; prepaid amount has no comprehensive custom nonnegative/≤charge validation; no automatic refund/no-show/expiry job established. | Do not promise these protections/automation; verify booking updates and actual collection. |
| V14 | Discount card create frontend requires dates/order/0–100; backend serializer lacks equivalent custom cross-field checks; apply checks expiry but not valid_from. Phone exact match. | Teach valid intended values, never eligibility bypass; verify future-start cards and formatted phone behavior. |
| V15 | Request discount UI requires Reason; backend accepts empty default. Pending duplicates not universally blocked; cap authority runs before reject action. | Avoid repeat submissions; over-admin-limit request may also fail rejection. |
| V16 | Supplier/contractor/payroll workspace initial list calls request first100 and use client tables/options. | Verify records/options beyond100; do not certify exhaustive payable/search views. |
| V17 | Draft purchase initially paid amount not persisted as pending payment; no-supplier UI clears initial payment though service supports broader payload. Invoice line/post edit/void UI absent. | Do not imply cash defaults record actual payment; inspect header/status and payment history. |
| V18 | Stock movement edit changes movement/current ingredient but does not comprehensively synchronize original purchase invoice line/payment ledger. | Review both records; no general invoice-reversal claim. |
| V19 | Transfer approval is not wrapped around both stock mutations/movements as one transaction. | After failure inspect source/destination; do not repeatedly approve or promise rollback. |
| V20 | Migration Modifiers is placeholder; units/ingredient-category steps may be no-op; stock/production/purchases/orders not copied. | Report skipped steps honestly; no modifier editor/onboarding wizard invented. |
| V21 | Branch QR public path uses restaurant `/menu/{slug}`, not unique branch path. | Scan URL and verify branch selection after QR changes. |
| V22 | ReceiptSettings component not registered in settings sections; stored printer/cash drawer/tax/service-charge fields do not establish hardware/tax integrations. Restaurant blank fields omitted; branch nullable blanks sent null. | Verify actual mounted controls and consumers; no Receipt tab/hardware/automatic tax guarantee. |
| V23 | Salary generation does not derive hours/deductions from attendance; monthly/weekly base not automatically prorated; same exact unpaid period can regenerate/reset approval; different overlapping periods not universally blocked. | Review periods and actual days/hours before approval; paid/payment records skipped. |
| V24 | Employment status, presence, authentication validity and attendance are separate; revocation scopes/permissions differ. | Test self/current/all-device revocation, branch isolation and reconnect on actual Redis/session deployment. |
| V25 | Some UI failures only log or collapse structured validation into generic text. Best-effort realtime may fail after committed data. | Test offline/retry/loading states; refresh record before repeating writes. |
| V26 | Imported/unmounted legacy UI: CustomersBaseModal, AnalyticsBaseModal, OrderCheckoutForm, CreateProductionModal, ReceiptSettings and alternate table/menu components may be retained but not rendered by current routes. | References mark unmounted components; their constraints are not the current page’s operating rules. |
| V27 | Web public/legacy and authenticated mobile marketplace ordering/cancellation use different APIs and contracts. | Test both clients, customer ownership, quote refresh, order retry and cancellation windows. Never generalize one client’s policy. |
| V28 | No mounted general leave approval, clock-in/out, arbitrary permission editor, customer partial order payments, refunds, credit notes, automatic bank/card execution, delivery-employee portal, universal undo/reopen. | Treat as absent, not Needs Verification of a proposed feature. |
| V29 | Table delete blocks active reservations but not active orders; category deletion cascades menu items. | Review dependencies; do not promise active-order deletion protection or undo. |
| V30 | FinanceManager can create/read/pay purchase invoices but approve endpoint excludes FinanceManager. Contractor API permits Inventory/Operations roles but those portals have no contractor routes. | Use a role with both a mounted workflow and actual endpoint permission; no URL/API bypass. |
| V31 | Salary advance Reason appears optional in UI but model/serializer requires nonblank; service-contract draft label can show Purchase translation. | Enter real reason; explain the actual sent status rather than assuming displayed draft label is accurate. |

| V32 | Mounted kitchen sidebar labels are Start Preparing / Mark as Ready / Print Bill; standalone OrderCard is unmounted. ProductionCard has Quantity / + Cook / − Reduce / Clear, while the custom-amount card is unmounted and clear passes refund=false. | Active guide wording was corrected from source; legacy references remain source-only, and live rendering/printing still needs verification. |
| V33 | The previous route-association inventory omitted RequireAuth, PortalLogoutButton and RootLayout despite their App/guard mounting. ManagerOrdersBase reuses the administrator OrdersTable; its separate ManagerOrdersTable is unmounted. | Shared-context classifications and guide statements were corrected; route association still does not prove each conditional button appears. |

## Manual acceptance checklist

Use a suitable isolated test deployment with approved disposable fixtures; this documentation task did not create data or run production actions.

1. For every staff role, sign in/select branch, verify menus/direct-route denial, demo restriction and protected buttons. Check custom role/explicit activity permissions separately.
2. Complete dine-in, takeaway, delivery and reserved/prepaid service; test two-station readiness, price snapshot, receipt/paid distinction, status guards and terminal retries.
3. Check cancelled/added/quantity-changed line stock movements, production shortage rollback and platter production exception against physical-business expectations.
4. Create/approve purchase, service and payroll drafts; partial/full payment and stale balance; check >100 record lists. Test no unintended duplicate payments after response loss.
5. Verify migration/transfer boundaries, branch deletion protections, QR destinations, settings consumers, attachments and file extension rejection.
6. Review English/fa/ps translations, mobile/responsive menus, dynamic labels, date/time localization, PDF fonts/RTL and real printer/popup behavior.
7. Verify SMS/OTP, geolocation, WhatsApp handoff, protected storage downloads, Redis/realtime reconnect and session revocation in configured deployment.

The repository is sufficient to document declared behavior but cannot establish working deployment credentials, external services, physical payment/printing, live data completeness, or absent runtime policies. These are the boundaries of this knowledge base, not permission to change application behavior.
