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
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
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
    <div className="w-full space-y-6 px-2 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-orange-100 p-4">
            <TicketPercent size={28} className="text-orange-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Discount Requests
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review and manage pending discount approvals
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 border border-orange-100">
            {pendingCount} Pending
          </div>

          <NavLink
            to="/admin/dashboard/all-discount-requests"
            className="rounded-2xl bg-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            View All Requests
          </NavLink>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
          <AlertTriangle size={20} className="mt-0.5" />

          <div>
            <p className="font-semibold">Something went wrong</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:flex-row md:items-center">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Search order, table, customer, reason..."
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            setPage(1);
            setSearch("");
          }}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-gray-200 bg-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={40} className="animate-spin text-orange-500" />

            <p className="text-sm text-gray-500">
              Loading discount requests...
            </p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="rounded-full bg-gray-100 p-5">
            <Inbox size={42} className="text-gray-400" />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-gray-800">
            No Pending Requests
          </h2>

          <p className="mt-2 max-w-md text-sm text-gray-500">
            There are currently no discount requests waiting for approval.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
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
    </div>
  );
}
