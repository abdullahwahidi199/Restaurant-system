import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  approveContractorInvoice,
  createContractor,
  createContractorInvoice,
  createContractorPayment,
  createServiceContract,
  deleteContractorInvoiceAttachment,
  getContractorInvoice,
  getContractorInvoiceAttachmentBlob,
  getContractorInvoices,
  getContractorLedger,
  getContractorPayments,
  getContractorSummary,
  getContractors,
  getServiceContracts,
  updateContractor,
  uploadContractorInvoiceAttachments,
} from "../services/contractorApi";
import {
  blankContract,
  blankContractor,
  blankInvoiceForm,
  blankInvoiceLine,
  blankPayment,
} from "../constants";
import { getPayableInvoices, getTopContractors } from "../utils/calculations";
import { listFrom, todayISO } from "../../shared/erp/formatters";

export default function useContractorWorkspace({
  initialView = "dashboard",
  openInvoiceId,
  openContractorId,
  basePath = "/admin/dashboard",
} = {}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialView);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoiceFilters, setInvoiceFilters] = useState({ search: "", status: "", contractor: "" });
  const [contractFilters, setContractFilters] = useState({ search: "", status: "" });
  const [paymentSearch, setPaymentSearch] = useState("");
  const [showContractorDialog, setShowContractorDialog] = useState(false);
  const [contractorForm, setContractorForm] = useState(blankContractor);
  const [editingContractor, setEditingContractor] = useState(null);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [contractForm, setContractForm] = useState(blankContract);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(null);
  const [paymentForm, setPaymentForm] = useState(blankPayment);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState(blankInvoiceForm);

  const contractorOptions = useMemo(
    () => contractors.map((contractor) => ({ value: contractor.id, label: contractor.name })),
    [contractors],
  );
  const contractOptions = useMemo(
    () =>
      contracts
        .filter((contract) => (invoiceForm.contractor ? String(contract.contractor) === String(invoiceForm.contractor) : true))
        .map((contract) => ({ value: contract.id, label: contract.title })),
    [contracts, invoiceForm.contractor],
  );
  const payableInvoices = useMemo(() => getPayableInvoices(invoices), [invoices]);
  const topContractors = useMemo(() => getTopContractors(contractors), [contractors]);
  const invoiceTotal = invoiceForm.lines.reduce(
    (sum, line) => sum + Number(line.quantity || 0) * Number(line.unit_price || 0),
    0,
  );

  const handleApiError = useCallback((err, fallback) => {
    console.error(err);
    setError(err?.response?.data?.detail || fallback);
  }, []);

  const loadSummary = useCallback(async () => {
    const res = await getContractorSummary();
    setSummary(res.data);
  }, []);

  const loadContractors = useCallback(async () => {
    const res = await getContractors({ page_size: 100 });
    setContractors(listFrom(res.data));
  }, []);

  const loadContracts = useCallback(async () => {
    const res = await getServiceContracts({
      page_size: 100,
      search: contractFilters.search || undefined,
      status: contractFilters.status || undefined,
    });
    setContracts(listFrom(res.data));
  }, [contractFilters.search, contractFilters.status]);

  const loadInvoices = useCallback(async () => {
    const res = await getContractorInvoices({
      page_size: 100,
      search: invoiceFilters.search || undefined,
      status: invoiceFilters.status || undefined,
      contractor: invoiceFilters.contractor || undefined,
    });
    setInvoices(listFrom(res.data));
  }, [invoiceFilters.contractor, invoiceFilters.search, invoiceFilters.status]);

  const loadPayments = useCallback(async () => {
    const res = await getContractorPayments({ page_size: 100, search: paymentSearch || undefined });
    setPayments(listFrom(res.data));
  }, [paymentSearch]);

  const loadContractorModule = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryRes, contractorRes, contractRes, invoiceRes, paymentRes] = await Promise.all([
        getContractorSummary(),
        getContractors({ page_size: 100 }),
        getServiceContracts({ page_size: 100 }),
        getContractorInvoices({ page_size: 100 }),
        getContractorPayments({ page_size: 100 }),
      ]);
      setSummary(summaryRes.data);
      setContractors(listFrom(contractorRes.data));
      setContracts(listFrom(contractRes.data));
      setInvoices(listFrom(invoiceRes.data));
      setPayments(listFrom(paymentRes.data));
    } catch (err) {
      handleApiError(err, "Failed to load contractor module.");
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const loadInvoiceDetail = useCallback(async (id) => {
    try {
      const res = await getContractorInvoice(id);
      setSelectedInvoice(res.data);
    } catch (err) {
      handleApiError(err, "Failed to open contractor invoice.");
    }
  }, [handleApiError]);

  const loadContractorProfile = useCallback(async (id) => {
    try {
      const res = await getContractorLedger(id);
      setSelectedLedger(res.data);
    } catch (err) {
      handleApiError(err, "Failed to load contractor profile.");
    }
  }, [handleApiError]);

  useEffect(() => setActiveTab(initialView), [initialView]);
  useEffect(() => void loadContractorModule(), [loadContractorModule]);
  useEffect(() => {
    if (!openInvoiceId) return;
    setActiveTab("invoices");
    void loadInvoiceDetail(openInvoiceId);
  }, [openInvoiceId, loadInvoiceDetail]);
  useEffect(() => {
    if (!openContractorId) return;
    setActiveTab("contractors");
    void loadContractorProfile(openContractorId);
  }, [openContractorId, loadContractorProfile]);
  useEffect(() => {
    const delay = setTimeout(() => void loadInvoices(), 350);
    return () => clearTimeout(delay);
  }, [loadInvoices]);
  useEffect(() => {
    const delay = setTimeout(() => void loadContracts(), 350);
    return () => clearTimeout(delay);
  }, [loadContracts]);
  useEffect(() => {
    const delay = setTimeout(() => void loadPayments(), 350);
    return () => clearTimeout(delay);
  }, [loadPayments]);

  const reloadMoneyData = async () => {
    await Promise.all([loadSummary(), loadContractors(), loadInvoices(), loadPayments(), loadContracts()]);
  };

  const startAddContractor = () => {
    setEditingContractor(null);
    setContractorForm(blankContractor);
    setShowContractorDialog(true);
  };

  const startEditContractor = (contractor) => {
    setEditingContractor(contractor);
    setContractorForm({
      name: contractor.name || "",
      contact_person: contractor.contact_person || "",
      phone: contractor.phone || "",
      email: contractor.email || "",
      address: contractor.address || "",
      notes: contractor.notes || "",
      is_active: Boolean(contractor.is_active),
    });
    setShowContractorDialog(true);
  };

  const submitContractor = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingContractor) {
        await updateContractor(editingContractor.id, contractorForm);
        setNotice("Contractor updated.");
      } else {
        await createContractor(contractorForm);
        setNotice("Contractor created.");
      }
      setShowContractorDialog(false);
      setEditingContractor(null);
      setContractorForm(blankContractor);
      await Promise.all([loadContractors(), loadSummary()]);
    } catch (err) {
      handleApiError(err, "Failed to save contractor.");
    } finally {
      setSaving(false);
    }
  };

  const submitContract = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createServiceContract({
        ...contractForm,
        contract_value: Number(contractForm.contract_value || 0),
        end_date: contractForm.end_date || null,
      });
      setNotice("Service contract created.");
      setShowContractDialog(false);
      setContractForm(blankContract);
      await loadContracts();
    } catch (err) {
      handleApiError(err, "Failed to save service contract.");
    } finally {
      setSaving(false);
    }
  };

  const updateInvoiceLine = (index, field, value) => {
    setInvoiceForm((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, [field]: value } : line)),
    }));
  };

  const submitInvoice = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...invoiceForm,
        contract: invoiceForm.contract || null,
        due_date: invoiceForm.due_date || null,
        amount_paid: Number(invoiceForm.amount_paid || 0),
        lines: invoiceForm.lines.map((line) => ({
          service_type: line.service_type,
          description: line.description,
          quantity: Number(line.quantity || 0),
          unit_price: Number(line.unit_price || 0),
        })),
      };
      const res = await createContractorInvoice(payload);
      setNotice("Contractor invoice created.");
      setInvoiceForm(blankInvoiceForm());
      await reloadMoneyData();
      setSelectedInvoice(res.data);
      navigate(`${basePath}/contractors/invoices/${res.data.id}`);
    } catch (err) {
      handleApiError(err, "Failed to create contractor invoice.");
    } finally {
      setSaving(false);
    }
  };

  const addInvoiceLine = () =>
    setInvoiceForm((current) => ({ ...current, lines: [...current.lines, blankInvoiceLine()] }));

  const removeInvoiceLine = (index) =>
    setInvoiceForm((current) => ({
      ...current,
      lines: current.lines.length === 1 ? current.lines : current.lines.filter((_, lineIndex) => lineIndex !== index),
    }));

  const openPaymentDialog = (invoice) => {
    setPaymentDialog(invoice);
    setPaymentForm({
      contractor: invoice.contractor,
      invoice: invoice.id,
      date: todayISO(),
      amount: invoice.remaining_balance || "",
      payment_method: "cash",
      reference_number: "",
      notes: "",
    });
  };

  const submitPayment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createContractorPayment({ ...paymentForm, amount: Number(paymentForm.amount || 0) });
      const invoiceId = paymentForm.invoice;
      const profileId = selectedLedger?.contractor?.id;
      setNotice("Contractor payment recorded.");
      setPaymentDialog(null);
      setPaymentForm(blankPayment);
      await reloadMoneyData();
      if (selectedInvoice?.id) await loadInvoiceDetail(selectedInvoice.id);
      if (invoiceId && Number(selectedInvoice?.id) !== Number(invoiceId)) await loadInvoiceDetail(invoiceId);
      if (profileId) await loadContractorProfile(profileId);
    } catch (err) {
      handleApiError(err, "Failed to record contractor payment.");
    } finally {
      setSaving(false);
    }
  };

  const approveInvoice = async (invoice) => {
    setSaving(true);
    setError("");
    try {
      const res = await approveContractorInvoice(invoice.id);
      setSelectedInvoice(res.data);
      setNotice("Invoice approved.");
      await reloadMoneyData();
    } catch (err) {
      handleApiError(err, "Failed to approve invoice.");
    } finally {
      setSaving(false);
    }
  };

  const uploadAttachments = async (invoiceId, files) => {
    if (!files?.length) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    setSaving(true);
    setError("");
    try {
      await uploadContractorInvoiceAttachments(invoiceId, formData);
      setNotice("Attachment uploaded.");
      await loadInvoiceDetail(invoiceId);
    } catch (err) {
      handleApiError(err, "Failed to upload attachment.");
    } finally {
      setSaving(false);
    }
  };

  const previewAttachment = async (invoice, attachment) => {
    try {
      const res = await getContractorInvoiceAttachmentBlob(invoice.id, attachment.id);
      setAttachmentPreview({ attachment, url: URL.createObjectURL(res.data) });
    } catch (err) {
      handleApiError(err, "Failed to open attachment.");
    }
  };

  const downloadAttachment = async (invoice, attachment) => {
    try {
      const res = await getContractorInvoiceAttachmentBlob(invoice.id, attachment.id, true);
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.original_filename || "contractor-attachment";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      handleApiError(err, "Failed to download attachment.");
    }
  };

  const removeAttachment = async (invoice, attachment) => {
    setSaving(true);
    setError("");
    try {
      await deleteContractorInvoiceAttachment(invoice.id, attachment.id);
      await loadInvoiceDetail(invoice.id);
      setNotice("Attachment removed.");
    } catch (err) {
      handleApiError(err, "Failed to remove attachment.");
    } finally {
      setSaving(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    loading,
    saving,
    notice,
    error,
    setNotice,
    setError,
    summary,
    contractors,
    contracts,
    invoices,
    payments,
    invoiceFilters,
    setInvoiceFilters,
    contractFilters,
    setContractFilters,
    paymentSearch,
    setPaymentSearch,
    contractorOptions,
    contractOptions,
    payableInvoices,
    topContractors,
    invoiceTotal,
    showContractorDialog,
    setShowContractorDialog,
    contractorForm,
    setContractorForm,
    editingContractor,
    showContractDialog,
    setShowContractDialog,
    contractForm,
    setContractForm,
    selectedInvoice,
    setSelectedInvoice,
    selectedLedger,
    setSelectedLedger,
    paymentDialog,
    setPaymentDialog,
    paymentForm,
    setPaymentForm,
    attachmentPreview,
    setAttachmentPreview,
    invoiceForm,
    setInvoiceForm,
    startAddContractor,
    startEditContractor,
    submitContractor,
    submitContract,
    updateInvoiceLine,
    submitInvoice,
    addInvoiceLine,
    removeInvoiceLine,
    openPaymentDialog,
    submitPayment,
    approveInvoice,
    loadInvoiceDetail,
    loadContractorProfile,
    uploadAttachments,
    previewAttachment,
    downloadAttachment,
    removeAttachment,
  };
}
