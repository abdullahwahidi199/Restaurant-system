import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  approveContractorInvoice,
  createContractor,
  createContractorInvoice,
  createContractorPayment,
  createServiceContract,
  deleteContractor,
  deleteContractorInvoiceAttachment,
  getContractorInvoice,
  getContractorInvoiceAttachmentBlob,
  getAllContractorInvoices,
  getContractorLedger,
  getAllContractorPayments,
  getContractorSummary,
  getAllContractors,
  getAllServiceContracts,
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
import { todayISO } from "../../shared/erp/formatters";

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
  const moduleRequestRef = useRef(0);
  const contractorRequestRef = useRef(0);
  const contractRequestRef = useRef(0);
  const invoiceRequestRef = useRef(0);
  const paymentRequestRef = useRef(0);
  const previousContractFiltersRef = useRef({ search: "", status: "" });
  const previousInvoiceFiltersRef = useRef({ search: "", status: "", contractor: "" });
  const previousPaymentSearchRef = useRef("");

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
    const request = ++contractorRequestRef.current;
    try {
      const allContractors = await getAllContractors();
      if (request === contractorRequestRef.current) setContractors(allContractors);
    } catch (err) {
      if (request === contractorRequestRef.current) {
        handleApiError(err, "Failed to refresh contractors.");
      }
    }
  }, [handleApiError]);

  const loadContracts = useCallback(async () => {
    const request = ++contractRequestRef.current;
    try {
      const allContracts = await getAllServiceContracts({
        search: contractFilters.search || undefined,
        status: contractFilters.status || undefined,
      });
      if (request === contractRequestRef.current) setContracts(allContracts);
    } catch (err) {
      if (request === contractRequestRef.current) {
        handleApiError(err, "Failed to refresh service contracts.");
      }
    }
  }, [contractFilters.search, contractFilters.status, handleApiError]);

  const loadInvoices = useCallback(async () => {
    const request = ++invoiceRequestRef.current;
    try {
      const allInvoices = await getAllContractorInvoices({
        search: invoiceFilters.search || undefined,
        status: invoiceFilters.status || undefined,
        contractor: invoiceFilters.contractor || undefined,
      });
      if (request === invoiceRequestRef.current) setInvoices(allInvoices);
    } catch (err) {
      if (request === invoiceRequestRef.current) {
        handleApiError(err, "Failed to refresh service invoices.");
      }
    }
  }, [handleApiError, invoiceFilters.contractor, invoiceFilters.search, invoiceFilters.status]);

  const loadPayments = useCallback(async () => {
    const request = ++paymentRequestRef.current;
    try {
      const allPayments = await getAllContractorPayments({ search: paymentSearch || undefined });
      if (request === paymentRequestRef.current) setPayments(allPayments);
    } catch (err) {
      if (request === paymentRequestRef.current) {
        handleApiError(err, "Failed to refresh contractor payments.");
      }
    }
  }, [handleApiError, paymentSearch]);

  const loadContractorModule = useCallback(async () => {
    const moduleRequest = ++moduleRequestRef.current;
    const contractorRequest = ++contractorRequestRef.current;
    const contractRequest = ++contractRequestRef.current;
    const invoiceRequest = ++invoiceRequestRef.current;
    const paymentRequest = ++paymentRequestRef.current;
    setLoading(true);
    setError("");
    try {
      const [summaryRes, allContractors, allContracts, allInvoices, allPayments] = await Promise.all([
        getContractorSummary(),
        getAllContractors(),
        getAllServiceContracts(),
        getAllContractorInvoices(),
        getAllContractorPayments(),
      ]);
      if (moduleRequest !== moduleRequestRef.current) return;
      setSummary(summaryRes.data);
      if (contractorRequest === contractorRequestRef.current) setContractors(allContractors);
      if (contractRequest === contractRequestRef.current) setContracts(allContracts);
      if (invoiceRequest === invoiceRequestRef.current) setInvoices(allInvoices);
      if (paymentRequest === paymentRequestRef.current) setPayments(allPayments);
    } catch (err) {
      if (moduleRequest === moduleRequestRef.current) {
        handleApiError(err, "Failed to load contractor module.");
      }
    } finally {
      if (moduleRequest === moduleRequestRef.current) setLoading(false);
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
  useEffect(() => {
    void loadContractorModule();
    return () => {
      moduleRequestRef.current += 1;
      contractorRequestRef.current += 1;
      contractRequestRef.current += 1;
      invoiceRequestRef.current += 1;
      paymentRequestRef.current += 1;
    };
  }, [loadContractorModule]);
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
    const previous = previousInvoiceFiltersRef.current;
    if (
      previous.search === invoiceFilters.search &&
      previous.status === invoiceFilters.status &&
      previous.contractor === invoiceFilters.contractor
    ) return;
    previousInvoiceFiltersRef.current = {
      search: invoiceFilters.search,
      status: invoiceFilters.status,
      contractor: invoiceFilters.contractor,
    };
    invoiceRequestRef.current += 1;
    const delay = setTimeout(() => void loadInvoices(), 350);
    return () => clearTimeout(delay);
  }, [invoiceFilters.contractor, invoiceFilters.search, invoiceFilters.status, loadInvoices]);
  useEffect(() => {
    const previous = previousContractFiltersRef.current;
    if (previous.search === contractFilters.search && previous.status === contractFilters.status) return;
    previousContractFiltersRef.current = { search: contractFilters.search, status: contractFilters.status };
    contractRequestRef.current += 1;
    const delay = setTimeout(() => void loadContracts(), 350);
    return () => clearTimeout(delay);
  }, [contractFilters.search, contractFilters.status, loadContracts]);
  useEffect(() => {
    if (previousPaymentSearchRef.current === paymentSearch) return;
    previousPaymentSearchRef.current = paymentSearch;
    paymentRequestRef.current += 1;
    const delay = setTimeout(() => void loadPayments(), 350);
    return () => clearTimeout(delay);
  }, [loadPayments, paymentSearch]);

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

  const removeContractor = async (contractor) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await deleteContractor(contractor.id);
      setContractors((current) => current.filter((item) => item.id !== contractor.id));
      if (selectedLedger?.contractor?.id === contractor.id) {
        setSelectedLedger(null);
      }
      await Promise.all([loadSummary(), loadContracts(), loadInvoices(), loadPayments()]);
      setNotice("Contractor deleted.");
    } catch (err) {
      handleApiError(err, "Failed to delete contractor.");
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
    removeContractor,
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
