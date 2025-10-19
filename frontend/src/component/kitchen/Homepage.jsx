import { useEffect, useState } from "react";
import FilterBar from "./FilterBar";
import OrderCard from "./OrderCard";
import MetricsBar from "./MetricsBar";

export default function KitchenHomepage() {
  const [tables, setTables] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchKitchenData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/orders/tables/");
      const data = await res.json();
      setTables(data);
    } catch (error) {
      console.error("Error fetching kitchen data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenData();
  }, []);

  // Combine all current orders across tables
  const allOrders = tables
    .filter((t) => t.current_order)
    .map((t) => ({
      ...t.current_order,
      tableNumber: t.number,
    }));

  const filteredOrders = allOrders.filter((order) => {
    if (filter !== "all" && order.status !== filter) return false;
    if (search && !order.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  if (loading) return <p className="text-center py-6">Loading...</p>;

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <MetricsBar orders={allOrders} />
        <FilterBar filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} />

        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} refresh={fetchKitchenData} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
