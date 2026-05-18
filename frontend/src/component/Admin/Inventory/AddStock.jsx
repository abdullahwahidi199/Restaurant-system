import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getIngredients, addStock } from "../../../api/inventoryApi";

export default function AddStock() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const [form, setForm] = useState({
    ingredient: "",
    quantity: "",
    total_price: "",
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const res = await getIngredients();

      const formatted = res.data.map((ing) => ({
        value: ing.id,
        label: `${ing.name} (${ing.unit})`,
        unit: ing.unit,
      }));

      setIngredients(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIngredientChange = (selected) => {
    setSelectedIngredient(selected);

    setForm({
      ...form,
      ingredient: selected ? selected.value : "",
      quantity: "",
      total_price: "",
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 UNIT CONVERSION LOGIC
  const convertQuantityToDB = (qty, unit) => {
    const q = parseFloat(qty);

    if (unit === "g") return q * 1000; // input kg → g
    if (unit === "kg") return q; // already kg stored as kg

    if (unit === "ml") return q * 1000; // input l → ml
    if (unit === "l") return q; // already l stored as l

    return q; // pcs
  };

  const getInputUnit = (unit) => {
    if (unit === "g") return "kg";
    if (unit === "kg") return "kg";

    if (unit === "ml") return "l";
    if (unit === "l") return "l";

    return unit;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.ingredient || !form.quantity || !form.total_price) {
      setError("Fill all fields!");
      return;
    }

    setLoading(true);

    try {
      const unit = selectedIngredient?.unit;

      // convert quantity to base unit
      const quantity = convertQuantityToDB(form.quantity, unit);

      const costPerUnit = parseFloat(form.total_price) / quantity;

      await addStock({
        ingredient: form.ingredient,
        quantity,
        cost_per_unit: costPerUnit,
      });

      setForm({
        ingredient: "",
        quantity: "",
        total_price: "",
      });

      setSelectedIngredient(null);

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
          <label className="block text-sm font-medium mb-1">Ingredient</label>

          <Select
            options={ingredients}
            value={selectedIngredient}
            onChange={handleIngredientChange}
            placeholder="Select ingredient"
            isClearable
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Quantity (
            {selectedIngredient ? getInputUnit(selectedIngredient.unit) : "-"})
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

        {/* Total Price */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Total Purchase Price
          </label>

          <input
            type="number"
            step="0.01"
            name="total_price"
            value={form.total_price}
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
