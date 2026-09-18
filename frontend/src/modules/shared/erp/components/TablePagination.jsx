import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function TablePagination({
  page = 1,
  totalItems = 0,
  pageSize = 10,
  totalPages: totalPagesProp,
  hasNext,
  hasPrevious,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [],
  loading = false,
  className = "",
}) {
  const { t: autoT } = useAutoTranslation();
  const totalPages = Math.max(
    1,
    Number(totalPagesProp) || Math.ceil(Number(totalItems || 0) / pageSize),
  );

  if (!totalItems || totalPages <= 1) return null;

  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const canGoBack = hasPrevious ?? currentPage > 1;
  const canGoForward = hasNext ?? currentPage < totalPages;

  return (
    <div
      className={`flex flex-col gap-2.5 border-t border-[var(--theme-border)] px-4 py-2.5 text-xs theme-text-muted sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        {pageSizeOptions.length > 0 && onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span>{autoT("legacy.rows_per_page_af2f9c1b")}</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              disabled={loading}
              className="theme-input h-8 min-h-8 rounded-md px-2 text-xs"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        )}
        <span aria-live="polite">
          {autoT("legacy.showing_163d8174")} {start}-{end} {autoT("legacy.of_de04fa0e")} {Number(totalItems).toLocaleString()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canGoBack || loading}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="theme-btn theme-btn-outline theme-btn-icon disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={autoT("legacy.previous_page_81f54719")}
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        <span className="min-w-[6.5rem] text-center text-[11px] font-semibold uppercase tracking-wide">
          {autoT("legacy.page_fb06270f")} {currentPage} {autoT("legacy.of_de04fa0e")} {totalPages}
        </span>
        <button
          type="button"
          disabled={!canGoForward || loading}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="theme-btn theme-btn-outline theme-btn-icon disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={autoT("legacy.next_page_4bfc194b")}
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
