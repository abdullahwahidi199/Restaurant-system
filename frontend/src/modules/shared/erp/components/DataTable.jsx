import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronsUpDown, Download } from "lucide-react";
import EmptyState from "./EmptyState";
import TablePagination from "./TablePagination";
import { useTranslation as useAutoTranslation } from "react-i18next";

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
                 const { t: autoT } = useAutoTranslation();
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
      <div className="flex min-h-10 items-center justify-between gap-3 border-b px-3 py-1.5 theme-surface">
        <p className="text-xs font-semibold uppercase tracking-wide theme-text-muted">
          {rows.length.toLocaleString()} {autoT("legacy.records_86761b63")}
        </p>
        {showExport && rows.length > 0 && (
          <button
            type="button"
            onClick={exportCsv}
            className="theme-btn theme-btn-outline h-8 px-3 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            {autoT("legacy.export_f3e4fadb")}
          </button>
        )}
      </div>
      <div className="space-y-2 p-2.5 md:hidden">
        {rows.length ? (
          visibleRows.map((row, index) => (
            <article
              key={row[rowKey] ?? index}
              className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3"
            >
              <div className="space-y-2.5">
                {dataColumns.map((column, columnIndex) => (
                  <div
                    key={column.key}
                    className={
                      columnIndex === 0
                        ? "border-b border-[var(--theme-border)] pb-2.5"
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
                          ? "text-sm font-bold theme-text-primary"
                          : "min-w-0 text-right text-xs font-medium theme-text-secondary"
                      }
                    >
                      {column.render ? column.render(row, index) : row[column.key]}
                    </div>
                  </div>
                ))}
              </div>

              {actionColumns.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--theme-border)] pt-3">
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
                title={empty || autoT("legacy.no_records_found_96f4f9b2")}
                description={autoT("legacy.adjust_filters_or_create_a_new_record_to_see_it_here_b57f25fa")}
              />
            )}
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] rtl:text-right ltr:text-left">
          <thead>
            <tr>
              {columns.map((column) => {
                const rightAligned = actionKeys.has(column.key) || column.className?.includes("text-right");
                return (
                <th
                  key={column.key}
                  className={column.headerClassName || (rightAligned ? "text-right" : "")}
                  aria-sort={
                    sort.key === column.key
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {column.sortable === false || actionKeys.has(column.key) ? (
                    column.header
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleSort(column)}
                      className={`inline-flex items-center gap-1.5 transition hover:text-[var(--theme-primary)] ${rightAligned ? "ml-auto" : ""}`}
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
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              visibleRows.map((row, index) => (
                <tr
                  key={row[rowKey] ?? index}
                  className="border-b border-[var(--theme-border)] transition"
                >
                  {columns.map((column) => (
                    <td key={column.key} className={column.className || "align-middle theme-text-secondary"}>
                      {column.render ? column.render(row, index) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-5">
                  {React.isValidElement(empty) ? (
                    empty
                  ) : (
                    <EmptyState
                      title={empty || autoT("legacy.no_records_found_96f4f9b2")}
                      description={autoT("legacy.adjust_filters_or_create_a_new_record_to_see_it_here_b57f25fa")}
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        totalItems={rows.length}
        pageSize={pageSize}
        totalPages={pageCount}
        onPageChange={setPage}
      />
    </div>
  );
}
