import React, { useEffect, useState, useCallback } from "react";
import { getIngredientsPages } from "../../../api/inventoryApi";
import { useTranslation as useAutoTranslation } from "react-i18next";
import TablePagination from "../../../modules/shared/erp/components/TablePagination";
// import AdjustStockModal from "./AdjustStockModal";
// import EditIngredientModal from "./EditIngredientModal";

export default function KichenManagerIngredientList() {
                 const { t: autoT } = useAutoTranslation();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 15;

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

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">{autoT("inventory_manager.ingredients.current_stock")}</h2>

      <input
        type="text"
        placeholder={autoT("inventory_manager.ingredients.search_placeholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading && (
        <div className="mb-3 text-gray-500 text-sm">{autoT("inventory_manager.ingredients.loading")}</div>
      )}

      {ingredients.length === 0 ? (
        <p className="text-gray-500">{autoT("inventory_manager.ingredients.empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="p-3">{autoT("attendance.table.name")}</th>
                <th className="p-3">{autoT("inventory_manager.common.quantity")}</th>
                <th className="p-3">{autoT("inventory_manager.ingredients.min_threshold")}</th>
                <th className="p-3">{autoT("inventory_manager.common.cost_per_unit")}</th>
                <th className="p-3">{autoT("table.status")}</th>
                <th className="p-3">{autoT("inventory_manager.common.action")}</th>
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
                        ? autoT("inventory_manager.common.low_stock")
                        : autoT("inventory_manager.common.ok")}
                    </span>
                  </td>
                  {/* <td className="p-3">
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
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>

          <TablePagination
            page={page}
            totalItems={count}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={loading}
            className="mt-4"
          />
        </div>
      )}

      {/* {adjustIngredient && (
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
      )} */}
    </div>
  );
}
