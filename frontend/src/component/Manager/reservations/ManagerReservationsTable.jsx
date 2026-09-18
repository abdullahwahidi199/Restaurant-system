import React, { useState } from "react";
import { Eye, Calendar, Users, Clock, Phone } from "lucide-react";
import ReservationDetails from "../../Admin/Reservations/ReservationDetails";
import toast from "react-hot-toast";
import instance from "../../../api/axiosInstance";
import ReservationUpdateForm from "../../Cashier/components/ReservationUpdateForms";
import ReservationCancellationToast from "../../Cashier/components/ReservationCancellationToast";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ManagerReservationsTable({
  reservations,
  onUpdate,
  onReservationSaved,
  showLocalFilters = true,
}) {
                 const { t: autoT } = useAutoTranslation();
  const [viewReservation, setViewReservation] = useState(null);
  const [editReservation, setEditReservation] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reservationToCancel, setReservationToCancel] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredReservations = showLocalFilters
    ? reservations.filter((r) => {
    const matchesName = r.customer_name
      .toLowerCase()
      .includes(searchName.toLowerCase());

    const matchesStatus = statusFilter ? r.status === statusFilter : true;

    const reservationDate = new Date(r.reservation_date);

    const matchesStartDate = startDate
      ? reservationDate >= new Date(startDate)
      : true;

    const matchesEndDate = endDate
      ? reservationDate <= new Date(endDate)
      : true;

    return matchesName && matchesStatus && matchesStartDate && matchesEndDate;
      })
    : reservations;
  // Get status badge color and styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
          border: "border-emerald-200",
        };
      case "cancelled":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          dot: "bg-red-500",
          border: "border-red-200",
        };
      case "reserved":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          dot: "bg-blue-500",
          border: "border-blue-200",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          dot: "bg-gray-500",
          border: "border-gray-200",
        };
    }
  };

  if (!filteredReservations || filteredReservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 mb-4 text-gray-300">
          <svg
            className="w-full h-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg font-medium">
          {autoT("legacy.no_reservations_found_f321e81a")}
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {autoT("legacy.your_reservations_will_appear_here_340ce69f")}
        </p>
      </div>
    );
  }

  const markArrived = async (id) => {
    try {
      await instance.post(`/orders/cashier/reservations/${id}/arrive/`);
      toast.success(autoT("legacy.marked_as_arrived_0a8ba09e"));
      onUpdate();
    } catch (err) {
      toast.error(autoT("legacy.failed_to_update_reservation_status_ea97683a"));
    }
  };

  const markNOShow = async (id) => {
    try {
      await instance.post(`/orders/cashier/reservations/${id}/no_show/`);
      toast.success(autoT("legacy.marked_as_no_show_b56ea0d0"));
      onUpdate();
    } catch (err) {
      toast.error(autoT("legacy.failed_to_mark_as_no_show_11badb27"));
    }
  };

  const markCancel = async (id) => {
    try {
      await instance.patch(`/orders/cancel-reservation/${id}/`);
      toast.success(autoT("legacy.reservation_cancelled_01ebfe58"));
      onUpdate();
    } catch (err) {
      toast.error(autoT("legacy.failed_to_cancel_reservation_95ed558b"));
    }
  };

  const isOverdueForNoShow = (reservation) => {
    if (!reservation.end_time || reservation.status !== "reserved")
      return false;
    const end = new Date(reservation.end_time);
    const noShowThreshold = new Date(end.getTime() + 60 * 60 * 1000); // +1 hour
    return new Date() > noShowThreshold;
  };

  return (
    <div className="w-full">
      {showLocalFilters && (
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder={autoT("legacy.search_customer_2b6cb473")}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">{autoT("legacy.all_status_6b308de7")}</option>
            <option value="reserved">{autoT("legacy.reserved_67a6ff10")}</option>
            <option value="completed">{autoT("stats.completed")}</option>
            <option value="cancelled">{autoT("status.cancelled")}</option>
            <option value="no_show">{autoT("legacy.no_show_7ed172ed")}</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      )}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {autoT("legacy.id_89f89c02")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {autoT("table.customer")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {autoT("legacy.table_0424f6e7")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {autoT("legacy.date_time_63ae7caf")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {autoT("legacy.guests_3c23a670")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {autoT("table.status")}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {autoT("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredReservations.map((reservation, index) => {
              const statusStyle = getStatusStyle(reservation.status);
              const overdue = isOverdueForNoShow(reservation);
              const canMarkNoShow =
                overdue && reservation.status === "reserved";

              return (
                <tr
                  key={reservation.id}
                  className={`group hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold text-sm">
                      #{reservation.id}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {reservation.customer_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Phone className="w-3 h-3" />
                            {reservation.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-amber-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-800 text-sm">
                        {reservation.table_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg w-fit">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">
                          {formatDate(reservation.reservation_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg w-fit">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-medium text-blue-600">
                          {formatTime(reservation.start_time)} -{" "}
                          {formatTime(reservation.end_time)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-semibold text-gray-700">
                        {reservation.guests}
                      </span>
                      <span className="text-xs text-gray-400">{autoT("legacy.guests_f8122851")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                      ></span>
                      {reservation.status.charAt(0).toUpperCase() +
                        reservation.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {/* Action Buttons Container */}
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => setEditReservation(reservation)}
                        disabled={[
                          "completed",
                          "cancelled",
                          "no_show",
                        ].includes(reservation.status)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition
    ${
      ["completed", "cancelled", "no_show"].includes(reservation.status)
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
    }`}
                      >
                        {autoT("legacy.edit_46d11d96")}
                      </button>
                      {reservation.status === "reserved" && (
                        <>
                          <button
                            onClick={() => markArrived(reservation.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs transition-colors"
                          >
                            {autoT("legacy.arrived_a22d66c8")}
                          </button>

                          {canMarkNoShow ? (
                            <button
                              onClick={() => markNOShow(reservation.id)}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-xs transition-colors"
                            >
                              {autoT("legacy.no_show_7ed172ed")}
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setReservationToCancel(reservation)
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs transition-colors"
                              title={autoT("legacy.cancel_reservation_bb3c1d62")}
                            >
                              {autoT("staff.cancel")}
                            </button>
                          )}
                        </>
                      )}

                      {/* {reservation.status === "arrived" && (
                        <span className="text-gray-500 text-xs">Completed</span>
                      )}
                      {reservation.status === "no_show" && (
                        <span className="text-red-600 font-medium text-xs">
                          No Show
                        </span>
                      )}
                      {reservation.status === "cancelled" && (
                        <span className="text-gray-500 text-xs">Cancelled</span>
                      )} */}

                      {/* View Details Button */}
                      <button
                        onClick={() => setViewReservation(reservation)}
                        className="group/btn relative p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 ml-2"
                        title={autoT("legacy.view_details_907b3bee")}
                      >
                        <Eye className="w-4.5 h-4.5 text-gray-500 group-hover/btn:text-blue-600 transition-colors" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {autoT("legacy.view_details_907b3bee")}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4 px-2">
        {filteredReservations.map((reservation, index) => {
          const statusStyle = getStatusStyle(reservation.status);
          const overdue = isOverdueForNoShow(reservation);
          const canMarkNoShow = overdue && reservation.status === "reserved";

          return (
            <div
              key={reservation.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border ${
                index % 2 === 0 ? "border-gray-100" : "border-gray-50"
              } hover:shadow-md hover:border-blue-100 transition-all duration-200`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
                    {reservation.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {reservation.customer_name}
                    </h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {reservation.phone}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                  ></span>
                  {reservation.status.charAt(0).toUpperCase() +
                    reservation.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{autoT("legacy.table_0424f6e7")}</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {reservation.table_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{autoT("legacy.guests_3c23a670")}</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {reservation.guests}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl col-span-2">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Calendar className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{autoT("legacy.date_time_63ae7caf")}</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {formatDate(reservation.reservation_date)} •{" "}
                      {formatTime(reservation.start_time)} -{" "}
                      {formatTime(reservation.end_time)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold text-xs">
                  #{reservation.id}
                </span>

                {/* Mobile Action Buttons */}
                {reservation.status === "reserved" && (
                  <div className="flex gap-2 flex-1">
                    <button
                      onClick={() => markArrived(reservation.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      {autoT("legacy.arrived_a22d66c8")}
                    </button>

                    {canMarkNoShow ? (
                      <button
                        onClick={() => markNOShow(reservation.id)}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                      >
                        {autoT("legacy.no_show_7ed172ed")}
                      </button>
                    ) : (
                      <button
                        onClick={() => markCancel(reservation.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                      >
                        {autoT("staff.cancel")}
                      </button>
                    )}
                  </div>
                )}

                {reservation.status !== "reserved" && (
                  <button
                    onClick={() => setViewReservation(reservation)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    {autoT("legacy.view_details_907b3bee")}
                  </button>
                )}
                <button
                  onClick={() => setEditReservation(reservation)}
                  disabled={["completed", "cancelled", "no_show"].includes(
                    reservation.status,
                  )}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition
      ${
        ["completed", "cancelled", "no_show"].includes(reservation.status)
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
      }`}
                >
                  {autoT("legacy.edit_46d11d96")}
                </button>
                {reservation.status === "reserved" && (
                  <button
                    onClick={() => setViewReservation(reservation)}
                    className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                    title={autoT("legacy.view_details_907b3bee")}
                  >
                    <Eye className="w-4.5 h-4.5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {viewReservation && (
        <ReservationDetails
          reservation={viewReservation}
          onClose={() => setViewReservation(null)}
        />
      )}

      {editReservation && (
        <ReservationUpdateForm
          reservation={editReservation}
          onClose={() => setEditReservation(null)}
          onReservationSaved={onReservationSaved}
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
    </div>
  );
}
