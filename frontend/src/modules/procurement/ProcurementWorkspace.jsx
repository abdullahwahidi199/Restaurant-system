import React, { useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FilePlus2, UserPlus, Wallet } from "lucide-react";
import ActionButton from "../shared/erp/components/ActionButton";
import Alert from "../shared/erp/components/Alert";
import LoadingState from "../shared/erp/components/LoadingState";
import PageHeader from "../shared/erp/components/PageHeader";
import { money } from "../shared/erp/formatters";
import AttachmentPreviewModal from "../shared/erp/components/AttachmentPreviewModal";
import PaymentVoucherModal from "./components/PaymentVoucherModal";
import PurchaseInvoiceDetailModal from "./components/PurchaseInvoiceDetailModal";
import SupplierFormModal from "./components/SupplierFormModal";
import SupplierPaymentModal from "./components/SupplierPaymentModal";
import SupplierProfileModal from "./components/SupplierProfileModal";
import { procurementTabs, procurementViews } from "./constants";
import useProcurementWorkspace from "./hooks/useProcurementWorkspace";
import CreatePurchaseInvoice from "./pages/CreatePurchaseInvoice";
import OutstandingPayables from "./pages/OutstandingPayables";
import ProcurementDashboard from "./pages/ProcurementDashboard";
import PurchaseInvoices from "./pages/PurchaseInvoices";
import SupplierPayments from "./pages/SupplierPayments";
import Suppliers from "./pages/Suppliers";

const getEntityId = (value) => value?.id ?? value;

export default function ProcurementWorkspace({
  onCreated,
  initialView = "dashboard",
  openInvoiceId,
  openSupplierId,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamically determine base path based on current URL workspace
  const isFinance = location.pathname.startsWith("/finance-manager");
  const isOperations = location.pathname.startsWith("/operations-manager");
  const basePath = isFinance
    ? "/finance-manager"
    : isOperations
      ? "/operations-manager"
      : "/admin/dashboard";

  const model = useProcurementWorkspace({
    initialView,
    openInvoiceId,
    openSupplierId,
    onCreated,
    basePath,
  });

  const pageMeta =
    procurementViews[model.activeTab] || procurementViews.dashboard;

  // Safe navigation handlers that respect the active workspace base path
  const handleOpenInvoice = (invoiceOrId) => {
    const id = getEntityId(invoiceOrId);
    if (!id) return;
    navigate(`${basePath}/procurement/purchase-invoices/${id}`);
  };

  const handleOpenSupplier = (supplierOrId) => {
    const id = getEntityId(supplierOrId);
    if (!id) return;
    navigate(`${basePath}/procurement/suppliers/${id}`);
  };

  // Rewrite tab paths dynamically so tab clicks stay in the current workspace
  const tabs = useMemo(() => {
    if (openInvoiceId || openSupplierId) return [];
    return procurementTabs.map((tab) => ({
      ...tab,
      to: tab.to ? `${basePath}${tab.to}` : `${basePath}/procurement`,
    }));
  }, [basePath, openInvoiceId, openSupplierId]);

  const content = () => {
    if (model.loading) return <LoadingState label="Loading procurement..." />;
    if (model.activeTab === "create") {
      return (
        <CreatePurchaseInvoice
          form={model.invoiceForm}
          suppliers={model.supplierOptions}
          ingredients={model.ingredients}
          ingredientMap={model.ingredientMap}
          invoiceTotal={model.invoiceTotal}
          paidInitially={model.paidInitially}
          remainingBalance={model.remainingBalance}
          saving={model.saving}
          onField={model.updateInvoiceField}
          onLineChange={model.updateLine}
          onAddLine={model.addLine}
          onRemoveLine={model.removeLine}
          onSubmit={model.submitInvoice}
        />
      );
    }
    if (model.activeTab === "invoices") {
      return (
        <PurchaseInvoices
          invoices={model.invoices}
          filters={model.invoiceFilters}
          onFilters={model.setInvoiceFilters}
          onOpen={handleOpenInvoice}
          onPayment={model.openPaymentDialog}
        />
      );
    }
    if (model.activeTab === "suppliers") {
      return (
        <Suppliers
          suppliers={model.suppliers}
          onAdd={() => model.setShowSupplierDialog(true)}
          onOpen={handleOpenSupplier}
          onToggle={model.toggleSupplier}
        />
      );
    }
    if (model.activeTab === "payments") {
      return (
        <SupplierPayments
          payments={model.payments}
          search={model.paymentSearch}
          onSearch={model.setPaymentSearch}
          onPayment={model.openPaymentDialog}
          onVoucher={model.openVoucherPreview}
          onVoucherPdf={model.downloadVoucherPdf}
        />
      );
    }
    if (model.activeTab === "payables") {
      return (
        <OutstandingPayables
          suppliers={model.suppliers}
          invoices={model.stats.unpaidInvoices}
          stats={model.stats}
          onOpenInvoice={handleOpenInvoice}
          onPayment={model.openPaymentDialog}
          onOpenSupplier={handleOpenSupplier}
        />
      );
    }
    return (
      <ProcurementDashboard
        basePath={basePath}
        stats={model.stats}
        invoices={model.invoices}
        payments={model.payments}
        onOpenInvoice={handleOpenInvoice}
        onOpenSupplier={handleOpenSupplier}
        onPayment={model.openPaymentDialog}
      />
    );
  };

  return (
    <section className="space-y-5 px-4 pb-6 lg:px-5">
      <PageHeader
        eyebrow="Pakhlai Procurement"
        breadcrumb={
          isFinance
            ? "Finance / Procurement"
            : isOperations
              ? "Operations / Procurement"
              : "Admin / Finance / Procurement"
        }
        icon={Wallet}
        title={pageMeta.title}
        description={pageMeta.description}
        quickStats={[
          {
            label: "Month Spend",
            value: money(model.stats.purchasesThisMonth),
          },
          {
            label: "Payables",
            value: money(model.stats.outstandingSupplierPayables),
          },
        ]}
        tabs={tabs}
        activeTab={model.activeTab}
        actions={
          <>
            <Link
              to={`${basePath}/procurement/purchase-invoices/new`}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FilePlus2 className="h-4 w-4" />
              New Invoice
            </Link>
            <ActionButton
              icon={UserPlus}
              onClick={() => model.setShowSupplierDialog(true)}
            >
              Supplier
            </ActionButton>
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

      {model.showSupplierDialog && (
        <SupplierFormModal
          form={model.supplierForm}
          saving={model.saving}
          onChange={model.setSupplierForm}
          onSubmit={model.submitSupplier}
          onClose={() => model.setShowSupplierDialog(false)}
        />
      )}
      {model.selectedInvoice && (
        <PurchaseInvoiceDetailModal
          basePath={basePath}
          invoice={model.selectedInvoice}
          saving={model.saving}
          onClose={() => model.setSelectedInvoice(null)}
          onPayment={model.openPaymentDialog}
          onApprove={model.approveDraft}
          onUploadAttachments={model.uploadAttachments}
          onPreviewAttachment={model.previewAttachment}
          onDownloadAttachment={model.downloadAttachment}
          onRemoveAttachment={model.removeAttachment}
          onPrintVoucher={model.openVoucherPreview}
          onDownloadVoucher={model.downloadVoucherPdf}
        />
      )}
      {model.selectedSupplierLedger && (
        <SupplierProfileModal
          ledger={model.selectedSupplierLedger}
          onClose={() => model.setSelectedSupplierLedger(null)}
        />
      )}
      {model.paymentDialog && (
        <SupplierPaymentModal
          invoice={model.paymentDialog?.id ? model.paymentDialog : null}
          form={model.paymentForm}
          supplierOptions={model.supplierOptions}
          invoiceOptions={model.invoiceOptions}
          saving={model.saving}
          onChange={model.setPaymentForm}
          onSubmit={model.submitPayment}
          onClose={() => model.setPaymentDialog(null)}
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
      {model.voucherPreview && (
        <PaymentVoucherModal
          voucher={model.voucherPreview}
          onClose={() => model.setVoucherPreview(null)}
        />
      )}
    </section>
  );
}

export function ProcurementDashboardPage() {
  return <ProcurementWorkspace initialView="dashboard" />;
}

export function PurchaseInvoicesPage() {
  return <ProcurementWorkspace initialView="invoices" />;
}

export function PurchaseInvoiceDetailPage() {
  const { id } = useParams();
  return <ProcurementWorkspace initialView="invoices" openInvoiceId={id} />;
}

export function CreatePurchaseInvoicePage() {
  return <ProcurementWorkspace initialView="create" />;
}

export function SuppliersPage() {
  return <ProcurementWorkspace initialView="suppliers" />;
}

export function SupplierProfilePage() {
  const { id } = useParams();
  return <ProcurementWorkspace initialView="suppliers" openSupplierId={id} />;
}

export function SupplierPaymentsPage() {
  return <ProcurementWorkspace initialView="payments" />;
}

export function OutstandingPayablesPage() {
  return <ProcurementWorkspace initialView="payables" />;
}
