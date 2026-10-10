import { Bell, Clock, User } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function CompactOrderCard({
  order,
  isSelected,
  onClick,
  currentTime,
}) {
  const { t: autoT } = useAutoTranslation();
  const items = Array.isArray(order.items) ? order.items : [];
  const statusColors = {
    pending: "bg-amber-100 text-amber-800 ring-amber-200",
    in_progress: "bg-blue-100 text-blue-800 ring-blue-200",
    ready: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    cancelled: "bg-red-100 text-red-800 ring-red-200",
    approved: "bg-purple-100 text-purple-800 ring-purple-200",
  };

  const getOrderTitle = () => {
    if (order.order_type === "dine-in") {
      const tableLabel = autoT("table.table").replace("#", "").trim();
      return `${tableLabel} ${order.tableName || "—"}`;
    }
    if (order.order_type === "takeaway") {
      return autoT("legacy.takeaway_order_32e0d890");
    }
    return autoT("legacy.delivery_order_4081c2f7");
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWaitTime = (dateString) => {
    const createdAt = new Date(dateString).getTime();
    if (Number.isNaN(createdAt) || !currentTime) return null;

    const minutes = Math.max(0, Math.floor((currentTime - createdAt) / 60000));
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const newItems = items.filter(
    (item) =>
      item.is_new === true &&
      (item.status === "pending" || item.status === "approved"),
  );
  const hasNewItems = newItems.length > 0;
  const waitTime = getWaitTime(order.created_at);
  const orderTitle = getOrderTitle();
  const statusLabel = (order.status || "pending").replaceAll("_", " ");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`${orderTitle}, ${autoT("table.order_number")} ${order.order_number || "—"}`}
      className={`
        group relative mb-0.5 grid w-full grid-cols-12 items-center gap-x-2 overflow-hidden
        rounded-md border px-3 py-1.5 text-left shadow-sm transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
            : hasNewItems
              ? "border-orange-300 bg-orange-50/80 hover:border-orange-400 hover:bg-orange-50"
              : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 hover:shadow"
        }
      `}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 ${
          isSelected
            ? "bg-blue-600"
            : hasNewItems
              ? "bg-orange-500"
              : "bg-slate-300 group-hover:bg-blue-400"
        }`}
      />

      {/* The service point is the strongest visual anchor for fast scanning. */}
      <div className="col-span-4 min-w-0 pl-1 md:col-span-3">
        <p className="truncate text-base font-black leading-5 tracking-tight text-slate-950">
          {orderTitle}
        </p>
      </div>

      <div className="col-span-2 min-w-0">
        <p className="truncate text-sm font-extrabold leading-5 text-slate-800">
          #{order.order_number || "—"}
        </p>
      </div>

      <div className="col-span-2 flex min-w-0 items-center gap-1 whitespace-nowrap text-xs font-bold text-slate-700">
        <Clock size={13} className="shrink-0 text-slate-400" />
        <span className="truncate">{formatTime(order.created_at)}</span>
        {waitTime && (
          <span className="hidden shrink-0 text-[10px] font-semibold text-slate-400 sm:inline">
            · {waitTime}
          </span>
        )}
      </div>

      <div className="hidden min-w-0 items-center gap-1.5 text-slate-600 xl:col-span-2 xl:flex">
        <User size={14} className="shrink-0 text-slate-400" />
        <span className="truncate text-xs font-semibold">
          {order.name || "—"}
        </span>
      </div>

      <div className="col-span-4 flex min-w-0 items-center justify-end gap-1.5 md:col-span-5 xl:col-span-3">
        {hasNewItems && (
          <span
            title={`${newItems.length} ${autoT("legacy.new_item_78b81962")}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm"
          >
            <Bell size={11} />
            {newItems.length}
          </span>
        )}

        <span
          className={`truncate rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ring-1 ring-inset ${
            statusColors[order.status] ||
            "bg-slate-100 text-slate-700 ring-slate-200"
          }`}
        >
          {statusLabel}
        </span>
      </div>
    </button>
  );
}
