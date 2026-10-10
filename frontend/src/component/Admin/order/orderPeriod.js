export const ORDER_PERIOD_PRESETS = Object.freeze([
  "today",
  "yesterday",
  "last_7_days",
  "this_month",
  "all_time",
]);

export function getOrderToday() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kabul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

const asDate = (value) => new Date(`${value}T00:00:00Z`);
const asISO = (date) => date.toISOString().slice(0, 10);

function shiftDays(value, days) {
  const date = asDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return asISO(date);
}

export function getOrderPeriodRange(preset, today = getOrderToday()) {
  if (preset === "all_time") {
    return { preset, start: "", end: "" };
  }

  if (preset === "yesterday") {
    const yesterday = shiftDays(today, -1);
    return { preset, start: yesterday, end: yesterday };
  }

  if (preset === "last_7_days") {
    return { preset, start: shiftDays(today, -6), end: today };
  }

  if (preset === "this_month") {
    const date = asDate(today);
    return {
      preset,
      start: asISO(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))),
      end: today,
    };
  }

  return { preset: "today", start: today, end: today };
}

export function validateOrderPeriodRange(start, end, today = getOrderToday()) {
  if (!start || !end) return "dates_required";

  const isValidDate = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(asDate(value).getTime()) &&
    asISO(asDate(value)) === value;

  if (!isValidDate(start) || !isValidDate(end)) return "invalid_dates";
  if (start > end) return "end_before_start";
  if (end > today) return "future_dates";
  return "";
}

export function formatOrderPeriodDate(value, language) {
  return new Intl.DateTimeFormat(language, {
    calendar: "gregory",
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(asDate(value));
}
