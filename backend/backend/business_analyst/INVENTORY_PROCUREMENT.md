# Inventory and Procurement read-only Business Analyst tools

All 30 requested tools are implemented: 18 record/detail tools and 12 summary
tools. Inventory contains 18 tools (11 record, 7 summary); Procurement contains
12 tools (7 record, 5 summary). The existing 13 Contractor and 5 Expense tools
remain registered, for 48 total tools.

## Tool status and filter support

Every row below is implemented and registered. Names are case-insensitive
substrings. Detail/profile/ledger lookups require an ID or an unambiguous name
or stored invoice number. Ambiguity returns `AMBIGUOUS_RECORD`; callers can list
matches and select an ID. Missing/unauthorized detail records share the same
`RECORD_NOT_AVAILABLE` error. Lists return an empty authorized population.

`D` means `date`, or independently optional inclusive `date_from`/`date_to`;
single date and range parameters cannot be combined. Omitted dates mean all
history. `P` means bounded `page`/`page_size` with complete counts and stable
whitelisted `sort`. `G` means independently paginated aggregate groups,
`ranking=identity|highest|lowest` and `group_by=month|day` for trends. `I` means
ingredient ID/name; `S` supplier ID/name; `V` invoice ID/stored-number substring.

| # | Tool | Family/domain | Filters and date basis |
|---|---|---|---|
| 1 | `list_ingredients` | Record / Inventory | I, definition active status, unit, stock status, low/out-of-stock booleans, P; current only |
| 2 | `get_ingredient_details` | Detail / Inventory | I; current stock and recipe count |
| 3 | `list_ingredient_stocks` | Record / Inventory | Ingredient filters above, authorized `stock_branch_ids`, P; current only |
| 4 | `list_ingredient_recipe_usages` | Record / Inventory | I, menu item ID/name, P |
| 5 | `list_ingredient_purchase_history` | Record / Inventory | I, S, V, invoice status/posting, D on purchase date, P; default excludes drafts |
| 6 | `list_stock_movements` | Record / Inventory | I, movement type/type array, order ID, D on event timestamp, P; all eight types |
| 7 | `get_stock_movement_details` | Detail / Inventory | Movement ID |
| 8 | `list_low_stock_ingredients` | Record / Inventory | I, active status, unit, warning status/booleans, P; current only |
| 9 | `list_stock_transfers` | Record / Inventory | I, status, source/destination branch IDs, D on creation, P |
| 10 | `get_stock_transfer_details` | Detail / Inventory | Transfer ID |
| 11 | `list_stock_transfer_logs` | Record / Inventory | Required authorized parent transfer ID, exact action, D on log timestamp, P |
| 12 | `list_suppliers` | Record / Procurement | S, active status, P; account totals all-history |
| 13 | `get_supplier_details` | Detail / Procurement | S; current account and relation counts |
| 14 | `list_purchase_invoices` | Record / Procurement | I, S, V, invoice status/posting, D on purchase date, P |
| 15 | `get_purchase_invoice_details` | Detail / Procurement | V; independent lines/payments/attachments pages and bounded page size |
| 16 | `list_purchase_invoice_lines` | Record / Procurement | I, S, V, invoice status/posting, D on purchase date, P |
| 17 | `list_supplier_payments` | Record / Procurement | S, V, payment method, D on payment date, P |
| 18 | `get_supplier_ledger` | Record / Procurement | S, D on each transaction's date, chronological pagination |
| 19 | `get_inventory_summary` | Summary / Inventory | Ingredient/current-stock filters; no dates |
| 20 | `get_ingredient_summary` | Summary / Inventory | I, D on purchase/movement activity, G; current stock ignores dates |
| 21 | `get_low_stock_summary` | Summary / Inventory | Ingredient/current-warning filters; no dates |
| 22 | `get_stock_movements_summary` | Summary / Inventory | I, movement type/type array, order ID, D on event timestamp, G |
| 23 | `get_consumption_summary` | Summary / Inventory | I, source order/production, D on event timestamp, G |
| 24 | `get_waste_summary` | Summary / Inventory | I, D on waste event timestamp, G |
| 25 | `get_stock_transfers_summary` | Summary / Inventory | I, status, endpoints, D on creation timestamp, G |
| 26 | `get_suppliers_summary` | Summary / Procurement | S, active status, D on independent purchase/payment activity, G; current account totals all-history |
| 27 | `get_supplier_summary` | Summary / Procurement | S, D on independent purchase/payment activity, G; current account totals all-history |
| 28 | `get_purchase_invoices_summary` | Summary / Procurement | I, S, V, invoice status/posting, D on purchase date, G |
| 29 | `get_supplier_payments_summary` | Summary / Procurement | S, V, method, D on payment date, G |
| 30 | `get_procurement_summary` | Summary / Procurement | D on independent purchase/payment activity, G; current liabilities all-history |

## Files

Created:

- `inventory/selectors.py`: authorized read-only queries and business aggregates.
- `business_analyst/tests/test_inventory_procurement_tools.py`: synthetic fixtures,
  Django query/permission/integration tests, and scripted realistic requests.
- `business_analyst/tests/test_inventory_procurement_live.py`: explicitly opted-in
  live DeepSeek checks against the same isolated synthetic data.
- `business_analyst/INVENTORY_PROCUREMENT.md`: this implementation report.

Modified:

- `business_analyst/tools.py`: all 30 handlers, closed parameter/output schemas,
  registration, owning-app authorization integration and document access policies.
- `business_analyst/errors.py`: safe ambiguity error.
- `business_analyst/prompts.py`: stock/unit/movement/financial interpretation rules.
- `business_analyst/tests/test_contractor_tools.py`,
  `business_analyst/tests/test_expense_tools.py` and
  `business_analyst/tests/test_documents.py`: update assertions for the newly
  implemented domains while preserving existing contracts.
- `docs/ai_knowledge/restaurant_admin_knowledge_pack/business_ai_capability_map.json`:
  canonical contracts and domain descriptions, with one contract per line to
  keep the catalog within its existing 256 KB bound.

No model fields, migrations, inventory write services, chat UI, provider, model
selection, batch executor or Operator Mentor implementation changed.

## Reuse and new selectors

There was no existing `inventory/selectors.py`. The new selectors reuse current
models and the actual DRF view permission classes, `resolve_principal`, principal
bindings, staff branch availability/access methods, the existing tool registry,
schema validation, batch read-only SQL guard, evidence/citations and turn audit.
The existing Contractor and Expense selectors and contracts are unchanged.

The calculation definitions were checked against `Supplier` account properties,
`PurchaseInvoice.refresh_totals_and_status`, `remaining_balance`,
`create_purchase_invoice`, `post_purchase_invoice_inventory`,
`create_supplier_payment`, `supplier_ledger`, inventory API views/serializers,
production movement services and verified Admin documentation. Test purchases
and payments are created through the actual existing services.

`InventoryQueries` adds narrowly scoped current-position, recipe, invoice-line,
movement, transfer/log, supplier/invoice/payment and ledger selectors. Summary
methods aggregate the same authorized populations in the database, with correlated
financial subqueries and invoice-ID subqueries to prevent join multiplication.
They are explicitly marked as supporting read-only Business Analyst operations.
No generic report engine or separate domain tool infrastructure was added.

## Permissions

`inventory.selectors.inventory_operation_views` maps each operation to the actual
GET policies of every required source. `authorize_inventory` reloads the user,
resolves the existing principal, rejects stale/forged bindings, and applies those
DRF policies. It is shared by registry authorization and selector construction;
direct selector callers therefore receive the same checks.

Every base population additionally constrains restaurant and active branch,
including related supplier/invoice/ingredient/order rows. Shared ingredient
definitions are visible with only the selected branch's stock. Multi-branch stock
filters are checked against server-resolved active available branches and require
the existing all-branch access flag. No model-supplied tenant/role/scope is accepted.

Transfer reads use the existing GET rule: either endpoint must be the active
branch; both endpoints and the ingredient must belong to the restaurant. Log
queries first authorize their parent transfer. BranchAdmin GET visibility is
preserved even though the ordinary dashboard hides its transfer panel; no transfer
write/action permissions are granted. Foreign legacy actor references are redacted.
Transfer movement categories also require the transfer GET permission. Without it,
ordinary movement/ingredient summaries retain permitted activity and explicitly
list `excluded_movement_types`; explicit transfer-type requests are denied and
transfer movement detail IDs remain unavailable.
Invoice attachment metadata requires its existing view permission and matching
tenant/branch/parent; file contents and download URLs are not returned.

Roles remain distinct. For example, Kitchen_manager can read the directory/current
stock/warnings, but cannot read suppliers, payments, movements, recipes or transfer
details through these tools. FinanceManager retains the actual current recipe,
ingredient-detail and low-stock API restrictions. Other allowed roles are checked
operation by operation, including restaurant subscription/staff/branch status.

## Calculation definitions

- Branch-owned ingredient stock uses its `Ingredient` quantity/threshold/cost.
  Shared definitions use the matching `IngredientStock` row exclusively. A missing
  shared row returns unknown/null stock; it is never initialized or replaced with
  an unscoped global quantity. `valuation_complete` is false when unknown positions
  prevent a complete valuation; `valuation` sums known positions.
  `valuation_scope` explicitly includes inactive definitions unless filtered;
  the ordinary UI dashboard's active-only definition must not override this scope.
- Current stock value is current quantity times current recorded unit cost. The
  stored ingredient cost has two decimals; historical invoice unit price has four.
  Purchase posting can replace the current cost. Value is not FIFO/weighted-average
  valuation, historical purchase spending, COGS or monetary waste loss.
- Exactly zero is out-of-stock; positive quantity at/below threshold is low-stock.
  Legacy negatives are separate. Warning lists use quantity <= threshold plus
  exactly-zero stock (also with legacy negative thresholds), including inactive definitions unless filtered. Low and
  zero warning counts are disjoint here; no reorder quantities/forecasts are inferred.
- Every movement category is retained. Negative and positive quantities are
  reported separately. Net recorded usage/waste is minus the signed net movement;
  positive corrections can make usage negative. Consumption includes only order,
  production and production_adjustment; manual adjustments/waste/transfers are
  separate categories. Event time does not establish order completion time.
- Quantities are grouped by original physical unit and ingredient. Raw numeric
  rankings preserve units and cannot establish comparable cross-unit physical
  consumption. No incompatible quantities are added into one total.
- Recognized purchase charges exclude draft invoices regardless of posting flag.
  Draft face values/counts remain separate. Posting and payment status are distinct.
  Ingredient-specific analysis sums selected historical lines; whole matching
  invoice charges/paid/remaining are explicitly labeled as an invoice cohort.
- Supplier-linked invoice paid uses all matching recorded payment rows, capped at
  current invoice total; supplierless paid uses its directly stored amount, capped
  at total. Draft paid/remaining contribute zero recognized settlement. Remaining
  is max(total - effective paid, 0). Stored paid is also returned for inspection.
- Supplier debt is max(all-history non-draft charges - all-history recorded supplier
  payments, 0), floored per supplier. The aggregate net-first balance and sum of
  per-invoice remaining are separately reported because corrections can make all
  three figures differ. Supplierless invoices are separate from supplier accounts.
- Activity purchases use `purchase_date`; payments use `SupplierPayment.date`.
  Current balances ignore activity dates. Timestamp dates use explicit Asia/Kabul
  day boundaries; no ambient timezone or implicit last-month restriction applies.
- Ledger ordering matches the existing service (date, invoice-before-payment, ID).
  Opening balance is earlier qualifying debits minus credits; running balances are
  signed, including negatives, and remain correct after pagination. Closing is
  opening plus selected debits minus selected credits. Decimal reconstruction
  avoids the existing service's float conversion and unbounded record load.
- Approved transfer quantity counts one request once; pending request quantities
  are separate. Rejected/cancelled requests are never completed movements.

## Capability Map and verification

Both domains contain canonical invocation/output contracts and relevant verified
document IDs, with concise selection descriptions. DeepSeek receives them through
the existing map accompanying every request, with the existing single batch API;
no discovery call, dataset preload or additional reasoning model was introduced.
The catalog retains the same 78 documents and all existing domains/tools.

Final verification:

| Check | Result |
|---|---|
| Django Business Analyst, Inventory, Contractors, Expenses and production-movement suite | 164 collected: 163 passed, 1 explicitly opt-in live test skipped; 130.738 seconds |
| New Inventory/Procurement Django tests | All 28 pass within that suite; all 30 handlers executed through real read-only batches |
| Final focused registration, source-permission and supplier-ranking checks | 3 passed after the final changes |
| Realistic scripted Analyst scenarios | All 12 pass through the real service, retrieval, citations and audit pipeline; model selections explicitly scripted |
| Live DeepSeek scenarios | All 12 completed with real provider calls, verified sources and completed audits; one Django test passed in 114.778 seconds |
| Existing frozen Mentor evaluation checks | Three cases pass using temporary LF-normalized copies of the existing evaluation fixtures; production files unchanged |
| Syntax, Django system checks, canonical Capability Map and Git whitespace checks | Passed |

The live suite uses synthetic records in the isolated SQLite test database and
the existing configured provider/model. It does not send production restaurant
records. Credentials remain in the existing server configuration and are never
written to the output artifacts. The first connection attempt was blocked by
Windows sandbox socket permissions; the authorized network-enabled run succeeded.

Live selection included complete ingredient profiles/recipes, low stock, September
consumption/adjustments, August waste, October transfer statuses, complete supplier
profiles, purchases-versus-payments, outstanding-balance ranking, monthly procurement
comparison, current valuation, and the distinction between valuation and purchase
spending. Current-valuation assertions check both the amount and its population:
the synthetic AFN 390.175 known-position value includes inactive records and is
explicitly incomplete because one shared branch stock position is unknown.
September supplier activity correctly distinguishes AFN 47.04 recognized purchases
from AFN 10 recorded payments against an August invoice; current debt stays separate.

Manual review of an earlier live answer identified the model applying the ordinary
dashboard's active-only definition to the broader tool population. The final output
now includes `valuation_scope` and `valuation_complete`, with explicit Analyst prompt
guidance; the subsequent live run passed semantic assertions for this distinction.

Extended Mentor/knowledge regression execution found existing Windows fixture
issues: the default published index is inconsistent for some API checks, while the
existing validated `E:/pakhlai/retry-test-knowledge-index` works. Three frozen dataset
hash checks fail on CRLF checkout bytes. For `questions.jsonl`, LF normalization
reproduces the configured SHA-256 exactly
(`3a6321bd5150f8d5758d630219e9b8a4a04732245677b9d53a00f8d54143b53e`).
Those three tests, including the 104-case retrieval/citation comparison, pass with
temporary normalized fixture copies. The repository fixtures, hashes, Mentor code,
index configuration and runtime behavior were not changed. A raw full-suite command
in this Windows checkout still needs that existing fixture/index setup corrected.

Run the offline domain suite from `backend/backend`:

```powershell
E:\pakhlai\.venv\Scripts\python.exe manage.py test business_analyst inventory contractors expenses menu.test_production_movements --settings=business_analyst.tests.settings --noinput
```

The live suite is opt-in:

```powershell
$env:BUSINESS_ANALYST_LIVE_INVENTORY = '1'
E:\pakhlai\.venv\Scripts\python.exe manage.py test business_analyst.tests.test_inventory_procurement_live --settings=business_analyst.tests.settings --noinput
```

Generated verification artifacts outside the Git repository:

- `E:/pakhlai/inventory_procurement_tests.txt`
- `E:/pakhlai/inventory_procurement_regressions.txt` (initial extended diagnostic run)
- `E:/pakhlai/inventory_procurement_final_regressions.txt` (extended run with a validated Mentor index)
- `E:/pakhlai/inventory_procurement_domain_regressions.txt` (final domain suite)
- `E:/pakhlai/inventory_procurement_final_checks.txt` (final focused registration/permission/ranking checks)
- `E:/pakhlai/inventory_procurement_live_tests.txt`
- `E:/pakhlai/inventory_procurement_live_results.json` (the 12 final live scenario responses and selected tools)
- `E:/pakhlai/inventory_procurement_mentor_fixture_checks.txt`

## Existing-model limitations

- Current shared-stock service helpers presently return `Ingredient` and
  `uses_shared_ingredients` returns false. The explicitly requested branch-aware
  AI read uses stored `IngredientStock` rows for shared definitions without
  changing those write/UI helpers. A missing row cannot establish branch stock.
- Stock movements do not establish a complete historical balance. No historical
  stock snapshot, inventory forecast or historical monetary waste loss is invented.
- Production-adjustment signs are available, but not a finer immutable reason
  taxonomy or a guaranteed order completion timestamp.
- Transfers are filtered by creation date. Approval timestamps are returned, but
  a separate approval-date query/filter is not advertised.
- Ledgers reconstruct mutable current records and are not immutable historical
  accounting snapshots. There is no independent supplier-credit/opening-account
  model; range openings derive only from earlier recorded charges/payments.
- Aggregate groups and relation lists are bounded and paginated. Totals always
  cover the entire matching authorized population, including groups beyond page 1.
- Precision/unit separation is preserved; there is no invented conversion or
  meaningful common ranking across mass, volume and pieces.
