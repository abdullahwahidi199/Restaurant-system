import React, { useEffect, useMemo, useState } from "react";
import { getStockMovements } from "../../../api/inventoryApi";

export default function StockMovementList() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* PAGINATION */
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 15;

  /* FILTERS */
  const [ingredient, setIngredient] = useState("");
  const [type, setType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchMovements();
  }, [page, ingredient, type, fromDate, toDate]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await getStockMovements({
        page,
        // ingredient,
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
  };
  // only for ingredient name other filters are handled at the backend

  const filteredMovements = useMemo(() => {
    return movements.filter((m) =>
      m.ingredient_name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, movements]);

  const totalPages = Math.ceil(count / pageSize);

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
      {filteredMovements.length === 0 ? (
        <p className="text-gray-500">No stock movements found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-600 text-left">
                <th className="p-3">Ingredient</th>
                <th className="p-3">Type</th>
                <th className="p-3">Change Qty</th>
                <th className="p-3">Date</th>
                <th className="p-3">Created By</th>
              </tr>
            </thead>

            <tbody>
              {filteredMovements.map((m) => (
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

                  <td className="p-3">{m.change_quantity}</td>

                  <td className="p-3 text-sm text-gray-600">
                    {new Date(m.created_at).toLocaleString()}
                  </td>

                  <td className="p-3 text-sm">
                    {m.created_by ? `User #${m.created_by}` : "System"}
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
    </div>
  );
}
