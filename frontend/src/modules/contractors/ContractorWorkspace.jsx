import React, { useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FilePlus2, UserPlus, Wrench } from "lucide-react";
import ActionButton from "../shared/erp/components/ActionButton";
import Alert from "../shared/erp/components/Alert";
import AttachmentPreviewModal from "../shared/erp/components/AttachmentPreviewModal";
import LoadingState from "../shared/erp/components/LoadingState";
import PageHeader from "../shared/erp/components/PageHeader";
import { money } from "../shared/erp/formatters";
import ContractFormModal from "./components/ContractFormModal";
import ContractorFormModal from "./components/ContractorFormModal";
import ContractorInvoiceDetailModal from "./components/ContractorInvoiceDetailModal";
import ContractorPaymentModal from "./components/ContractorPaymentModal";
import ContractorProfileModal from "./components/ContractorProfileModal";
import { contractorTabs, contractorViews, blankContract } from "./constants";
import useContractorWorkspace from "./hooks/useContractorWorkspace";
import ContractorInvoices from "./pages/ContractorInvoices";
import ContractorPayables from "./pages/ContractorPayables";
import ContractorPayments from "./pages/ContractorPayments";
import ContractorsDashboard from "./pages/ContractorsDashboard";
import ContractorsList from "./pages/ContractorsList";
import CreateContractorInvoice from "./pages/CreateContractorInvoice";
import ServiceContracts from "./pages/ServiceContracts";

export default function ContractorWorkspace({
  initialView = "dashboard",
  openInvoiceId,
  openContractorId,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamically detect role workspace base route
  const isFinance = location.pathname.startsWith("/finance-manager");
  const basePath = isFinance ? "/finance-manager" : "/admin/dashboard";

  const model = useContractorWorkspace({
    initialView,
    openInvoiceId,
    openContractorId,
    basePath,
  });

  const pageMeta =
    contractorViews[model.activeTab] || contractorViews.dashboard;

  // Safe navigation handlers keeping user in active workspace
  const handleOpenInvoice = (id) => {
    navigate(`${basePath}/contractors/invoices/${id}`);
  };

  const handleOpenContractor = (id) => {
    navigate(`${basePath}/contractors/contractors/${id}`);
  };

  // Rewrite tab URLs dynamically
  const tabs = useMemo(() => {
    if (openInvoiceId || openContractorId) return [];
    return contractorTabs.map((tab) => ({
      ...tab,
      to: tab.to
        ? tab.to.replace(/^\/admin\/dashboard/i, basePath)
        : `${basePath}/contractors`,
    }));
  }, [basePath, openInvoiceId, openContractorId]);

  const content = () => {
    if (model.loading)
      return <LoadingState label="Loading contractor workspace..." />;
    if (model.activeTab === "create") {
      return (
        <CreateContractorInvoice
          form={model.invoiceForm}
          contractors={model.contractorOptions}
          contracts={model.contractOptions}
          invoiceTotal={model.invoiceTotal}
          saving={model.saving}
          onChange={model.setInvoiceForm}
          onLineChange={model.updateInvoiceLine}
          onAddLine={model.addInvoiceLine}
          onRemoveLine={model.removeInvoiceLine}
          onSubmit={model.submitInvoice}
        />
      );
    }
    if (model.activeTab === "invoices") {
      return (
        <ContractorInvoices
          invoices={model.invoices}
          filters={model.invoiceFilters}
          contractors={model.contractorOptions}
          onFilters={model.setInvoiceFilters}
          onOpen={handleOpenInvoice}
          onPayment={model.openPaymentDialog}
        />
      );
    }
    if (model.activeTab === "contractors") {
      return (
        <ContractorsList
          contractors={model.contractors}
          onAdd={model.startAddContractor}
          onEdit={model.startEditContractor}
          onOpen={handleOpenContractor}
        />
      );
    }
    if (model.activeTab === "contracts") {
      return (
        <ServiceContracts
          contracts={model.contracts}
          filters={model.contractFilters}
          onFilters={model.setContractFilters}
          onAdd={() => {
            model.setContractForm(blankContract);
            model.setShowContractDialog(true);
          }}
        />
      );
    }
    if (model.activeTab === "payments") {
      return (
        <ContractorPayments
          payments={model.payments}
          search={model.paymentSearch}
          onSearch={model.setPaymentSearch}
        />
      );
    }
    if (model.activeTab === "payables") {
      return (
        <ContractorPayables
          invoices={model.payableInvoices}
          summary={model.summary}
          onOpen={handleOpenInvoice}
          onPayment={model.openPaymentDialog}
        />
      );
    }
    return (
      <ContractorsDashboard
        summary={model.summary}
        recentInvoices={model.invoices.slice(0, 6)}
        payableInvoices={model.payableInvoices.slice(0, 6)}
        topContractors={model.topContractors}
        payments={model.payments.slice(0, 5)}
        onOpenInvoice={handleOpenInvoice}
        onPayment={model.openPaymentDialog}
        basePath={basePath}
      />
    );
  };

  return (
    <section className="space-y-5 px-4 pb-6 lg:px-5">
      <PageHeader
        eyebrow="Contractor Management"
        breadcrumb={
          isFinance ? "Finance / Contractors" : "Admin / Finance / Contractors"
        }
        icon={Wrench}
        title={pageMeta.title}
        description={pageMeta.description}
        quickStats={[
          { label: "Active", value: model.summary?.active_contractors || 0 },
          {
            label: "Outstanding",
            value: money(model.summary?.outstanding_balance),
          },
        ]}
        tabs={tabs}
        activeTab={model.activeTab}
        actions={
          <>
            <ActionButton icon={UserPlus} onClick={model.startAddContractor}>
              Contractor
            </ActionButton>
            <Link
              to={`${basePath}/contractors/invoices/new`}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <FilePlus2 className="h-4 w-4" />
              Invoice
            </Link>
          </>
        }
      />

      {model.notice && (
        <Alert
          tone="success"
          message={model.notice}
          onClose={() => model.setNotice("")}
        />
      )}
      {model.error && (
        <Alert
          tone="error"
          message={model.error}
          onClose={() => model.setError("")}
        />
      )}
      {content()}

      {model.showContractorDialog && (
        <ContractorFormModal
          form={model.contractorForm}
          editing={model.editingContractor}
          saving={model.saving}
          onChange={model.setContractorForm}
          onSubmit={model.submitContractor}
          onClose={() => model.setShowContractorDialog(false)}
        />
      )}
      {model.showContractDialog && (
        <ContractFormModal
          form={model.contractForm}
          contractors={model.contractorOptions}
          saving={model.saving}
          onChange={model.setContractForm}
          onSubmit={model.submitContract}
          onClose={() => model.setShowContractDialog(false)}
        />
      )}
      {model.paymentDialog && (
        <ContractorPaymentModal
          invoice={model.paymentDialog}
          form={model.paymentForm}
          saving={model.saving}
          onChange={model.setPaymentForm}
          onSubmit={model.submitPayment}
          onClose={() => model.setPaymentDialog(null)}
        />
      )}
      {model.selectedInvoice && (
        <ContractorInvoiceDetailModal
          invoice={model.selectedInvoice}
          saving={model.saving}
          onClose={() => model.setSelectedInvoice(null)}
          onApprove={model.approveInvoice}
          onPayment={model.openPaymentDialog}
          onUpload={model.uploadAttachments}
          onPreview={model.previewAttachment}
          onDownload={model.downloadAttachment}
          onRemove={model.removeAttachment}
        />
      )}
      {model.selectedLedger && (
        <ContractorProfileModal
          ledger={model.selectedLedger}
          invoices={model.invoices}
          contracts={model.contracts}
          onPayment={model.openPaymentDialog}
          onClose={() => model.setSelectedLedger(null)}
        />
      )}
      {model.attachmentPreview && (
        <AttachmentPreviewModal
          preview={model.attachmentPreview}
          onClose={() => {
            URL.revokeObjectURL(model.attachmentPreview.url);
            model.setAttachmentPreview(null);
          }}
        />
      )}
    </section>
  );
}

export function ContractorDashboardPage() {
  return <ContractorWorkspace initialView="dashboard" />;
}

export function ContractorInvoicesPage() {
  return <ContractorWorkspace initialView="invoices" />;
}

export function ContractorInvoiceDetailPage() {
  const { id } = useParams();
  return <ContractorWorkspace initialView="invoices" openInvoiceId={id} />;
}

export function CreateContractorInvoicePage() {
  return <ContractorWorkspace initialView="create" />;
}

export function ContractorsPage() {
  return <ContractorWorkspace initialView="contractors" />;
}

export function ContractorProfilePage() {
  const { id } = useParams();
  return (
    <ContractorWorkspace initialView="contractors" openContractorId={id} />
  );
}

export function ServiceContractsPage() {
  return <ContractorWorkspace initialView="contracts" />;
}

export function ContractorPaymentsPage() {
  return <ContractorWorkspace initialView="payments" />;
}

export function ContractorPayablesPage() {
  return <ContractorWorkspace initialView="payables" />;
}
