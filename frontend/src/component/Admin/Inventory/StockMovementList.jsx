import React, { useEffect, useState, useCallback } from "react";
import { getStockMovements } from "../../../api/inventoryApi";
import EditStockMovement from "./EditStockModal";

export default function StockMovementList() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMovement, setSelectedMovement] = useState(null);

  /* PAGINATION */
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 15;

  /* FILTERS */
  const [ingredient, setIngredient] = useState("");
  const [type, setType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchMovements = useCallback(
    async (pageNum = 1, searchTerm = "") => {
      setLoading(true);

      try {
        const res = await getStockMovements({
          page: pageNum,
          search: searchTerm,
          type,
          from: fromDate,
          to: toDate,
        });

        setMovements(res.data.results);
        setCount(res.data.count);
      } catch (err) {
        console.error("Failed to fetch stock movements", err);
      } finally {
        setLoading(false);
      }
    },
    [type, fromDate, toDate],
  );

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchMovements(page, search);
    }, 600);

    return () => clearTimeout(delay);
  }, [page, search, fetchMovements]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  /* SEARCH FILTER */

  const totalPages = Math.ceil(count / pageSize);

  /* =========================
     UNIT HELPERS
  ========================== */

  const getDisplayUnit = (unit) => {
    if (unit === "g") return "kg";
    if (unit === "ml") return "L";

    return unit;
  };

  const convertToDisplayQuantity = (qty, unit) => {
    const q = parseFloat(qty);

    if (unit === "g") return q / 1000;
    if (unit === "ml") return q / 1000;

    return q;
  };

  const formatQuantity = (qty, unit) => {
    const converted = convertToDisplayQuantity(qty, unit);

    return `${converted.toFixed(3)} ${getDisplayUnit(unit)}`;
  };

  const calculateTotalPrice = (qty, unitCost) => {
    if (!unitCost) return null;

    return (parseFloat(qty) * parseFloat(unitCost)).toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading stock movements...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold">Stock Movements</h2>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Search ingredient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />

        <select
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value);
          }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="purchase">Purchase</option>
          <option value="adjustment">Adjustment</option>
          <option value="waste">Waste</option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setPage(1);
            setFromDate(e.target.value);
          }}
          className="border rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setPage(1);
            setToDate(e.target.value);
          }}
          className="border rounded-lg px-3 py-2 text-sm"
        />

        <button
          onClick={() => {
            setSearch("");
            setIngredient("");
            setType("");
            setFromDate("");
            setToDate("");
            setPage(1);
          }}
          className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
        >
          Reset
        </button>
      </div>

      {/* TABLE */}
      {movements.length === 0 ? (
        <p className="text-gray-500">No stock movements found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-600 text-left">
                <th className="p-3">Ingredient</th>
                <th className="p-3">Type</th>
                <th className="p-3">Details</th>
                <th className="p-3">Date</th>
                <th className="p-3">Created By</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{m.ingredient_name}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                        ${
                          m.movement_type === "purchase"
                            ? "bg-green-100 text-green-700"
                            : m.movement_type === "adjustment"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                    >
                      {m.movement_type}
                    </span>
                  </td>

                  {/* DETAILS */}
                  <td className="p-3">
                    {m.movement_type === "purchase" ? (
                      <div className="space-y-1">
                        <div className="font-medium">
                          Qty:{" "}
                          {formatQuantity(m.change_quantity, m.ingredient_unit)}
                        </div>

                        <div className="text-sm text-green-700 font-medium">
                          Total: AFN{" "}
                          {calculateTotalPrice(m.change_quantity, m.unit_cost)}
                        </div>

                        <div className="text-xs text-gray-500">
                          Unit Cost({m.ingredient_unit}): AFN {m.unit_cost}
                        </div>
                      </div>
                    ) : (
                      <span
                        className={
                          parseFloat(m.change_quantity) >= 0
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {parseFloat(m.change_quantity) > 0 ? "+" : ""}
                        {formatQuantity(m.change_quantity, m.ingredient_unit)}
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-sm text-gray-600">
                    {new Date(m.created_at).toLocaleString()}
                  </td>

                  <td className="p-3 text-sm">
                    {m.createt_by_name || "System"}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => setSelectedMovement(m)}
                      className="text-blue-600 hover:underline"
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

      {/* PAGINATION */}
      <div className="flex items-center justify-between pt-4">
        <span className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {selectedMovement && (
        <EditStockMovement
          movement={selectedMovement}
          onClose={() => setSelectedMovement(null)}
          onSuccess={fetchMovements}
        />
      )}
    </div>
  );
}
