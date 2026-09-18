import React from "react";
import { Upload } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function FileUploader({ disabled, onFiles }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--theme-border-strong)] bg-[var(--theme-muted)] px-4 py-5 text-[13px] font-semibold theme-text-secondary transition hover:border-[var(--theme-primary)] hover:bg-[var(--theme-surface)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--theme-surface)] theme-text-muted shadow-sm">
        <Upload className="h-4 w-4" />
      </span>
      <span>{autoT("legacy.drop_files_here_or_choose_attachments_28b4dee0")}</span>
      <span className="text-xs font-normal theme-text-muted">{autoT("legacy.pdf_jpg_and_png_supported_8bc9b7ab")}</span>
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
