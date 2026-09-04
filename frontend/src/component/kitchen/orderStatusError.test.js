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

test("uses a Dari fallback for unknown or network errors", () => {
  assert.equal(
    getOrderStatusErrorMessage(new Error("Network error")),
    "وضعیت سفارش به‌روزرسانی نشد. لطفاً دوباره کوشش کنید.",
  );
});
