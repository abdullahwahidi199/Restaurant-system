import React, { useEffect, useState } from "react";
import { getIngredients, addStock } from "../../../api/inventoryApi";

export default function AddStock() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    ingredient: "",
    quantity: "",
    cost_per_unit: "",
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const res = await getIngredients();
      setIngredients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.ingredient || !form.quantity  ||!form.cost_per_unit) {
      setError("Fill all the fields!");
      return;
    }

    setLoading(true);

    try {
      await addStock({
        ingredient: form.ingredient,
        quantity: form.quantity,
        cost_per_unit: form.cost_per_unit ,
      });

      setForm({
        ingredient: "",
        quantity: "",
        cost_per_unit: "",
      });

      alert("Stock added successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to add stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Add New Stock</h2>

      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-100 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ingredient */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Ingredient
          </label>
          <select
            name="ingredient"
            value={form.ingredient}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select ingredient</option>
            {ingredients.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.name} ({ing.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Quantity
          </label>
          <input
            type="number"
            step="0.001"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter quantity"
          />
        </div>

        
        <div>
          <label className="block text-sm font-medium mb-1">
            Cost per unit 
          </label>
          <input
            type="number"
            step="0.01"
            name="cost_per_unit"
            value={form.cost_per_unit}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Stock"}
        </button>
      </form>
    </div>
  );
}
