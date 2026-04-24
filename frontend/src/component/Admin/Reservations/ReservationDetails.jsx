import React from "react";
import {
  X,
  Calendar,
  Clock,
  Users,
  Phone,
  CreditCard,
  FileText,
  User,
} from "lucide-react";

export default function ReservationDetails({ reservation, onClose }) {
  if (!reservation) return null;

  // Arrow Functions
  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: "Completed",
      },
      cancelled: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        label: "Cancelled",
      },
      reserved: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        label: "Reserved",
      },
      pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        label: "Pending",
      },
    };
    return (
      configs[status] || {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        label: status,
      }
    );
  };

  const handleClose = () => {
    onClose?.();
  };

  const statusConfig = getStatusConfig(reservation.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Reservation #{reservation.id}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {reservation.reservation_type?.replace("_", " ") || "Standard"}{" "}
              Reservation
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
            >
              <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
              {statusConfig.label}
            </span>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <InfoItem
              icon={<User className="w-5 h-5" />}
              label="Customer Name"
              value={reservation.customer_name}
            />
            <InfoItem
              icon={<Phone className="w-5 h-5" />}
              label="Phone Number"
              value={reservation.phone}
            />
            <InfoItem
              icon={<Users className="w-5 h-5" />}
              label="Guests"
              value={reservation.guests}
            />
            <InfoItem
              icon={<Calendar className="w-5 h-5" />}
              label="Table"
              value={reservation.table_name}
            />
            <InfoItem
              icon={<Clock className="w-5 h-5" />}
              label="Reservation Date"
              value={formatDateTime(reservation.start_time)}
            />
            <InfoItem
              icon={<Clock className="w-5 h-5" />}
              label="Duration"
              value={`${reservation.duration_minutes} minutes`}
            />
          </div>

          {/* Pricing Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Price</p>
                <p className="text-2xl font-bold text-slate-900">
                  AFN{reservation.total_price?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Paid Amount</p>
                <p className="text-2xl font-bold text-emerald-600">
                  AFN{reservation.paid_amount}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Balance Due</p>
                <p className="text-2xl font-bold text-red-600">
                  AFN
                  {(reservation.total_price - reservation.paid_amount)?.toFixed(
                    2,
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {reservation.notes && (
            <div className="mb-6">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-blue-800">{reservation.notes}</p>
                </div>
              </div>
            </div>
          )}

          {reservation.created_by_name && (
            <div className="flex items-center gap-2 text-sm text-slate-500 pt-4 border-t border-slate-200">
              <User className="w-4 h-4" />
              <span>
                Created by{" "}
                <strong className="text-slate-700">
                  {reservation.created_by_name}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-slate-50 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Info Item Component
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
    <div className="p-2 bg-slate-100 rounded-lg text-slate-600 flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-base font-semibold text-slate-900 truncate">{value}</p>
    </div>
  </div>
);
