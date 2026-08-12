import React, { useContext, useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import AddReservation from "./AddReservation";
import ReservationUpdateForm from "./ReservationUpdateForms";
import ReservationCancellationToast from "./ReservationCancellationToast";
import { AuthContext } from "../../../api/authforRBC";
import ReservationPrintModal from "./ReservationPrintModal";
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

export default function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const { restaurantDetails } = useContext(AuthContext);
  const [printReservation, setPrintReservation] = useState(null);
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
      const res = await instance.get("/orders/cashier/reservations/", {
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
    } catch (err) {
      toast.error("Failed to fetch reservations");
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

  const markArrived = async (id) => {
    try {
      await instance.post(`/orders/cashier/reservations/${id}/arrive/`);
      toast.success("Marked as arrived");
      fetchReservations(page);
    } catch (err) {
      toast.error("Failed to update reservation status");
    }
  };

  const markCancel = async (id) => {
    try {
      await instance.patch(`/orders/cancel-reservation/${id}/`);
      toast.success("Reservation cancelled");
      fetchReservations(page);
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

      <div className="mb-4 grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-5">
        <input
          type="search"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Search name, phone, table..."
          className="rounded-md border border-gray-200 px-3 py-2 text-sm md:col-span-2"
        />
        <select
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Active status</option>
          <option value="reserved">Reserved</option>
          <option value="arrived">Arrived</option>
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
            Reset
          </button>
        </div>
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

                            <button
                              onClick={() => setReservationToCancel(r)}
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
                        <button
                          onClick={() => setSelectedReservation(r)}
                          disabled={[
                            "completed",
                            "cancelled",
                            "no_show",
                          ].includes(r.status)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition
      ${
        ["completed", "cancelled", "no_show"].includes(r.status)
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
      }`}
                        >
                          ✏️ Edit
                        </button>

                        {r.status === "cancelled" && (
                          <span className="text-gray-500 text-xs">
                            Cancelled
                          </span>
                        )}
                        <button
                          onClick={() => setPrintReservation(r)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs"
                        >
                          🖨 Print
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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

      {/* Add Reservation Modal */}
      {isAddModalOpen && (
        <AddReservation
          onClose={() => setIsAddModalOpen(false)}
          onReservationSaved={() => {
            setIsAddModalOpen(false);
            setPage(1);
            fetchReservations(1);
          }}
        />
      )}
      {selectedReservation && (
        <ReservationUpdateForm
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onReservationSaved={() => {
            setSelectedReservation(null);
            fetchReservations(page);
          }}
        />
      )}
      {reservationToCancel && (
        <ReservationCancellationToast
          reservationNumber={reservationToCancel.reservation_number}
          onConfirm={() => {
            markCancel(reservationToCancel.id);
            setReservationToCancel(null);
          }}
          onClose={() => setReservationToCancel(null)}
        />
      )}

      {printReservation && (
        <ReservationPrintModal
          reservation={printReservation}
          restaurant={restaurantDetails}
          onClose={() => setPrintReservation(null)}
        />
      )}
    </div>
  );
}
