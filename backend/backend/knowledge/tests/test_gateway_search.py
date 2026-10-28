import unittest

from knowledge.errors import GatewayError
from knowledge.tests.gateway_helpers import INDEX_ROOT, identity, repository_gateway


@unittest.skipUnless(INDEX_ROOT.is_dir(), "Build the generated index to run gateway repository tests.")
class RepositorySearchTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.gateway, cls.index, cls.current = repository_gateway()

    def setUp(self):
        self.current["principal"] = identity()

    def search(self, query, **kwargs):
        return self.gateway.search_documentation(user=object(), query=query, **kwargs)

    def test_actual_operational_procedures(self):
        examples = [
            ("How do I record a payment for a contractor invoice?", "operator_modules_contractors_services"),
            ("How do I create a supplier purchase invoice?", "operator_modules_procurement_purchasing"),
            ("How do I collect customer payment and mark an order paid at cashier?", "operator_modules_billing_cashier"),
            ("How do I record employee attendance?", "operator_modules_employees_attendance_shifts"),
            ("How do I create a menu item?", "operator_modules_menu_menu"),
            ("How does the kitchen prepare orders and mark items ready?", "operator_modules_kitchen_preparation"),
            ("How do I create a table reservation?", "operator_modules_reservations_reservations"),
            ("How do I adjust inventory stock after a count?", "operator_modules_inventory_stock"),
            ("How do I approve a discount request?", "operator_modules_discounts_requests"),
            ("Where do I sign in and choose a branch?", "operator_navigation_application_navigation"),
            ("Which fields are required for a contractor invoice?", "operator_modules_contractors_services"),
            ("What should I do after a network error or failed save?", "operator_troubleshooting_errors_and_recovery"),
        ]
        for query, expected in examples:
            with self.subTest(query=query):
                response = self.search(query, limit=8)
                self.assertIn(expected, [r["document_id"] for r in response["results"]])
                self.assertEqual(response["query"], query)
                for result in response["results"]:
                    self.assertIsNotNone(self.index.get_section(result["section_id"]))
                    self.assertNotIn("content", result)

    def test_exact_title_and_identifier_rank_first(self):
        did = "operator_modules_contractors_services"
        document = self.index.get_document(did)
        for query in (did, document["title"]):
            self.assertEqual(self.search(query)["results"][0]["document_id"], did)
        section = next(self.index.get_section(sid) for sid in document["section_ids"] if self.index.get_section(sid)["heading"] == "Record a contractor payment and outstanding balance")
        self.assertEqual(self.search(section["heading"])["results"][0]["section_id"], section["section_id"])

    def test_misleading_module_and_topics_do_not_hide_original_question(self):
        result = self.search("How do I pay a contractor invoice?", module="payroll", topics=["salary"], limit=8)
        self.assertIn("operator_modules_contractors_services", [r["document_id"] for r in result["results"]])
        self.assertEqual(result["query"], "How do I pay a contractor invoice?")

    def test_ambiguous_payments_are_diverse_and_deterministic(self):
        first = self.search("How do I pay someone?")
        second = self.search("How do I pay someone?")
        self.assertEqual(first["results"], second["results"])
        modules = {r["module"] for r in first["results"]}
        self.assertGreaterEqual(len(modules.intersection({"billing", "procurement", "contractors", "payroll", "expenses"})), 3)

    def test_verified_aliases_and_exact_phrases_keep_the_payment_domain(self):
        for query in ('How do I settle a contractor bill?', '"Record a contractor payment"'):
            with self.subTest(query=query):
                response = self.search(query)
                self.assertEqual(response["results"][0]["document_id"], "operator_modules_contractors_services")
                self.assertEqual(response["results"][0]["title"], "Record a contractor payment and outstanding balance")

    def test_actual_dari_and_pashto_literals_in_indexed_references(self):
        self.current["principal"] = identity(superuser=True)
        for query in ("ذخیره", "خوندي کول"):
            with self.subTest(query=query):
                response = self.search(query)
                self.assertTrue(response["results"])
                self.assertEqual(response["query"], query)
                self.assertTrue(any(query.split()[0] in self.index.get_section(r["section_id"])["content"] for r in response["results"]))

    def test_form_only_module_is_discoverable_for_call_operator(self):
        self.current["principal"] = identity("Call_operator")
        response = self.gateway.search_documentation(user=object(), mode="browse", module="orders")
        self.assertIn("orders", {m["module"] for m in response["available_modules"]})
        self.assertIn("operator_forms_order_entry", response["module_context"]["documents"])
        self.assertEqual(response["results"][0]["document_id"], "operator_forms_order_entry")

    def test_procedural_primary_over_technical_but_validation_is_discoverable(self):
        self.current["principal"] = identity(superuser=True)
        result = self.search("How do I record a contractor payment?", limit=10)
        self.assertEqual(result["results"][0]["document_type"], "operator_guide")
        validation = self.search("contractors validation errors serializer payment amount invoice", limit=15)
        self.assertIn("backend_reference", {r["document_type"] for r in validation["results"]})

    def test_browse_capabilities_module_list_and_safe_unknown_module(self):
        overview = self.gateway.search_documentation(user=object(), mode="browse")
        self.assertTrue(overview["available_modules"])
        self.assertIsNone(overview["search_token"])
        browsed = self.gateway.search_documentation(user=object(), mode="browse", module="contractors", limit=3)
        self.assertEqual(browsed["result_count"], 3)
        self.assertTrue(all(r["module"] == "contractors" for r in browsed["results"]))
        self.assertTrue(browsed["module_context"]["capabilities"])
        next_page = self.gateway.search_documentation(user=object(), mode="browse", module="contractors", limit=3, offset=browsed["next_offset"])
        self.assertFalse({r["section_id"] for r in browsed["results"]}.intersection(r["section_id"] for r in next_page["results"]))
        empty = self.gateway.search_documentation(user=object(), mode="browse", module="no_such_module")
        self.assertEqual(empty["results"], [])

    def test_role_filters_apply_to_results_and_capability_previews(self):
        self.current["principal"] = identity("Waiter")
        response = self.search("contractor payroll salary supplier", module="payroll", limit=15)
        self.assertNotIn("payroll", {m["module"] for m in response["available_modules"]})
        self.assertIsNone(response["module_context"])
        self.assertTrue(all(r["module"] not in {"payroll", "contractors", "procurement"} for r in response["results"]))
        self.assertEqual(self.gateway.search_documentation(user=object(), mode="browse", module="payroll")["results"], [])

    def test_no_results_does_not_invent_or_substitute_workflows(self):
        response = self.search("qzxyvbnmlkjhgfd")
        self.assertEqual(response["results"], [])
        self.assertEqual(response["result_count"], 0)
        self.assertIsNone(response["search_token"])
        self.assertIn("No matching authorized", response["explanation"])

    def test_runtime_schema_limits_and_unknown_tools(self):
        bad_arguments = [{"query": ""}, {"query": "x", "limit": 16}, {"query": "x", "limit": True}, {"query": "x", "user_id": 1}, {"query": "x", "module": "../../.env"}, {"query": "x", "topics": ["x"] * 9}, {"query": "x", "offset": 1}, {"mode": "other"}, {"query": "x" * 513}]
        for arguments in bad_arguments:
            with self.subTest(arguments=arguments), self.assertRaises(GatewayError):
                self.gateway.execute(name="search_documentation", arguments=arguments, user=object())
        with self.assertRaises(GatewayError):
            self.gateway.execute(name="__import__", arguments={}, user=object())
