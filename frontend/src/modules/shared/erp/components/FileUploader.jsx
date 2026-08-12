import React from "react";
import { Upload } from "lucide-react";

export default function FileUploader({ disabled, onFiles }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-white">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
        <Upload className="h-5 w-5" />
      </span>
      <span>Drop files here or choose attachments</span>
      <span className="text-xs font-normal text-slate-400">PDF, JPG, and PNG supported</span>
      <input
        type="file"
        multiple
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          onFiles?.(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}
