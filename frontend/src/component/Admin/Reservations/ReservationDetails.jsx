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
import AuditTimeline from "../../../modules/audit/components/AuditTimeline";
import StatusBadge from "../../../modules/shared/erp/components/StatusBadge";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ReservationDetails({ reservation, onClose }) {
                 const { t: autoT } = useAutoTranslation();
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

  const getStatusLabel = (status) =>
    ({
      completed: autoT("stats.completed"),
      cancelled: autoT("status.cancelled"),
      reserved: autoT("legacy.reserved_67a6ff10"),
      pending: autoT("stats.pending"),
    })[status] || status;

  const handleClose = () => {
    onClose?.();
  };

  const statusLabel = getStatusLabel(reservation.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-overlay)] p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="theme-surface max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border shadow-[var(--theme-shadow-lg)] animate-in fade-in"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex min-h-14 items-center justify-between border-b px-5 py-3 theme-muted">
          <div>
            <h2 className="text-lg font-semibold theme-text-primary">
              {autoT("legacy.reservation_c574ce11")}{reservation.id}
            </h2>
            <p className="mt-1 text-xs theme-text-muted">
              {reservation.reservation_type?.replace("_", " ") || autoT("legacy.standard_2dfa6607")}{" "}
              {autoT("legacy.reservation_18d5c8fe")}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="theme-btn theme-btn-ghost theme-btn-icon"
            aria-label={autoT("legacy.close_modal_70d3a544")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-56px)] overflow-y-auto p-5">
          {/* Status Badge */}
          <div className="mb-5">
            <StatusBadge status={reservation.status} label={statusLabel} />
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <InfoItem
              icon={<User className="w-5 h-5" />}
              label={autoT("legacy.customer_name_75636316")}
              value={reservation.customer_name}
            />
            <InfoItem
              icon={<Phone className="w-5 h-5" />}
              label={autoT("staff.form.phone")}
              value={reservation.phone}
            />
            <InfoItem
              icon={<Users className="w-5 h-5" />}
              label={autoT("legacy.guests_3c23a670")}
              value={reservation.guests}
            />
            <InfoItem
              icon={<Calendar className="w-5 h-5" />}
              label={autoT("legacy.table_0424f6e7")}
              value={reservation.table_name}
            />
            <InfoItem
              icon={<Clock className="w-5 h-5" />}
              label={autoT("legacy.reservation_date_aefe975e")}
              value={formatDateTime(reservation.start_time)}
            />
            <InfoItem
              icon={<Clock className="w-5 h-5" />}
              label={autoT("legacy.duration_1370004d")}
              value={`${reservation.duration_minutes} minutes`}
            />
          </div>

          {/* Pricing Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {autoT("legacy.payment_details_b8579d99")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">{autoT("legacy.total_price_a2a7c604")}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {autoT("labels.afn")}{reservation.total_price?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">{autoT("legacy.pre_paid_amount_bd03e1ea")}</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {autoT("labels.afn")}{reservation.paid_amount}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {reservation.status !== "completed"
                    ? autoT("legacy.balance_due_5a6bd4c7")
                    : autoT("legacy.post_paid_17f98ce3")}
                </p>
                <p
                  className={`text-2xl font-bold ${reservation.status !== "completed" ? "text-red-600" : "text-blue-600"}`}
                >
                  {autoT("labels.afn")}
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
                    {autoT("inventory_manager.common.notes")}
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
                {autoT("legacy.created_by_5d73cc30")}{" "}
                <strong className="text-slate-700">
                  {reservation.created_by_name}
                </strong>
              </span>
            </div>
          )}

          <div className="mt-6 rounded-lg border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              {autoT("inventory_manager.ingredients.audit_history")}
            </h3>
            <AuditTimeline
              module="RESERVATIONS"
              objectType="Reservation"
              objectId={reservation.id}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-slate-50 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm"
          >
            {autoT("menuDetails.close")}
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
