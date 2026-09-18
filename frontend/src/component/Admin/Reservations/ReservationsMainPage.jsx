import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import ReservationsTable from "./ReservationsTable";
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

export default function ReservationsMainPage() {
                 const { t: autoT } = useAutoTranslation();
  const [reservations, setReservations] = useState([]);
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
  const fetchReservations = async (targetPage = page) => {
    try {
      const res = await instance.get("/orders/reservations/", {
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
      setReservations(payload.results);
      setPagination({
        count: payload.count,
        next: payload.next,
        previous: payload.previous,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchReservations(page);
  }, [page, filters]);

  const updateFilter = (field, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters({ search: "", status: "", start: "", end: "" });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-5">
        <input
          type="search"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder={autoT("legacy.search_name_phone_table_7703d5f9")}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm md:col-span-2"
        />
        <select
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">{autoT("legacy.all_status_543fccc9")}</option>
          <option value="reserved">{autoT("legacy.reserved_67a6ff10")}</option>
          <option value="arrived">{autoT("legacy.arrived_a22d66c8")}</option>
          <option value="completed">{autoT("stats.completed")}</option>
          <option value="cancelled">{autoT("status.cancelled")}</option>
          <option value="no_show">{autoT("legacy.no_show_7ed172ed")}</option>
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
      <ReservationsTable reservations={reservations} />
      <PaginationControls
        page={page}
        count={pagination.count}
        hasNext={Boolean(pagination.next)}
        hasPrevious={Boolean(pagination.previous)}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
