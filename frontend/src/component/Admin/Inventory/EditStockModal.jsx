// src/components/inventory/EditStockMovement.jsx

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import instance from "../../../api/axiosInstance";

export default function EditStockMovement({ movement, onClose, onSuccess }) {
  const { t } = useTranslation();
  const ingredientUnit = movement.ingredient_unit || "pcs";

  // Convert DB quantity back to display quantity
  const getDisplayQuantity = (qty, unit) => {
    const q = parseFloat(qty);

    if (unit === "g") return q / 1000;
    if (unit === "ml") return q / 1000;

    return q;
  };

  const getInputUnit = (unit) => {
    if (unit === "g") return "kg";
    if (unit === "ml") return "l";

    return unit;
  };

  // Convert display quantity back to DB quantity
  const convertQuantityToDB = (qty, unit) => {
    const q = parseFloat(qty);

    if (unit === "g") return q * 1000;
    if (unit === "ml") return q * 1000;

    return q;
  };

  const initialQuantity = getDisplayQuantity(
    movement.change_quantity,
    ingredientUnit,
  );

  const initialTotalPrice =
    parseFloat(movement.change_quantity) * parseFloat(movement.unit_cost || 0);

  const [formData, setFormData] = useState({
    movement_type: movement.movement_type,
    quantity: initialQuantity,
    total_price: initialTotalPrice,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const dbQuantity = convertQuantityToDB(formData.quantity, ingredientUnit);

      let unitCost = null;

      if (movement.movement_type === "purchase") {
        unitCost = parseFloat(formData.total_price) / dbQuantity;
      }

      await instance.put(`inventory/stock-movements/${movement.id}/edit/`, {
        quantity: dbQuantity,
        movement_type:
          movement.movement_type === "purchase"
            ? "purchase"
            : formData.movement_type,
        new_unit_cost: unitCost,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.log(err);

      setError(
        err.response?.data?.detail ||
          t("inventory_manager.stock_movements.update_failed", {
            defaultValue: "Failed to update movement",
          }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl sm:p-6">
        <h2 className="text-xl font-bold mb-4">
          {t("inventory_manager.stock_movements.edit_title", {
            defaultValue: "Edit Stock Movement",
          })}
        </h2>

        {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Movement Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("inventory_manager.stock_movements.movement_type", {
                defaultValue: "Movement Type",
              })}
            </label>

            {movement.movement_type === "purchase" ? (
              <input
                type="text"
                value={t("inventory_manager.types.purchase", { defaultValue: "Purchase" })}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500"
              />
            ) : (
              <select
                value={formData.movement_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    movement_type: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="adjustment">
                  {t("inventory_manager.types.adjustment", { defaultValue: "Adjustment" })}
                </option>
                <option value="waste">
                  {t("inventory_manager.types.waste", { defaultValue: "Waste" })}
                </option>
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("inventory_manager.common.quantity", { defaultValue: "Quantity" })} ({getInputUnit(ingredientUnit)})
            </label>

            <input
              type="number"
              step="0.001"
              className="w-full border rounded px-3 py-2"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: e.target.value,
                })
              }
              required
            />
          </div>

          {movement.movement_type === "purchase" && (
            <>
              {/* Total Price */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("inventory_manager.stock_movements.total_purchase_price", {
                    defaultValue: "Total Purchase Price",
                  })}
                </label>

                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded px-3 py-2"
                  value={formData.total_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_price: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* Preview */}
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p>
                  {t("inventory_manager.common.unit_cost", { defaultValue: "Unit Cost" })}:{" "}
                  {formData.quantity && formData.total_price
                    ? (
                        parseFloat(formData.total_price) /
                        convertQuantityToDB(formData.quantity, ingredientUnit)
                      ).toFixed(2)
                    : "0"}
                </p>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-2 pt-4 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              {t("inventory_manager.common.cancel", { defaultValue: "Cancel" })}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
              {loading
                ? t("inventory_manager.common.saving", { defaultValue: "Saving..." })
                : t("inventory_manager.common.save_changes", {
                    defaultValue: "Save Changes",
                  })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
