import { Clock, User, Phone, MapPin, Bell } from "lucide-react";

export default function CompactOrderCard({ order, isSelected, onClick }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    ready: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    approved: "bg-purple-100 text-purple-800",
  };

  const getOrderTitle = () => {
    if (order.order_type === "dine-in") return `Table ${order.tableName}`;
    if (order.order_type === "takeaway") return "Takeaway";
    return "Delivery";
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const pendingCount = order.items.filter(
    (item) => item.status === "pending" && item.is_new === true,
  ).length;

  // ✅ Check for new items with status pending or approved
  const newItems = order.items.filter(
    (item) =>
      item.is_new === true &&
      (item.status === "pending" || item.status === "approved"),
  );
  const hasNewItems = newItems.length > 0;

  return (
    <div
      onClick={onClick}
      className={`
    relative grid grid-cols-12 gap-2 items-center
    px-4 py-3 mb-2 rounded-lg border shadow-sm
    cursor-pointer transition-all duration-200 text-sm

    ${
      isSelected
        ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
        : hasNewItems
          ? "bg-orange-50 border-orange-400 shadow-orange-100 animate-pulse-subtle"
          : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"
    }
  `}
    >
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${
          isSelected
            ? "bg-blue-500"
            : hasNewItems
              ? "bg-orange-500"
              : "bg-gray-300"
        }`}
      />
      <div className="col-span-2 text-gray-700 truncate">
        <div className="flex items-center gap-1">
          <span>order #{order.order_number}</span>
        </div>
      </div>

      {/* Time */}
      <div className="col-span-2 text-gray-500 text-xs">
        {formatTime(order.created_at)}
      </div>

      {/* Order Type / Table */}
      <div className="col-span-2 font-medium text-gray-900 flex items-center gap-2">
        {getOrderTitle()}
      </div>

      {/* Customer Name */}
      <div className="col-span-2 text-gray-700 truncate">
        <div className="flex items-center gap-1">
          <User size={12} className="text-gray-400" />
          <span>{order.name}</span>
        </div>
      </div>

      {/* Status & Badges */}
      <div className="col-span-4 flex items-center justify-end gap-2 flex-wrap">
        {/* 🔔 New Item Indicator */}
        {hasNewItems && (
          <span className="flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm animate-pulse">
            <Bell size={12} />
            {newItems.length} New Item{newItems.length > 1 ? "s" : ""}
          </span>
        )}

        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}
        >
          {order.status.replace("_", " ")}
        </span>

        {pendingCount > 0 && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            {pendingCount} pending
          </span>
        )}
      </div>
    </div>
  );
}
