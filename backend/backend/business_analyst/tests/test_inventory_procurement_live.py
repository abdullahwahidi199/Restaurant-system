"""Opt-in live DeepSeek checks against synthetic, isolated Django test data only.

Run with BUSINESS_ANALYST_LIVE_INVENTORY=1 and a configured DEEPSEEK_API_KEY.
Normal CI never calls the provider. No production database is used.
"""
import json
import os
import re
from pathlib import Path
from unittest import skipUnless

from django.test import override_settings
from business_analyst.models import TurnAudit
from business_analyst.service import ConversationService
from .test_inventory_procurement_tools import InventoryProcurementFixture


LIVE_SCENARIOS = [
    "Give me a complete profile of chicken, including stock, purchases, consumption, waste and recipes.",
    "Which ingredients are running low?",
    "What ingredients did we consume most during September 2026?",
    "Show every stock adjustment for chicken during September 2026.",
    "How much waste was recorded during August 2026?",
    "Show pending transfers and approved transfers for October 2026.",
    "Give me the complete profile of supplier Ahmad.",
    "How much did we purchase from Ahmad during September 2026, and how much did we pay him?",
    "Which suppliers currently have the largest outstanding balances?",
    "Compare our procurement purchases and supplier payments for August and September 2026.",
    "How much is our current inventory worth?",
    "Explain why current stock value differs from historical purchase spending.",
]


@skipUnless(os.environ.get("BUSINESS_ANALYST_LIVE_INVENTORY") == "1", "Explicit opt-in required for live provider requests")
class InventoryProcurementLiveTests(InventoryProcurementFixture):
    def test_twelve_live_requests_with_synthetic_data(self):
        key = os.environ.get("DEEPSEEK_API_KEY", "")
        self.assertTrue(key, "Live provider credential is required")
        results = []
        for number, question in enumerate(LIVE_SCENARIOS, 1):
            with self.subTest(number=number), override_settings(DEEPSEEK_API_KEY=key):
                try:
                    response = ConversationService().reply(user=self.admin, question=question)
                    turn = TurnAudit.objects.get(pk=response["request_id"])
                    message = response["message"]
                    row = {"case": number, "question": question, "mode": "live_deepseek_synthetic_database",
                        "status": turn.status, "kind": message["kind"], "model_calls": turn.model_calls,
                        "batches": turn.batches, "operations": turn.operations,
                        "tools": [s["tool_id"] for s in message["sources"] if s.get("tool_id")],
                        "answer": message["content"]}
                    results.append(row)
                    self.assertEqual(turn.status, "completed")
                    self.assertEqual(message["kind"], "answer")
                    self.assertTrue(message["sources"])
                    if number < 12:
                        self.assertTrue(row["tools"], "Fresh figures must cite successful business tools")
                    if number == 8:
                        self.assertIn("47.04", message["content"])
                    if number == 11:
                        answer = message["content"].lower()
                        self.assertTrue("390.18" in answer or "390.175" in answer)
                        self.assertRegex(answer, re.compile(r"includ\w*.{0,100}inactive|inactive.{0,100}includ", re.S))
                        self.assertTrue("unknown" in answer or "incomplete" in answer)
                except Exception as error:
                    if not results or results[-1]["case"] != number:
                        results.append({"case": number, "question": question, "mode": "live_deepseek_synthetic_database",
                            "error": getattr(error, "code", type(error).__name__)})
                    raise
                finally:
                    target = os.environ.get("BUSINESS_ANALYST_LIVE_INVENTORY_OUTPUT")
                    if target:
                        Path(target).write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
