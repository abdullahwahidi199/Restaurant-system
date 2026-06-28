import { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import ProductionCard from "./ProductionCard";

export default function DailyProduction() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await instance.get("/menu/production/");
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const adjust = async (item, action, quantity) => {
    try {
      await instance.post("/menu/production/", {
        menu_item: item.id,
        action,
        quantity,
      });
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to adjust production");
    }
  };

  const clearProduction = async (productionId, refund = false) => {
    if (
      !confirm(
        refund ? "Clear and refund unused ingredients?" : "Clear production?",
      )
    )
      return;
    try {
      await instance.delete(
        `/menu/production/${productionId}/?refund=${refund}`,
      );
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to clear production");
    }
  };

  const activeCount = items.filter(
    (i) => i.production && i.production.quantity_remaining > 0,
  ).length;
  const totalRemaining = items.reduce(
    (s, i) => s + (i.production?.quantity_remaining || 0),
    0,
  );
  const totalProduced = items.reduce(
    (s, i) => s + (i.production?.quantity_produced || 0),
    0,
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daily Production</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-gray-500">Tracked Items</p>
          <h2 className="text-2xl font-bold">{items.length}</h2>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-gray-500">Active (in stock)</p>
          <h2 className="text-2xl font-bold">{activeCount}</h2>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-gray-500">Total Remaining</p>
          <h2 className="text-2xl font-bold">
            {totalRemaining} / {totalProduced}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden divide-y">
        {loading ? (
          <div className="p-5">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-5 text-gray-500">
            No menu items use daily production. Enable “Uses daily production”
            on a menu item first.
          </div>
        ) : (
          items.map((item) => (
            <ProductionCard
              key={item.id}
              item={item}
              onIncrement={(qty) => adjust(item, "increment", qty)}
              onDecrement={(qty) => adjust(item, "decrement", qty)}
              onClear={(refund) =>
                item.production && clearProduction(item.production.id, refund)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
