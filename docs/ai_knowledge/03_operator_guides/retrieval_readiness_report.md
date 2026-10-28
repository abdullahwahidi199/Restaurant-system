---
id: "operator_retrieval_readiness_report"
title: "Operator documentation retrieval-readiness report"
module: "coverage"
description: "Focused audit results, metadata and cross-reference repairs, source-only exclusions and remaining manual verification before a later indexing implementation."
keywords: ["retrieval readiness", "documentation audit", "metadata", "unmounted controls", "indexing preparation"]
roles: []
related_docs: ["operator_index", "operator_retrieval_conventions", "operator_coverage_matrix", "operator_qa_report", "operator_troubleshooting_verification_register", "operator_reference_source_disposition"]
frontend_routes: []
source_references: ["frontend/src/App.jsx", "frontend/src/api/ReauireAuth.jsx", "frontend/src/rootLayout.jsx", "frontend/src/component/kitchen/OrderDetailSidebar.jsx", "frontend/src/component/Admin/DailyProduction/DailyProduction.jsx", "frontend/src/component/Admin/DailyProduction/ProductionCard.jsx", "frontend/src/component/Manager/orders/ManagerOrdersBase.jsx", "frontend/src/component/Admin/dashboard/Notifications.jsx", "backend/backend/reports/views.py", "backend/backend/contractors/views.py"]
status: "source_verified"
---

# Operator documentation retrieval-readiness report

Reviewed on 2026-10-28: **all 326 existing Markdown documents**. The detailed knowledge base was refined in place. **328 documents** remain after adding this report and the [retrieval conventions](retrieval_conventions.md); no existing file or stable document ID was removed or replaced.

The structure is ready for a later indexer **provided it observes the documented type, availability and verification boundaries**. This is not live certification of every workflow. No indexing, catalog/search gateway, embeddings, chatbot functionality or application changes were implemented.

## Categories and focused changes

| Category | Files after refinement | Change |
|---|---|---|
| Primary module / role guides | 28 / 6 | Descriptive summaries and verified terminology; literal compound-role corrections; direct detail links from every module. |
| End-to-end workflows | 7 | Clear section boundaries; mounted kitchen labels corrected. Complete numbered procedures retained. |
| Forms | 2 | Improved discovery summaries; field tables and validation distinctions retained. |
| Navigation, including index | 5 | Linked category/availability rules; branch selector references now point directly to navigation procedure. |
| Troubleshooting | 1 | Improved error/recovery summary; existing technical detail retained. |
| Interface references | 227 | All retained. Nineteen source-only exceptions marked unmounted; three shared references corrected. JSX, escaped pipes, tables and action/field anchors preserved. |
| Backend references | 46 | Direct links back to supported procedures, clearer summaries and corrected namespace/functional-module distinctions. All declarations and validation/effect evidence retained. |
| QA / conventions / source inventory | 6 | Path-derived classification, explicit verification boundaries, repaired discrepancy table and current readiness report. |

Document type is derived from directories and a few exact-path QA exceptions, rather than a new redundant field in hundreds of files. `availability` is added only to the 19 unmounted exceptions and three shared references that directory/route inference previously misrepresented. Existing statuses were not upgraded. Role-neutral lists are explicitly documented as neither universal access nor denial.

## Problems found and fixed

- **No duplicate IDs, invalid frontmatter or broken relative links were found in the initial 326-file structural audit.** There was no reason to regenerate valid technical Markdown.
- Generic title-repeating descriptions were replaced for primary, workflow, form, role, navigation and troubleshooting entry points. Contractor approval, service invoice, outstanding amount and payment terms are now discoverable directly in its summary/headings.
- **48 technical references lacked a direct primary-procedure relationship.** Links were added to all 46 backend references and both branch-selection/switcher references; module guides now link directly to their relevant mounted control/field and server-rule references.
- Admin/BranchAdmin and specialist role-guide metadata used combined prose values. These now use separate verified role names. Role-neutral/endpoint-varying references no longer rely on “See access section” as a role filter. Backend `users`, `restaurants`, `otp` and `system` filenames retain their namespace while module metadata identifies employees, branches, public ordering and settings respectively.
- The original import/route association omitted **RequireAuth**, **PortalLogoutButton** and **RootLayout**. Their shared mounting, applicable context and coverage/source-inventory statements are corrected. Their previous `needs_verification` statuses remain unchanged; static mounting is not runtime evidence.
- Active kitchen instructions now use **Start Preparing**, **Mark as Ready** and **Print Bill**, with sidebar visibility and printing-mode conditions. The separate OrderCard remains an unmounted reference. ManagerOrdersBase is correctly described as reusing the administrator table/detail components.
- Production instructions use the mounted Quantity / Cook / Reduce / Clear controls. **Custom amount... / Apply / - Remove** belongs to an unmounted card; clear passes `refund=false`, so a backend refund option is not taught as a visible checkbox or alternate workflow.
- Dashboard **Mark read** behavior, reservation **Create Reservation** label and the difference between contractor portal access and broader API roles were clarified from code.
- A blank line detached **V29–V31** from the discrepancy table. Those rows are rejoined to the valid table; **V32–V33** record the additional source/mounting findings without removing earlier unresolved checks.
- One test reference omitted its containing class. It now resolves as `OrderPaymentIntegrityTests.test_paid_order_allows_pending_discount_approval`; the method and its evidence are unchanged.

## Verification and preservation

Final validation checks actual YAML parsing and required metadata types; unique IDs and related IDs; relative links and heading/explicit anchors; repository source files and qualified Python symbols; metadata routes against App.jsx declarations; and the continued presence of every original action/field anchor, coverage route/action/field row and reference file. Application-file scope is checked separately through Git status. Detailed per-file change reasons are maintained during this audit; the changed directory scopes are summarized below rather than duplicating the coverage matrix.

Results: **328 parseable documents with unique IDs**, **5,235 resolved relative links**, **1,378 resolved link fragments**, **1,264 valid related-document IDs**, **339 distinct existing source files**, and **103 resolved qualified Python symbol references**. No missing links/anchors, unresolved metadata references, heading-level jumps or identical complete-document bodies remain. The original **193 route**, **804 action** and **573 field** coverage entries and all original explicit action/field anchors are preserved. These checks establish structural integrity, not live behavior.

No application test suite, database tests or running UI was exercised in this refinement. The original [QA report](qa_report.md) retains its historical **41 frontend tests passed** result and original counts, clearly labeled as the earlier pass. Documentation checks do not elevate all instructions to automated-test verification.

Technical references remain supporting evidence. Their repeated property tables and cross-links are intentional, not duplicate procedures to merge. None was deleted for file-count reduction; primary guides were not replaced by generated outlines. Existing source expressions remain available to answer detailed permission, validation and state questions.

## Source-only documents excluded from active instructions

These 19 interface documents have explicit `availability: unmounted` and no referenced import path from the current App root. They remain fetchable for source/legacy questions, not as current controls or navigation. Their own references preserve detailed fields/actions.

- [Customer management FilterBar](reference/interface/component_admin_customers_filterbar.md)
- [CreateProductionModal](reference/interface/component_admin_dailyproduction_createproductionmodal.md)
- [ProductionItemCard](reference/interface/component_admin_dailyproduction_productionitemcard.md)
- [Legacy menu Catagories](reference/interface/component_admin_menumanagement_catagories.md)
- [Legacy management MenuList](reference/interface/component_admin_menumanagement_menulist.md)
- [ReceiptSettings](reference/interface/component_admin_settings_components_receiptsettings.md)
- [Legacy settings LanguageSwitcher](reference/interface/component_admin_settings_languageswitcher.md)
- [TakeawayCheckoutForm](reference/interface/component_cashier_components_takeawaycheckoutform.md)
- [Legacy customer MenuCard](reference/interface/component_customer_menucard.md)
- [Legacy customer MenuDetails](reference/interface/component_customer_menudetails.md)
- [Legacy customer PlatterDetails](reference/interface/component_customer_platterdetails.md)
- [Legacy kitchen FilterBar](reference/interface/component_kitchen_filterbar.md)
- [Legacy kitchen CategoriesListModal](reference/interface/component_kitchen_menu_categorieslistmodal.md)
- [Legacy kitchen MenuList](reference/interface/component_kitchen_menu_menulist.md)
- [Legacy kitchen OrderCard](reference/interface/component_kitchen_ordercard.md)
- [Legacy ManagerOrdersTable](reference/interface/component_manager_orders_managerorderstable.md)
- [Legacy ManagerTables](reference/interface/component_manager_tables_managertables.md)
- [OrderCheckoutForm](reference/interface/component_waiter_ordercheckoutform.md)
- [Standalone ThemeSwitcher](reference/interface/theme_themeswitcher.md)

Backend contracts, QA records and the customer/mobile handoff guide also require their documented retrieval scope. They are not all active staff operating instructions. Shared ERP/UI components delegate callbacks to their mounted parents; a route association does not mean every button is available to every listed role.

## Remaining checks and implementation discrepancies

All prior findings remain in the [verification register](troubleshooting/verification_register.md). In particular: InventoryManager table/procurement navigation conflicts; FinanceManager purchase/payroll approval restrictions; explicit Manager activity permissions; post-completion discounts without refunds; stock effects for cancelled/added lines; free-reservation totals; card start-date validation; first-100-record limits; transfer partial failures; migration placeholders; and stored settings without mounted integrations. Refining their documentation does not fix those behaviors.

Manual acceptance is still needed for role fixtures, conditional/responsive rendering, physical receipt/ticket printing, external SMS/OTP/WhatsApp, geolocation, storage downloads, realtime/cache infrastructure and actual transaction behavior. Static import reachability is a conservative mounting check, not proof a runtime branch renders. No uncertain behavior was filled in with a guessed workflow.

## Files changed and handoff

Edits are limited to this documentation tree: primary summaries/procedures and detail links; backend relationship/metadata refinements; exceptional interface availability/shared context; navigation/role metadata; coverage/source/QA reconciliation; and the verification register. Two documents were added: this report and `retrieval_conventions.md`. The [index](index.md) links both.

Relative to the starting documentation snapshot, **125 existing files changed**, **201 existing files are byte-for-byte unchanged**, and **2 files were added**. Most changes are targeted metadata and relationship additions; all 326 original documents and their IDs remain. No React, Django, model, migration, configuration or dependency file was modified.

Preserve stable document IDs and existing action/field links during the later indexing stage. Apply the path-derived categories and availability exceptions before using a document as an active instruction; consult primary procedures with exact technical evidence where necessary. The indexing implementation remains a separate task.
