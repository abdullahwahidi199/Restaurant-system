import instance from "./axiosInstance";

export const getIngredientsPages = (page, search) => {
  let url = `/inventory/ingredientsPages/?page=${page}`;

  if (search) {
    url += `&search=${search}`;
  }

  return instance.get(url);
};
export const getIngredients = () => instance.get("/inventory/ingredients/");

export const getIngredient = (id) => instance.get(`/inventory/ingredients/${id}/`);

export const getIngredientPurchaseHistory = (id) =>
  instance.get(`/inventory/ingredients/${id}/purchase-history/`);

export const createIngredient = (data) =>
  instance.post("/inventory/ingredients/", data);
export const updateIngredient = (id, data) =>
  instance.patch(`/inventory/ingredients/${id}/`, data);

export const addStock = (data) => instance.post("/inventory/purchases/", data);

export const getSuppliers = (params) =>
  instance.get("/inventory/suppliers/", { params });

export const createSupplier = (data) =>
  instance.post("/inventory/suppliers/", data);

export const updateSupplier = (id, data) =>
  instance.patch(`/inventory/suppliers/${id}/`, data);

export const getSupplierLedger = (id) =>
  instance.get(`/inventory/suppliers/${id}/ledger/`);

export const getPurchaseInvoices = (params) =>
  instance.get("/inventory/purchase-invoices/", { params });

export const getPurchaseInvoice = (id) =>
  instance.get(`/inventory/purchase-invoices/${id}/`);

export const createPurchaseInvoice = (data) =>
  instance.post("/inventory/purchase-invoices/", data);

export const approvePurchaseInvoice = (id) =>
  instance.post(`/inventory/purchase-invoices/${id}/approve/`);

export const uploadPurchaseInvoiceAttachments = (invoiceId, formData) =>
  instance.post(`/inventory/purchase-invoices/${invoiceId}/attachments/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getPurchaseInvoiceAttachmentBlob = (
  invoiceId,
  attachmentId,
  download = false,
) =>
  instance.get(
    `/inventory/purchase-invoices/${invoiceId}/attachments/${attachmentId}/download/`,
    {
      params: download ? { download: 1 } : undefined,
      responseType: "blob",
    },
  );

export const deletePurchaseInvoiceAttachment = (invoiceId, attachmentId) =>
  instance.delete(
    `/inventory/purchase-invoices/${invoiceId}/attachments/${attachmentId}/`,
  );

export const getSupplierPayments = (params) =>
  instance.get("/inventory/supplier-payments/", { params });

export const createSupplierPayment = (data) =>
  instance.post("/inventory/supplier-payments/", data);

export const getSupplierPayment = (id) =>
  instance.get(`/inventory/supplier-payments/${id}/`);

export const getSupplierPaymentVoucher = (id) =>
  instance.get(`/inventory/supplier-payments/${id}/voucher/`);

export const getSupplierPaymentVoucherPdf = (id) =>
  instance.get(`/inventory/supplier-payments/${id}/voucher-pdf/`, {
    responseType: "blob",
  });

export const getMenuItems = () => instance.get("/menu/menu-items/");

export const getRecipes = () => instance.get("/inventory/recipes/");

export const addRecipeIngredient = (data) =>
  instance.post("/inventory/recipes/", data);

export const deleteRecipe = (id) =>
  instance.delete(`/inventory/recipes/${id}/`);

export const getStockMovements = (params) =>
  instance.get("/inventory/stock-movements/", { params });

export const adjustStock = (data) =>
  instance.post("/inventory/adjust-stock/", data);

export const getInventorySummary = () =>
  instance.get("/inventory/inventory-summary/");
