import { test } from "node:test";
import assert from "node:assert/strict";
import { getSalesPresetRange, validateSalesRange } from "./salesChartUtils.js";

test("rolling presets include calendar days with both boundaries included", () => {
  assert.deepEqual(getSalesPresetRange("last_30_days", "2026-10-03"), {
    preset: "last_30_days", start: "2026-09-04", end: "2026-10-03", interval: "auto",
  });
  assert.equal(getSalesPresetRange("last_7_days", "2026-01-03").start, "2025-12-28");
});

test("last year is a complete calendar year, distinct from the last twelve months", () => {
  const lastYear = getSalesPresetRange("last_year", "2026-10-03");
  assert.equal(lastYear.start, "2025-01-01");
  assert.equal(lastYear.end, "2025-12-31");
  assert.equal(getSalesPresetRange("last_12_months", "2026-10-03").start, "2025-10-04");
});

test("month and year presets handle leap days and year boundaries", () => {
  const lastMonth = getSalesPresetRange("last_month", "2024-03-31");
  assert.equal(lastMonth.start, "2024-02-01");
  assert.equal(lastMonth.end, "2024-02-29");
  assert.equal(getSalesPresetRange("last_month", "2026-01-02").start, "2025-12-01");
  assert.equal(getSalesPresetRange("this_year", "2026-10-03").start, "2026-01-01");
  assert.equal(getSalesPresetRange("last_12_months", "2024-02-29").start, "2023-03-01");
});

test("custom ranges reject invalid, reversed and future dates while allowing a single day", () => {
  const today = "2026-10-03";
  assert.equal(validateSalesRange("", today, today), "dates_required");
  assert.equal(validateSalesRange("2025-02-30", today, today), "invalid_dates");
  assert.equal(validateSalesRange(today, "2026-10-02", today), "end_before_start");
  assert.equal(validateSalesRange(today, "2026-10-04", today), "future_dates");
  assert.equal(validateSalesRange(today, today, today), "");
  assert.equal(validateSalesRange("2024-02-29", today, today), "");
});
