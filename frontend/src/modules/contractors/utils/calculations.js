export const getContractorInvoiceNumber = (invoice) =>
  invoice?.invoice_number || `CINV-${invoice?.id}`;

export const getPayableInvoices = (invoices) =>
  invoices.filter((invoice) => ["approved", "partially_paid"].includes(invoice.status));

export const getTopContractors = (contractors) =>
  [...contractors]
    .sort((a, b) => Number(b.total_invoiced || 0) - Number(a.total_invoiced || 0))
    .slice(0, 5);

export const contractorTrendRows = (payments) => {
  const trend = payments.reduce((acc, payment) => {
    const date = payment.date || "Unknown";
    acc[date] = (acc[date] || 0) + Number(payment.amount || 0);
    return acc;
  }, {});
  return Object.entries(trend)
    .sort(([a], [b]) => String(b).localeCompare(String(a)))
    .slice(0, 7);
};

export const formatFileSize = (bytes) => {
  const size = Number(bytes || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
