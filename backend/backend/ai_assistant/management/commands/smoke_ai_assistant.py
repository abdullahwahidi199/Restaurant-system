"""Explicitly opt-in paid checks through the real authenticated Django route."""
import json
from dataclasses import replace
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.test import override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from ai_assistant.config import Limits
from ai_assistant.errors import AssistantError
from ai_assistant.provider import DeepSeekProvider
from ai_assistant.service import ConversationService


class BudgetProvider:
    def __init__(self, maximum=10, used=0):
        self.maximum, self.used = maximum, used
        self.calls = []
        self.provider = DeepSeekProvider()

    def complete(self, **kwargs):
        if self.used >= self.maximum:
            raise AssistantError("smoke_request_cap", "The live smoke-test request cap was reached.", 422)
        self.used += 1  # Count attempts, including timeouts, before transport.
        record = {"number": self.used, "usage": {}}
        self.calls.append(record)
        try:
            result = self.provider.complete(**kwargs)
            record.update(usage=result.usage, tools=[call.name for call in result.tool_calls], status="ok")
            return result
        except AssistantError as exc:
            record.update(status=exc.code, provider_http_status=exc.provider_http_status)
            raise


class Command(BaseCommand):
    help = "Opt-in paid DeepSeek/HTTP endpoint smoke tests; never invoked by the routine test suite."

    def add_arguments(self, parser):
        parser.add_argument("--live", action="store_true", required=True)
        parser.add_argument("--user-id", type=int, required=True)
        parser.add_argument("--max-requests", type=int, default=10)
        parser.add_argument("--prior-requests", type=int, default=0)

    def handle(self, *args, **options):
        maximum, prior = options["max_requests"], options["prior_requests"]
        if not 1 <= maximum <= 10 or not 0 <= prior <= maximum:
            raise CommandError("Use a total request cap of 1–10 and a valid prior attempt count.")
        user = get_user_model().objects.filter(pk=options["user_id"], is_active=True).first()
        if not user:
            raise CommandError("Select an existing active authorized user.")
        budget = BudgetProvider(maximum, prior)
        limits = replace(Limits.configured(), output_tokens=min(Limits.configured().output_tokens, 1200))
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Bearer " + str(AccessToken.for_user(user)))
        events, conversation = [], None
        real_init = ConversationService.__init__

        def observed_init(service, **kwargs):
            real_init(service, **kwargs, observer=lambda event: events.append(event))

        questions = [
            ("greeting", "Hello, how are you?"),
            ("operator", "How do I create a contractor invoice?"),
            ("followup", "What fields are required?"),
            ("multi_step", "How do I approve a contractor invoice and then record its payment?"),
            ("ambiguous", "How do I pay an invoice?"),
            ("unsupported", "How do I configure quantum teleportation for kitchen inventory?"),
            ("multilingual", "چگونه فاکتور قراردادی ایجاد کنم؟"),
        ]
        # Only test host validation/limits are overridden. Authentication, account
        # authorization, persistence, provider and gateway are the real code.
        with override_settings(ALLOWED_HOSTS=[*settings.ALLOWED_HOSTS, "testserver"], AI_ASSISTANT_LIMITS=limits.__dict__), \
                patch("ai_assistant.service.get_provider", return_value=budget), \
                patch.object(ConversationService, "__init__", observed_init):
            for name, question in questions:
                if budget.used >= maximum and name != "greeting":
                    self.stdout.write(json.dumps({"test": name, "status": "not_run_request_cap", "calls": 0}))
                    continue
                before, first_event = budget.used, len(events)
                data = {"message": question}
                if name == "followup" and conversation:
                    data["conversation_id"] = conversation
                response = client.post("/api/assistant/chat/", data, format="json")
                body = response.data
                if name == "operator" and response.status_code == 200:
                    conversation = body["conversation_id"]
                self.stdout.write(json.dumps({"test": name, "question": question, "http_status": response.status_code,
                    "calls": budget.used - before, "tools": events[first_event:], "response": body}, ensure_ascii=True))
                if response.status_code >= 500:
                    break  # Diagnose external failures before making more paid calls.
        self.stdout.write(json.dumps({"total_attempts_including_prior": budget.used, "model_calls": budget.calls}))
