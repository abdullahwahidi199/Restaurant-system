import assert from "node:assert/strict";
import test from "node:test";

import { getOrderStatusErrorMessage } from "./orderStatusError.js";

test("uses the localized stock message supplied by the API", () => {
  const message = "موجودی مواد اولیه کافی نیست: برنج.";
  const error = {
    response: {
      data: {
        error_code: "insufficient_stock",
        message,
      },
    },
  };

  assert.equal(getOrderStatusErrorMessage(error), message);
});

test("translates legacy insufficient-stock responses and keeps ingredient names", () => {
  const error = {
    response: { data: { error: "Insufficient stock for: Rice, Oil" } },
  };

  assert.equal(
    getOrderStatusErrorMessage(error),
    "وضعیت سفارش تغییر نکرد، چون موجودی مواد اولیه کافی نیست: Rice, Oil. " +
      "لطفاً موجودی گدام را بررسی کنید.",
  );
});

test("keeps the exact required, available, and shortage quantities", () => {
  const error = {
    response: {
      data: {
        error:
          "Insufficient stock for: Rice (required 6 kg, available 5 kg, shortage 1 kg)",
      },
    },
  };

  const message = getOrderStatusErrorMessage(error);
  assert.match(message, /Rice/);
  assert.match(message, /required 6 kg/);
  assert.match(message, /available 5 kg/);
  assert.match(message, /shortage 1 kg/);
});

test("uses the detailed daily-production message supplied by the API", () => {
  const message =
    "وضعیت سفارش تغییر نکرد، چون تولید آماده کافی نیست: Kabuli Pulao " +
    "(required 4 portion(s), available 0 portion(s), shortage 4 portion(s); " +
    "no active production batch). لطفاً مقدار تولید روزانه را بررسی کنید.";
  const error = {
    response: {
      data: {
        error_code: "insufficient_production",
        message,
      },
    },
  };

  assert.equal(getOrderStatusErrorMessage(error), message);
});

test("translates legacy missing-production responses", () => {
  const error = {
    response: {
      data: {
        error: "Kabuli Pulao is not available — no active production.",
      },
    },
  };

  const message = getOrderStatusErrorMessage(error);
  assert.match(message, /Kabuli Pulao/);
  assert.match(message, /no active production batch/);
});

test("uses a Dari fallback for unknown or network errors", () => {
  assert.equal(
    getOrderStatusErrorMessage(new Error("Network error")),
    "وضعیت سفارش به‌روزرسانی نشد. لطفاً دوباره کوشش کنید.",
  );
});
