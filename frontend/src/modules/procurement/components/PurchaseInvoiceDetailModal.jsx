import React, { useState } from "react";
import {
  Check,
  CreditCard,
  FileText,
  History,
  Paperclip,
  Wallet,
} from "lucide-react";
import FileUploader from "../../shared/erp/components/FileUploader";
import Modal from "../../shared/erp/components/Modal";
import Panel from "../../shared/erp/components/Panel";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { compactDate, money } from "../../shared/erp/formatters";
import { getInvoiceNumber } from "../utils/calculations";
import AuditTimeline from "../../audit/components/AuditTimeline";
import PurchaseAttachmentList from "./PurchaseAttachmentList";
import PurchaseInvoiceLinesTable from "./PurchaseInvoiceLinesTable";
import PurchasePaymentHistory from "./PurchasePaymentHistory";

export default function PurchaseInvoiceDetailModal({
  basePath = "/admin/dashboard",
  invoice,
  saving,
  onClose,
  onPayment,
  onApprove,
  onUploadAttachments,
  onPreviewAttachment,
  onDownloadAttachment,
  onRemoveAttachment,
  onPrintVoucher,
  onDownloadVoucher,
}) {
  const [activeTab, setActiveTab] = useState("details");
  const tabs = [
    ["details", "Details", FileText],
    ["attachments", "Attachments", Paperclip],
    ["payments", "Payments", Wallet],
    ["audit", "Audit History", History],
  ];

  return (
    <Modal title={`Purchase Invoice ${getInvoiceNumber(invoice)}`} onClose={onClose} wide>
      <div className="space-y-5 p-5">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {tabs.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeTab === key ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {React.createElement(Icon, { className: "h-4 w-4" })}
              {label}
            </button>
          ))}
        </div>
        {activeTab === "details" && (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-4">
              <Panel title="Supplier"><p className="text-sm font-semibold text-slate-950">{invoice.supplier_name || "Cash / No Supplier"}</p></Panel>
              <Panel title="Purchase Date"><p className="text-sm font-semibold text-slate-950">{compactDate(invoice.purchase_date)}</p></Panel>
              <Panel title="Due Date"><p className="text-sm font-semibold text-slate-950">{compactDate(invoice.due_date)}</p></Panel>
              <Panel title="Status"><StatusBadge status={invoice.status} /></Panel>
            </div>
            <PurchaseInvoiceLinesTable
              basePath={basePath}
              lines={invoice.lines || []}
            />
            <div className="grid gap-3 md:grid-cols-3">
              <Panel title="Invoice Total"><p className="text-lg font-semibold text-slate-950">{money(invoice.total_amount)}</p></Panel>
              <Panel title="Paid"><p className="text-lg font-semibold text-emerald-700">{money(invoice.amount_paid)}</p></Panel>
              <Panel title="Remaining"><p className="text-lg font-semibold text-rose-700">{money(invoice.remaining_balance)}</p></Panel>
            </div>
            {invoice.notes && <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600">{invoice.notes}</div>}
          </div>
        )}
        {activeTab === "attachments" && (
          <div className="space-y-4">
            <FileUploader disabled={saving} onFiles={(files) => onUploadAttachments(invoice.id, files)} />
            <PurchaseAttachmentList invoice={invoice} onPreview={onPreviewAttachment} onDownload={onDownloadAttachment} onRemove={onRemoveAttachment} />
          </div>
        )}
        {activeTab === "payments" && (
          <PurchasePaymentHistory invoice={invoice} onPayment={onPayment} onPrintVoucher={onPrintVoucher} onDownloadVoucher={onDownloadVoucher} />
        )}
        {activeTab === "audit" && (
          <AuditTimeline
            module="PROCUREMENT"
            objectType="PurchaseInvoice"
            objectId={invoice.id}
          />
        )}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          {invoice.status === "draft" && (
            <button type="button" disabled={saving} onClick={() => onApprove(invoice)} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              <Check className="h-4 w-4" />
              Approve
            </button>
          )}
          {invoice.supplier && Number(invoice.remaining_balance) > 0 && invoice.status !== "draft" && (
            <button type="button" onClick={() => onPayment(invoice)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <CreditCard className="h-4 w-4" />
              Record Payment
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
