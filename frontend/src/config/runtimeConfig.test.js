import assert from "node:assert/strict";
import test from "node:test";
import { deriveWebSocketBaseUrl } from "./runtimeConfig.js";

test("websocket base URL is derived from the configured API origin", () => {
  assert.equal(
    deriveWebSocketBaseUrl("https://pakhlai.com/api", "http://localhost:5173"),
    "wss://pakhlai.com",
  );
  assert.equal(
    deriveWebSocketBaseUrl(
      "http://127.0.0.1:8000/api/",
      "http://localhost:5173",
    ),
    "ws://127.0.0.1:8000",
  );
});

test("relative API URLs use the frontend origin", () => {
  assert.equal(
    deriveWebSocketBaseUrl("/api", "https://app.pakhlai.com"),
    "wss://app.pakhlai.com",
  );
});
