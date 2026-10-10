import React, { useEffect, useState } from "react";
import instance from "../../api/axiosInstance";
import CompactOrderCard from "./CompactOrderCard";
import OrderDetailSidebar from "./OrderDetailSidebar";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ReadyOrders() {
                 const { t: autoT } = useAutoTranslation();
  const [readyOrders, setReadyOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await instance.get("/orders/ready-kitchen-orders/");

      setReadyOrders(response.data);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          error.message ||
          "Failed to load ready orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadyOrders();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {loading && (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500">{autoT("legacy.loading_ready_orders_2ac23eb5")}</p>
          </div>
        )}

        {!loading && error && (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && readyOrders.length === 0 && (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-500">{autoT("legacy.no_ready_orders_found_210ca9cc")}</p>
          </div>
        )}

        {!loading &&
          !error &&
          readyOrders.map((order) => (
            <CompactOrderCard
              key={order.id}
              order={order}
              isSelected={selectedOrder?.id === order.id}
              currentTime={currentTime}
              onClick={() => setSelectedOrder(order)}
            />
          ))}
      </div>

      {selectedOrder && (
        <OrderDetailSidebar
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          readOnly={true}
        />
      )}
    </div>
  );
}
