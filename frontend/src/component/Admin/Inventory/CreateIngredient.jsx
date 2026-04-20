import { useState } from "react";
import { createIngredient } from "../../../api/inventoryApi";

export default function CreateIngredientModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    unit: "kg",
    minimum_threshold: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createIngredient({
        name: form.name,
        unit: form.unit,
        minimum_threshold: form.minimum_threshold || 0,
        quantity_available: 0,
        cost_per_unit: 0,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to create ingredient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          Add New Ingredient
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
         
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
            <label className="block text-sm font-medium mb-1">
              Unit
            </label>
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
              {loading ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
