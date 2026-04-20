import React, { useEffect, useState } from "react";
import { getIngredients } from "../../../api/inventoryApi";
import AdjustStockModal from "./AdjustStockModal";
import EditIngredientModal from "./EditIngredientModal";

export default function IngredientList() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustIngredient, setAdjustIngredient] = useState(null);
  const [editIngredient, setEditIngredient] = useState(null);
  const [showUpdateIngredient, setShowUpdateIngredient] = useState(false);

  const fetchIngredients = async () => {
    try {
      const response = await getIngredients();
      setIngredients(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch ingredients", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-500 text-center">
        Loading ingredients...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Current Stock</h2>

      {ingredients.length === 0 ? (
        <p className="text-gray-500">No ingredients found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Min Threshold</th>
                <th className="p-3">Cost / Unit</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
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
                        Number(ingredient.quantity_available) <=
                        Number(ingredient.minimum_threshold)
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {Number(ingredient.quantity_available) <=
                      Number(ingredient.minimum_threshold)
                        ? "Low Stock"
                        : "OK"}
                    </span>
                  </td>

                  <td className="p-3 flex gap-3">
                    <button
                      onClick={() => setAdjustIngredient(ingredient)}
                      className="px-3 py-1 text-sm rounded-lg bg-blue-600 text-white"
                    >
                      Adjust
                    </button>
                    <button
                      onClick={() => {
                        setEditIngredient(ingredient);
                      }}
                      className="px-3 py-1 text-sm rounded-lg bg-green-600 text-white"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adjustIngredient && (
        <AdjustStockModal
          ingredient={adjustIngredient}
          onClose={() => setAdjustIngredient(null)}
          onSuccess={fetchIngredients}
        />
      )}
      {editIngredient && (
        <EditIngredientModal
          ingredient={editIngredient}
          onClose={() => setEditIngredient(null)}
          onSuccess={fetchIngredients}
        />
      )}
    </div>
  );
}
