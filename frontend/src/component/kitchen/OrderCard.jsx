  import { useEffect, useState } from "react";
  import { Clock, CheckCircle, Utensils } from "lucide-react";
  import OrderItem from "./OrderItem";
import instance from "../../api/axiosInstance";

  export default function OrderCard({ order, refresh }) {
    const [updating, setUpdating] = useState(false);
    
    const [time,setTime]=useState(0)
    const [running,setRunning]=useState(false)
    const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await instance.patch(
        `/orders/orders/${order.id}/update_status/`,
        { status: newStatus }
      );
      refresh();
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setUpdating(false);
    }
  };


    useEffect(() => {
  if (order.status === "in_progress") {
    const savedTime = localStorage.getItem(`order-${order.id}-time`);
    if (savedTime) setTime(Number(savedTime));

    setRunning(true);
    const interval = setInterval(() => {
      setTime(prev => {
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


    const formatTime=(seconds)=>{
      const mins=Math.floor(seconds/60)
      const secs=seconds%60
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      ready: "bg-green-100 text-green-800",
      
    };

    return (
      <div className="bg-white shadow-sm rounded-2xl p-4 border space-y-2">
        <div className="flex justify-between items-center">
          {order.order_type==="dine-in" ?
          <h2 className="text-lg font-semibold">Table {order.table }</h2>
          : order.order_type==="takeawy"
          ? <h2 className="text-lg font-semibold">Take away</h2> 
          : <h2 className="text-lg font-semibold">Online Order</h2>
        }
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

          {order.status === "in_progress" && (
          <div className="text-center my-4">
            <span className="text-4xl font-mono font-bold text-blue-600">{formatTime(time)}</span>
          </div>
        )}
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
              onClick={() => {
    updateOrderStatus("ready");
    setRunning(false);
  }}
              className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
            >
              <CheckCircle size={16} /> Mark Ready
            </button>
          )}

          
        </div>
      </div>
    );
  }
