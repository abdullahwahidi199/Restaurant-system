import copy
import time
from dataclasses import replace
from types import SimpleNamespace
from unittest.mock import Mock

from django.contrib.auth.models import AnonymousUser, User
from django.db import connection
from django.test import override_settings
from ai_assistant.errors import AssistantError
from users.models import Staff

from business_analyst.config import Limits
from business_analyst.context import ToolContext, principal_for
from business_analyst.errors import OperationError
from business_analyst.executor import BatchExecutor
from business_analyst.registry import ToolRegistry
from .helpers import ADMIN_DOC, DOC, OTHER_DOC, DatabaseFixture, definition, invocation


class ExecutorTests(DatabaseFixture):
    def execute(self, documents=(), tools=(), *, user=None, registry=None, limits=None, audit=None):
        user = user or self.admin
        principal = principal_for(user)
        executor = BatchExecutor(self.documents, registry or self.registry(definition()), limits or Limits(), audit=audit)
        return executor.execute({"document_ids": list(documents), "tools": list(tools)}, user=user,
                                binding=principal.binding, deadline=time.monotonic() + 20)

    def test_multiple_documents_without_business_tools(self):
        result = self.execute((DOC, OTHER_DOC))
        self.assertEqual([item["data"]["document_id"] for item in result["results"]], [DOC, OTHER_DOC])
        self.assertTrue(all(item["ok"] for item in result["results"]))

    def test_parameter_defaults_types_constraints_and_dispatch(self):
        valid = self.execute(tools=[invocation(amount=3)])
        self.assertEqual(valid["results"][0]["data"]["output"], {"value": 3, "label": "test"})
        for parameters in ({}, {"amount": True}, {"amount": "3"}, {"amount": -1}, {"amount": 11},
                           {"amount": 1, "label": "invalid"}, {"amount": 1, "branch_id": 99}, {"amount": float("nan")}):
            with self.subTest(parameters=parameters):
                result = self.execute(tools=[{"invocation_id": "a", "tool_id": "test.echo", "parameters": parameters}])
                self.assertEqual(result["results"][0]["error"]["code"], "INVALID_PARAMETERS")

    def test_registration_rejects_duplicate_unknown_knowledge_writes_and_unsafe_schema(self):
        registry = ToolRegistry(self.documents)
        registry.register(definition())
        with self.assertRaises(ValueError):
            registry.register(definition())
        for override in ({"id": "__import__('os')"}, {"read_only": False}, {"knowledge_ids": ("unknown",)},
                         {"id": None}, {"description": None}, {"knowledge_ids": (["invalid"],)},
                         {"domain": "unknown"}, {"authorize": None}, {"timeout_seconds": 100},
                         {"parameters": {"type": "object", "additionalProperties": True}},
                         {"output": {"$ref": "https://attacker.invalid/schema"}}):
            with self.subTest(override=override), self.assertRaises(ValueError):
                ToolRegistry(self.documents).register(definition(**override))
        for key in ("branch_id", "restaurant_id", "role", "permissions", "user_id"):
            schema = copy.deepcopy(definition().parameters)
            schema["properties"][key] = {"type": "string"}
            with self.assertRaises(ValueError):
                ToolRegistry(self.documents).register(definition(parameters=schema))
        nested = {"type": "object", "additionalProperties": False,
                  "properties": {"filters": {"type": "object", "additionalProperties": True}}}
        with self.assertRaises(ValueError):
            ToolRegistry(self.documents).register(definition(parameters=nested))

    def test_registration_copies_contracts_and_validates_defaults(self):
        tool = definition()
        registry = ToolRegistry(self.documents)
        registry.register(tool)
        tool.parameters["properties"]["amount"]["minimum"] = -999
        self.assertEqual(registry.get(tool.id).parameters["properties"]["amount"]["minimum"], 0)
        schema = copy.deepcopy(definition().parameters)
        schema["properties"]["label"]["default"] = 10
        with self.assertRaises(ValueError):
            ToolRegistry(self.documents).register(definition(parameters=schema))

    def test_mixed_failures_are_independent_and_do_not_leak_exception_details(self):
        denied = definition(id="test.denied", authorize=lambda context, params: False,
                            handler=Mock(side_effect=AssertionError("Must not run")))
        broken = definition(id="test.broken", handler=Mock(side_effect=RuntimeError("private SQL/password")))
        registry = self.registry(definition(), denied, broken)
        result = self.execute([DOC, "missing"], [invocation("test.denied", "deny", amount=1),
                                                invocation("test.broken", "fail", amount=1),
                                                invocation("test.echo", "pass", amount=2)], registry=registry)
        self.assertEqual([item["ok"] for item in result["results"]], [True, False, False, False, True])
        self.assertEqual([item.get("error", {}).get("code") for item in result["results"]],
                         [None, "INVALID_DOCUMENT_ID", "PERMISSION_DENIED", "EXECUTION_FAILED", None])
        self.assertNotIn("private SQL/password", str(result))

    def test_tool_authorization_uses_reloaded_context_and_is_independent_of_document_policy(self):
        seen = []
        def handler(context, parameters):
            seen.append(context.principal)
            return {"value": parameters["amount"], "label": parameters["label"]}
        tool = definition(authorize=lambda context, params: context.principal.role == "BranchAdmin", handler=handler)
        result = self.execute([DOC, ADMIN_DOC], [invocation(amount=1)], user=self.branch_admin, registry=self.registry(tool))
        self.assertEqual([item["ok"] for item in result["results"]], [True, False, True])
        self.assertEqual(seen[0].restaurant_id, str(self.restaurant.pk))
        self.assertEqual(seen[0].branch_id, str(self.branch.pk))
        denied = self.execute([DOC], [invocation(amount=1)], user=self.waiter)
        self.assertEqual([item["error"]["code"] for item in denied["results"]], ["PERMISSION_DENIED", "PERMISSION_DENIED"])

    def test_record_level_cross_tenant_and_branch_protection(self):
        for restaurant_id, branch_id, allowed in ((self.restaurant.pk, self.branch.pk, True),
                                                  (self.restaurant.pk, self.second_branch.pk, False),
                                                  (self.foreign_restaurant.pk, self.foreign_branch.pk, False)):
            record = SimpleNamespace(restaurant_id=restaurant_id, branch_id=branch_id)
            def handler(context, parameters):
                context.require_record_scope(record)
                return {"value": 1, "label": "test"}
            result = self.execute(tools=[invocation(amount=1)], registry=self.registry(definition(handler=handler)))
            self.assertEqual(result["results"][0]["ok"], allowed)
            if not allowed:
                self.assertEqual(result["results"][0]["error"]["code"], "PERMISSION_DENIED")

    def test_changed_context_between_operations_denies_remaining_operations(self):
        def audit(event, metadata):
            if event == "operation_finished":
                Staff.objects.filter(user=self.admin).update(active_branch=self.second_branch)
        result = self.execute([DOC, OTHER_DOC], audit=audit)
        self.assertTrue(result["results"][0]["ok"])
        self.assertEqual(result["results"][1]["error"]["code"], "PERMISSION_DENIED")

    def test_sql_writes_by_a_handler_are_blocked(self):
        def handler(context, parameters):
            User.objects.create(username="should-never-exist")
            return {"value": 1, "label": "test"}
        result = self.execute(tools=[invocation("test.write", amount=1), invocation(invocation_id="next", amount=2)],
                              registry=self.registry(definition(id="test.write", handler=handler), definition()))
        self.assertEqual(result["results"][0]["error"]["code"], "READ_ONLY_VIOLATION")
        self.assertTrue(result["results"][1]["ok"])
        self.assertFalse(User.objects.filter(username="should-never-exist").exists())

    def test_database_exception_rolls_back_only_the_failed_operation(self):
        def handler(context, parameters):
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM missing_test_only_table")
        result = self.execute(tools=[invocation("test.broken", amount=1), invocation(invocation_id="next", amount=2)],
                              registry=self.registry(definition(id="test.broken", handler=handler), definition()))
        self.assertEqual(result["results"][0]["error"]["code"], "EXECUTION_FAILED")
        self.assertTrue(result["results"][1]["ok"])

    def test_unregistered_tools_cannot_dispatch_or_import_python(self):
        for identity in ("not_registered", "os.system", "eval", "__import__"):
            result = self.execute(tools=[invocation(identity, amount=1)])
            self.assertEqual(result["results"][0]["error"]["code"], "TOOL_NOT_REGISTERED")

    def test_invalid_output_timeout_and_oversized_output_do_not_fail_peers(self):
        invalid = definition(id="test.invalid", handler=lambda context, params: {"value": "wrong", "label": "test"})
        def expired(context, params):
            ToolContext(context.principal, time.monotonic() - 1).check_deadline()
        timeout = definition(id="test.timeout", handler=expired)
        huge = definition(id="test.huge", handler=lambda context, params: {"value": 1, "label": "x" * 50000})
        result = self.execute([DOC], [invocation("test.invalid", "i", amount=1), invocation("test.timeout", "t", amount=1),
                                     invocation("test.huge", "h", amount=1)], registry=self.registry(invalid, timeout, huge))
        self.assertTrue(result["results"][0]["ok"])
        self.assertEqual([item["error"]["code"] for item in result["results"][1:]], ["INVALID_OUTPUT", "TIMEOUT", "OUTPUT_TOO_LARGE"])

    def test_batch_turn_and_document_size_limits_and_malformed_envelopes(self):
        result = self.execute([DOC, OTHER_DOC], limits=replace(Limits(), turn_operations=1))
        self.assertTrue(result["results"][0]["ok"])
        self.assertEqual(result["results"][1]["error"]["code"], "LIMIT_EXCEEDED")
        result = self.execute([DOC], limits=replace(Limits(), document_bytes=5))
        self.assertEqual(result["results"][0]["error"]["code"], "OUTPUT_TOO_LARGE")
        executor = BatchExecutor(self.documents, self.registry(), Limits())
        principal = principal_for(self.admin)
        for request in ({}, {"document_ids": DOC, "tools": []}, {"document_ids": [], "tools": []},
                        {"document_ids": [DOC] * 17, "tools": []}, {"document_ids": [DOC], "tools": [], "branch_id": 999}):
            result = executor.execute(request, user=self.admin, binding=principal.binding, deadline=time.monotonic() + 1)
            self.assertTrue(result["error"])

    def test_duplicate_tool_invocation_ids_are_rejected_independently(self):
        result = self.execute(tools=[invocation(amount=1), invocation(amount=2)])
        self.assertEqual([item["ok"] for item in result["results"]], [True, False])
        self.assertEqual(result["results"][1]["error"]["code"], "INVALID_PARAMETERS")

    def test_trusted_context_rejects_anonymous_invalid_profiles_and_superuser_without_scope(self):
        with self.assertRaises(AssistantError):
            principal_for(AnonymousUser())
        Staff.objects.filter(user=self.branch_admin).update(active_branch=self.second_branch)
        with self.assertRaises(AssistantError):
            principal_for(self.branch_admin)
        Staff.objects.filter(user=self.admin).update(active_branch=self.foreign_branch)
        with self.assertRaises(AssistantError):
            principal_for(self.admin)
        root = User.objects.create_superuser(username="root", password="test-password")
        with self.assertRaises(AssistantError):
            principal_for(root)
