import { useCallback, useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import { AlertTriangle, Loader2 } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import EmptyState from "../../../modules/shared/erp/components/EmptyState";
import StatusBadge from "../../../modules/shared/erp/components/StatusBadge";

export default function LowStockItems() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLowStock = useCallback(async () => {
    try {
      setLoading(true);
      const res = await instance.get("/inventory/low-stock/");
      setItems(res.data);
    } catch {
      setError(t("inventory_manager.low_stock.load_failed", { defaultValue: "Failed to load low stock items" }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="theme-card p-4 sm:p-5"
    >
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-red-500 w-5 h-5" />
          <h2 className="text-base font-semibold theme-text-primary">
            {t("inventory_manager.low_stock.title", { defaultValue: "Low Stock Items" })}
          </h2>
        </div>

        <span className="text-sm text-gray-500">
          {t("inventory_manager.low_stock.item_count", {
            defaultValue: "{{count}} item",
            defaultValue_plural: "{{count}} items",
            count: items.length,
          })}
        </span>
      </div>

      
      {items.length === 0 ? (
        <EmptyState
          title={t("inventory_manager.low_stock.all_stocked", { defaultValue: "All ingredients are sufficiently stocked" })}
          description={t("inventory_manager.low_stock.empty_description", { defaultValue: "Low-stock ingredients will appear here when attention is needed." })}
        />
      ) : (
        <>
        <div className="space-y-3 md:hidden">
          {items.map((item) => {
            const critical = Number(item.quantity_available) === 0;

            return (
              <article
                key={item.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-base font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {t("inventory_manager.low_stock.minimum_amount", {
                        defaultValue: "Minimum: {{quantity}} {{unit}}",
                        quantity: item.minimum_threshold,
                        unit: item.unit,
                      })}
                    </p>
                  </div>
                  <StatusBadge
                    status={critical ? "out_of_stock" : "low_stock"}
                    label={critical
                      ? t("inventory_manager.common.out_of_stock", { defaultValue: "Out of Stock" })
                      : t("inventory_manager.common.low_stock", { defaultValue: "Low Stock" })}
                  />
                </div>
                <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span className="font-semibold text-gray-900">
                    {item.quantity_available} {item.unit}
                  </span>{" "}
                  <span className="text-gray-500">
                    {t("inventory_manager.common.available", { defaultValue: "available" })}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">{t("inventory_manager.ingredients.ingredient", { defaultValue: "Ingredient" })}</th>
                <th className="py-2">{t("inventory_manager.common.available_title", { defaultValue: "Available" })}</th>
                <th className="py-2">{t("inventory_manager.common.minimum", { defaultValue: "Minimum" })}</th>
                <th className="py-2">{t("inventory_manager.common.status", { defaultValue: "Status" })}</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => {
                const critical =
                  Number(item.quantity_available) === 0;

                return (
                  <tr
                    key={item.id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="py-3 font-medium text-gray-800">
                      {item.name}
                    </td>

                    <td className="py-3">
                      {item.quantity_available} {item.unit}
                    </td>

                    <td className="py-3">
                      {item.minimum_threshold} {item.unit}
                    </td>

                    <td className="py-3">
                      <StatusBadge
                        status={critical ? "out_of_stock" : "low_stock"}
                        label={critical
                          ? t("inventory_manager.common.out_of_stock", { defaultValue: "Out of Stock" })
                          : t("inventory_manager.common.low_stock", { defaultValue: "Low Stock" })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </Motion.div>
  );
}
