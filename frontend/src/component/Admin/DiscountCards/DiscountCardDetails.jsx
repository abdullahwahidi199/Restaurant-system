import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../../api/axiosInstance";

import { ArrowLeft } from "lucide-react";
export default function DiscountCardDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cardDetails, setCardDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Fetch Data ────────────────────────────────────────
  const fetchDiscountCardDetails = async () => {
    try {
      setLoading(true);
      const response = await instance.get(`/orders/discount-cards/${id}/`);
      setCardDetails(response.data);
    } catch (error) {
      console.error("Error fetching discount card details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountCardDetails();
  }, [id]);

  // ── Handlers ──────────────────────────────────────────
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await instance.delete(`/orders/discount-cards-actions/${id}/`);
      navigate(-1); // Redirect after delete
    } catch (error) {
      console.error("Error deleting discount card:", error);
      alert("Failed to delete card.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ── Loading State ─────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cardDetails?.card) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-500">
        <p className="text-xl mb-4">Card not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { card, orders_used } = cardDetails;

  // ── Main Render ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200"
            >
              <ArrowLeft
                size={18}
                className="text-gray-600 group-hover:-translate-x-1 transition-transform duration-200"
              />
              <span className="text-sm font-medium text-gray-700">Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {card.card_name}
              </h1>
              <p className="text-sm text-gray-500">Card #{card.card_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                navigate(`/admin/dashboard/discount-cards/${id}/edit`)
              }
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
            >
              Edit
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Card Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Card Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoBlock label="Customer Name" value={card.customer_name} />
                <InfoBlock label="Phone Number" value={card.customer_phone} />
                <InfoBlock
                  label="Discount Percentage"
                  value={`${card.discount_percentage}%`}
                  highlight="text-green-600"
                />
                <InfoBlock
                  label="Minimum Order Amount"
                  value={`AFN${parseFloat(card.minimum_order_amount).toFixed(2)}`}
                />
                <InfoBlock
                  label="Valid From"
                  value={formatDate(card.valid_from)}
                />
                <InfoBlock
                  label="Valid Until"
                  value={formatDate(card.valid_until)}
                />
                <InfoBlock
                  label="Usage Limit"
                  value={card.usage_limit ? card.usage_limit : "Unlimited"}
                />
                <InfoBlock
                  label="Status"
                  value={
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClasses(card.status)}`}
                    >
                      {card.status}
                    </span>
                  }
                />
                {card.notes && (
                  <div className="md:col-span-2">
                    <InfoBlock label="Notes" value={card.notes} />
                  </div>
                )}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Orders Used
              </h2>
              {orders_used.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-lg">No orders have used this card yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Discount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders_used.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.order_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            AFN{parseFloat(order.total).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {order.discount_percent}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-2">Total Discount</p>
              <p className="text-4xl font-bold text-green-600">
                {card.discount_percentage}%
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-2">Usage Stats</p>
              <p className="text-4xl font-bold text-gray-900">
                {card.used_count}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                out of {card.usage_limit ? card.usage_limit : "∞"} uses
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-4 text-center">
                Validity Period
              </p>
              <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>{formatDate(card.valid_from)}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                <span>{formatDate(card.valid_until)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Card
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {card.card_name}
              </span>
              ? This action cannot be undone and will remove all associated
              history.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-70"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete Card"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable Info Block Component ─────────────────────
function InfoBlock({ label, value, highlight }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className={`text-sm font-semibold text-gray-900 ${highlight || ""}`}>
        {value || <span className="text-gray-400 font-normal italic">N/A</span>}
      </div>
    </div>
  );
}
