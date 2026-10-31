# Minimal Contractors test data

From `backend/backend`, using the Python environment with the backend dependencies:

```powershell
python manage.py seed_contractor_test_data --restaurant RESTAURANT_ID --branch BRANCH_ID --dry-run
python manage.py seed_contractor_test_data --restaurant RESTAURANT_ID --branch BRANCH_ID --confirm seed:RESTAURANT_ID:BRANCH_ID
python manage.py seed_contractor_test_data --restaurant RESTAURANT_ID --branch BRANCH_ID --cleanup --dry-run
python manage.py seed_contractor_test_data --restaurant RESTAURANT_ID --branch BRANCH_ID --cleanup --confirm cleanup:RESTAURANT_ID:BRANCH_ID
```

Select the existing restaurant and the branch selected in the application. Both IDs are mandatory; a branch from another restaurant is rejected. Dry-run is read-only. Writes require the exact action and scope confirmation token. Each invocation runs atomically and locks the selected branch to serialize seed/cleanup invocations.

The fixture creates 4 contractors (3 active, 1 inactive), 4 contracts (active, completed, draft, expired), 6 invoices, 8 lines and 5 payments. It uses the existing invoice/payment services. It creates no restaurant, branch, user, audit, expense or other-module records. Contacts use reserved `.invalid` email addresses.

All contractor names and contract titles begin with `[TEST:contractors-sep-oct-2026-v1]`. Invoice numbers are `TEST-CS26-01` through `06`; payment references are `TEST-CS26-P01` through `P05`. Descriptions/notes also identify test data. Line items belong only to marked invoices.

| Invoice | Contractor | Date | Total | Paid | Remaining recognized debt | Current status |
| --- | --- | --- | ---: | ---: | ---: | --- |
| TEST-CS26-01 | Kabul Cooling Services | 2026-09-05 | 6,000 | 3,000 | 3,000 | partially_paid |
| TEST-CS26-02 | Safai Kitchen Care | 2026-09-12 | 3,000 | 3,000 | 0 | paid |
| TEST-CS26-03 | Pamir Pest Control (inactive) | 2026-09-18 | 2,500 | 0 | 2,500 | approved |
| TEST-CS26-04 | Kabul Cooling Services | 2026-10-05 | 4,000 | 4,000 | 0 | paid |
| TEST-CS26-05 | Safai Kitchen Care | 2026-10-12 | 3,500 | 1,500 | 2,000 | partially_paid |
| TEST-CS26-06 | Balkh Electrical Works | 2026-10-20 | 1,800 | 0 | 0 (draft excluded) | draft |

Contract agreement values total 37,000; these are not invoice debt. Recognized service charges: Maintenance 10,000; Cleaning 6,500; Pest Control 2,500. Electrical 1,800 is draft only and is excluded from recognized service-type totals.

| Activity period | Recognized charges | Payments | Net activity |
| --- | ---: | ---: | ---: |
| September 2026 | 11,500 | 5,000 | 6,500 |
| October 2026 | 7,500 | 6,500 | 1,000 |
| Total | 19,000 | 11,500 | 7,500 |

Payments: cash 2,000; bank transfer 4,000 (two payments); card 4,000; mobile money 1,500. One October bank transfer pays the September refrigeration invoice, exercising the tools' separate invoice/payment date semantics. Current all-time outstanding remains 7,500 under either period filter. Contractor balances are Cooling 3,000, Cleaning 2,000, Pest Control 2,500, Electrical 0. Pest Control and Electrical have no payments.

The command prints actual database IDs. A signed ownership manifest in the first contractor's notes records exact IDs and a fingerprint of every seeded row. Repeating the command validates that manifest and performs no writes. Cleanup verifies the signature, scope, unchanged fields and all reverse dependencies (including nullable contract references), then deletes only manifest IDs in payment/line/invoice/contract/contractor order. An edited seed row, missing row, additional dependent record, invalid manifest, or changed signing key causes refusal without changes. Keep the manifest intact; inspect and resolve such conflicts manually before cleanup. Cleanup itself is idempotent.

Verification tests invoke all 13 existing Contractors Business Analyst tools, validate their output schemas and check period activity, current balances, statuses, service types and ledgers:

```powershell
python manage.py test contractors.tests business_analyst.tests.test_contractor_tools --noinput
```

Tests run against Django's separate test database. They also verify read-only dry-run, scope/confirmation requirements, repeat runs, rollback on failure, safe cleanup, and preservation of unrelated Contractor data. No business logic or AI infrastructure is changed.

## Verified local seed: 31 October 2026

User-confirmed scope: **Afiyat, restaurant 2 / Main Branch, branch 1**. Existing contractors Asanlink and Zark were preserved. The other restaurant was untouched.

| Record type | Created IDs |
| --- | --- |
| Contractors | 4 Cooling, 5 Cleaning, 6 Electrical, 7 Pest Control |
| Service contracts | 1 Cooling, 2 Cleaning, 3 Electrical, 4 Pest Control |
| Invoices | 3–8, corresponding to TEST-CS26-01 through TEST-CS26-06 |
| Invoice lines | 3–10 |
| Payments | 5–9, corresponding to TEST-CS26-P01 through TEST-CS26-P05 |

Exact commands from `E:\pakhlai\Restaurant-system\backend\backend` with the workspace environment:

```powershell
E:\pakhlai\.venv\Scripts\python.exe manage.py seed_contractor_test_data --restaurant 2 --branch 1 --dry-run
E:\pakhlai\.venv\Scripts\python.exe manage.py seed_contractor_test_data --restaurant 2 --branch 1 --confirm seed:2:1
E:\pakhlai\.venv\Scripts\python.exe manage.py seed_contractor_test_data --restaurant 2 --branch 1 --cleanup --dry-run
E:\pakhlai\.venv\Scripts\python.exe manage.py seed_contractor_test_data --restaurant 2 --branch 1 --cleanup --confirm cleanup:2:1
```

Live verification hashed every existing model row before seeding and compared it afterward: **1,419,198 existing rows unchanged; exactly 27 rows added**. A second seed invocation performed no writes. Cleanup dry-run identified exactly those 27 rows; actual live cleanup was not performed, so the fixture remains available. Verification, the repeated seed, and cleanup dry-run left the resulting database unchanged.

All **13 existing Contractors tool handlers** executed with the existing Afiyat administrator's authoritative scope and passed their parameter/output schema validation. Listings, profile/contract/invoice details, payment-method totals, invoice-status/service-type summaries, September/October totals and all four contractor ledgers reconciled with the tables above. These verification calls made no business writes.

**Existing infrastructure limitation:** 12 of 13 tools also succeeded through the production `BatchExecutor`. `get_contractor_ledger` fails there with `READ_ONLY_VIOLATION`. PostgreSQL's UNION row query begins with a parenthesized SELECT, while the existing executor guard accepts only statements beginning with SELECT. Direct ledger-handler results are correct. The existing test `ContractorToolTests.test_all_thirteen_tools_execute_in_read_only_batch_without_business_writes` reproduced the same failure independently. Per scope, no executor, selector, business logic or AI tools were modified.

Test results: all 5 new seed tests passed; 34 of 35 existing Contractors Analyst tests passed, with the batch-ledger test above failing. Live idempotence and cleanup planning also passed. The isolated existing batch-ledger test reproduced its failure.

Detailed live results: `E:\pakhlai\contractor_seed_verification.json`. One-off verification runner: `E:\pakhlai\verify_contractor_seed.py` (hard-coded to this confirmed local scope; not part of the management command).
