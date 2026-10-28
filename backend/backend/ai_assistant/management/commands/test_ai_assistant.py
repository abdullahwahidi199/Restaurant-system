import json
import uuid

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import DatabaseError

from ai_assistant.errors import AssistantError
from ai_assistant.service import ConversationService
from ai_assistant.testing import DemoProvider


class Command(BaseCommand):
    help = "Exercise the assistant with an existing authorized account; choose explicit --mock or --live."
    requires_system_checks = []

    def add_arguments(self, parser):
        mode = parser.add_mutually_exclusive_group(required=True)
        mode.add_argument("--mock", action="store_true", help="No network: deterministic reference excerpt through the real orchestrator.")
        mode.add_argument("--live", action="store_true", help="Explicit paid provider smoke test; requires environment credentials.")
        parser.add_argument("--user-id", type=int, required=True)
        parser.add_argument("--question", required=True)
        parser.add_argument("--conversation-id", type=uuid.UUID)

    def handle(self, *args, **options):
        try:
            user = get_user_model().objects.get(pk=options["user_id"])
            self.stdout.write("Question: " + options["question"])
            service = ConversationService(provider=DemoProvider(options["question"]) if options["mock"] else None,
                                          observer=lambda event: self.stdout.write(json.dumps(event, ensure_ascii=False)))
            self.stdout.write("Limits: " + json.dumps({name: getattr(service.limits, name) for name in ("model_requests", "tool_calls", "fetched_sections", "evidence_characters", "turn_seconds")}, sort_keys=True))
            result = service.reply(user=user, question=options["question"], conversation_id=options.get("conversation_id"))
            self.stdout.write(json.dumps(result, ensure_ascii=False, indent=2))
        except get_user_model().DoesNotExist:
            raise CommandError("The selected account is not available.") from None
        except AssistantError as exc:
            raise CommandError(f"{exc.code}: {exc.message}") from None
        except DatabaseError:
            raise CommandError("Assistant storage is unavailable. Apply assistant migrations and select an authorized account.") from None
