import React, { useEffect, useState } from "react";
import api from "../../api/auth";
import ReviewItemModel from "./ReviewPage";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrderId,setReviewOrderID]=useState(null)

  const user=localStorage.getItem('customer')
  console.log(orders)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/customer/orders/");
        setOrders(res.data);
        console.log(res.data)
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-black";
      case "in_progress":
        return "bg-blue-500 text-white";
      case "ready":
      case "ready_for_pickup":
        return "bg-green-500 text-white";
      case "completed":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6 text-center text-red-500">
        Your Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-400 text-center">You have no past orders yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-800 rounded-xl p-5 hover:bg-gray-700 transition"
            >
              <div className="flex justify-between items-center mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.replace("_", " ")}
                </span>
                <p className="text-gray-400 text-sm">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              <div className="mb-3">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between py-1 border-b border-gray-700 last:border-b-0"
                  >
                    <div>
                      <p className="text-gray-200 font-medium">{item.menu_item}</p>
                      <p className="text-gray-400 text-sm">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="text-red-400 font-semibold">{item.subtotal} AFN</p>
                  </div>
                ))}
              </div>
                <button
                  onClick={()=>setReviewOrderID(order.id)}
                >
                  Rate
                </button>
              <div className="flex justify-end">
                <p className="text-red-500 font-bold">Total: {order.total} AFN</p>
              </div>
            </div>
          ))}
        </div>
       
      )}
      {reviewOrderId&&(
                          <ReviewItemModel user={user.id} deliveryId={reviewOrderId} 
                            onClose={()=>setReviewOrderID(null)}
                          />
                        )}
    </div>
  );
}
