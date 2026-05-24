import { Clock, User, Phone, MapPin } from "lucide-react";

export default function CompactOrderCard({ order, isSelected, onClick }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    ready: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
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
    (item) => item.status === "pending",
  ).length;

  return (
    <div
      onClick={onClick}
      className={`
        grid grid-cols-12 gap-2 items-center px-4 py-2 border-b cursor-pointer transition-all duration-200 text-sm
        ${
          isSelected
            ? "bg-blue-50 border-l-4 border-l-blue-500"
            : "bg-white hover:bg-gray-50"
        }
      `}
    >
      <div className="col-span-2 text-gray-700 truncate">
        <div className="flex items-center gap-1">
          {/* <User size={12} className="text-gray-400" /> */}
          <span>order #{order.order_number}</span>
        </div>
      </div>

      {/* Time */}
      <div className="col-span-2 text-gray-500 text-xs">
        {formatTime(order.created_at)}
      </div>

      {/* Order Type / Table */}
      <div className="col-span-2 font-medium text-gray-900">
        {getOrderTitle()}
      </div>

      {/* Customer Name */}
      <div className="col-span-2 text-gray-700 truncate">
        <div className="flex items-center gap-1">
          <User size={12} className="text-gray-400" />
          <span>{order.name}</span>
        </div>
      </div>

      {/* Status & Pending Badge */}
      <div className="col-span-2 flex items-center justify-end gap-2">
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
