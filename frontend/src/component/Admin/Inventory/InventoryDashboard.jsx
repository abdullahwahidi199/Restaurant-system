import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Boxes,
  AlertTriangle,
  TrendingUp,
  Trash2,
  Flame,
} from "lucide-react";
import TopConsumedChart from "./TopConsumedChart";

import IngredientList from "./IngredientList";
import LowStockItems from "./LowStockItems";
import StockMovementList from "./StockMovementList";
import AddStock from "./AddStock";
import CreateIngredientModal from "./CreateIngredient";

import { getInventorySummary } from "../../../api/inventoryApi";

export default function InventoryDashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await getInventorySummary();
      setStats(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Failed to load inventory summary", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading inventory dashboard…</p>;
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">Stock overview and management</p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          New Ingredient
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard
          title="Total Ingredients"
          value={stats.total_ingredients}
          icon={<Boxes />}
        />
        <StatCard
          title="Low Stock"
          value={stats.low_stock}
          icon={<AlertTriangle />}
          danger
        />
        <StatCard
          title="Out of Stock"
          value={stats.out_of_stock}
          icon={<Trash2 />}
          danger
        />
        <StatCard
          title="Inventory Value"
          value={`AFN${Number(stats.inventory_value).toFixed(2)}`}
          icon={<TrendingUp />}
        />
      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopConsumedChart items={stats.top_consumed_ingredients} />

        <SummaryList
          title="High Waste Ingredients (30 days)"
          items={stats.high_waste_ingredients}
          valueKey="wasted"
          danger
          icon={<Trash2 className="w-4 h-4" />}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* DATA */}
        <div className="xl:col-span-3 space-y-6">
          <IngredientList />
          <StockMovementList />
        </div>

        {/* ACTIONS */}
        <div className="space-y-6">
          <AddStock />
          <LowStockItems />
        </div>
      </div>

      {showCreate && (
        <CreateIngredientModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            loadSummary();
          }}
        />
      )}
    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function StatCard({ title, value, icon, danger }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-2xl p-5 flex items-center justify-between shadow-sm"
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p
          className={`text-3xl font-bold ${
            danger ? "text-red-600" : "text-gray-900"
          }`}
        >
          {value}
        </p>
      </div>

      <div
        className={`p-3 rounded-xl ${
          danger ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-700"
        }`}
      >
        {icon}
      </div>
    </motion.div>
  );
}

function SummaryList({ title, items, valueKey, danger, icon }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`p-2 rounded-lg ${
            danger ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-700"
          }`}
        >
          {icon}
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No data available</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex justify-between text-sm text-gray-700"
            >
              <span>
                {item.ingredient__name} ({item.ingredient__unit})
              </span>
              <span
                className={`font-medium ${
                  danger ? "text-red-600" : "text-gray-900"
                }`}
              >
                {Math.abs(item[valueKey])}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
