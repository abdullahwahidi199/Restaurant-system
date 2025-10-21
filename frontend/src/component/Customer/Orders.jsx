import React, { useEffect, useState } from "react";
import { api } from "../../api/auth";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/customer/orders/");
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-black text-white">
      <h2 className="text-3xl font-bold mb-8 text-center text-red-500">
        Your Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-400 text-center">You have no past orders yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#111] p-6 rounded-2xl shadow-md hover:shadow-red-500/20 transition"
            >
              {/* Header Section */}
              <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                
                <span
                  className={`px-3 py-1 text-sm rounded-full capitalize ${
                    order.status === "pending"
                      ? "bg-yellow-600"
                      : order.status === "completed"
                      ? "bg-green-600"
                      : "bg-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Details */}
              <p className="text-gray-400 text-sm mb-3">
                <strong>Placed on:</strong>{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>

              {/* Items */}
              <div className="bg-[#1a1a1a] p-4 rounded-xl mb-3">
                <h4 className="text-lg font-semibold mb-2 text-gray-300">
                  Items
                </h4>
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-gray-300 border-b border-gray-800 py-2"
                  >
                    <div>
                      <p className="font-medium">{item.menu_item}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{item.subtotal} AFN</p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-end items-center mt-2">
                <p className="text-lg font-bold text-red-400">
                  Total: {order.total} AFN
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
