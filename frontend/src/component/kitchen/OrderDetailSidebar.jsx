import {
  Clock,
  CheckCircle,
  X,
  User,
  Phone,
  MapPin,
  Receipt,
} from "lucide-react";
import { useState, useEffect } from "react";
import instance from "../../api/axiosInstance";
import OrderItem from "./OrderItem";
import KitchenBillPrintModal from "./KitchenBillPrintModal";

export default function OrderDetailSidebar({
  order,
  onClose,
  onOrderPrinted,
  onOrderUpdated,
  readOnly = false,
}) {
  const [printMode, setPrintMode] = useState("new"); // "new" or "all"
  const [updating, setUpdating] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [time, setTime] = useState(0);

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await instance.patch(`/orders/orders/${order.id}/update_status/`, {
        status: newStatus,
      });
      onOrderUpdated?.(response.data);
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setUpdating(false);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (order.status === "in_progress") {
      const savedTime = localStorage.getItem(`order-${order.id}-time`);
      if (savedTime) setTime(Number(savedTime));
      const interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;
          localStorage.setItem(`order-${order.id}-time`, newTime);
          return newTime;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTime(0);
      localStorage.removeItem(`order-${order.id}-time`);
    }
  }, [order.status, order.id]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getOrderTitle = () => {
    if (order.order_type === "dine-in") return `Table ${order.tableName}`;
    if (order.order_type === "takeaway") return "Takeaway Order";
    return "Delivery Order";
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    ready: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  useEffect(() => {
    let interval;

    if (order.status === "in_progress") {
      const storageKey = `order-${order.id}-startedAt`;

      // get existing start time or create one
      let startedAt = localStorage.getItem(storageKey);

      if (!startedAt) {
        startedAt = Date.now();
        localStorage.setItem(storageKey, startedAt);
      }

      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - Number(startedAt)) / 1000);

        setTime(elapsed);
      };

      // initial update
      updateTimer();

      interval = setInterval(updateTimer, 1000);
    } else {
      setTime(0);

      localStorage.removeItem(`order-${order.id}-startedAt`);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [order.status, order.id]);

  const items = order.items || [];
  const hasPendingItems = items.some((i) => i.status === "pending");
  const allStationItemsReady =
    items.length > 0 &&
    items.every(
      (i) =>
        i.status === "ready" ||
        i.status === "cancelled" ||
        i.status === "served" ||
        i.status === "completed",
    );

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-full max-w-96 overflow-y-auto border-l border-gray-200 bg-white shadow-xl sm:w-96">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white p-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-lg text-gray-800">
            {getOrderTitle()}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Close order details"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Badge & Timer */}
        <div className="flex justify-between items-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColors[order.status]}`}
          >
            {order.status.replace("_", " ")}
          </span>
          {order.status === "in_progress" && (
            <div className="flex items-center gap-1 text-sm font-mono text-gray-600">
              <Clock size={14} /> {formatTime(time)}
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User size={16} className="text-gray-500" />
            <span className="font-medium">{order.name}</span>
          </div>

          {order.order_type === "delivery" && order.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin size={16} className="text-gray-500 mt-0.5" />
              <span className="text-gray-600">{order.address}</span>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg ">
            <p>created by: {order.created_by_name}</p>
          </div>
        </div>

        {/* Notes */}
        {order.note && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-yellow-800 mb-1">
              📝 Notes:
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {order.note}
            </p>
          </div>
        )}

        {/* Order Items */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Receipt size={16} /> Order Items
          </h4>
          <div className="space-y-2">
            {order.items.map((item) => (
              <OrderItem key={item.id} item={item} readOnly={readOnly} />
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-800">Total:</span>
            <span className="text-xl font-bold text-gray-900">
              {order.total} AFN
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {hasPendingItems && !allStationItemsReady && !readOnly && (
            <button
              disabled={updating}
              onClick={() => updateOrderStatus("in_progress")}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Clock size={16} /> Start Preparing
            </button>
          )}

          <div className="space-y-2">
            <select
              value={printMode}
              onChange={(e) => setPrintMode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {!readOnly && <option value="new">Unprinted Items</option>}
              <option value="all">Reprint Full Order</option>
            </select>

            <button
              onClick={() => setShowPrint(true)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Print Bill
            </button>
          </div>

          {!hasPendingItems && !allStationItemsReady && !readOnly && (
            <button
              disabled={updating}
              onClick={() => {
                updateOrderStatus("ready");
              }}
              className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={16} /> Mark as Ready
            </button>
          )}
        </div>
      </div>

      {showPrint && (
        <KitchenBillPrintModal
          order={order}
          onClose={() => setShowPrint(false)}
          onOrderPrinted={onOrderPrinted}
          printMode={printMode}
        />
      )}
    </div>
  );
}
