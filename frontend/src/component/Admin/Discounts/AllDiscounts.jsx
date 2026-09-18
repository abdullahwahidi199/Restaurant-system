import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import PaginationControls from "../../ui/PaginationControls";
import { useTranslation as useAutoTranslation } from "react-i18next";

const PAGE_SIZE = 20;
const normalizePaginatedResponse = (data) =>
  Array.isArray(data)
    ? { results: data, count: data.length, next: null, previous: null }
    : {
        results: data?.results || [],
        count: data?.count || 0,
        next: data?.next || null,
        previous: data?.previous || null,
      };

export default function AllDiscounts() {
                 const { t: autoT } = useAutoTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    start: "",
    end: "",
  });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const getAllRequests = async (targetPage = page) => {
    try {
      setLoading(true);
      setError("");
      const res = await instance.get("orders/discount-requests", {
        params: {
          page: targetPage,
          page_size: PAGE_SIZE,
          search: filters.search || undefined,
          status: filters.status || undefined,
          start: filters.start || undefined,
          end: filters.end || undefined,
        },
      });
      const payload = normalizePaginatedResponse(res.data);
      setRequests(payload.results);
      setPagination({
        count: payload.count,
        next: payload.next,
        previous: payload.previous,
      });
    } catch (error) {
      console.error(error);
      setError(autoT("legacy.failed_to_fetch_discount_requests_please_try_again_d2a7c666"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllRequests(page);
  }, [page, filters]);

  const updateFilter = (field, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters({ search: "", status: "", start: "", end: "" });
  };

  // Helper to format ISO dates to readable local strings
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Helper to assign Tailwind classes based on status
  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 ring-green-600/20";
      case "rejected":
        return "bg-red-100 text-red-800 ring-red-600/20";
      case "pending":
        return "bg-yellow-100 text-yellow-800 ring-yellow-600/20";
      default:
        return "bg-gray-100 text-gray-800 ring-gray-600/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 text-lg font-medium animate-pulse">
          {autoT("legacy.loading_discount_requests_4b58612f")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{autoT("legacy.discount_requests_c1f68f1c")}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {autoT("legacy.manage_and_review_all_customer_discount_requests_f16dff9c")}
        </p>
      </div>

      <div className="mb-4 grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-5">
        <input
          type="search"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder={autoT("legacy.search_order_table_customer_reason_d05d8939")}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm md:col-span-2"
        />
        <select
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">{autoT("legacy.all_status_543fccc9")}</option>
          <option value="pending">{autoT("stats.pending")}</option>
          <option value="approved">{autoT("inventory_manager.statuses.approved")}</option>
          <option value="rejected">{autoT("inventory_manager.statuses.rejected")}</option>
        </select>
        <input
          type="date"
          value={filters.start}
          onChange={(event) => updateFilter("start", event.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.end}
            onChange={(event) => updateFilter("end", event.target.value)}
            className="min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            {autoT("inventory_manager.common.reset")}
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {autoT("inventory_manager.types.order")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {autoT("legacy.table_0424f6e7")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {autoT("table.customer")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {autoT("menu_item_sales.discount")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {autoT("legacy.original_c0a8060f")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {autoT("legacy.final_672b22cc")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {autoT("legacy.reason_f219cc06")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {autoT("table.status")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {autoT("legacy.requested_by_343959a4")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {autoT("legacy.approved_by_2b62a43b")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {autoT("legacy.created_at_5db1542e")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {requests.length > 0 ? (
              requests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{req.order_number}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {req.table_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {req.customer_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {req.discount_percent}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 line-through decoration-gray-300">
                    {req.original_total}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {req.final_total}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-gray-700 max-w-[150px] truncate"
                    title={req.reason}
                  >
                    {req.reason}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClasses(req.status)}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {req.requested_by_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {req.approved_by_name || (
                      <span className="text-gray-400 italic">{autoT("no_data")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {formatDate(req.created_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="11"
                  className="px-4 py-12 text-center text-sm text-gray-500 italic"
                >
                  {autoT("legacy.no_discount_requests_found_64c851d8")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls
        page={page}
        count={pagination.count}
        hasNext={Boolean(pagination.next)}
        hasPrevious={Boolean(pagination.previous)}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        className="mt-4"
      />
    </div>
  );
}
