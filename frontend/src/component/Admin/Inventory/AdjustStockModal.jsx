import { useState } from "react";
import { useTranslation } from "react-i18next";
import { adjustStock } from "../../../api/inventoryApi";

export default function AdjustStockModal({ ingredient, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState("");
  const [movementType, setMovementType] = useState("adjustment");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const qty = Number(quantity);

    if (ingredient.quantity_available + qty < 0) {
      setError(
        t("inventory_manager.stock_adjustments.cannot_reduce_below_zero", {
          defaultValue: "Cannot reduce below 0. Available: {{quantity}}",
          quantity: ingredient.quantity_available,
        }),
      );
      return;
    }

    try {
      setLoading(true);
      await adjustStock({
        ingredient: ingredient.id,
        quantity: qty,
        movement_type: movementType,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          t("inventory_manager.stock_adjustments.adjust_failed", {
            defaultValue: "Failed to adjust stock",
          }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-1">
          {t("inventory_manager.stock_adjustments.adjust_stock_for", {
            defaultValue: "Adjust Stock - {{name}}",
            name: ingredient.name,
          })}
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          {t("inventory_manager.stock_adjustments.available_quantity", {
            defaultValue: "Available: {{quantity}} {{unit}}",
            quantity: ingredient.quantity_available,
            unit: ingredient.unit,
          })}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              {t("inventory_manager.stock_adjustments.quantity_delta", {
                defaultValue: "Quantity (+ / -)",
              })}
            </label>
            <input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder={t("inventory_manager.stock_adjustments.quantity_placeholder", {
                defaultValue: "e.g. -5 or 10",
              })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              {t("inventory_manager.stock_adjustments.adjustment_type", {
                defaultValue: "Adjustment Type",
              })}
            </label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="adjustment">
                {t("inventory_manager.types.adjustment", { defaultValue: "Adjustment" })}
              </option>
              <option value="waste">
                {t("inventory_manager.types.waste", { defaultValue: "Waste" })}
              </option>
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border"
            >
              {t("inventory_manager.common.cancel", { defaultValue: "Cancel" })}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-black text-white"
            >
              {loading
                ? t("inventory_manager.common.saving", { defaultValue: "Saving..." })
                : t("inventory_manager.stock_adjustments.adjust_stock", {
                    defaultValue: "Adjust Stock",
                  })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
