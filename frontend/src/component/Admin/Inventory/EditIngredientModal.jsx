import React, { useState } from "react";
import instance from "../../../api/axiosInstance";
import { updateIngredient } from "../../../api/inventoryApi";
import { useTranslation } from "react-i18next";

export default function EditIngredientModal({
  ingredient,
  onSuccess,
  onClose,
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: ingredient.name,
    unit: ingredient.unit,
    minimum_threshold: ingredient.minimum_threshold,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await updateIngredient(ingredient.id, {
        name: form.name,
        unit: form.unit,
        minimum_threshold: form.minimum_threshold || 0,
      });
      onSuccess();
      onClose();
    } catch (error) {
      setError(t("inventory_manager.ingredients.update_failed", { defaultValue: "Failed to update ingredient" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t("inventory_manager.ingredients.update_ingredient", { defaultValue: "Update Ingredient" })}
        </h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("inventory_manager.ingredients.ingredient_name", { defaultValue: "Ingredient Name" })}
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("inventory_manager.common.unit", { defaultValue: "Unit" })}
            </label>
            <select
              name="unit"
              disabled
              value={form.unit}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="kg">{t("inventory_manager.units.kilogram", { defaultValue: "Kilogram" })}</option>
              <option value="g">{t("inventory_manager.units.gram", { defaultValue: "Gram" })}</option>
              <option value="l">{t("inventory_manager.units.liter", { defaultValue: "Liter" })}</option>
              <option value="ml">{t("inventory_manager.units.milliliter", { defaultValue: "Milliliter" })}</option>
              <option value="pcs">{t("inventory_manager.units.pieces", { defaultValue: "Pieces" })}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("inventory_manager.ingredients.minimum_threshold", { defaultValue: "Minimum Threshold" })}
            </label>
            <input
              type="number"
              step="0.001"
              name="minimum_threshold"
              value={form.minimum_threshold}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              {t("inventory_manager.common.cancel", { defaultValue: "Cancel" })}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg"
            >
              {loading
                ? t("inventory_manager.common.saving", { defaultValue: "Saving..." })
                : t("inventory_manager.common.update", { defaultValue: "Update" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
