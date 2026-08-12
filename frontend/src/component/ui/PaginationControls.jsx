import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

export default function PaginationControls({
  page,
  count = 0,
  hasNext,
  hasPrevious,
  onPageChange,
  pageSize = PAGE_SIZE,
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil(Number(count || 0) / pageSize));

  if (!count || totalPages <= 1) return null;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 ${className}`}
    >
      <span>
        Page <span className="font-semibold text-gray-900">{page}</span> of{" "}
        <span className="font-semibold text-gray-900">{totalPages}</span>
        <span className="ml-2 text-gray-400">({count} total)</span>
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={!hasPrevious || page <= 1}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Prev
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={!hasNext || page >= totalPages}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
