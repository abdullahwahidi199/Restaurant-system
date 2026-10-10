import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Loader2,
  RefreshCw,
  TicketPercent,
  AlertTriangle,
  Inbox,
} from "lucide-react";

import instance from "../../../api/axiosInstance";
import DiscountRequestCard from "../../Manager/DiscountRequest/DiscountRequestCard";
import useDiscountSocket from "../../../hooks/useDiscoutSocket";
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

export default function AdminDiscountsMain() {
  const { t: autoT } = useAutoTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "pending").length,
    [requests],
  );

  const fetchPendingRequests = async (targetPage = page) => {
    try {
      setError("");
      setLoading(true);

      const res = await instance.get(
        "/orders/admin/discount-requests/pending/",
        {
          params: {
            page: targetPage,
            page_size: PAGE_SIZE,
            search: search || undefined,
          },
        },
      );

      const payload = normalizePaginatedResponse(res.data);
      setRequests(payload.results);
      setPagination({
        count: payload.count,
        next: payload.next,
        previous: payload.previous,
      });
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.detail ||
          error?.message ||
          "Failed to load discount requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests(page);
  }, [page, search]);

  const handleAction = async (id, action) => {
    try {
      setActionLoading(id);

      await instance.patch(`/orders/discounts/${id}/approveOrReject/`, {
        action,
      });

      fetchPendingRequests(page);
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        `Failed to ${action} request.`;

      setError(message);

      setTimeout(() => {
        setError("");
      }, 4000);
    } finally {
      setActionLoading(null);
    }
  };

  const approveRequest = (id) => handleAction(id, "approve");
  const rejectRequest = (id) => handleAction(id, "reject");

  useDiscountSocket((data) => {
    console.log("DISCOUNT REALTIME:", data);

    if (data.type === "NEW_DISCOUNT_REQUEST") {
      setRequests((prev) => {
        const exists = prev.find((r) => r.id === data.discount.id);

        // if request already exists -> update it
        if (exists) {
          return prev.map((req) =>
            req.id === data.discount.id ? data.discount : req,
          );
        }

        // if new pending request -> add it
        if (data.discount.status === "pending") {
          if (page === 1) {
            setPagination((current) => ({
              ...current,
              count: Number(current.count || 0) + 1,
            }));
            return [data.discount, ...prev].slice(0, PAGE_SIZE);
          }
          fetchPendingRequests(page);
        }

        return prev;
      });
    }
  });

  return (
    <section className="w-full space-y-4">
      {/* Header */}
      <div className="theme-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
            <TicketPercent className="h-4 w-4" />
          </div>

          <div>
            <h1 className="text-lg font-semibold theme-text-primary">
              {autoT("legacy.discount_requests_c1f68f1c")}
            </h1>

            <p className="mt-0.5 text-xs theme-text-secondary">
              {autoT("legacy.review_and_manage_pending_discount_approvals_b5997c7b")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="theme-badge theme-badge-warning">
            {pendingCount} {autoT("stats.pending")}
          </div>

          <NavLink
            to="/admin/dashboard/all-discount-requests"
            className="theme-btn theme-btn-outline h-8 px-3 text-xs"
          >
            {autoT("legacy.view_all_requests_c1ab1b65")}
          </NavLink>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] p-3 text-[var(--theme-danger-hover)]">
          <AlertTriangle size={20} className="mt-0.5" />

          <div>
            <p className="font-semibold">{autoT("legacy.something_went_wrong_8d886c0b")}</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="theme-card flex flex-col gap-2 p-3 md:flex-row md:items-center">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder={autoT("legacy.search_order_table_customer_reason_d05d8939")}
          className="theme-input h-9 min-w-0 flex-1 px-3"
        />
        <button
          type="button"
          onClick={() => {
            setPage(1);
            setSearch("");
          }}
          className="theme-btn theme-btn-outline h-9 px-3"
        >
          {autoT("inventory_manager.common.reset")}
        </button>
      </div>

      {loading ? (
        <div className="theme-card flex min-h-52 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--theme-primary)]" />

            <p className="text-sm text-gray-500">
              {autoT("legacy.loading_discount_requests_4b58612f")}
            </p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="theme-card flex min-h-52 flex-col items-center justify-center border-dashed p-8 text-center">
          <div className="rounded-lg bg-[var(--theme-muted)] p-3">
            <Inbox className="h-7 w-7 theme-text-muted" />
          </div>

          <h2 className="mt-3 text-base font-semibold theme-text-primary">
            {autoT("legacy.no_pending_requests_064c1a53")}
          </h2>

          <p className="mt-1 max-w-md text-xs theme-text-secondary">
            {autoT("legacy.there_are_currently_no_discount_requests_waiting_for_a_bb163af9")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {requests.map((req) => (
            <DiscountRequestCard
              key={req.id}
              request={req}
              loading={actionLoading === req.id}
              onApprove={approveRequest}
              onReject={rejectRequest}
            />
          ))}
        </div>
      )}
      <PaginationControls
        page={page}
        count={pagination.count}
        hasNext={Boolean(pagination.next)}
        hasPrevious={Boolean(pagination.previous)}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
      />
    </section>
  );
}
