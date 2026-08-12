import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, Boxes, FileText, Plus, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import CreateIngredientModal from "./CreateIngredient";
import IngredientList from "./IngredientList";
import InventoryDashboard from "./InventoryDashboard";
import InventoryReport from "../Reports/InventoryReport";
import LowStockItems from "./LowStockItems";
import StockMovementList from "./StockMovementList";

const todayISO = () => new Date().toISOString().slice(0, 10);

const getWorkspaceBase = (pathname) => {
  if (pathname.startsWith("/operations-manager")) return "/operations-manager";
  if (pathname.startsWith("/inventory-manager")) return "/inventory-manager";
  if (pathname.startsWith("/finance-manager")) return "/finance-manager";
  return "/admin/dashboard";
};

function InventoryPageShell({ title, description, action, children }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-gray-500">
            {t("inventory_manager.common.inventory", { defaultValue: "Inventory" })}
          </p>
          <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
            {title}
          </h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {action && <div className="w-full md:w-auto">{action}</div>}
      </div>
      {children}
    </div>
  );
}

export function InventoryOverviewPage() {
  return <InventoryDashboard />;
}

export function IngredientsPage() {
  const { t } = useTranslation();
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <InventoryPageShell
      title={t("inventory_manager.pages.ingredients.title", { defaultValue: "Ingredients" })}
      description={t("inventory_manager.pages.ingredients.description", {
        defaultValue: "Maintain stock item definitions, units, thresholds, and branch inventory records.",
      })}
      action={
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white md:w-auto"
        >
          <Plus className="h-4 w-4" />
          {t("inventory_manager.ingredients.new_ingredient", { defaultValue: "New Ingredient" })}
        </button>
      }
    >
      <IngredientList key={refreshKey} />
      {showCreate && (
        <CreateIngredientModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            setRefreshKey((key) => key + 1);
          }}
        />
      )}
    </InventoryPageShell>
  );
}

export function StockLevelsPage() {
  const { t } = useTranslation();
  return (
    <InventoryPageShell
      title={t("inventory_manager.pages.stock_levels.title", { defaultValue: "Stock Levels" })}
      description={t("inventory_manager.pages.stock_levels.description", {
        defaultValue: "Review current ingredient quantities, thresholds, and unit costs.",
      })}
    >
      <IngredientList />
    </InventoryPageShell>
  );
}

export function StockMovementsPage() {
  const { t } = useTranslation();
  return (
    <InventoryPageShell
      title={t("inventory_manager.pages.stock_movements.title", { defaultValue: "Stock Movements" })}
      description={t("inventory_manager.pages.stock_movements.description", {
        defaultValue: "Audit purchases, adjustments, waste, and inventory movement history.",
      })}
    >
      <StockMovementList />
    </InventoryPageShell>
  );
}

export function StockAdjustmentsPage() {
  const { t } = useTranslation();
  const dashboardBase = getWorkspaceBase(useLocation().pathname);

  return (
    <InventoryPageShell
      title={t("inventory_manager.pages.stock_adjustments.title", { defaultValue: "Stock Adjustments" })}
      description={t("inventory_manager.pages.stock_adjustments.description", {
        defaultValue: "Correct stock quantities after counts, waste, breakage, and kitchen checks.",
      })}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <IngredientList />
        <div className="rounded-lg border bg-white p-4 lg:sticky lg:top-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">
              {t("inventory_manager.stock_adjustments.queue_title", { defaultValue: "Adjustment Queue" })}
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {t("inventory_manager.stock_adjustments.queue_description", {
              defaultValue: "Select Adjust beside an ingredient to record a stock correction.",
            })}
          </p>
          <Link
            to={`${dashboardBase}/inventory/stock-movements?type=adjustment`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 sm:w-auto"
          >
            <FileText className="h-4 w-4" />
            {t("inventory_manager.stock_adjustments.view_adjustments", { defaultValue: "View Adjustments" })}
          </Link>
        </div>
      </div>
    </InventoryPageShell>
  );
}

export function LowStockAlertsPage() {
  const { t } = useTranslation();
  const dashboardBase = getWorkspaceBase(useLocation().pathname);

  return (
    <InventoryPageShell
      title={t("inventory_manager.pages.low_stock.title", { defaultValue: "Low Stock Alerts" })}
      description={t("inventory_manager.pages.low_stock.description", {
        defaultValue: "Ingredients that need attention before service is disrupted.",
      })}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <LowStockItems />
        <div className="rounded-lg border bg-white p-4 lg:sticky lg:top-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="font-semibold text-gray-900">
              {t("inventory_manager.low_stock.restock_workflow", { defaultValue: "Restock Workflow" })}
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {t("inventory_manager.low_stock.restock_description", {
              defaultValue: "Use Procurement to create a purchase invoice when stock needs to be replenished.",
            })}
          </p>
          <Link
            to={`${dashboardBase}/procurement/purchase-invoices/new`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white sm:w-auto"
          >
            <Boxes className="h-4 w-4" />
            {t("inventory_manager.low_stock.create_purchase_invoice", { defaultValue: "Create Purchase Invoice" })}
          </Link>
        </div>
      </div>
    </InventoryPageShell>
  );
}

export function InventoryReportsPage() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());

  return (
    <InventoryPageShell
      title={t("inventory_manager.pages.reports.title", { defaultValue: "Inventory Reports" })}
      description={t("inventory_manager.pages.reports.description", {
        defaultValue: "Stock value, purchase history, supplier history, and purchase cost intelligence.",
      })}
    >
      <div className="mb-4 grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            {t("inventory_manager.reports.start_date", { defaultValue: "Start Date" })}
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="input"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            {t("inventory_manager.reports.end_date", { defaultValue: "End Date" })}
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="input"
          />
        </label>
      </div>
      <InventoryReport startDate={startDate} endDate={endDate} />
    </InventoryPageShell>
  );
}
