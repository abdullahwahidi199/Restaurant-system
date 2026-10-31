"""Opt-in live comparison using one real registry and isolated synthetic data."""
import json
import os
from pathlib import Path
from unittest import skipUnless

from django.test import override_settings
from ai_assistant.audit_payloads import read_blob
from business_analyst.documents import DocumentRepository
from business_analyst.models import TurnAudit
from business_analyst.registry import json_bytes
from business_analyst.service import ConversationService
from .test_capability_map import ARTIFACTS, CapabilityMapFixture, FullContractDocuments


QUESTIONS = [
    "Why might our total contractor outstanding balance differ from the sum of unpaid service invoice balances?",
    "Explain the difference between a service contract's value, a contractor invoice's total, a payment, and a contractor's outstanding balance in our system.",
    "Compare January 2026 recognized contractor invoice charges, recorded contractor payments and operating expenses. Show each total separately.",
    "How much is current inventory worth, and how much did we purchase/pay suppliers during September 2026? Keep current valuation and period activity separate.",
]


@skipUnless(os.environ.get("BUSINESS_ANALYST_LIVE_CAPABILITY_MAP") == "1", "Explicit opt-in required for live provider comparison")
class CapabilityMapLiveComparisonTests(CapabilityMapFixture):
    def test_four_before_after_questions(self):
        key = os.environ.get("DEEPSEEK_API_KEY", "")
        self.assertTrue(key, "A configured live provider credential is required")
        rows = []
        target = Path(os.environ.get("BUSINESS_ANALYST_LIVE_CAPABILITY_MAP_OUTPUT", str(ARTIFACTS / "live.comparison.json")))
        for number, question in enumerate(QUESTIONS, 1):
            for label, repository in (("before_full", FullContractDocuments()), ("after_compact", DocumentRepository())):
                with self.subTest(question=number, representation=label), override_settings(DEEPSEEK_API_KEY=key):
                    row = {"case": number, "representation": label, "question": question,
                        "mode": "live_deepseek_synthetic_database", "validation": "failed"}
                    rows.append(row)
                    try:
                        result = ConversationService(documents=repository).reply(user=self.admin, question=question)
                        turn = TurnAudit.objects.get(pk=result["request_id"])
                        requests, selections, operations, usages = [], [], [], []
                        for event in turn.events.select_related("payload").order_by("sequence"):
                            payload = read_blob(event.payload)
                            if event.event_type == "model_request":
                                requests.append(len(json_bytes(payload["payload"])))
                            elif event.event_type == "model_response":
                                response = payload.get("response", {})
                                usages.append(response.get("usage", {}))
                                for choice in response.get("choices", []):
                                    for call in choice.get("message", {}).get("tool_calls", []):
                                        arguments = json.loads(call["function"]["arguments"])
                                        selections.append({"function": call["function"]["name"],
                                            "document_ids": arguments.get("document_ids", []),
                                            "tools": [{"tool_id": t.get("tool_id"), "parameters": t.get("parameters")} for t in arguments.get("tools", [])]})
                            elif event.event_type == "operation_finished":
                                operations.append({k: payload.get(k) for k in ("kind", "id", "ok", "code")})
                        row.update(status=turn.status, model=turn.model, configuration=turn.model_configuration,
                            model_calls=turn.model_calls, batches=turn.batches, operations=operations, selections=selections,
                            usage=turn.usage, per_call_usage=usages, usage_complete=turn.usage_complete,
                            duration_ms=turn.duration_ms, initial_request_bytes=requests[0], cumulative_request_bytes=sum(requests),
                            sources=result["message"]["sources"], answer=result["message"]["content"], kind=result["message"]["kind"])
                        self.assertEqual(turn.status, "completed")
                        self.assertEqual(row["kind"], "answer")
                        self.assertTrue(row["sources"])
                        self.assertTrue(all(s["function"] == "retrieve_business_context" for s in selections))
                        self.assertTrue(all(op["ok"] for op in operations), operations)
                        text = row["answer"].lower().replace(",", "")
                        if number == 1:
                            self.assertTrue(any(word in text for word in ("floor", "net", "capp", "correction", "overpay")))
                        elif number == 2:
                            self.assertTrue(all(word in text for word in ("contract", "invoice", "payment", "balance")))
                        elif number == 3:
                            for amount in ("385", "70", "1810"):
                                self.assertRegex(text, rf"\b{amount}(?:\.00)?\b")
                        elif number == 4:
                            self.assertTrue("390.18" in text or "390.175" in text)
                            self.assertIn("104.04", text)
                            self.assertRegex(text, r"\b10(?:\.00)?\b")
                            self.assertTrue("unknown" in text or "incomplete" in text)
                        row["validation"] = "passed"
                    except Exception as error:
                        row["error"] = getattr(error, "code", type(error).__name__)
                        raise
                    finally:
                        target.parent.mkdir(parents=True, exist_ok=True)
                        target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
