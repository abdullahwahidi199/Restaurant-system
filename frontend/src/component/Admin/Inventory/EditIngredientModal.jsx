import React, { useState } from "react";
import instance from "../../../api/axiosInstance";
import { updateIngredient } from "../../../api/inventoryApi";

export default function EditIngredientModal({
  ingredient,
  onSuccess,
  onClose,
}) {
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
      setError("Failed to create ingredient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Update Ingredient</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Ingredient Name
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
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="kg">Kilogram</option>
              <option value="g">Gram</option>
              <option value="l">Liter</option>
              <option value="ml">Milliliter</option>
              <option value="pcs">Pieces</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Minimum Threshold
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

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg"
            >
              {loading ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
