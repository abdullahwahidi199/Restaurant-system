import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  History as HistoryIcon,
  AlertCircle,
  FileText,
  Search,
  X,
  RotateCcw,
} from "lucide-react";
import instance from "../../../api/axiosInstance";
import Pagination from "./Pagination";
import { useDebounce, useLatestRequest } from "./hooks";
import { formatCurrency, formatDateTime, getActionColor } from "./helpers";
import { useTranslation as useAutoTranslation } from "react-i18next";

function ExpenseHistory() {
  const { t: autoT } = useAutoTranslation();
  const location = useLocation();
  const dashboardBase = location.pathname.startsWith("/operations-manager")
    ? "/operations-manager"
    : location.pathname.startsWith("/inventory-manager")
      ? "/inventory-manager"
      : "/admin/dashboard";

  // Data
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 400);
  const { next: nextReq, isLatest } = useLatestRequest();

  const fetchHistory = async (page = 1) => {
    const reqId = nextReq();
    setLoading(true);
    setError(null);

    try {
      const params = { page, page_size: pagination.pageSize };

      if (debouncedSearch) params.search = debouncedSearch;
      if (actionFilter !== "all") params.action = actionFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await instance.get("/expenses/expense-history/", {
        params,
      });

      if (!isLatest(reqId)) return;

      setHistory(response.data.results || []);
      const count = response.data.count || 0;

      setPagination((prev) => ({
        ...prev,
        count,
        page,
        totalPages: Math.max(1, Math.ceil(count / prev.pageSize)),
      }));
    } catch (err) {
      if (!isLatest(reqId)) return;
      setError(autoT("legacy.failed_to_load_history_47b41322"));
      console.error(err);
    } finally {
      if (isLatest(reqId)) setLoading(false);
    }
  };

  // Reset to page 1 on any filter or page size change
  useEffect(() => {
    fetchHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, actionFilter, dateFrom, dateTo, pagination.pageSize]);

  // Only change page when page number changes
  useEffect(() => {
    fetchHistory(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || loading) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const hasActiveFilters =
    !!searchTerm || actionFilter !== "all" || !!dateFrom || !!dateTo;

  const resetFilters = () => {
    setSearchTerm("");
    setActionFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link
          to={`${dashboardBase}/expenses`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 mb-4 transition"
        >
          <ArrowLeft size={16} />
          {autoT("legacy.back_to_expenses_732b199b")}
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <HistoryIcon className="text-indigo-600" size={28} />
              {autoT("legacy.expense_audit_history_0c1f0328")}
            </h1>
            <p className="text-gray-500 mt-1">
              {autoT("legacy.complete_immutable_audit_trail_of_all_expense_changes_2d9d6fd1")}
            </p>
          </div>
        </div>

        {/* Filters Bar - Exactly same consistent layout as main page */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder={autoT("legacy.search_expense_name_685bcc99")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
            >
              <option value="all">{autoT("legacy.all_actions_902f1999")}</option>
              <option value="created">{autoT("legacy.created_accf40c8")}</option>
              <option value="updated">{autoT("legacy.updated_f2f8570d")}</option>
              <option value="deleted">{autoT("legacy.deleted_441bda6c")}</option>
            </select>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title={autoT("legacy.from_date_3b5d11ae")}
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title={autoT("legacy.to_date_af244da3")}
            />

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                title={autoT("legacy.reset_all_filters_2cef9452")}
              >
                <RotateCcw size={16} /> {autoT("inventory_manager.common.reset")}
              </button>
            )}
          </div>
        </div>

        {/* Table / States */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading && history.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-block w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-3 text-gray-500">{autoT("legacy.loading_history_59c39817")}</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle
                className="inline-block text-red-500 mb-2"
                size={32}
              />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={() => fetchHistory(1)}
                className="mt-3 text-sm text-indigo-600 hover:underline"
              >
                {autoT("landing.marketplace.discovery.retry")}
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <FileText size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {autoT("legacy.no_history_entries_found_2f5be2cb")}
              </h3>
              <p className="text-gray-500 mb-4">
                {hasActiveFilters
                  ? autoT("legacy.try_adjusting_your_filters_11962c19")
                  : autoT("legacy.no_expense_changes_have_been_recorded_yet_76192842")}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <RotateCcw size={16} /> {autoT("legacy.reset_filters_5be69856")}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {autoT("legacy.expense_a0db8e68")}
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {autoT("legacy.amount_43dc8532")}
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {autoT("inventory_manager.common.action")}
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {autoT("legacy.date_time_63ae7caf")}
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {autoT("legacy.changes_8aa57de6")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {history.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(item.amount, item.currency)}
                          </div>
                          {item.currency === "USD" && (
                            <div className="text-xs text-gray-500">
                              ≈ {formatCurrency(item.amount_afn, "AFN")}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${getActionColor(
                              item.action,
                            )}`}
                          >
                            {item.action}
                          </span>
                        </td>
                        <td c$lassName="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {formatDateTime(item.date_time)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {item.changed_fields &&
                          Object.keys(item.changed_fields).length > 0 ? (
                            <div className="space-y-1 max-w-md">
                              {Object.entries(item.changed_fields).map(
                                ([field, values]) => (
                                  <div
                                    key={field}
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <span className="font-semibold text-gray-700 min-w-[80px]">
                                      {field}:
                                    </span>
                                    <span className="text-gray-500 line-through">
                                      {String(values.old)}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-indigo-700 font-medium">
                                      {String(values.new)}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.count}
                pageSize={pagination.pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={(size) =>
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: size,
                    page: 1,
                  }))
                }
                loading={loading}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpenseHistory;
