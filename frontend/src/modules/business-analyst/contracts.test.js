import assert from "node:assert/strict";
import { test } from "node:test";
import { readBusinessMessage } from "./contracts.js";
import { isStaffManagementPath } from "../../config/staffRoutes.js";

const message = (sources = []) => ({ id: 1, role: "assistant", kind: "answer", state: "complete", content: "AFN **1850.00**",
  created_at: "2026-10-31T12:00:00Z", sources });

test("Business Analyst accepts both real evidence shapes and discards private execution metadata", () => {
  const result = readBusinessMessage(message([
    { kind: "document", evidence_id: "b1:0", document_id: "admin_finance_expenses", title: "Finance > Expenses", provenance: { path: "C:/private/file", sha256: "secret" } },
    { kind: "tool", evidence_id: "b1:1", tool_id: "get_expense_summary", invocation_id: "internal", executed_at: "2026-10-31T12:00:00Z", parameters: { forbidden: "hidden" } },
  ]));
  assert.equal(result.sources[0].document_title, "Finance > Expenses");
  assert.equal(result.sources[1].document_title, "Expense summary");
  assert.doesNotMatch(JSON.stringify(result), /private|secret|forbidden|invocation_id|provenance/);
});

test("Business Analyst validates malformed responses and supports the full 32-operation evidence budget", () => {
  for (const raw of [{ ...message(), id: -1 }, { ...message(), state: "unknown" }, { ...message(), content: "" },
    message([{ kind: "tool", evidence_id: "b1:0", tool_id: "bad id", executed_at: "2026-10-31" }]),
    message([{ kind: "future", evidence_id: "b1:0" }])]) assert.throws(() => readBusinessMessage(raw));
  const source = { kind: "document", evidence_id: "b1:0", document_id: "admin_finance_expenses", title: "Expenses" };
  assert.equal(readBusinessMessage(message(Array.from({ length: 32 }, () => source))).sources.length, 32);
  assert.throws(() => readBusinessMessage(message(Array.from({ length: 33 }, () => source))));
});

test("Historical tool observations remain labeled and both assistants are authenticated management routes", () => {
  assert.equal(readBusinessMessage({ ...message(), historical_observation: true }).historical_observation, true);
  assert.equal(isStaffManagementPath("/business-analyst"), true);
  assert.equal(isStaffManagementPath("/assistant"), true);
  assert.equal(isStaffManagementPath("/a-restaurant/menu"), false);
});
