import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import DiscountRequestCard from "./DiscountRequestCard";
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

export default function DiscountRequestMain() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const fetchPendingDiscountRequests = async (targetPage = page) => {
    try {
      setError("");
      setLoading(true);
      const res = await instance.get(
        "orders/manager/discount-requests/pending/",
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
      console.log(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDiscountRequests(page);
  }, [page, search]);

  const approveRequest = async (id) => {
    try {
      const res = await instance.patch(
        `/orders/discounts/${id}/approveOrReject/`,
        {
          action: "approve",
        },
      );

      fetchPendingDiscountRequests(page);
    } catch (error) {
      console.log(error);
    }
  };

  const rejectRequest = async (id) => {
    try {
      const res = await instance.patch(
        `/orders/discounts/${id}/approveOrReject/`,
        {
          action: "reject",
        },
      );

      fetchPendingDiscountRequests(page);
    } catch (error) {
      console.log(error);
    }
  };

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
          fetchPendingDiscountRequests(page);
        }

        return prev;
      });
    }
  });
  if (loading) {
    <div>Loading...</div>;
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 md:flex-row md:items-center">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Search order, table, customer, reason..."
          className="min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            setPage(1);
            setSearch("");
          }}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {requests.length > 0 ? (
          requests.map((req) => (
            <DiscountRequestCard
              key={req.id}
              request={req}
              onApprove={approveRequest}
              onReject={rejectRequest}
            />
          ))
        ) : (
          <div>No requests yet!</div>
        )}
      </div>
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
