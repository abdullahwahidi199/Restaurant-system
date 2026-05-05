import React, { useEffect, useState, useCallback } from "react";
import { getIngredientsPages } from "../../../api/inventoryApi";
import AdjustStockModal from "./AdjustStockModal";
import EditIngredientModal from "./EditIngredientModal";

export default function IngredientList() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 15;

  const [adjustIngredient, setAdjustIngredient] = useState(null);
  const [editIngredient, setEditIngredient] = useState(null);

  const [search, setSearch] = useState("");

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const fetchIngredients = useCallback(async (pageNum = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const response = await getIngredientsPages(pageNum, searchTerm);
      setIngredients(response.data.results);
      setCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch ingredients", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // debounce fetch
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchIngredients(page, search);
    }, 600);

    return () => clearTimeout(delay);
  }, [search, page, fetchIngredients]);

  const refresh = () => fetchIngredients(page, search);

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Current Stock</h2>

      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading && (
        <div className="mb-3 text-gray-500 text-sm">Loading ingredients...</div>
      )}

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
                  <td className="p-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setAdjustIngredient(ingredient)}
                        className="px-3 py-1 text-sm rounded-lg bg-blue-600 text-white"
                      >
                        Adjust
                      </button>
                      <button
                        onClick={() => setEditIngredient(ingredient)}
                        className="px-3 py-1 text-sm rounded-lg bg-green-600 text-white"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {adjustIngredient && (
        <AdjustStockModal
          ingredient={adjustIngredient}
          onClose={() => setAdjustIngredient(null)}
          onSuccess={refresh}
        />
      )}

      {editIngredient && (
        <EditIngredientModal
          ingredient={editIngredient}
          onClose={() => setEditIngredient(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
