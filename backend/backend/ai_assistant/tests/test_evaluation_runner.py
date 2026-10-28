import json
from copy import deepcopy
from pathlib import Path
from unittest.mock import patch

from django.test import SimpleTestCase
from knowledge.access import can_read_document
from knowledge.markdown import digest
from ai_assistant.evaluation.dataset import load_dataset
from ai_assistant.evaluation.retrieval import aggregate
from ai_assistant.evaluation.performance import statistics_ms
from .helpers import gateway_fixture


class EvaluationRunnerTests(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.gateway, cls.index, cls.current = gateway_fixture()
        cls.root = Path(__file__).resolve().parents[4] / "docs/ai_knowledge/evaluation"

    def test_frozen_dataset_has_actual_accessible_sections_and_unchanged_hash(self):
        config = json.loads((self.root / "config.json").read_text(encoding="utf-8"))
        records, fingerprint = load_dataset(self.root / "questions.jsonl", self.index, config["dataset_sha256"])
        self.assertEqual(len(records), 96)
        self.assertEqual(sum(r["retrieval_metric"] for r in records), 80)
        self.assertEqual(fingerprint, config["dataset_sha256"])
        self.assertEqual({r["language"] for r in records}, {"en", "fa", "ps"})

    def test_metric_denominators_exclude_nonanswerable_cases_and_use_section_ranks(self):
        cases = [{"retrieval_metric": True, "first_correct_rank": 1}, {"retrieval_metric": True, "first_correct_rank": None},
                 {"retrieval_metric": True, "first_correct_rank": 5}, {"retrieval_metric": False, "first_correct_rank": 1}]
        summary = aggregate(cases)
        self.assertEqual(summary["denominator"], 3)
        self.assertAlmostEqual(summary["recall_at_1"], 1 / 3)
        self.assertAlmostEqual(summary["recall_at_5"], 2 / 3)
        self.assertAlmostEqual(summary["mrr_at_15"], (1 + .2) / 3)

    def test_percentile_definition_is_reproducible(self):
        measured = statistics_ms(list(range(1, 31)))
        self.assertEqual(measured["median_ms"], 15.5)
        self.assertEqual(measured["p95_ms"], 29)

    def test_lexical_cache_is_lazy_authorized_and_reuses_prepared_sections(self):
        from knowledge.search import SearchEngine
        from ai_assistant.evaluation.dataset import evaluation_principal
        engine = SearchEngine(self.index)
        self.assertEqual(engine.records, {})
        principal = evaluation_principal("Waiter")
        engine.search(principal, query="change table")
        authorized_sections = {s["section_id"] for s in self.index.iter_sections() if can_read_document(principal, self.index.get_document(s["document_id"]))}
        self.assertEqual(set(engine.records), authorized_sections)
        before = {sid: id(record) for sid, record in engine.records.items()}
        engine.search(principal, query="new order")
        self.assertEqual(before, {sid: id(record) for sid, record in engine.records.items()})
        self.assertLess(len(engine.records), len(engine.sections))

    def test_retrieval_expectations_are_not_generated_by_current_search(self):
        config = json.loads((self.root / "config.json").read_text(encoding="utf-8"))
        with patch("knowledge.search.SearchEngine.search", side_effect=AssertionError("Annotation validation must not call search")):
            records, _ = load_dataset(self.root / "questions.jsonl", self.index, config["dataset_sha256"])
        self.assertTrue(records[0]["source_checks"][0]["contains"])
