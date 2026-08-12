import { todayISO } from "../../shared/erp/formatters";

export const displayUnit = (unit) => {
  if (unit === "g") return "kg";
  if (unit === "ml") return "L";
  return unit || "-";
};

export const conversionFactor = (unit) => {
  if (unit === "g" || unit === "ml") return 1000;
  return 1;
};

export const getInvoiceNumber = (invoice) =>
  invoice?.invoice_number || `PINV-${invoice?.id}`;

export const getProcurementStats = ({ invoices, suppliers, payments }) => {
  const postedInvoices = invoices.filter((invoice) => invoice.status !== "draft");
  const unpaidInvoices = invoices.filter((invoice) =>
    ["unpaid", "partially_paid"].includes(invoice.status),
  );
  const currentMonth = todayISO().slice(0, 7);

  const totalPurchasesToday = postedInvoices
    .filter((invoice) => invoice.purchase_date === todayISO())
    .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
  const purchasesThisMonth = postedInvoices
    .filter((invoice) => String(invoice.purchase_date || "").startsWith(currentMonth))
    .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
  const outstandingSupplierPayables = suppliers.reduce(
    (sum, supplier) => sum + Number(supplier.outstanding_balance || 0),
    0,
  );
  const paymentsMade = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );
  const topSuppliers = [...suppliers]
    .sort((a, b) => Number(b.total_purchases || 0) - Number(a.total_purchases || 0))
    .slice(0, 5);

  const purchaseTrend = postedInvoices.reduce((acc, invoice) => {
    const date = invoice.purchase_date || "Unknown";
    acc[date] = (acc[date] || 0) + Number(invoice.total_amount || 0);
    return acc;
  }, {});
  const trendRows = Object.entries(purchaseTrend)
    .sort(([a], [b]) => String(b).localeCompare(String(a)))
    .slice(0, 7);
  const maxTrendValue = Math.max(1, ...trendRows.map(([, value]) => Number(value || 0)));

  return {
    postedInvoices,
    unpaidInvoices,
    totalPurchasesToday,
    purchasesThisMonth,
    outstandingSupplierPayables,
    paymentsMade,
    topSuppliers,
    trendRows,
    maxTrendValue,
  };
};

export const formatFileSize = (bytes) => {
  const size = Number(bytes || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
