import React, { useState } from "react";
import { Eye, Calendar, Users, Clock, Phone, Mail } from "lucide-react";
import ReservationDetails from "./ReservationDetails";

export default function ReservationsTable({ reservations, onViewDetails }) {
  const [selectedReservation, setSelectedReservation] = useState(null);
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

  if (!reservations || reservations.length === 0) {
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
          No reservations found
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Your reservations will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  ID
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Customer
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Table
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Date & Time
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Guests
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Status
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reservations.map((reservation, index) => {
              const statusStyle = getStatusStyle(reservation.status);
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
                      <span className="text-xs text-gray-400">guests</span>
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedReservation(reservation)}
                        className="group/btn relative p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                        title="View Details"
                      >
                        <Eye className="w-4.5 h-4.5 text-gray-500 group-hover/btn:text-blue-600 transition-colors" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          View Details
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
        {reservations.map((reservation, index) => {
          const statusStyle = getStatusStyle(reservation.status);
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
                    <p className="text-xs text-gray-400">Table</p>
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
                    <p className="text-xs text-gray-400">Guests</p>
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
                    <p className="text-xs text-gray-400">Date & Time</p>
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
                <button
                  onClick={() => setSelectedReservation(reservation)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {selectedReservation && (
        <ReservationDetails
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
}
