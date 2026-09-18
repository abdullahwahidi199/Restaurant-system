import {
  X,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Clock,
  CreditCard,
  Truck,
  Table2,
  StickyNote,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";

export default function OrderDetailsModal({ order, onClose }) {
  const { t } = useTranslation();
  if (!order) return null;

  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  const statusColors = {
    completed: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isCompleted = order.status === "completed";
  const remainingAmount = parseFloat(order.remaining_total || 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-2xl w-[90%] md:w-[650px] max-h-[90vh] overflow-y-auto shadow-2xl"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {t("table.order_number")} #{order.order_number}
            </h2>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border mt-1 inline-flex items-center gap-1 ${
                statusColors[order.status] ||
                "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {order.status_display}
            </span>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 hover:bg-gray-200 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Customer Info */}
          <Section title={t("legacy.customer_info_5051e8bf")}>
            <InfoRow
              icon={<User size={15} />}
              label={t("modal.customer")}
              value={order.name || "—"}
            />
            <InfoRow
              icon={<Phone size={15} />}
              label={t("modal.phone")}
              value={order.phone || "—"}
            />
            {order.address && (
              <InfoRow
                icon={<MapPin size={15} />}
                label={t("modal.address")}
                value={order.address}
              />
            )}
            {order.latitude && order.longitude && (
              <InfoRow
                icon={<MapPin size={15} />}
                label={t("settings_center.nav.location")}
                value={`${order.latitude}, ${order.longitude}`}
              />
            )}
          </Section>

          {/* Order Info */}
          <Section title={t("legacy.order_info_835437bf")}>
            <InfoRow
              icon={<ShoppingBag size={15} />}
              label={t("modal.order_type")}
              value={order.order_type_display}
            />
            {order.tableName && (
              <InfoRow
                icon={<Table2 size={15} />}
                label={t("legacy.table_0424f6e7")}
                value={order.tableName}
              />
            )}
            <InfoRow
              icon={<Clock size={15} />}
              label={t("legacy.preparation_time_850cc504")}
              value={
                order.preparation_time ? `${order.preparation_time} min` : "—"
              }
            />
            {order.note && (
              <InfoRow
                icon={<StickyNote size={15} />}
                label={t("modal.note")}
                value={order.note}
              />
            )}
          </Section>

          {/* Staff Info */}
          <Section title={t("nav.staff")}>
            {order.created_by_name && (
              <InfoRow
                icon={<User size={15} />}
                label={t("inventory_manager.common.created_by")}
                value={order.created_by_name}
              />
            )}
            {order.received_by_name && (
              <InfoRow
                icon={<User size={15} />}
                label={t("legacy.received_by_cashier_4933c755")}
                value={order.received_by_name}
              />
            )}
            {order.order_type === "delivery" && order.delivery_boy_details && (
              <InfoRow
                icon={<Truck size={15} />}
                label={t("legacy.delivery_by_b5aa13ed")}
                value={`${order.delivery_boy_details.name} (${order.delivery_boy_details.vehicle_number})`}
              />
            )}
          </Section>

          {/* Timeline */}
          <Section title={t("legacy.timeline_018514a3")}>
            <InfoRow
              icon={<Clock size={15} />}
              label={t("legacy.created_at_5db1542e")}
              value={formatDate(order.created_at)}
            />
            {order.paid_at && (
              <InfoRow
                icon={<CheckCircle size={15} />}
                label={t("legacy.paid_at_55c62e1a")}
                value={formatDate(order.paid_at)}
              />
            )}
          </Section>

          {/* Reservation Payment */}
          {order.reservation_payment && (
            <Section title={t("legacy.reservation_payment_e93a5f8e")}>
              <InfoRow
                icon={<CreditCard size={15} />}
                label={t("inventory_manager.common.type")}
                value={order.reservation_payment.reservation_type}
              />
              <InfoRow
                icon={<CreditCard size={15} />}
                label={t("table.total")}
                value={`${order.reservation_payment.total} AFN`}
              />
              <InfoRow
                icon={<CreditCard size={15} />}
                label={t("legacy.pre_paid_95dcec04")}
                value={`${order.reservation_payment.paid} AFN`}
              />
              <InfoRow
                icon={<CreditCard size={15} />}
                // ✅ Same logic as ReservationDetails
                label={isCompleted ? t("legacy.post_paid_17f98ce3") : t("legacy.balance_due_5a6bd4c7")}
                value={`${order.reservation_payment.remaining} AFN`}
                valueClass={isCompleted ? "text-blue-600" : "text-red-600"}
              />
            </Section>
          )}

          {/* Items */}
          <Section title={t("modal.items")}>
            <ul className="border rounded-xl divide-y overflow-hidden">
              {(order.items || []).map((item) => (
                <li
                  key={item.id}
                  className={`px-4 py-3 flex justify-between items-center ${
                    item.status === "cancelled"
                      ? "bg-red-50 opacity-75"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <span
                        className={
                          item.status === "cancelled"
                            ? "line-through text-red-600"
                            : ""
                        }
                      >
                        {item.item_name}
                      </span>

                      {item.status === "cancelled" && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          {t("status.cancelled")}
                        </span>
                      )}

                      {item.is_new && item.status !== "cancelled" && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {t("landing.marketplace.card.new")}
                          {item.added_by_name ? ` • ${item.added_by_name}` : ""}
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-gray-400">× {item.quantity}</p>
                  </div>

                  <span
                    className={`font-semibold ${
                      item.status === "cancelled"
                        ? "text-red-600 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    {item.subtotal} {t("labels.afn")}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <CreditCard size={15} />
              {t("legacy.payment_summary_dad7cf7f")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {order.order_type === "delivery" && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">{t("legacy.delivery_fee_9c12c6cb")}</p>
                  <p className="text-xl font-bold text-slate-900">
                    {order.delivery_fee} {t("labels.afn")}
                  </p>
                </div>
              )}
              {Number(order.discount_percent) > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">{t("menu_item_sales.discount")}</p>
                  <p className="text-xl font-bold text-green-600">
                    {order.discount_percent}%
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {t("modal.total")}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {order.total} {t("labels.afn")}
                </p>
              </div>

              {remainingAmount > 0 && (
                <div>
                  {/* ✅ Same pattern: completed = Post-paid, else = Balance Due */}
                  <p className="text-sm text-slate-500 mb-1">
                    {isCompleted ? t("legacy.post_paid_17f98ce3") : t("legacy.balance_due_5a6bd4c7")}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isCompleted ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {order.remaining_total} {t("labels.afn")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Section
function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-2">
        {children}
      </div>
    </div>
  );
}

// Reusable Info Row — supports optional valueClass for color overrides
function InfoRow({ icon, label, value, valueClass = "text-gray-800" }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`font-medium text-right max-w-[60%] ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}
