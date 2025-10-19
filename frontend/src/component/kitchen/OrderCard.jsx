import { useState } from "react";
import { Clock, CheckCircle, Utensils } from "lucide-react";
import OrderItem from "./OrderItem";

export default function OrderCard({ order, refresh }) {
  const [updating, setUpdating] = useState(false);

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await fetch(`http://127.0.0.1:8000/orders/orders/${order.id}/update_status/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      refresh();
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setUpdating(false);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    ready: "bg-green-100 text-green-800",
    
  };

  return (
    <div className="bg-white shadow-sm rounded-2xl p-4 border space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Table {order.tableNumber}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
          {order.status.replace("_", " ")}
        </span>
      </div>

      <p className="text-sm text-gray-600">👤 {order.name} | 📞 {order.phone}</p>
      <p className="text-sm text-gray-500">Total: {order.total} AFN</p>

      <div className="divide-y divide-gray-200">
        {order.items.map((item) => (
          <OrderItem key={item.id} item={item} />
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-3">
        {order.status === "pending" && (
          <button
            disabled={updating}
            onClick={() => updateOrderStatus("in_progress")}
            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
          >
            <Clock size={16} /> Start
          </button>
        )}

        {order.status === "in_progress" && (
          <button
            disabled={updating}
            onClick={() => updateOrderStatus("ready")}
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
          >
            <CheckCircle size={16} /> Mark Ready
          </button>
        )}

        
      </div>
    </div>
  );
}
