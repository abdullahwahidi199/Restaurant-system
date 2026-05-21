import { useContext, useEffect, useState } from "react";
import FilterBar from "./FilterBar";
import OrderCard from "./OrderCard";
import MetricsBar from "./MetricsBar";
import instance from "../../api/axiosInstance";
import useOrdersSocket from "../../hooks/useOrdersSocket";
import { AuthContext } from "../../api/authforRBC";

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

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await instance.get("/orders/kitchen-orders/", {
        params: {
          order_type: activeTypeTab,
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
      order.phone?.toLowerCase().includes(query)
    );
  });

  const handleMessage = (msg) => {
    if (!msg?.order) return;

    const incoming = msg.order;

    // update current tab orders (your existing logic)
    setOrders((prev) => {
      // remove orders kitchen should not see
      if (incoming.status === "served" || incoming.status === "cancelled") {
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

    // 🔥 ALSO update pendingOrders
    setPendingOrders((prev) => {
      // remove if no longer pending
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
  if (loading)
    return <p className="text-center py-6 text-gray-500">Loading orders...</p>;

  if (error) return <p>{error}</p>;

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <MetricsBar orders={orders} />

        <div className="flex justify-center mb-3">
          <input
            type="text"
            placeholder="Search customer or order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-1/2 px-4 py-2 rounded-lg border"
          />
        </div>

        <div className="flex justify-between">
          <div className="flex bg-white shadow-sm rounded-full overflow-hidden">
            {typeTabs.map((tab) => {
              const showDot = hasPendingOrders(tab.key);

              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTypeTab(tab.key);
                    setActiveStatusTab("pending");
                  }}
                  className={`relative px-5 py-2 ${
                    activeTypeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600"
                  }`}
                >
                  {tab.label}

                  {showDot && (
                    <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex bg-white shadow-sm rounded-full overflow-hidden">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveStatusTab(tab.key)}
                className={`px-4 py-2 ${
                  activeStatusTab === tab.key
                    ? "bg-green-600 text-white"
                    : "text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-400">No orders found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} refresh={fetchOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
