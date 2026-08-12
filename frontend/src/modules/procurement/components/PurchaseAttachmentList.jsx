import React from "react";
import { Download, File, FileText, Trash2 } from "lucide-react";
import { formatFileSize } from "../utils/calculations";

export default function PurchaseAttachmentList({ invoice, onPreview, onDownload, onRemove }) {
  const attachments = invoice.attachments || [];
  if (!attachments.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
        No supplier invoice scans or supporting documents uploaded yet.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex h-24 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
            {attachment.file_type === "pdf" ? (
              <FileText className="h-9 w-9 text-rose-500" />
            ) : (
              <File className="h-9 w-9" />
            )}
          </div>
          <p className="mt-3 truncate text-sm font-semibold text-slate-950">
            {attachment.original_filename}
          </p>
          <p className="text-xs text-slate-500">
            {formatFileSize(attachment.file_size)} - {attachment.uploaded_by_name || "System"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => onPreview(invoice, attachment)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold hover:bg-slate-50">
              Preview
            </button>
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
