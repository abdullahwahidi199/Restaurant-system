import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approvePurchaseInvoice,
  createPurchaseInvoice,
  createSupplier,
  createSupplierPayment,
  deletePurchaseInvoiceAttachment,
  getProcurementIngredients,
  getPurchaseInvoice,
  getPurchaseInvoiceAttachmentBlob,
  getPurchaseInvoices,
  getSupplierLedger,
  getSupplierPaymentVoucher,
  getSupplierPaymentVoucherPdf,
  getSupplierPayments,
  getSuppliers,
  updateSupplier,
  uploadPurchaseInvoiceAttachments,
} from "../services/procurementApi";
import {
  blankInvoiceForm,
  blankLine,
  blankPayment,
  blankSupplier,
} from "../constants";
import { conversionFactor, getProcurementStats } from "../utils/calculations";
import { listFrom, todayISO } from "../../shared/erp/formatters";

export default function useProcurementWorkspace({
  initialView = "dashboard",
  openInvoiceId,
  openSupplierId,
  onCreated,
} = {}) {
  const [activeTab, setActiveTab] = useState(initialView);
  const [ingredients, setIngredients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [invoiceFilters, setInvoiceFilters] = useState({ search: "", status: "" });
  const [paymentSearch, setPaymentSearch] = useState("");
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [supplierForm, setSupplierForm] = useState(blankSupplier);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedSupplierLedger, setSelectedSupplierLedger] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(null);
  const [paymentForm, setPaymentForm] = useState(blankPayment);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [voucherPreview, setVoucherPreview] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState(blankInvoiceForm);

  const ingredientMap = useMemo(
    () =>
      ingredients.reduce((acc, item) => {
        acc[String(item.id)] = item;
        return acc;
      }, {}),
    [ingredients],
  );

  const supplierOptions = useMemo(
    () => suppliers.map((supplier) => ({ value: supplier.id, label: supplier.name })),
    [suppliers],
  );

  const invoiceOptions = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.supplier && Number(invoice.remaining_balance) > 0)
        .map((invoice) => ({
          value: invoice.id,
          supplier: invoice.supplier,
          remaining: invoice.remaining_balance,
          label: `${invoice.invoice_number || `PINV-${invoice.id}`} - ${invoice.supplier_name}`,
        })),
    [invoices],
  );

  const invoiceTotal = invoiceForm.lines.reduce(
    (sum, line) => sum + Number(line.total_price || 0),
    0,
  );
  const paidInitially = invoiceForm.supplier
    ? Number(invoiceForm.amount_paid || 0)
    : invoiceTotal;
  const remainingBalance = invoiceForm.supplier
    ? Math.max(invoiceTotal - paidInitially, 0)
    : 0;
  const stats = useMemo(
    () => getProcurementStats({ invoices, suppliers, payments }),
    [invoices, suppliers, payments],
  );

  const handleApiError = useCallback((err, fallback) => {
    console.error(err);
    const detail = err?.response?.data?.detail || err?.response?.data || fallback;
    setError(typeof detail === "string" ? detail : fallback);
  }, []);

  const loadProcurement = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ingredientRes, supplierRes, invoiceRes, paymentRes] = await Promise.all([
        getProcurementIngredients(),
        getSuppliers(),
        getPurchaseInvoices({ page: 1, page_size: 100 }),
        getSupplierPayments({ page: 1, page_size: 100 }),
      ]);
      setIngredients(listFrom(ingredientRes.data));
      setSuppliers(listFrom(supplierRes.data));
      setInvoices(listFrom(invoiceRes.data));
      setPayments(listFrom(paymentRes.data));
    } catch (err) {
      handleApiError(err, "Failed to load procurement data.");
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const loadInvoices = useCallback(async () => {
    try {
      const res = await getPurchaseInvoices({
        page: 1,
        page_size: 100,
        search: invoiceFilters.search || undefined,
        status: invoiceFilters.status || undefined,
      });
      setInvoices(listFrom(res.data));
    } catch (err) {
      handleApiError(err, "Failed to refresh invoices.");
    }
  }, [handleApiError, invoiceFilters.search, invoiceFilters.status]);

  const loadPayments = useCallback(async () => {
    try {
      const res = await getSupplierPayments({
        page: 1,
        page_size: 100,
        search: paymentSearch || undefined,
      });
      setPayments(listFrom(res.data));
    } catch (err) {
      handleApiError(err, "Failed to refresh payments.");
    }
  }, [handleApiError, paymentSearch]);

  const openInvoice = useCallback(async (invoice) => {
    try {
      const res = await getPurchaseInvoice(invoice.id);
      setSelectedInvoice(res.data);
    } catch (err) {
      handleApiError(err, "Failed to open invoice.");
    }
  }, [handleApiError]);

  const openLedger = useCallback(async (supplier) => {
    try {
      const res = await getSupplierLedger(supplier.id);
      setSelectedSupplierLedger(res.data);
    } catch (err) {
      handleApiError(err, "Failed to load supplier ledger.");
    }
  }, [handleApiError]);

  useEffect(() => setActiveTab(initialView), [initialView]);
  useEffect(() => void loadProcurement(), [loadProcurement]);
  useEffect(() => {
    if (!openInvoiceId) return;
    setActiveTab("invoices");
    void openInvoice({ id: openInvoiceId });
  }, [openInvoiceId, openInvoice]);
  useEffect(() => {
    if (!openSupplierId) return;
    setActiveTab("suppliers");
    void openLedger({ id: openSupplierId });
  }, [openSupplierId, openLedger]);
  useEffect(() => {
    const delay = setTimeout(() => void loadInvoices(), 400);
    return () => clearTimeout(delay);
  }, [loadInvoices]);
  useEffect(() => {
    const delay = setTimeout(() => void loadPayments(), 400);
    return () => clearTimeout(delay);
  }, [loadPayments]);

  const updateInvoiceField = (field, value) => {
    setInvoiceForm((current) => ({
      ...current,
      [field]: value,
      amount_paid: field === "supplier" && !value ? "" : current.amount_paid,
    }));
  };

  const updateLine = (key, field, value) => {
    setInvoiceForm((current) => ({
      ...current,
      lines: current.lines.map((line) => {
        if (line.key !== key) return line;
        const next = { ...line, [field]: value };
        const quantity = Number(field === "quantity" ? value : next.quantity);
        const unitPrice = Number(field === "unit_price" ? value : next.unit_price);
        const total = Number(field === "total_price" ? value : next.total_price);
        if (field === "ingredient") {
          next.quantity = "";
          next.unit_price = "";
          next.total_price = "";
        } else if (field === "quantity" || field === "unit_price") {
          next.total_price = quantity > 0 && unitPrice >= 0 ? (quantity * unitPrice).toFixed(2) : "";
        } else if (field === "total_price") {
          next.unit_price = quantity > 0 ? (total / quantity).toFixed(4) : "";
        }
        return next;
      }),
    }));
  };

  const addLine = () =>
    setInvoiceForm((current) => ({ ...current, lines: [...current.lines, blankLine()] }));

  const removeLine = (key) =>
    setInvoiceForm((current) => ({
      ...current,
      lines: current.lines.length === 1 ? current.lines : current.lines.filter((line) => line.key !== key),
    }));

  const submitInvoice = async (status = "unpaid") => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const lines = invoiceForm.lines.map((line) => {
        const ingredient = ingredientMap[String(line.ingredient)];
        const factor = conversionFactor(ingredient?.unit);
        return {
          ingredient: line.ingredient,
          quantity: Number(line.quantity) * factor,
          unit_price: Number(line.unit_price) / factor,
        };
      });
      if (lines.some((line) => !line.ingredient || line.quantity <= 0)) {
        setError("Add at least one valid ingredient line.");
        return;
      }
      if (invoiceForm.supplier && Number(invoiceForm.amount_paid || 0) > invoiceTotal) {
        setError("Initial payment cannot be more than the invoice total.");
        return;
      }
      await createPurchaseInvoice({
        supplier: invoiceForm.supplier || null,
        invoice_number: invoiceForm.invoice_number,
        purchase_date: invoiceForm.purchase_date,
        due_date: invoiceForm.due_date || null,
        amount_paid: invoiceForm.supplier ? invoiceForm.amount_paid || 0 : invoiceTotal,
        payment_method: invoiceForm.payment_method,
        notes: invoiceForm.notes,
        status,
        lines,
      });
      setInvoiceForm(blankInvoiceForm());
      setNotice(status === "draft" ? "Draft saved." : "Purchase invoice created.");
      await Promise.all([loadInvoices(), loadPayments()]);
      onCreated?.();
    } catch (err) {
      handleApiError(err, "Failed to create purchase invoice.");
    } finally {
      setSaving(false);
    }
  };

  const submitSupplier = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createSupplier(supplierForm);
      setSupplierForm(blankSupplier);
      setShowSupplierDialog(false);
      const res = await getSuppliers();
      setSuppliers(listFrom(res.data));
      setNotice("Supplier saved.");
    } catch (err) {
      handleApiError(err, "Failed to save supplier.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSupplier = async (supplier) => {
    try {
      await updateSupplier(supplier.id, { is_active: !supplier.is_active });
      const res = await getSuppliers();
      setSuppliers(listFrom(res.data));
    } catch (err) {
      handleApiError(err, "Failed to update supplier.");
    }
  };

  const refreshSelectedInvoice = async (invoiceId = selectedInvoice?.id) => {
    if (!invoiceId) return;
    const res = await getPurchaseInvoice(invoiceId);
    setSelectedInvoice(res.data);
  };

  const approveDraft = async (invoice) => {
    setSaving(true);
    try {
      const res = await approvePurchaseInvoice(invoice.id);
      setSelectedInvoice(res.data);
      await loadInvoices();
      onCreated?.();
      setNotice("Draft invoice approved.");
    } catch (err) {
      handleApiError(err, "Failed to approve invoice.");
    } finally {
      setSaving(false);
    }
  };

  const openPaymentDialog = (invoice = null) => {
    setPaymentDialog(invoice || true);
    setPaymentForm({
      ...blankPayment,
      supplier: invoice?.supplier || "",
      purchase_invoice: invoice?.id || "",
      amount: invoice?.remaining_balance || "",
      date: todayISO(),
    });
  };

  const submitPayment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createSupplierPayment(paymentForm);
      const paidInvoiceId = paymentForm.purchase_invoice;
      setPaymentDialog(null);
      setPaymentForm(blankPayment);
      await Promise.all([loadInvoices(), loadPayments()]);
      if (selectedInvoice?.id) await refreshSelectedInvoice(selectedInvoice.id);
      if (selectedSupplierLedger?.supplier?.id) await openLedger(selectedSupplierLedger.supplier);
      setNotice("Supplier payment recorded.");
      if (paidInvoiceId && Number(selectedInvoice?.id) !== Number(paidInvoiceId)) {
        await openInvoice({ id: paidInvoiceId });
      }
    } catch (err) {
      handleApiError(err, "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  };

  const saveBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const uploadAttachments = async (invoiceId, files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    setSaving(true);
    setError("");
    try {
      await uploadPurchaseInvoiceAttachments(invoiceId, formData);
      await refreshSelectedInvoice(invoiceId);
      setNotice("Attachment uploaded.");
    } catch (err) {
      handleApiError(err, "Failed to upload attachment.");
    } finally {
      setSaving(false);
    }
  };

  const previewAttachment = async (invoice, attachment) => {
    try {
      const res = await getPurchaseInvoiceAttachmentBlob(invoice.id, attachment.id, false);
      const url = URL.createObjectURL(res.data);
      setAttachmentPreview({ attachment, url });
    } catch (err) {
      handleApiError(err, "Failed to preview attachment.");
    }
  };

  const downloadAttachment = async (invoice, attachment) => {
    try {
      const res = await getPurchaseInvoiceAttachmentBlob(invoice.id, attachment.id, true);
      saveBlob(res.data, attachment.original_filename || "attachment");
    } catch (err) {
      handleApiError(err, "Failed to download attachment.");
    }
  };

  const removeAttachment = async (invoice, attachment) => {
    setSaving(true);
    try {
      await deletePurchaseInvoiceAttachment(invoice.id, attachment.id);
      await refreshSelectedInvoice(invoice.id);
      setNotice("Attachment removed.");
    } catch (err) {
      handleApiError(err, "Failed to remove attachment.");
    } finally {
      setSaving(false);
    }
  };

  const openVoucherPreview = async (payment) => {
    try {
      const res = await getSupplierPaymentVoucher(payment.id);
      setVoucherPreview(res.data);
    } catch (err) {
      handleApiError(err, "Failed to open payment voucher.");
    }
  };

  const downloadVoucherPdf = async (payment) => {
    try {
      const res = await getSupplierPaymentVoucherPdf(payment.id);
      saveBlob(res.data, `${payment.voucher_number || `SPV-${payment.id}`}.pdf`);
    } catch (err) {
      handleApiError(err, "Failed to download voucher PDF.");
    }
  };

  return {
    activeTab,
    setActiveTab,
    ingredients,
    suppliers,
    invoices,
    payments,
    loading,
    saving,
    notice,
    error,
    setNotice,
    setError,
    invoiceFilters,
    setInvoiceFilters,
    paymentSearch,
    setPaymentSearch,
    showSupplierDialog,
    setShowSupplierDialog,
    supplierForm,
    setSupplierForm,
    selectedInvoice,
    setSelectedInvoice,
    selectedSupplierLedger,
    setSelectedSupplierLedger,
    paymentDialog,
    setPaymentDialog,
    paymentForm,
    setPaymentForm,
    attachmentPreview,
    setAttachmentPreview,
    voucherPreview,
    setVoucherPreview,
    invoiceForm,
    setInvoiceForm,
    ingredientMap,
    supplierOptions,
    invoiceOptions,
    invoiceTotal,
    paidInitially,
    remainingBalance,
    stats,
    updateInvoiceField,
    updateLine,
    addLine,
    removeLine,
    submitInvoice,
    submitSupplier,
    toggleSupplier,
    openInvoice,
    approveDraft,
    openLedger,
    openPaymentDialog,
    submitPayment,
    uploadAttachments,
    previewAttachment,
    downloadAttachment,
    removeAttachment,
    openVoucherPreview,
    downloadVoucherPdf,
  };
}
