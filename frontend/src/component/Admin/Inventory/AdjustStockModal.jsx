import { useState } from "react";
import { adjustStock } from "../../../api/inventoryApi";

export default function AdjustStockModal({ ingredient, onClose, onSuccess }) {
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
        `Cannot reduce below 0. Available: ${ingredient.quantity_available}`,
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
      setError(err.response?.data?.detail || "Failed to adjust stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-1">
          Adjust Stock – {ingredient.name}
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          Available: {ingredient.quantity_available} {ingredient.unit}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Quantity (+ / -)</label>
            <input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="e.g. -5 or 10"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Adjustment Type</label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="adjustment">Adjustment</option>
              <option value="waste">Waste</option>
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-black text-white"
            >
              {loading ? "Saving..." : "Adjust Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
