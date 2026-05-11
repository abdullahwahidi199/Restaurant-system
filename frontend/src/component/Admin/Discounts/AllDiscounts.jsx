import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";

export default function AllDiscounts() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAllRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await instance.get("orders/discount-requests");
      setRequests(res.data);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch discount requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllRequests();
  }, []);

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
          Loading discount requests...
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
        <h2 className="text-2xl font-bold text-gray-900">Discount Requests</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage and review all customer discount requests.
        </p>
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
                Order
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Table
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Customer
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Discount
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Original
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Final
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Reason
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Requested By
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Approved By
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Created At
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
                      <span className="text-gray-400 italic">N/A</span>
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
                  No discount requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
