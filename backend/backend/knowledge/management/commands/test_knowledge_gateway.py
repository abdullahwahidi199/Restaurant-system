"""Read-only CLI using a real account and the production documentation policy."""
import json

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import DatabaseError

from knowledge.errors import GatewayError
from knowledge.gateway import KnowledgeGateway


class Command(BaseCommand):
    help = "Search/fetch knowledge as an explicitly selected existing authenticated staff account (read-only)."
    requires_system_checks = []
    requires_migrations_checks = False

    def add_arguments(self, parser):
        parser.add_argument("--user-id", type=int, required=True, help="Existing authorized account ID; no role/branch overrides.")
        parser.add_argument("--query", default="")
        parser.add_argument("--module")
        parser.add_argument("--browse", action="store_true")
        parser.add_argument("--limit", type=int, default=5)

    def handle(self, *args, **options):
        try:
            user = get_user_model().objects.get(pk=options["user_id"])
        except get_user_model().DoesNotExist:
            raise CommandError("The selected account is not available.") from None
        except DatabaseError:
            raise CommandError("Account storage is unavailable; the CLI requires an existing authorized account.") from None
        gateway = KnowledgeGateway()
        arguments = {"query": options["query"], "mode": "browse" if options["browse"] else "search", "limit": options["limit"]}
        if options.get("module"):
            arguments["module"] = options["module"]
        try:
            result = gateway.execute(name="search_documentation", arguments=arguments, user=user)
            self.stdout.write("Query: " + result["query"])
            for item in result["results"]:
                self.stdout.write(json.dumps({key: item[key] for key in ("rank", "document_id", "section_id", "title", "relevance_score", "summary")}, ensure_ascii=False))
            if result["results"]:
                first = result["results"][0]
                fetched = gateway.execute(name="fetch_documentation", arguments={"search_token": result["search_token"], "sections": [{"document_id": first["document_id"], "section_id": first["section_id"]}], "max_characters": 400}, user=user)
                self.stdout.write("Fetch succeeded; reference preview: " + fetched["sections"][0]["content"])
                if fetched["sections"][0]["is_partial"]:
                    self.stdout.write("Partial preview only; more source content remains.")
            else:
                self.stdout.write(result["explanation"])
                self.stdout.write("Available modules: " + ", ".join(m["module"] for m in result["available_modules"]))
        except GatewayError as exc:
            raise CommandError(f"{exc.code}: {exc.message}") from exc
