import React, { useState } from "react";
import { BadgeCheck, Check, CreditCard, Download, File, FileText, History, Paperclip, Trash2, Wallet } from "lucide-react";
import DataTable from "../../shared/erp/components/DataTable";
import FileUploader from "../../shared/erp/components/FileUploader";
import Modal from "../../shared/erp/components/Modal";
import Panel from "../../shared/erp/components/Panel";
import StatusBadge from "../../shared/erp/components/StatusBadge";
import { formatMethod, money } from "../../shared/erp/formatters";
import AuditTimeline from "../../audit/components/AuditTimeline";
import { formatFileSize, getContractorInvoiceNumber } from "../utils/calculations";

function Lines({ lines = [] }) {
  return (
    <DataTable
      rows={lines}
      empty="No service lines found."
      columns={[
        { key: "service_type", header: "Service" },
        { key: "description", header: "Description", render: (line) => line.description || "-" },
        { key: "quantity", header: "Qty", className: "px-4 py-3 text-right" },
        { key: "unit_price", header: "Unit Price", className: "px-4 py-3 text-right", render: (line) => money(line.unit_price) },
        { key: "total", header: "Total", className: "px-4 py-3 text-right font-semibold text-slate-950", render: (line) => money(line.total_price) },
      ]}
    />
  );
}

function Attachments({ invoice, onPreview, onDownload, onRemove }) {
  const attachments = invoice.attachments || [];
  if (!attachments.length) {
    return <p className="rounded-lg border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">No supporting documents uploaded yet.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex h-24 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
            {attachment.file_type === "pdf" ? <FileText className="h-9 w-9 text-rose-500" /> : <File className="h-9 w-9" />}
          </div>
          <p className="mt-3 truncate text-sm font-semibold text-slate-950">{attachment.original_filename}</p>
          <p className="text-xs text-slate-500">{formatFileSize(attachment.file_size)} - {attachment.uploaded_by_name || "System"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => onPreview(invoice, attachment)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold hover:bg-slate-50">Preview</button>
            <button type="button" onClick={() => onDownload(invoice, attachment)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button type="button" onClick={() => onRemove(invoice, attachment)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Payments({ invoice, onPayment }) {
  const payments = invoice.payments || [];
  if (!payments.length) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">No contractor payments recorded for this invoice.</p>
        {Number(invoice.remaining_balance || 0) > 0 && (
          <button type="button" onClick={() => onPayment(invoice)} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            <CreditCard className="h-4 w-4" />
            Record Payment
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div key={payment.id} className="flex gap-3 rounded-lg border border-slate-200 p-3">
          <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <BadgeCheck className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-950">{money(payment.amount)}</p>
              <p className="text-sm text-slate-500">{payment.date}</p>
            </div>
            <p className="text-sm text-slate-500">
              {formatMethod(payment.payment_method)}
              {payment.reference_number ? ` - ${payment.reference_number}` : ""}
            </p>
            {payment.notes && <p className="mt-1 text-sm text-slate-600">{payment.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ContractorInvoiceDetailModal({
  invoice,
  saving,
  onClose,
  onApprove,
  onPayment,
  onUpload,
  onPreview,
  onDownload,
  onRemove,
}) {
  const [activeTab, setActiveTab] = useState("details");
  const tabs = [
    ["details", "Details", FileText],
    ["attachments", "Attachments", Paperclip],
    ["payments", "Payments", Wallet],
    ["audit", "Audit History", History],
  ];

  return (
    <Modal title={`Contractor Invoice ${getContractorInvoiceNumber(invoice)}`} onClose={onClose} wide>
      <div className="space-y-5 p-5">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {tabs.map(([key, label, Icon]) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${activeTab === key ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {React.createElement(Icon, { className: "h-4 w-4" })}
              {label}
            </button>
          ))}
        </div>
        {activeTab === "details" && (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-4">
              <Panel title="Contractor"><p className="text-sm font-semibold text-slate-950">{invoice.contractor_name}</p></Panel>
              <Panel title="Contract"><p className="text-sm font-semibold text-slate-950">{invoice.contract_title || "-"}</p></Panel>
              <Panel title="Invoice Date"><p className="text-sm font-semibold text-slate-950">{invoice.invoice_date || "-"}</p></Panel>
              <Panel title="Status"><StatusBadge status={invoice.status} /></Panel>
            </div>
            <Lines lines={invoice.lines || []} />
            <div className="grid gap-3 md:grid-cols-3">
              <Panel title="Invoice Total"><p className="text-lg font-semibold text-slate-950">{money(invoice.total_amount)}</p></Panel>
              <Panel title="Paid"><p className="text-lg font-semibold text-emerald-700">{money(invoice.amount_paid)}</p></Panel>
              <Panel title="Remaining"><p className="text-lg font-semibold text-rose-700">{money(invoice.remaining_balance)}</p></Panel>
            </div>
            {invoice.description && <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600">{invoice.description}</div>}
          </div>
        )}
        {activeTab === "attachments" && (
          <div className="space-y-4">
            <FileUploader disabled={saving} onFiles={(files) => onUpload(invoice.id, files)} />
            <Attachments invoice={invoice} onPreview={onPreview} onDownload={onDownload} onRemove={onRemove} />
          </div>
        )}
        {activeTab === "payments" && <Payments invoice={invoice} onPayment={onPayment} />}
        {activeTab === "audit" && (
          <AuditTimeline
            module="CONTRACTORS"
            objectType="ContractorInvoice"
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
          {Number(invoice.remaining_balance || 0) > 0 && invoice.status !== "draft" && (
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
