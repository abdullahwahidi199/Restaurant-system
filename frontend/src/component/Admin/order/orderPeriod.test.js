import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getOrderPeriodRange,
  validateOrderPeriodRange,
} from "./orderPeriod.js";

test("order period presets use inclusive calendar dates", () => {
  assert.deepEqual(getOrderPeriodRange("today", "2026-10-04"), {
    preset: "today", start: "2026-10-04", end: "2026-10-04",
  });
  assert.deepEqual(getOrderPeriodRange("yesterday", "2026-01-01"), {
    preset: "yesterday", start: "2025-12-31", end: "2025-12-31",
  });
  assert.deepEqual(getOrderPeriodRange("last_7_days", "2026-10-04"), {
    preset: "last_7_days", start: "2026-09-28", end: "2026-10-04",
  });
  assert.deepEqual(getOrderPeriodRange("this_month", "2026-10-04"), {
    preset: "this_month", start: "2026-10-01", end: "2026-10-04",
  });
  assert.deepEqual(getOrderPeriodRange("all_time", "2026-10-04"), {
    preset: "all_time", start: "", end: "",
  });
});

test("custom order periods reject invalid, reversed, and future dates", () => {
  const today = "2026-10-04";
  assert.equal(validateOrderPeriodRange("", today, today), "dates_required");
  assert.equal(validateOrderPeriodRange("2026-02-30", today, today), "invalid_dates");
  assert.equal(validateOrderPeriodRange(today, "2026-10-03", today), "end_before_start");
  assert.equal(validateOrderPeriodRange(today, "2026-10-05", today), "future_dates");
  assert.equal(validateOrderPeriodRange(today, today, today), "");
});
