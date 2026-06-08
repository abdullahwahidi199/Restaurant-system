// src/pages/expenses/Pagination.jsx
import { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const set = new Set([1, total, current]);
  if (current - 1 > 1) set.add(current - 1);
  if (current + 1 < total) set.add(current + 1);

  const sorted = Array.from(set).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      out.push("...");
    }
  }
  return out;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
}) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <label className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={loading}
            className="px-2 py-1 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
        <span className="text-gray-500">
          {start}–{end} of {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <NavBtn
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
          title="First page"
        >
          <ChevronsLeft size={16} />
        </NavBtn>
        <NavBtn
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </NavBtn>

        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span key={`d-${i}`} className="px-2 text-gray-400 select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={loading}
              className={`min-w-[34px] h-8 px-2 rounded-md text-sm font-medium transition disabled:opacity-60 ${
                p === currentPage
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <NavBtn
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          title="Next page"
        >
          <ChevronRight size={16} />
        </NavBtn>
        <NavBtn
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
          title="Last page"
        >
          <ChevronsRight size={16} />
        </NavBtn>
      </div>
    </div>
  );
}

function NavBtn({ children, ...props }) {
  return (
    <button
      {...props}
      className="p-1.5 rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition"
    >
      {children}
    </button>
  );
}
