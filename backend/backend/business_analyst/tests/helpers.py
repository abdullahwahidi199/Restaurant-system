import json
from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from ai_assistant.provider import Completion, ToolCall
from ai_assistant.testing import ScriptedProvider
from restaurants.models import Branch, Restaurant, Subscription
from users.models import Staff

from business_analyst.documents import DocumentRepository
from business_analyst.registry import ToolDefinition, ToolRegistry

DOC = "admin_dashboard_sales_meaning"
OTHER_DOC = "admin_dashboard_sales_trend"
ADMIN_DOC = "admin_administration_branch_migration"


def batch(documents=(DOC,), tools=(), call_id="retrieve_1"):
    return Completion(tool_calls=(ToolCall(call_id, "retrieve_business_context", json.dumps({
        "document_ids": list(documents), "tools": list(tools)})),), finish_reason="tool_calls")


def final(content="Sales are order values, not verified cash collections or profit.", citations=("b1:0",), kind="answer"):
    return Completion(json.dumps({"kind": kind, "content": content, "citations": list(citations)}))


def invocation(identity="test.echo", invocation_id="echo_1", **parameters):
    return {"invocation_id": invocation_id, "tool_id": identity, "parameters": parameters}


def definition(**overrides):
    values = {"id": "test.echo", "description": "Test only bounded echo; never production.", "domain": "dashboard",
              "parameters": {"type": "object", "additionalProperties": False, "required": ["amount"],
                             "properties": {"amount": {"type": "integer", "minimum": 0, "maximum": 10},
                                            "label": {"type": "string", "enum": ["test", "other"], "default": "test"}}},
              "output": {"type": "object", "additionalProperties": False, "required": ["value", "label"],
                         "properties": {"value": {"type": "integer"}, "label": {"type": "string"}}},
              "knowledge_ids": (DOC,), "authorize": lambda context, params: context.principal.role == "Admin",
              "handler": lambda context, params: {"value": params["amount"], "label": params["label"]}}
    values.update(overrides)
    return ToolDefinition(**values)


class DatabaseFixture(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.restaurant = cls.make_restaurant("analyst")
        cls.foreign_restaurant = cls.make_restaurant("foreign")
        cls.branch = Branch.objects.create(restaurant=cls.restaurant, name="One", code="BA-1")
        cls.second_branch = Branch.objects.create(restaurant=cls.restaurant, name="Two", code="BA-2")
        cls.foreign_branch = Branch.objects.create(restaurant=cls.foreign_restaurant, name="Foreign", code="BA-3")
        cls.admin = cls.staff_user("analyst-admin", "Admin", "0712345601")
        cls.other = cls.staff_user("analyst-other", "Admin", "0712345602")
        cls.branch_admin = cls.staff_user("analyst-branch-admin", "BranchAdmin", "0712345603")
        cls.waiter = cls.staff_user("analyst-waiter", "Waiter", "0712345604")

    @classmethod
    def make_restaurant(cls, name):
        restaurant = Restaurant.objects.create(name=name, email=f"{name}@example.invalid", phone=name, address="Fixture")
        Subscription.objects.create(restaurant=restaurant, starts_at=timezone.now().date() - timedelta(days=1),
                                    expires_at=timezone.now().date() + timedelta(days=30), is_active=True, max_branches=8)
        return restaurant

    @classmethod
    def staff_user(cls, username, role, phone):
        user = User.objects.create_user(username=username, password="test-password")
        staff = Staff.objects.create(user=user, restaurant=cls.restaurant, active_branch=cls.branch,
                                    name=username, role=role, email=f"{username}@example.invalid", phone=phone)
        staff.branches.add(cls.branch)
        return user

    def setUp(self):
        self.documents = DocumentRepository()

    def registry(self, *tools):
        registry = ToolRegistry(self.documents)
        for tool in tools:
            registry.register(tool)
        return registry.freeze()
