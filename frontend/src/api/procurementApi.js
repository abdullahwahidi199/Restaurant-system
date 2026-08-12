import instance from "./axiosInstance";

export const getProcurementIngredients = () =>
  instance.get("/inventory/ingredients/");

export const getSuppliers = (params) =>
  instance.get("/procurement/suppliers/", { params });

export const createSupplier = (data) =>
  instance.post("/procurement/suppliers/", data);

export const updateSupplier = (id, data) =>
  instance.patch(`/procurement/suppliers/${id}/`, data);

export const getSupplierLedger = (id) =>
  instance.get(`/procurement/suppliers/${id}/ledger/`);

export const getPurchaseInvoices = (params) =>
  instance.get("/procurement/purchase-invoices/", { params });

export const getPurchaseInvoice = (id) =>
  instance.get(`/procurement/purchase-invoices/${id}/`);

export const createPurchaseInvoice = (data) =>
  instance.post("/procurement/purchase-invoices/", data);

export const approvePurchaseInvoice = (id) =>
  instance.post(`/procurement/purchase-invoices/${id}/approve/`);

export const uploadPurchaseInvoiceAttachments = (invoiceId, formData) =>
  instance.post(
    `/procurement/purchase-invoices/${invoiceId}/attachments/`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

export const getPurchaseInvoiceAttachmentBlob = (
  invoiceId,
  attachmentId,
  download = false,
) =>
  instance.get(
    `/procurement/purchase-invoices/${invoiceId}/attachments/${attachmentId}/download/`,
    {
      params: download ? { download: 1 } : undefined,
      responseType: "blob",
    },
  );

export const deletePurchaseInvoiceAttachment = (invoiceId, attachmentId) =>
  instance.delete(
    `/procurement/purchase-invoices/${invoiceId}/attachments/${attachmentId}/`,
  );

export const getSupplierPayments = (params) =>
  instance.get("/procurement/supplier-payments/", { params });

export const createSupplierPayment = (data) =>
  instance.post("/procurement/supplier-payments/", data);

export const getSupplierPayment = (id) =>
  instance.get(`/procurement/supplier-payments/${id}/`);

export const getSupplierPaymentVoucher = (id) =>
  instance.get(`/procurement/supplier-payments/${id}/voucher/`);

export const getSupplierPaymentVoucherPdf = (id) =>
  instance.get(`/procurement/supplier-payments/${id}/voucher-pdf/`, {
    responseType: "blob",
  });
