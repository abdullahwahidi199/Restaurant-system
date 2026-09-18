import assert from "node:assert/strict";
import test from "node:test";
import {
  APP_MODES,
  resolveAppMode,
} from "./appEnvironment.js";

test("production hostnames determine the app mode", () => {
  assert.equal(
    resolveAppMode({ hostname: "app.pakhlai.com", mode: "customer" }),
    APP_MODES.STAFF,
  );
  assert.equal(
    resolveAppMode({ hostname: "pakhlai.com", mode: "staff" }),
    APP_MODES.CUSTOMER,
  );
  assert.equal(
    resolveAppMode({ hostname: "www.pakhlai.com", mode: "staff" }),
    APP_MODES.CUSTOMER,
  );
});

test("the configured mode supports local and preview hosts", () => {
  assert.equal(
    resolveAppMode({ hostname: "localhost", mode: "staff" }),
    APP_MODES.STAFF,
  );
  assert.equal(
    resolveAppMode({ hostname: "127.0.0.1", mode: "customer" }),
    APP_MODES.CUSTOMER,
  );
});

test("unknown hosts default to the customer app", () => {
  assert.equal(
    resolveAppMode({ hostname: "preview.example", mode: "invalid" }),
    APP_MODES.CUSTOMER,
  );
});
