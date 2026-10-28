import json
from collections import Counter
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from knowledge.indexer import build_index
from knowledge.storage import publish_index


class Command(BaseCommand):
    help = "Build or validate the local Markdown knowledge index without database or AI calls."
    requires_system_checks = []
    requires_migrations_checks = False

    def add_arguments(self, parser):
        parser.add_argument("--source", help="Documentation root override (trusted deployment path).")
        parser.add_argument("--output", help="Private generated-index storage override.")
        parser.add_argument("--check", action="store_true", help="Validate the full build without creating or replacing any index files.")
        parser.add_argument("--allow-partial", action="store_true", help="Explicitly publish valid documents despite errors; default loader refuses this incomplete index.")
        parser.add_argument("--verbose-diagnostics", action="store_true", help="Print each diagnostic using logical relative paths.")

    def handle(self, *args, **options):
        source = Path(options["source"] or settings.KNOWLEDGE_DOCUMENTATION_ROOT).resolve()
        output = Path(options["output"] or settings.KNOWLEDGE_INDEX_ROOT).resolve()
        if source == output or source.is_relative_to(output):
            raise CommandError("Index output must not be the source directory or an ancestor of it.")
        if output.is_relative_to(source) and not any(part.startswith(".") for part in output.relative_to(source).parts):
            raise CommandError("An index inside the source root must use a hidden excluded directory.")
        try:
            result = build_index(source)
            self.stdout.write(json.dumps(result.summary(), sort_keys=True))
            counts = Counter(i.code for i in result.issues)
            if counts:
                self.stdout.write("Diagnostics by code: " + json.dumps(dict(sorted(counts.items())), sort_keys=True))
            if options["verbose_diagnostics"]:
                for issue in result.issues:
                    self.stdout.write(json.dumps(issue.to_dict(), ensure_ascii=False, sort_keys=True))
                for item in result.excluded:
                    self.stdout.write("Excluded: " + json.dumps(item, ensure_ascii=False, sort_keys=True))
            if options["check"]:
                if result.errors:
                    raise CommandError("Validation found errors; no index files were written.")
                self.stdout.write(self.style.SUCCESS("Check passed; no index files were written."))
                return
            manifest = publish_index(result, output, allow_partial=options["allow_partial"])
            self.stdout.write(("Complete" if manifest["complete"] else "PARTIAL") + " generation committed: " + manifest["build_hash"])
        except CommandError:
            raise
        except (OSError, ValueError) as exc:
            # Never echo arbitrary absolute filesystem paths from OS exceptions.
            message = str(exc) if isinstance(exc, ValueError) else "Index storage could not be read or written; check deployment paths and permissions."
            raise CommandError(message) from exc
