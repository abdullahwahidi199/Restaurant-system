import { useContext, useEffect, useState } from "react";
import { Clock, CheckCircle, Utensils, CheckCircle2 } from "lucide-react";
import OrderItem from "./OrderItem";
import instance from "../../api/axiosInstance";
import KitchenBillPrintModal from "./KitchenBillPrintModal";

export default function OrderCard({ order }) {
  const [updating, setUpdating] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await instance.patch(`/orders/orders/${order.id}/update_status/`, {
        status: newStatus,
      });
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

      setRunning(true);
      const interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;
          localStorage.setItem(`order-${order.id}-time`, newTime);
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setRunning(false);
      setTime(0);
      localStorage.removeItem(`order-${order.id}-time`);
    }
  }, [order.status, order.id]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    ready: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  // 🔥 CHECK VISIBLE ITEM STATUSES FOR THIS STATION:
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
    <div className="bg-white shadow-sm rounded-2xl p-4 border border-gray-100 space-y-3">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          {order.order_type === "dine-in" ? (
            <h2 className="text-lg font-semibold">Table {order.tableName}</h2>
          ) : order.order_type === "takeaway" ? (
            <h2 className="text-lg font-semibold">Take away</h2>
          ) : (
            <h2 className="text-lg font-semibold">Delivery</h2>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {new Date(order.created_at).toLocaleTimeString()}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}
        >
          {order.status.replace("_", " ")}
        </span>
      </div>

      {/* Customer Info */}
      <div className="text-sm text-gray-600 space-y-1">
        <p className="flex justify-between">
          <span>👤 {order.name}</span>
          <span>📞 {order.phone}</span>
        </p>
        <p className="font-semibold text-gray-800">Total: {order.total} AFN</p>
      </div>

      {/* Notes Section */}
      {order.note && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <p className="text-xs font-semibold text-yellow-800 mb-1">
            📝 Notes:
          </p>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
            {order.note}
          </p>
        </div>
      )}

      {/* Order Items Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`${
              index % 2 === 0 ? "border-r border-gray-100 pr-2" : "pl-2"
            }`}
          >
            <OrderItem item={item} />
          </div>
        ))}
      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-2">
        {/* 1️⃣ SHOW START IF ANY ITEM FOR THIS STATION IS PENDING */}
        {hasPendingItems && !allStationItemsReady && (
          <button
            disabled={updating}
            onClick={() => updateOrderStatus("in_progress")}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <Clock size={16} /> Start
          </button>
        )}

        <button
          onClick={() => setShowPrint(true)}
          className="flex-1 min-w-[80px] bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Print
        </button>

        {/* 2️⃣ SHOW MARK READY IF ITEMS STARTED BUT NOT YET READY */}
        {!hasPendingItems && !allStationItemsReady && (
          <button
            disabled={updating}
            onClick={() => {
              updateOrderStatus("ready");
              setRunning(false);
            }}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1 bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
          >
            <CheckCircle size={16} /> Mark Ready
          </button>
        )}

        {/* 3️⃣ SHOW COMPLETED BADGE ONCE THIS STATION FINISHES ITS ITEMS */}
        {allStationItemsReady && (
          <div className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-xs font-bold">
            <CheckCircle2 size={16} className="text-green-600 shrink-0" />
            <span>Your Station Ready</span>
          </div>
        )}
      </div>

      {showPrint && (
        <KitchenBillPrintModal
          order={order}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
}
