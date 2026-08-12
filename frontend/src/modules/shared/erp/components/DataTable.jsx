import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Download } from "lucide-react";
import EmptyState from "./EmptyState";

const actionKeys = new Set(["action", "actions"]);

const getSortValue = (column, row) => {
  if (column.sortValue) return column.sortValue(row);
  return row[column.key] ?? "";
};

const stringify = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).replaceAll('"', '""');
};

export default function DataTable({
  columns = [],
  rows = [],
  empty,
  rowKey = "id",
  pageSize = 10,
  exportFilename = "erp-export.csv",
  showExport = true,
}) {
  const [sort, setSort] = useState({ key: "", direction: "asc" });
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  const sortedRows = useMemo(() => {
    if (!sort.key) return rows;
    const column = columns.find((item) => item.key === sort.key);
    if (!column) return rows;
    return [...rows].sort((a, b) => {
      const left = getSortValue(column, a);
      const right = getSortValue(column, b);
      const leftNumber = Number(left);
      const rightNumber = Number(right);
      const result =
        Number.isFinite(leftNumber) && Number.isFinite(rightNumber)
          ? leftNumber - rightNumber
          : String(left).localeCompare(String(right));
      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, rows, sort]);

  const visibleRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);
  const start = rows.length ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, rows.length);
  const dataColumns = columns.filter((column) => !actionKeys.has(column.key));
  const actionColumns = columns.filter((column) => actionKeys.has(column.key));

  const toggleSort = (column) => {
    if (column.sortable === false || actionKeys.has(column.key)) return;
    setPage(1);
    setSort((current) => ({
      key: column.key,
      direction: current.key === column.key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const exportCsv = () => {
    const exportableColumns = columns.filter((column) => !actionKeys.has(column.key));
    const header = exportableColumns.map((column) => `"${stringify(column.header)}"`).join(",");
    const body = sortedRows.map((row) =>
      exportableColumns
        .map((column) => `"${stringify(column.exportValue ? column.exportValue(row) : getSortValue(column, row))}"`)
        .join(","),
    );
    const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="theme-table overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 theme-surface">
        <p className="text-xs font-semibold uppercase tracking-wide theme-text-muted">
          {rows.length.toLocaleString()} records
        </p>
        {showExport && rows.length > 0 && (
          <button
            type="button"
            onClick={exportCsv}
            className="theme-btn theme-btn-outline px-3 py-2 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        )}
      </div>
      <div className="space-y-3 p-3 md:hidden">
        {rows.length ? (
          visibleRows.map((row, index) => (
            <article
              key={row[rowKey] ?? index}
              className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 shadow-sm"
            >
              <div className="space-y-3">
                {dataColumns.map((column, columnIndex) => (
                  <div
                    key={column.key}
                    className={
                      columnIndex === 0
                        ? "border-b border-[var(--theme-border)] pb-3"
                        : "flex items-start justify-between gap-3"
                    }
                  >
                    <span
                      className={
                        columnIndex === 0
                          ? "sr-only"
                          : "text-xs font-semibold uppercase tracking-wide theme-text-muted"
                      }
                    >
                      {column.header}
                    </span>
                    <div
                      className={
                        columnIndex === 0
                          ? "text-base font-bold theme-text-primary"
                          : "min-w-0 text-right text-sm font-medium theme-text-secondary"
                      }
                    >
                      {column.render ? column.render(row, index) : row[column.key]}
                    </div>
                  </div>
                ))}
              </div>

              {actionColumns.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--theme-border)] pt-3">
                  {actionColumns.map((column) => (
                    <div key={column.key}>
                      {column.render ? column.render(row, index) : row[column.key]}
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="px-1 py-4">
            {React.isValidElement(empty) ? (
              empty
            ) : (
              <EmptyState
                title={empty || "No records found"}
                description="Adjust filters or create a new record to see it here."
              />
            )}
          </div>
        )}
      </div>

      <div className="hidden max-h-[68vh] overflow-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="sticky top-0 z-10 text-xs font-bold uppercase tracking-wide backdrop-blur">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.headerClassName || "px-4 py-3"}>
                  {column.sortable === false || actionKeys.has(column.key) ? (
                    column.header
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleSort(column)}
                      className="inline-flex items-center gap-1.5 transition hover:text-[var(--theme-primary)]"
                    >
                      {column.header}
                      {sort.key === column.key ? (
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition ${sort.direction === "desc" ? "rotate-180" : ""}`}
                        />
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 text-[var(--theme-disabled-text)]" />
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--theme-border)]">
            {rows.length ? (
              visibleRows.map((row, index) => (
                <tr
                  key={row[rowKey] ?? index}
                  className="transition"
                >
                  {columns.map((column) => (
                    <td key={column.key} className={column.className || "px-4 py-4 align-middle theme-text-secondary"}>
                      {column.render ? column.render(row, index) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8">
                  {React.isValidElement(empty) ? (
                    empty
                  ) : (
                    <EmptyState
                      title={empty || "No records found"}
                      description="Adjust filters or create a new record to see it here."
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {rows.length > pageSize && (
        <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm theme-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {start}-{end} of {rows.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="theme-btn theme-btn-outline h-9 w-9 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold uppercase tracking-wide">
              Page {page} of {pageCount}
            </span>
            <button
              type="button"
              disabled={page === pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              className="theme-btn theme-btn-outline h-9 w-9 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
