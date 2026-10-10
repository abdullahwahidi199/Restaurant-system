export const SALES_PRESETS = [
  "today", "last_7_days", "last_30_days", "last_90_days", "this_month",
  "last_month", "this_year", "last_year", "last_12_months",
];

export function getSalesToday() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kabul", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

const asDate = (value) => new Date(`${value}T00:00:00Z`);
const asISO = (date) => date.toISOString().slice(0, 10);
const shiftDays = (value, days) => {
  const date = asDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return asISO(date);
};

export function getSalesPresetRange(preset, today = getSalesToday()) {
  const date = asDate(today);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  let start = today;
  let end = today;

  if (preset === "last_7_days") start = shiftDays(today, -6);
  if (preset === "last_30_days") start = shiftDays(today, -29);
  if (preset === "last_90_days") start = shiftDays(today, -89);
  if (preset === "this_month") start = asISO(new Date(Date.UTC(year, month, 1)));
  if (preset === "last_month") {
    start = asISO(new Date(Date.UTC(year, month - 1, 1)));
    end = asISO(new Date(Date.UTC(year, month, 0)));
  }
  if (preset === "this_year") start = `${year}-01-01`;
  if (preset === "last_year") {
    start = `${year - 1}-01-01`;
    end = `${year - 1}-12-31`;
  }
  if (preset === "last_12_months") {
    const lastDay = new Date(Date.UTC(year - 1, month + 1, 0)).getUTCDate();
    start = shiftDays(asISO(new Date(Date.UTC(year - 1, month, Math.min(date.getUTCDate(), lastDay)))), 1);
  }
  return { preset, start, end, interval: "auto" };
}

export function validateSalesRange(start, end, today = getSalesToday()) {
  if (!start || !end) return "dates_required";
  const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(asDate(value).getTime()) && asISO(asDate(value)) === value;
  if (!validDate(start) || !validDate(end)) return "invalid_dates";
  if (start > end) return "end_before_start";
  if (end > today) return "future_dates";
  return "";
}

export function formatSalesDate(value, language, options = {}) {
  return new Intl.DateTimeFormat(language, {
    calendar: "gregory", timeZone: "UTC", month: "short", day: "numeric",
    ...options,
  }).format(asDate(value));
}
