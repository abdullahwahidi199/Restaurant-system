import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import AddReservation from "./AddReservation";

export default function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchReservations = async () => {
    try {
      const res = await instance.get("/orders/cashier/reservations/");
      setReservations(res.data);
    } catch (err) {
      toast.error("Failed to fetch reservations");
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const markArrived = async (id) => {
    try {
      await instance.post(`/orders/cashier/reservations/${id}/arrive/`);
      toast.success("Marked as arrived");
      fetchReservations();
    } catch (err) {
      toast.error("Failed to update reservation status");
    }
  };

  const markNOShow = async (id) => {
    try {
      await instance.post(`/orders/cashier/reservations/${id}/no_show/`);
      toast.success("Marked as No Show");
      fetchReservations();
    } catch (err) {
      toast.error("Failed to mark as No Show");
    }
  };

  const markCancel = async (id) => {
    try {
      await instance.patch(`/orders/cancel-reservation/${id}/`);
      toast.success("Reservation cancelled");
      fetchReservations();
    } catch (err) {
      toast.error("Failed to cancel reservation");
    }
  };

  const formatDateTime = (isoString) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(isoString));
  };

  // Check if reservation is past end_time + 1 hour and still reserved → eligible for No Show
  const isOverdueForNoShow = (reservation) => {
    if (!reservation.end_time || reservation.status !== "reserved")
      return false;
    const end = new Date(reservation.end_time);
    const noShowThreshold = new Date(end.getTime() + 60 * 60 * 1000); // +1 hour
    return new Date() > noShowThreshold;
  };

  const getStatusBadge = (status, isOverdue) => {
    if (status === "arrived")
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Arrived
        </span>
      );
    if (status === "cancelled")
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Cancelled
        </span>
      );
    if (status === "no_show")
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          No Show
        </span>
      );
    if (isOverdue)
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
          Overdue
        </span>
      );
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Reserved
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reservations</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md"
        >
          <span className="text-xl">+</span> Add Reservation
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {reservations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No reservations found. Click "Add Reservation" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((r) => {
                  const overdue = isOverdueForNoShow(r);
                  const canMarkNoShow = overdue && r.status === "reserved";

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {r.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {r.table_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDateTime(r.start_time)}
                        {r.end_time && (
                          <span className="block text-xs text-gray-400">
                            → {formatDateTime(r.end_time)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {r.guests}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(r.status, overdue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {r.status === "reserved" && (
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => markArrived(r.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs transition-colors"
                            >
                              Arrived
                            </button>
                            {canMarkNoShow && (
                              <button
                                onClick={() => markNOShow(r.id)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-xs transition-colors"
                              >
                                No Show
                              </button>
                            )}
                            <button
                              onClick={() => markCancel(r.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs transition-colors"
                              title="Cancel reservation"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {r.status === "arrived" && (
                          <span className="text-gray-500 text-xs">
                            Completed
                          </span>
                        )}
                        {r.status === "no_show" && (
                          <span className="text-red-600 font-medium text-xs">
                            No Show
                          </span>
                        )}
                        {r.status === "cancelled" && (
                          <span className="text-gray-500 text-xs">
                            Cancelled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Reservation Modal */}
      {isAddModalOpen && (
        <AddReservation
          onClose={() => setIsAddModalOpen(false)}
          onReservationSaved={() => {
            setIsAddModalOpen(false);
            fetchReservations();
          }}
        />
      )}
    </div>
  );
}
