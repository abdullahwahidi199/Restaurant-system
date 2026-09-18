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
import TopConsumedChart from "../../Admin/Inventory/TopConsumedChart";

import KichenManagerIngredientList from "./IngredientList";
import LowStockItems from "../../Admin/Inventory/LowStockItems";
// import StockMovementList from "./StockMovementList";
// import CreateIngredientModal from "./CreateIngredient";

import { getInventorySummary } from "../../../api/inventoryApi";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function KitchenManagerStockDashboard() {
                 const { t: autoT } = useAutoTranslation();
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
    return <p className="text-gray-500">{autoT("legacy.loading_inventory_dashboard_ee354ffa")}</p>;
  }

  return (
    <div className="space-y-6 p-10">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{autoT("nav.inventory")}</h1>
          <p className="text-sm text-gray-500">{autoT("inventory_manager.dashboard.subtitle")}</p>
        </div>

        {/* <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          New Ingredient
        </button> */}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title={autoT("inventory_manager.dashboard.total_ingredients")}
          value={stats.total_ingredients}
          icon={<Boxes />}
        />
        <StatCard
          title={autoT("inventory_manager.common.low_stock")}
          value={stats.low_stock}
          icon={<AlertTriangle />}
          danger
        />
        <StatCard
          title={autoT("inventory_manager.common.out_of_stock")}
          value={stats.out_of_stock}
          icon={<Trash2 />}
          danger
        />
        {/* <StatCard
          title="Inventory Value"
          value={`AFN${Number(stats.inventory_value).toFixed(2)}`}
          icon={<TrendingUp />}
        /> */}
      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopConsumedChart items={stats.top_consumed_ingredients} />

        <SummaryList
          title={autoT("inventory_manager.dashboard.high_waste")}
          items={stats.high_waste_ingredients}
          valueKey="wasted"
          danger
          icon={<Trash2 className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <KichenManagerIngredientList />
          {/* <StockMovementList /> */}
        </div>

        <div className="space-y-6">
          <LowStockItems />
        </div>
      </div>

      {/* {showCreate && (
        <CreateIngredientModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            loadSummary();
          }}
        />
      )} */}
    </div>
  );
}

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
  const { t: autoT } = useAutoTranslation();
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
        <p className="text-sm text-gray-500">{autoT("inventory_manager.common.no_data_available")}</p>
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
