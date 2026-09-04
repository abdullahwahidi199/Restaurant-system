const DEFAULT_STATUS_ERROR =
  "وضعیت سفارش به‌روزرسانی نشد. لطفاً دوباره کوشش کنید.";

const buildInsufficientStockMessage = (ingredients = "") => {
  const detail = ingredients.trim().replace(/\.+$/, "");
  const ingredientText = detail ? `: ${detail}` : "";

  return `وضعیت سفارش تغییر نکرد، چون موجودی مواد اولیه کافی نیست${ingredientText}. لطفاً موجودی گدام را بررسی کنید.`;
};

export const getOrderStatusErrorMessage = (error) => {
  const data = error?.response?.data;

  if (data?.error_code === "insufficient_stock" && data?.message) {
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

  return DEFAULT_STATUS_ERROR;
};
