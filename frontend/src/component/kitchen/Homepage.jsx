import { useEffect, useState } from "react";
import FilterBar from "./FilterBar";
import OrderCard from "./OrderCard";
import MetricsBar from "./MetricsBar";

export default function KitchenHomepage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

 
  const [activeTypeTab, setActiveTypeTab] = useState("dine-in");
  const [activeStatusTab, setActiveStatusTab] = useState("pending");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/orders/orders/");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  
  const allowedStatuses = {
    "dine-in": ["pending", "in_progress", "ready"],
    takeaway: ["pending", "in_progress", "ready"],
    delivery: ["pending", "in_progress", "ready"],
  };

  const filteredOrders = orders.filter((order) => {
    return (
      order.order_type === activeTypeTab &&
      allowedStatuses[order.order_type].includes(order.status) &&
      (activeStatusTab === "all" || order.status === activeStatusTab) &&
      (!search || order.name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const typeTabs = [
    { key: "dine-in", label: "🍽️ Dine-In" },
    { key: "takeaway", label: "🥡 Takeaway" },
    { key: "delivery", label: "🚚 Delivery" },
  ];

  const statusTabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "in_progress", label: "In Progress" },
    { key: "ready", label: activeTypeTab === "delivery" ? "Ready for Pickup" : "Ready" },
  ];

  if (loading)
    return <p className="text-center py-6 text-gray-500">Loading orders...</p>;

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
            className="w-full sm:w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-center space-x-4 mb-2">
          {typeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTypeTab(tab.key);
                setActiveStatusTab("all");
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTypeTab === tab.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 border hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex justify-center space-x-4 mb-4">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatusTab(tab.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                activeStatusTab === tab.key
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white text-gray-700 border hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <p className="text-gray-400 italic text-center py-8">
            No {activeTypeTab} orders in {activeStatusTab} status.
          </p>
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
