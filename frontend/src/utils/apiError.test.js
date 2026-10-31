import assert from "node:assert/strict";
import test from "node:test";

import { getApiErrorMessage } from "./apiError.js";

test("reads the API error field used by order creation conflicts", () => {
  const error = {
    response: {
      data: { error: "Table 4 already has an active order (#19)." },
    },
  };

  assert.equal(
    getApiErrorMessage(error, "Order failed"),
    "Table 4 already has an active order (#19).",
  );
});

test("reads DRF non-field validation errors", () => {
  const error = {
    response: {
      data: { non_field_errors: ["Minimum order is 500 for delivery orders."] },
    },
  };

  assert.equal(
    getApiErrorMessage(error, "Order failed"),
    "Minimum order is 500 for delivery orders.",
  );
});

test("finds nested item validation errors", () => {
  const error = {
    response: {
      data: { items: [{ menu_item: ["Invalid menu item for this branch."] }] },
    },
  };

  assert.equal(
    getApiErrorMessage(error, "Order failed"),
    "Invalid menu item for this branch.",
  );
});

test("uses the supplied fallback for network errors", () => {
  assert.equal(
    getApiErrorMessage(new Error("Network Error"), "Order failed"),
    "Order failed",
  );
});

