import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getIngredient,
  getIngredientPurchaseHistory,
  getIngredientsPages,
} from "../../../api/inventoryApi";
import AdjustStockModal from "./AdjustStockModal";
import EditIngredientModal from "./EditIngredientModal";
import instance from "../../../api/axiosInstance";
import { ArrowUpRight, FileText, AlertTriangle, PackageX, X } from "lucide-react";
import AuditTimeline from "../../../modules/audit/components/AuditTimeline";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "AFN",
});

export default function IngredientList() {
  const { t } = useTranslation();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 15;

  const [adjustIngredient, setAdjustIngredient] = useState(null);
  const [editIngredient, setEditIngredient] = useState(null);
  const [detailIngredient, setDetailIngredient] = useState(null);
  const [detailHistory, setDetailHistory] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState("details");
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const fetchIngredients = useCallback(async (pageNum = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const response = await getIngredientsPages(pageNum, searchTerm);
      setIngredients(response.data.results);
      setCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch ingredients", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // debounce fetch
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchIngredients(page, search);
    }, 600);

    return () => clearTimeout(delay);
  }, [search, page, fetchIngredients]);

  const handleDownloadPDF = async (type) => {
    try {
      const res = await instance.get("/inventory/inventory-pdf/", {
        params: { type },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_inventory_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  function deleteIngredient(id) {
    if (
      !window.confirm(
        t("inventory_manager.ingredients.delete_confirm", {
          defaultValue: "Are you sure you want to delete this ingredient?",
        }),
      )
    ) {
      return;
    }
    try {
      instance.delete(`/inventory/ingredients/${id}/`).then(() => {
        fetchIngredients(page, search);
      });
    } catch (error) {
      console.error("Failed to delete ingredient", error);
    }
  }

  const refresh = () => fetchIngredients(page, search);

  const openIngredientDetail = useCallback(async (ingredient) => {
    setDetailLoading(true);
    setDetailTab("details");
    try {
      const [ingredientRes, historyRes] = await Promise.all([
        getIngredient(ingredient.id),
        getIngredientPurchaseHistory(ingredient.id),
      ]);
      setDetailIngredient(ingredientRes.data);
      setDetailHistory(historyRes.data || []);
    } catch (error) {
      console.error("Failed to load ingredient detail", error);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    const ingredientId = searchParams.get("ingredient");
    if (!ingredientId) return;
    openIngredientDetail({ id: ingredientId });
  }, [openIngredientDetail, searchParams]);

  return (
    <div className="rounded-lg bg-white p-4 shadow sm:p-6">
      <h2 className="mb-4 text-xl font-semibold">
        {t("inventory_manager.ingredients.current_stock", { defaultValue: "Current Stock" })}
      </h2>

      <input
        type="text"
        placeholder={t("inventory_manager.ingredients.search_placeholder", { defaultValue: "Search by name..." })}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading && (
        <div className="mb-3 text-gray-500 text-sm">
          {t("inventory_manager.ingredients.loading", { defaultValue: "Loading ingredients..." })}
        </div>
      )}

      {ingredients.length === 0 ? (
        <p className="text-gray-500">
          {t("inventory_manager.ingredients.empty", { defaultValue: "No ingredients found." })}
        </p>
      ) : (
        <>
        <div className="space-y-3 md:hidden">
          {ingredients.map((ingredient) => {
            const lowStock =
              Number(ingredient.quantity_available) <=
              Number(ingredient.minimum_threshold);

            return (
              <article
                key={ingredient.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 border-b pb-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-base font-semibold text-gray-900">
                      {ingredient.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {t("inventory_manager.ingredients.available_amount", {
                        defaultValue: "{{quantity}} {{unit}} available",
                        quantity: ingredient.quantity_available,
                        unit: ingredient.unit,
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                      lowStock
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {lowStock
                      ? t("inventory_manager.common.low_stock", { defaultValue: "Low Stock" })
                      : t("inventory_manager.common.ok", { defaultValue: "OK" })}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm">
                  <MobileStockField
                    label={t("inventory_manager.ingredients.min_threshold", { defaultValue: "Min Threshold" })}
                    value={ingredient.minimum_threshold}
                  />
                  <MobileStockField
                    label={t("inventory_manager.common.cost_per_unit", { defaultValue: "Cost / Unit" })}
                    value={ingredient.cost_per_unit || "--"}
                  />
                  <MobileStockField
                    label={t("inventory_manager.common.used_in", { defaultValue: "Used In" })}
                    value={t("inventory_manager.ingredients.menu_item_count", {
                      defaultValue: "{{count}} Menu Item",
                      defaultValue_plural: "{{count}} Menu Items",
                      count: ingredient.menu_items_count || 0,
                    })}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openIngredientDetail(ingredient)}
                    className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700"
                  >
                    {t("inventory_manager.common.view", { defaultValue: "View" })}
                  </button>
                  <button
                    onClick={() => setAdjustIngredient(ingredient)}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                  >
                    {t("inventory_manager.common.adjust", { defaultValue: "Adjust" })}
                  </button>
                  <button
                    onClick={() => setEditIngredient(ingredient)}
                    className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white"
                  >
                    {t("inventory_manager.common.edit", { defaultValue: "Edit" })}
                  </button>
                  {ingredient.menu_items_count === 0 && (
                    <button
                      onClick={() => deleteIngredient(ingredient.id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white"
                    >
                      {t("inventory_manager.common.delete", { defaultValue: "Delete" })}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="p-3">{t("inventory_manager.common.name", { defaultValue: "Name" })}</th>
                <th className="p-3">{t("inventory_manager.common.quantity", { defaultValue: "Quantity" })}</th>
                <th className="p-3">{t("inventory_manager.ingredients.min_threshold", { defaultValue: "Min Threshold" })}</th>
                <th className="p-3">{t("inventory_manager.common.cost_per_unit", { defaultValue: "Cost / Unit" })}</th>
                <th className="p-3">{t("inventory_manager.common.used_in", { defaultValue: "Used In" })}</th>
                <th className="p-3">{t("inventory_manager.common.status", { defaultValue: "Status" })}</th>
                <th className="p-3">{t("inventory_manager.common.action", { defaultValue: "Action" })}</th>
              </tr>
            </thead>

            <tbody>
              {ingredients.map((ingredient) => (
                <tr key={ingredient.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{ingredient.name}</td>
                  <td className="p-3">
                    {ingredient.quantity_available} {ingredient.unit}
                  </td>
                  <td className="p-3">{ingredient.minimum_threshold}</td>
                  <td className="p-3">
                    {ingredient.cost_per_unit ? ingredient.cost_per_unit : "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ingredient.menu_items_count > 0
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t("inventory_manager.ingredients.menu_item_count", {
                        defaultValue: "{{count}} Menu Item",
                        defaultValue_plural: "{{count}} Menu Items",
                        count: ingredient.menu_items_count || 0,
                      })}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        Number(ingredient.quantity_available) <=
                        Number(ingredient.minimum_threshold)
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {Number(ingredient.quantity_available) <=
                      Number(ingredient.minimum_threshold)
                        ? t("inventory_manager.common.low_stock", { defaultValue: "Low Stock" })
                        : t("inventory_manager.common.ok", { defaultValue: "OK" })}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openIngredientDetail(ingredient)}
                        className="px-3 py-1 text-sm rounded-lg border text-gray-700"
                      >
                        {t("inventory_manager.common.view", { defaultValue: "View" })}
                      </button>
                      <button
                        onClick={() => setAdjustIngredient(ingredient)}
                        className="px-3 py-1 text-sm rounded-lg bg-blue-600 text-white"
                      >
                        {t("inventory_manager.common.adjust", { defaultValue: "Adjust" })}
                      </button>
                      <button
                        onClick={() => setEditIngredient(ingredient)}
                        className="px-3 py-1 text-sm rounded-lg bg-green-600 text-white"
                      >
                        {t("inventory_manager.common.edit", { defaultValue: "Edit" })}
                      </button>
                      {ingredient.menu_items_count === 0 && (
                        <button
                          onClick={() => deleteIngredient(ingredient.id)}
                          className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white"
                        >
                          {t("inventory_manager.common.delete", { defaultValue: "Delete" })}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleDownloadPDF("all")}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 sm:w-auto"
              >
                <FileText size={16} />
                {t("inventory_manager.ingredients.full_inventory_report", { defaultValue: "Full Inventory Report" })}
              </button>

              <button
                onClick={() => handleDownloadPDF("low_stock")}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 sm:w-auto"
              >
                <AlertTriangle size={16} />
                {t("inventory_manager.ingredients.low_stock_report", { defaultValue: "Low Stock Report" })}
              </button>

              <button
                onClick={() => handleDownloadPDF("out_of_stock")}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 sm:w-auto"
              >
                <PackageX size={16} />
                {t("inventory_manager.ingredients.out_of_stock_report", { defaultValue: "Out of Stock Report" })}
              </button>
            </div>
            <span className="text-sm text-gray-500">
              {t("inventory_manager.common.page_of", {
                defaultValue: "Page {{page}} of {{totalPages}}",
                page,
                totalPages,
              })}
            </span>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border px-4 py-2 disabled:opacity-50"
              >
                {t("inventory_manager.common.prev", { defaultValue: "Prev" })}
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border px-4 py-2 disabled:opacity-50"
              >
                {t("inventory_manager.common.next", { defaultValue: "Next" })}
              </button>
            </div>
          </div>
        </>
      )}

      {adjustIngredient && (
        <AdjustStockModal
          ingredient={adjustIngredient}
          onClose={() => setAdjustIngredient(null)}
          onSuccess={refresh}
        />
      )}

      {editIngredient && (
        <EditIngredientModal
          ingredient={editIngredient}
          onClose={() => setEditIngredient(null)}
          onSuccess={refresh}
        />
      )}

      {detailIngredient && (
        <IngredientDetailModal
          ingredient={detailIngredient}
          history={detailHistory}
          loading={detailLoading}
          activeTab={detailTab}
          onTabChange={setDetailTab}
          onClose={() => setDetailIngredient(null)}
        />
      )}
    </div>
  );
}

function MobileStockField({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
      <span className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </span>
      <span className="min-w-0 break-words text-right font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}

function IngredientDetailModal({
  ingredient,
  history,
  loading,
  activeTab,
  onTabChange,
  onClose,
}) {
  const { t } = useTranslation();
  const tabs = [
    { id: "details", label: t("inventory_manager.common.details", { defaultValue: "Details" }) },
    { id: "history", label: t("inventory_manager.ingredients.purchase_history", { defaultValue: "Purchase History" }) },
    { id: "audit", label: t("inventory_manager.ingredients.audit_history", { defaultValue: "Audit History" }) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              {t("inventory_manager.ingredients.ingredient", { defaultValue: "Ingredient" })}
            </p>
            <h3 className="text-lg font-semibold text-gray-900">{ingredient.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50"
            title={t("inventory_manager.common.close", { defaultValue: "Close" })}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 flex flex-wrap gap-2 border-b pb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "details" && (
            <div className="grid gap-3 md:grid-cols-4">
              <DetailMetric
                label={t("inventory_manager.ingredients.current_quantity", { defaultValue: "Current Quantity" })}
                value={`${ingredient.quantity_available || 0} ${ingredient.unit || ""}`}
              />
              <DetailMetric
                label={t("inventory_manager.ingredients.minimum_threshold", { defaultValue: "Minimum Threshold" })}
                value={ingredient.minimum_threshold || 0}
              />
              <DetailMetric
                label={t("inventory_manager.common.cost_per_unit", { defaultValue: "Cost / Unit" })}
                value={currency.format(ingredient.cost_per_unit || 0)}
              />
              <DetailMetric
                label={t("inventory_manager.common.status", { defaultValue: "Status" })}
                value={
                  Number(ingredient.quantity_available || 0) <=
                  Number(ingredient.minimum_threshold || 0)
                    ? t("inventory_manager.common.low_stock", { defaultValue: "Low Stock" })
                    : t("inventory_manager.common.ok", { defaultValue: "OK" })
                }
              />
            </div>
          )}

          {activeTab === "history" && (
            <div className="rounded-lg border">
              <div className="space-y-3 p-3 md:hidden">
                {history.map((row) => (
                  <article key={row.id} className="rounded-lg border bg-white p-3">
                    <div className="border-b pb-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {row.invoice_number}
                      </p>
                      <p className="text-xs text-gray-500">{row.purchase_date}</p>
                    </div>
                    <div className="mt-3 grid gap-2">
                      <MobileStockField label={t("inventory_manager.common.supplier", { defaultValue: "Supplier" })} value={row.supplier_name} />
                      <MobileStockField
                        label={t("inventory_manager.common.quantity", { defaultValue: "Quantity" })}
                        value={`${Number(row.quantity || 0).toLocaleString()} ${ingredient.unit}`}
                      />
                      <MobileStockField
                        label={t("inventory_manager.common.unit_cost", { defaultValue: "Unit Cost" })}
                        value={currency.format(row.unit_cost || 0)}
                      />
                      <MobileStockField
                        label={t("inventory_manager.common.total_cost", { defaultValue: "Total Cost" })}
                        value={currency.format(row.total_cost || 0)}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to={`/admin/dashboard/procurement/purchase-invoices/${row.purchase_invoice}`}
                        className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        {t("inventory_manager.common.invoice", { defaultValue: "Invoice" })}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      {row.stock_movement && (
                        <Link
                          to={`/admin/dashboard/inventory/stock-movements?movement=${row.stock_movement}`}
                          className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                        >
                          {t("inventory_manager.common.movement", { defaultValue: "Movement" })}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
                {!history.length && (
                  <div className="py-6 text-center text-sm text-gray-500">
                    {loading
                      ? t("inventory_manager.ingredients.loading_purchase_history", { defaultValue: "Loading purchase history..." })
                      : t("inventory_manager.ingredients.no_purchase_history", { defaultValue: "No purchase history found." })}
                  </div>
                )}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2">{t("inventory_manager.common.purchase_date", { defaultValue: "Purchase Date" })}</th>
                      <th className="px-3 py-2">{t("inventory_manager.common.supplier", { defaultValue: "Supplier" })}</th>
                      <th className="px-3 py-2">{t("inventory_manager.common.invoice", { defaultValue: "Invoice" })}</th>
                      <th className="px-3 py-2 text-right">{t("inventory_manager.common.quantity", { defaultValue: "Quantity" })}</th>
                      <th className="px-3 py-2 text-right">{t("inventory_manager.common.unit_cost", { defaultValue: "Unit Cost" })}</th>
                      <th className="px-3 py-2 text-right">{t("inventory_manager.common.total_cost", { defaultValue: "Total Cost" })}</th>
                      <th className="px-3 py-2 text-right">{t("inventory_manager.common.links", { defaultValue: "Links" })}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.map((row) => (
                      <tr key={row.id}>
                        <td className="px-3 py-3">{row.purchase_date}</td>
                        <td className="px-3 py-3">{row.supplier_name}</td>
                        <td className="px-3 py-3 font-medium">{row.invoice_number}</td>
                        <td className="px-3 py-3 text-right">
                          {Number(row.quantity || 0).toLocaleString()} {ingredient.unit}
                        </td>
                        <td className="px-3 py-3 text-right">
                          {currency.format(row.unit_cost || 0)}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold">
                          {currency.format(row.total_cost || 0)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/dashboard/procurement/purchase-invoices/${row.purchase_invoice}`}
                              className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                            >
                              {t("inventory_manager.common.invoice", { defaultValue: "Invoice" })}
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                            {row.stock_movement && (
                              <Link
                                to={`/admin/dashboard/inventory/stock-movements?movement=${row.stock_movement}`}
                                className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                              >
                                {t("inventory_manager.common.movement", { defaultValue: "Movement" })}
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!history.length && (
                      <tr>
                        <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>
                          {loading
                            ? t("inventory_manager.ingredients.loading_purchase_history", { defaultValue: "Loading purchase history..." })
                            : t("inventory_manager.ingredients.no_purchase_history", { defaultValue: "No purchase history found." })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <AuditTimeline
              module="INVENTORY"
              objectType="Ingredient"
              objectId={ingredient.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailMetric({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
