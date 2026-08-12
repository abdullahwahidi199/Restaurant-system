export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "AFN",
});

export const money = (value) => currency.format(Number(value || 0));

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const monthStartISO = () => {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
};

export const listFrom = (payload) => payload?.results || payload || [];

export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const compactDate = (value) => value || "-";

export const formatMethod = (value) =>
  String(value || "-")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const percent = (value, total) => {
  const totalNumber = Number(total || 0);
  if (!totalNumber) return 0;
  return Math.min(100, Math.max(0, (Number(value || 0) / totalNumber) * 100));
};
