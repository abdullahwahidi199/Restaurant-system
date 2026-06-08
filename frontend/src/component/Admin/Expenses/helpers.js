// src/pages/expenses/helpers.js

export const formatCurrency = (amount, currency = "AFN") => {
  const value = parseFloat(amount || 0);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted} ${currency}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getActionColor = (action) => {
  const colors = {
    created: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    updated: "bg-amber-100 text-amber-700 ring-amber-200",
    deleted: "bg-red-100 text-red-700 ring-red-200",
  };
  return colors[action] || "bg-gray-100 text-gray-700 ring-gray-200";
};

export const getCurrencyBadge = (currency) => {
  return currency === "USD"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-indigo-100 text-indigo-700";
};

export const emptyExpenseForm = () => ({
  name: "",
  date: new Date().toISOString().split("T")[0],
  amount: "",
  currency: "AFN",
  exchange_rate: "1",
  description: "",
});
