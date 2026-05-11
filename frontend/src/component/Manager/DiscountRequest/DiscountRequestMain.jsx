import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import DiscountRequestCard from "./DiscountRequestCard";
import useDiscountSocket from "../../../hooks/useDiscoutSocket";

export default function DiscountRequestMain() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fetchPendingDiscountRequests = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await instance.get(
        "orders/manager/discount-requests/pending/",
      );
      setRequests(res.data);
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDiscountRequests();
  }, []);

  const approveRequest = async (id) => {
    try {
      const res = await instance.patch(
        `/orders/discounts/${id}/approveOrReject/`,
        {
          action: "approve",
        },
      );

      fetchPendingDiscountRequests();
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

      fetchPendingDiscountRequests();
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
          return [data.discount, ...prev];
        }

        return prev;
      });
    }
  });
  if (loading) {
    <div>Loading...</div>;
  }
  return (
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
  );
}
