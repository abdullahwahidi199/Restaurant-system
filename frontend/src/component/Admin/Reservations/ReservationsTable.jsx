import React, { useState } from "react";
import { Eye, Calendar, Users, Clock, Phone, Mail } from "lucide-react";
import ReservationDetails from "./ReservationDetails";
import EmptyState from "../../../modules/shared/erp/components/EmptyState";
import StatusBadge from "../../../modules/shared/erp/components/StatusBadge";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ReservationsTable({ reservations }) {
                 const { t: autoT } = useAutoTranslation();
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

  if (!reservations || reservations.length === 0) {
    return (
      <EmptyState
        title={autoT("legacy.no_reservations_found_f321e81a")}
        description={autoT("legacy.your_reservations_will_appear_here_340ce69f")}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="theme-table hidden overflow-hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  #
                </div>
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {autoT("table.customer")}
                </div>
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {autoT("legacy.table_0424f6e7")}
                </div>
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {autoT("legacy.date_time_63ae7caf")}
                </div>
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {autoT("legacy.guests_3c23a670")}
                </div>
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {autoT("table.status")}
                </div>
              </th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                {autoT("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reservations.map((reservation, index) => {
              return (
                <tr
                  key={reservation.id}
                  className={`group hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold text-sm">
                      #{reservation.reservation_number}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
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
                  <td className="px-4 py-2.5">
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
                  <td className="px-4 py-2.5">
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
                  <td className="px-4 py-2.5">
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
                  <td className="px-4 py-2.5">
                    <StatusBadge status={reservation.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedReservation(reservation)}
                        className="group/btn theme-btn theme-btn-outline theme-btn-icon relative"
                        title={autoT("legacy.view_details_907b3bee")}
                        aria-label={autoT("legacy.view_details_907b3bee")}
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
        {reservations.map((reservation, index) => {
          return (
            <div
              key={reservation.id}
              className={`bg-[var(--theme-surface)] rounded-xl p-4 shadow-sm border ${
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
                <StatusBadge status={reservation.status} />
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
                <button
                  onClick={() => setSelectedReservation(reservation)}
                  className="theme-btn theme-btn-primary h-10 flex-1 px-4 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  {autoT("legacy.view_details_907b3bee")}
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
