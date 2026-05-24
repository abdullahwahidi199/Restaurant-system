import { useContext, useEffect, useState } from "react";
import FilterBar from "./FilterBar";
import OrderCard from "./OrderCard";
import MetricsBar from "./MetricsBar";
import instance from "../../api/axiosInstance";
import useOrdersSocket from "../../hooks/useOrdersSocket";
import { AuthContext } from "../../api/authforRBC";
import OrderDetailSidebar from "./OrderDetailSidebar";
import CompactOrderCard from "./CompactOrderCard";

export default function KitchenHomepage() {
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resName, setResName] = useState(null);
  const [resLogo, setResLogo] = useState(null);
  const [resAdd, setResAdd] = useState(null);
  const [resPhone, setResPhone] = useState(null);

  const [activeTypeTab, setActiveTypeTab] = useState("dine-in");
  const [activeStatusTab, setActiveStatusTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/orders/kitchen-orders/", {
        params: {
          // order_type: activeTypeTab,
          status: activeStatusTab,
          search: search || undefined,
        },
      });
      setOrders(res.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await instance.get("/orders/kitchen-orders/", {
        params: { status: "pending" },
      });
      setPendingOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [activeTypeTab, activeStatusTab]);

  const filteredOrders = orders.filter((order) => {
    const query = search.toLowerCase();

    return (
      order.name?.toLowerCase().includes(query) ||
      order.tableName?.toLowerCase().includes(query) ||
      order.order_number?.toString().includes(query)
    );
  });

  const handleMessage = (msg) => {
    if (!msg?.order) return;

    const incoming = msg.order;
    const ACTIVE = ["pending", "approved", "in_progress", "ready"];

    const hasActiveItems = (order) =>
      order.items?.some((i) => ACTIVE.includes(i.status));

    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === incoming.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = incoming;
        if (!hasActiveItems(incoming)) {
          return copy.filter((o) => o.id !== incoming.id);
        }
        return copy;
      }
      if (hasActiveItems(incoming)) {
        return [incoming, ...prev];
      }
      return prev;
    });

    setPendingOrders((prev) => {
      if (incoming.status !== "pending" || incoming.status === "cancelled") {
        return prev.filter((o) => o.id !== incoming.id);
      }
      const idx = prev.findIndex((o) => o.id === incoming.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = incoming;
        return copy;
      }
      return [incoming, ...prev];
    });
  };

  useOrdersSocket(handleMessage);

  useEffect(() => {
    if (!selectedOrder) return;

    const updatedSelectedOrder = orders.find((o) => o.id === selectedOrder.id);

    if (updatedSelectedOrder) {
      setSelectedOrder(updatedSelectedOrder);
    }
  }, [orders]);

  const typeTabs = [
    { key: "dine-in", label: "🍽️ Dine-In" },
    { key: "takeaway", label: "🥡 Takeaway" },
    { key: "delivery", label: "🚚 Delivery" },
  ];

  const statusTabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "in_progress", label: "In Progress" },
    { key: "ready", label: "Ready" },
  ];

  const hasPendingOrders = (type) => {
    return pendingOrders.some((order) => order.order_type === type);
  };

  const dineInOrders = filteredOrders.filter(
    (order) => order.order_type === "dine-in",
  );
  const takeawayDeliveryOrders = filteredOrders.filter(
    (order) =>
      order.order_type === "takeaway" || order.order_type === "delivery",
  );

  if (loading)
    return <p className="text-center py-6 text-gray-500">Loading orders...</p>;

  if (error) return <p>{error}</p>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${selectedOrder ? "mr-96" : ""}`}
      >
        {/* Header & Filters */}
        <div className="p-4 border-b bg-white shadow-sm">
          <div className="max-w-full mx-auto space-y-4">
            <div className="flex justify-center">
              <input
                type="text"
                placeholder="Search customer or order number or table..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-96 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Split Screen - Two Equal Sections */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Dine-In Section - Top 50% */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-gray-200">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800">🍽️ Dine-In</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {dineInOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              {dineInOrders.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No dine-in orders found.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {dineInOrders.map((order) => (
                    <CompactOrderCard
                      key={order.id}
                      order={order}
                      isSelected={selectedOrder?.id === order.id}
                      onClick={() => setSelectedOrder(order)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Takeaway & Delivery Section - Bottom 50% */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800">
                🥡 Takeaway & 🚚 Delivery
              </h2>
              <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {takeawayDeliveryOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              {takeawayDeliveryOrders.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No takeaway or delivery orders found.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {takeawayDeliveryOrders.map((order) => (
                    <CompactOrderCard
                      key={order.id}
                      order={order}
                      isSelected={selectedOrder?.id === order.id}
                      onClick={() => setSelectedOrder(order)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Full Order Details */}
      {selectedOrder && (
        <OrderDetailSidebar
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
