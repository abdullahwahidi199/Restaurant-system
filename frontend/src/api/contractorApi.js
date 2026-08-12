import instance from "./axiosInstance";

export const getContractorSummary = () =>
  instance.get("/contractors/summary/");

export const getContractors = (params) =>
  instance.get("/contractors/contractors/", { params });

export const createContractor = (data) =>
  instance.post("/contractors/contractors/", data);

export const updateContractor = (id, data) =>
  instance.patch(`/contractors/contractors/${id}/`, data);

export const getContractorLedger = (id) =>
  instance.get(`/contractors/contractors/${id}/ledger/`);

export const getServiceContracts = (params) =>
  instance.get("/contractors/contracts/", { params });

export const createServiceContract = (data) =>
  instance.post("/contractors/contracts/", data);

export const updateServiceContract = (id, data) =>
  instance.patch(`/contractors/contracts/${id}/`, data);

export const getContractorInvoices = (params) =>
  instance.get("/contractors/invoices/", { params });

export const getContractorInvoice = (id) =>
  instance.get(`/contractors/invoices/${id}/`);

export const createContractorInvoice = (data) =>
  instance.post("/contractors/invoices/", data);

export const approveContractorInvoice = (id) =>
  instance.post(`/contractors/invoices/${id}/approve/`);

export const uploadContractorInvoiceAttachments = (invoiceId, formData) =>
  instance.post(`/contractors/invoices/${invoiceId}/attachments/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getContractorInvoiceAttachmentBlob = (
  invoiceId,
  attachmentId,
  download = false,
) =>
  instance.get(
    `/contractors/invoices/${invoiceId}/attachments/${attachmentId}/download/`,
    {
      params: download ? { download: 1 } : undefined,
      responseType: "blob",
    },
  );

export const deleteContractorInvoiceAttachment = (invoiceId, attachmentId) =>
  instance.delete(
    `/contractors/invoices/${invoiceId}/attachments/${attachmentId}/`,
  );

export const getContractorPayments = (params) =>
  instance.get("/contractors/payments/", { params });

export const createContractorPayment = (data) =>
  instance.post("/contractors/payments/", data);

export const getContractorPayment = (id) =>
  instance.get(`/contractors/payments/${id}/`);
