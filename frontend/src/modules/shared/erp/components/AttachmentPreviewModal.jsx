import React from "react";
import { Maximize2, X } from "lucide-react";

export default function AttachmentPreviewModal({ preview, onClose }) {
  const { attachment, url } = preview;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950/95">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="truncate font-semibold">{attachment.original_filename}</p>
          <p className="text-xs text-white/60">
            Uploaded by {attachment.uploaded_by_name || "System"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm transition hover:bg-white/10"
          >
            <Maximize2 className="h-4 w-4" />
            Open
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 transition hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        {attachment.file_type === "pdf" ? (
          <iframe title={attachment.original_filename} src={url} className="h-full w-full rounded-lg bg-white" />
        ) : (
          <img src={url} alt={attachment.original_filename} className="max-h-full max-w-full rounded-lg object-contain" />
        )}
      </div>
    </div>
  );
}
