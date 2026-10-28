import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateIdleSeconds,
  canClaimPresenceLeadership,
  parseJwtSessionId,
  shouldSendHeartbeat,
} from "./presenceRuntimeUtils.js";


const tokenWithPayload = (payload) => {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${encoded}.signature`;
};

test("extracts the opaque managed-session id from a JWT payload", () => {
  assert.equal(parseJwtSessionId(tokenWithPayload({ sid: "session-123" })), "session-123");
  assert.equal(parseJwtSessionId("invalid"), "legacy");
});

test("only one visible tab claims a live leadership lease", () => {
  const now = 10_000;
  assert.equal(canClaimPresenceLeadership(null, "tab-a", now), true);
  assert.equal(canClaimPresenceLeadership({ tabId: "tab-b", expiresAt: now + 1_000 }, "tab-a", now), false);
  assert.equal(canClaimPresenceLeadership({ tabId: "tab-b", expiresAt: now - 1 }, "tab-a", now), true);
  assert.equal(canClaimPresenceLeadership({ tabId: "tab-a", expiresAt: now + 1_000 }, "tab-a", now), true);
  assert.equal(canClaimPresenceLeadership(null, "tab-a", now, false), false);
});

test("idle time and heartbeat cadence are bounded and deterministic", () => {
  assert.equal(calculateIdleSeconds(1_000, 6_500), 5);
  assert.equal(calculateIdleSeconds(7_000, 6_500), 0);
  assert.equal(shouldSendHeartbeat(1_000, 29_999), false);
  assert.equal(shouldSendHeartbeat(1_000, 30_000), true);
  assert.equal(shouldSendHeartbeat(29_999, 30_000, true), true);
});
