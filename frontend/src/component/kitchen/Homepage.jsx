import { useEffect, useState } from "react";
import FilterBar from "./FilterBar";
import OrderCard from "./OrderCard";
import MetricsBar from "./MetricsBar";
import instance from "../../api/axiosInstance";
import { Users } from "lucide-react";

export default function KitchenHomepage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error,setError]=useState(null)

  console.log(orders)
  const [activeTypeTab, setActiveTypeTab] = useState("dine-in");
  const [activeStatusTab, setActiveStatusTab] = useState("pending");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/orders/orders/");
      const data =res.data
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message)
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


  const hasPending = {
    "dine-in": orders.some((o) => o.order_type === "dine-in" && o.status === "pending"),
    takeaway: orders.some((o) => o.order_type === "takeaway" && o.status === "pending"),
    delivery: orders.some((o) => o.order_type === "delivery" && o.status === "pending"),
  };

  // console.log(hasPending["delivery"])
  if (loading)
    return <p className="text-center py-6 text-gray-500">Loading orders...</p>;
  if (error){
    return(
      <p>{error}</p>
    )
  }

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


        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">

          <div className="flex bg-white shadow-sm border border-gray-200 rounded-full overflow-hidden">
            {typeTabs.map((tab) => (
              <div key={tab.key} className="relative">
                {hasPending[tab.key] && (
                  <span className="absolute top-2 right-2 w-2.5 z-10 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                )}

                <button
                  onClick={() => {
                    setActiveTypeTab(tab.key);
                    setActiveStatusTab("all");
                  }}
                  className={`relative px-5 py-2 text-sm font-medium transition-all duration-300 ${activeTypeTab === tab.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {tab.label}
                </button>
              </div>
            ))}
          </div>


          <div className="flex bg-white shadow-sm border border-gray-200 rounded-full overflow-hidden">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveStatusTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${activeStatusTab === tab.key
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>


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
