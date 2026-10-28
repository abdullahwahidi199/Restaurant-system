import json
import os
import platform
import tempfile
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from knowledge.loader import load_index
from knowledge.markdown import digest
from ai_assistant.evaluation.behavior import evaluate_behaviors
from ai_assistant.evaluation.dataset import load_dataset
from ai_assistant.evaluation.performance import evaluate_performance
from ai_assistant.evaluation.retrieval import evaluate_retrieval
from ai_assistant.evaluation.test_runner import run_tests


class Command(BaseCommand):
    help = "Offline source-specific retrieval, mocked orchestration, security and local performance evaluation. Never calls DeepSeek."
    requires_system_checks = []
    requires_migrations_checks = False

    def add_arguments(self, parser):
        for flag in ("retrieval", "orchestration", "security", "performance", "all"):
            parser.add_argument("--" + flag, action="store_true")
        parser.add_argument("--config", help="Reviewed evaluation config path (trusted development operation).")
        parser.add_argument("--output", help="Results JSON path, outside the operator source tree.")
        parser.add_argument("--baseline", help="Preserved earlier result JSON for a same-dataset comparison.")

    def handle(self, *args, **options):
        root = Path(settings.KNOWLEDGE_DOCUMENTATION_ROOT).resolve()
        config_path = Path(options["config"] or root.parent / "evaluation/config.json").resolve()
        output = Path(options["output"] or config_path.parent / "results.json").resolve()
        if output.is_relative_to(root) or output == config_path or (options["baseline"] and output == Path(options["baseline"]).resolve()):
            raise CommandError("Evaluation output must not overwrite source documentation, configuration or the preserved baseline.")
        try:
            raw_config = config_path.read_bytes()
            config = json.loads(raw_config)
            index = load_index(settings.KNOWLEDGE_INDEX_ROOT)
            if index.version != config["index_version"]:
                raise ValueError("Evaluation index changed; review frozen source annotations/configuration before running.")
            records, data_hash = load_dataset(config_path.parent / config["dataset"], index, config["dataset_sha256"])
            selected = {key for key in ("retrieval", "orchestration", "security", "performance") if options[key]}
            if options["all"] or not selected:
                selected = {"retrieval", "orchestration", "security", "performance"}
            source_root = Path(__file__).resolve().parents[3]
            fingerprints = {}
            for file in ("knowledge/search.py", "knowledge/ranking.py", "knowledge/aliases.json", "knowledge/gateway.py", "knowledge/access.py", "ai_assistant/orchestrator.py", "ai_assistant/provider.py", "ai_assistant/service.py", "ai_assistant/language.py"):
                fingerprints[file] = digest((source_root / file).read_bytes())
            report = {"schema_version": 1, "created_at": datetime.now(ZoneInfo("Asia/Kabul")).isoformat(), "dataset_sha256": data_hash,
                      "config_sha256": digest(raw_config), "index_version": index.version, "question_count": len(records), "answerable_count": sum(r["retrieval_metric"] for r in records),
                      "configuration": config, "implementation_fingerprints": fingerprints, "environment": {"python": platform.python_version(), "system": platform.system()}, "selected": sorted(selected)}
            if "retrieval" in selected:
                report["retrieval"] = evaluate_retrieval(records, index, config)
            if "orchestration" in selected:
                report["behavior"] = evaluate_behaviors(records, index)
            labels = [label for category in ("orchestration", "security", "performance") if category in selected for label in config[category + "_tests"]]
            if labels:
                report["tests"] = run_tests(labels)
            if "performance" in selected:
                report["performance"] = evaluate_performance(settings.KNOWLEDGE_INDEX_ROOT, records, config)
                from ai_assistant.tests.test_evaluation_hardening import DATABASE_PERFORMANCE
                report["performance"]["database"] = DATABASE_PERFORMANCE
            if options["baseline"]:
                baseline = json.loads(Path(options["baseline"]).read_text(encoding="utf-8"))
                if baseline["dataset_sha256"] != data_hash or baseline["index_version"] != index.version or baseline["config_sha256"] != report["config_sha256"]:
                    raise ValueError("Baseline comparison requires identical dataset, index and evaluation configuration.")
                report["comparison"] = {"same_dataset_index_and_config": True}
                if "retrieval" in report and "retrieval" in baseline:
                    before, after = baseline["retrieval"]["overall"], report["retrieval"]["overall"]
                    report["comparison"]["retrieval_delta"] = {key: after[key] - before[key] for key in ("recall_at_1", "recall_at_3", "recall_at_5", "mrr_at_15")}
                    old = {case["id"]: case for case in baseline["retrieval"]["cases"]}
                    report["comparison"]["rank_changes"] = [{"id": case["id"], "before": old[case["id"]]["first_correct_rank"], "after": case["first_correct_rank"]} for case in report["retrieval"]["cases"] if case["retrieval_metric"] and case["first_correct_rank"] != old[case["id"]]["first_correct_rank"]]
            output.parent.mkdir(parents=True, exist_ok=True)
            handle, temporary = tempfile.mkstemp(prefix=".evaluation-", suffix=".tmp", dir=output.parent)
            try:
                with os.fdopen(handle, "w", encoding="utf-8", newline="\n") as stream:
                    json.dump(report, stream, ensure_ascii=False, sort_keys=True, indent=2)
                    stream.write("\n")
                os.replace(temporary, output)
            finally:
                if Path(temporary).exists():
                    Path(temporary).unlink()
            self.stdout.write(json.dumps({key: report[key] for key in ("question_count", "answerable_count", "dataset_sha256", "index_version")}, sort_keys=True))
            if "retrieval" in report:
                self.stdout.write("Retrieval: " + json.dumps(report["retrieval"]["overall"], sort_keys=True))
                self.stdout.write("Languages: " + json.dumps(report["retrieval"]["by_language"], sort_keys=True))
            if "tests" in report:
                self.stdout.write("Tests: " + json.dumps({key: report["tests"][key] for key in ("tests_run", "passed", "failures", "skipped")}, sort_keys=True))
            if "behavior" in report:
                self.stdout.write("Scripted behavior: " + json.dumps({key: report["behavior"][key] for key in ("passed", "failed")}, sort_keys=True))
            self.stdout.write("Evaluation JSON written.")
            if report.get("tests", {}).get("failures", 0) or report.get("behavior", {}).get("failed", 0):
                raise CommandError("Evaluation has failing checks; results were saved for inspection.")
        except CommandError:
            raise
        except (OSError, ValueError, KeyError, TypeError) as exc:
            raise CommandError(str(exc) if isinstance(exc, ValueError) else "Evaluation inputs/output could not be read or validated.") from None
