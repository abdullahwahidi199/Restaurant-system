import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Boxes,
  AlertTriangle,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import TopConsumedChart from "./TopConsumedChart";

import IngredientList from "./IngredientList";
import LowStockItems from "./LowStockItems";
import StockMovementList from "./StockMovementList";
import CreateIngredientModal from "./CreateIngredient";
import StockTransferPanel from "./StockTransferPanel";

import { getInventorySummary } from "../../../api/inventoryApi";
import InventorySearch from "./InventorySearch";
import { AuthContext } from "../../../api/authforRBC";

export default function InventoryDashboard() {
  const { t } = useTranslation();
  const { auth } = useContext(AuthContext);
  const [showCreate, setShowCreate] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const isBranchAdmin = auth?.user?.role === "BranchAdmin";

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
    return (
      <p className="text-gray-500">
        {t("inventory_manager.dashboard.loading", {
          defaultValue: "Loading inventory dashboard...",
        })}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {t("inventory_manager.dashboard.title", { defaultValue: "Inventory" })}
          </h1>
          <p className="text-sm text-gray-500">
            {t("inventory_manager.dashboard.subtitle", { defaultValue: "Stock overview and management" })}
          </p>
        </div>
        <InventorySearch />
        <button
          onClick={() => setShowCreate(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          {t("inventory_manager.ingredients.new_ingredient", { defaultValue: "New Ingredient" })}
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <StatCard
          title={t("inventory_manager.dashboard.total_ingredients", { defaultValue: "Total Ingredients" })}
          value={stats.total_ingredients}
          icon={<Boxes />}
        />
        <StatCard
          title={t("inventory_manager.common.low_stock", { defaultValue: "Low Stock" })}
          value={stats.low_stock}
          icon={<AlertTriangle />}
          danger
        />
        <StatCard
          title={t("inventory_manager.common.out_of_stock", { defaultValue: "Out of Stock" })}
          value={stats.out_of_stock}
          icon={<Trash2 />}
          danger
        />
        <StatCard
          title={t("inventory_manager.dashboard.inventory_value", { defaultValue: "Inventory Value" })}
          value={`AFN ${new Intl.NumberFormat().format(
            Number(stats.inventory_value).toFixed(2),
          )}`}
          icon={<TrendingUp />}
        />
      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:gap-6">
        <TopConsumedChart items={stats.top_consumed_ingredients} />

        <SummaryList
          title={t("inventory_manager.dashboard.high_waste", { defaultValue: "High Waste Ingredients (30 days)" })}
          items={stats.high_waste_ingredients}
          valueKey="wasted"
          danger
          icon={<Trash2 className="w-4 h-4" />}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4 xl:gap-6">
        {/* DATA */}
        <div className="xl:col-span-3 space-y-6">
          <IngredientList />
          <StockMovementList />
        </div>

        {/* ACTIONS */}
        <div className="space-y-6">
          {!isBranchAdmin && <StockTransferPanel />}
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
      className="flex items-start justify-between gap-4 overflow-hidden rounded-lg border bg-white p-4 shadow-sm sm:p-5"
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p
          className={`break-words text-2xl font-bold xl:text-3xl ${
            danger ? "text-red-600" : "text-gray-900"
          }`}
        >
          {value}
        </p>
      </div>

      <div
        className={`rounded-lg p-3 ${
          danger ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-700"
        }`}
      >
        {icon}
      </div>
    </motion.div>
  );
}

function SummaryList({ title, items, valueKey, danger, icon }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-5">
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
        <p className="text-sm text-gray-500">
          {t("inventory_manager.common.no_data_available", { defaultValue: "No data available" })}
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li
              key={idx}
            className="flex items-start justify-between gap-3 text-sm text-gray-700"
          >
              <span className="min-w-0 break-words">
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
