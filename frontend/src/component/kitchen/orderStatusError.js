const DEFAULT_STATUS_ERROR =
  "وضعیت سفارش به‌روزرسانی نشد. لطفاً دوباره کوشش کنید.";

const buildInsufficientStockMessage = (ingredients = "") => {
  const detail = ingredients.trim().replace(/\.+$/, "");
  const ingredientText = detail ? `: ${detail}` : "";

  return `وضعیت سفارش تغییر نکرد، چون موجودی مواد اولیه کافی نیست${ingredientText}. لطفاً موجودی گدام را بررسی کنید.`;
};

const buildInsufficientProductionMessage = (production = "") => {
  const detail = production.trim().replace(/\.+$/, "");
  const productionText = detail ? `: ${detail}` : "";

  return `وضعیت سفارش تغییر نکرد، چون تولید آماده کافی نیست${productionText}. لطفاً مقدار تولید روزانه را بررسی کنید.`;
};

export const getOrderStatusErrorMessage = (error) => {
  const data = error?.response?.data;

  if (
    ["insufficient_stock", "insufficient_production"].includes(
      data?.error_code,
    ) &&
    data?.message
  ) {
    return data.message;
  }

  const originalMessage =
    typeof data?.error === "string"
      ? data.error.trim()
      : typeof data?.detail === "string"
        ? data.detail.trim()
        : "";
  const stockError = originalMessage.match(
    /^insufficient stock(?:\s+for)?\s*:?\s*(.*)$/i,
  );

  if (stockError) {
    return buildInsufficientStockMessage(stockError[1]);
  }

  const productionError = originalMessage.match(
    /^insufficient production(?:\s+for)?\s*:?\s*(.*)$/i,
  );
  if (productionError) {
    return buildInsufficientProductionMessage(productionError[1]);
  }

  const missingProduction = originalMessage.match(
    /^(.*?) is not available\s*[—-]\s*no active production\.?$/i,
  );
  if (missingProduction) {
    return buildInsufficientProductionMessage(
      `${missingProduction[1]} (no active production batch)`,
    );
  }

  const remainingProduction = originalMessage.match(
    /^Only (\d+) portion\(s\) of (.*?) remaining\.?$/i,
  );
  if (remainingProduction) {
    return buildInsufficientProductionMessage(
      `${remainingProduction[2]} (available ${remainingProduction[1]} portion(s))`,
    );
  }

  return DEFAULT_STATUS_ERROR;
};
