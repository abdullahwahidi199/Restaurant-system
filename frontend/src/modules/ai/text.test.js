import assert from "node:assert/strict";
import test from "node:test";
import { characterCount, safeAnswerUrl, segmentText } from "./text.js";
import { assistantContextKey } from "./access.js";

test("chat text preserves graphemes and uses Django codepoint limits", () => {
  assert.deepEqual(segmentText("👨‍👩‍👧‍👦اَ"), ["👨‍👩‍👧‍👦", "اَ"]);
  assert.equal(characterCount("😀".repeat(4000)), 4000);
  assert.equal(segmentText("پښتو دری").join(""), "پښتو دری");
});

test("only safe explicit answer links survive; no implicit source viewer or image URLs", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,<script>", "file:///private", "../docs/private.md", "/docs/private.md", "//tracking.invalid/x", "https://user:password@example.com"]) {
    assert.equal(safeAnswerUrl(url), undefined);
  }
  assert.equal(safeAnswerUrl("https://example.com/help"), "https://example.com/help");
});

test("account/role/branch/permission changes reset session while refreshed token does not", () => {
  const auth = { tokens: { access: "first" }, user: { staff_id: 1, session_id: "one", role: "Waiter", restaurant_id: 1 } };
  const key = assistantContextKey(auth, { id: 1 });
  assert.notEqual(assistantContextKey(auth, { id: 2 }), key);
  for (const change of [{ role: "Admin" }, { restaurant_id: 2 }, { staff_id: 2 }, { session_id: "two" }, { can_monitor_activity: true }]) {
    assert.notEqual(assistantContextKey({ ...auth, user: { ...auth.user, ...change } }, { id: 1 }), key);
  }
  assert.equal(assistantContextKey({ ...auth, tokens: { access: "refreshed" } }, { id: 1 }), key);
});
