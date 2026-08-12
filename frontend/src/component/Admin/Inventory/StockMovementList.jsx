import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStockMovements } from "../../../api/inventoryApi";
import EditStockMovement from "./EditStockModal";

export default function StockMovementList() {
  const { t } = useTranslation();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [searchParams] = useSearchParams();
  const movementId = searchParams.get("movement") || "";
  const typeParam = searchParams.get("type") || "";

  /* PAGINATION */
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 15;

  /* FILTERS */
  const [ingredient, setIngredient] = useState("");
  const [type, setType] = useState(typeParam);
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
          movement: movementId || undefined,
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
    [type, movementId, fromDate, toDate],
  );

  useEffect(() => {
    setType(typeParam);
    setPage(1);
  }, [typeParam]);

  useEffect(() => {
    if (movementId) setPage(1);
  }, [movementId]);

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
        {t("inventory_manager.stock_movements.loading", { defaultValue: "Loading stock movements..." })}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg bg-white p-4 shadow sm:p-6">
      <h2 className="text-xl font-semibold">
        {t("inventory_manager.stock_movements.title", { defaultValue: "Stock Movements" })}
      </h2>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder={t("inventory_manager.stock_movements.search_placeholder", { defaultValue: "Search ingredient..." })}
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
          <option value="">{t("inventory_manager.stock_movements.all_types", { defaultValue: "All Types" })}</option>
          <option value="purchase">{t("inventory_manager.types.purchase", { defaultValue: "Purchase" })}</option>
          <option value="adjustment">{t("inventory_manager.types.adjustment", { defaultValue: "Adjustment" })}</option>
          <option value="waste">{t("inventory_manager.types.waste", { defaultValue: "Waste" })}</option>
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
          {t("inventory_manager.common.reset", { defaultValue: "Reset" })}
        </button>
      </div>

      {/* TABLE */}
      {movements.length === 0 ? (
        <p className="text-gray-500">
          {t("inventory_manager.stock_movements.empty", { defaultValue: "No stock movements found." })}
        </p>
      ) : (
        <>
        <div className="space-y-3 md:hidden">
          {movements.map((m) => (
            <article
              key={m.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 border-b pb-3">
                <div className="min-w-0">
                  <h3 className="break-words text-base font-semibold text-gray-900">
                    {m.ingredient_name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                    m.movement_type === "purchase"
                      ? "bg-green-100 text-green-700"
                      : m.movement_type === "adjustment"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                    {t(`inventory_manager.types.${m.movement_type}`, { defaultValue: m.movement_type })}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <MobileMovementField
                  label={t("inventory_manager.common.details", { defaultValue: "Details" })}
                  value={
                    m.movement_type === "purchase" ? (
                      <span>
                        {t("inventory_manager.common.qty", { defaultValue: "Qty" })}: {formatQuantity(m.change_quantity, m.ingredient_unit)}
                        <span className="mt-1 block text-green-700">
                          {t("inventory_manager.common.total", { defaultValue: "Total" })}: AFN {calculateTotalPrice(m.change_quantity, m.unit_cost)}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          {t("inventory_manager.common.unit_cost", { defaultValue: "Unit Cost" })}({m.ingredient_unit}): AFN {m.unit_cost}
                        </span>
                      </span>
                    ) : (
                      <span
                        className={
                          parseFloat(m.change_quantity) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {parseFloat(m.change_quantity) > 0 ? "+" : ""}
                        {formatQuantity(m.change_quantity, m.ingredient_unit)}
                      </span>
                    )
                  }
                />
                <MobileMovementField
                  label={t("inventory_manager.common.created_by", { defaultValue: "Created By" })}
                  value={m.createt_by_name || t("inventory_manager.common.system", { defaultValue: "System" })}
                />
              </div>

              <button
                onClick={() => setSelectedMovement(m)}
                className="mt-4 w-full rounded-lg border px-3 py-2 text-sm font-medium text-blue-600"
              >
                {t("inventory_manager.common.edit", { defaultValue: "Edit" })}
              </button>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-600 text-left">
                <th className="p-3">{t("inventory_manager.ingredients.ingredient", { defaultValue: "Ingredient" })}</th>
                <th className="p-3">{t("inventory_manager.common.type", { defaultValue: "Type" })}</th>
                <th className="p-3">{t("inventory_manager.common.details", { defaultValue: "Details" })}</th>
                <th className="p-3">{t("inventory_manager.common.date", { defaultValue: "Date" })}</th>
                <th className="p-3">{t("inventory_manager.common.created_by", { defaultValue: "Created By" })}</th>
                <th className="p-3">{t("inventory_manager.common.action", { defaultValue: "Action" })}</th>
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
                      {t(`inventory_manager.types.${m.movement_type}`, { defaultValue: m.movement_type })}
                    </span>
                  </td>

                  {/* DETAILS */}
                  <td className="p-3">
                    {m.movement_type === "purchase" ? (
                      <div className="space-y-1">
                        <div className="font-medium">
                          {t("inventory_manager.common.qty", { defaultValue: "Qty" })}:{" "}
                          {formatQuantity(m.change_quantity, m.ingredient_unit)}
                        </div>

                        <div className="text-sm text-green-700 font-medium">
                          {t("inventory_manager.common.total", { defaultValue: "Total" })}: AFN{" "}
                          {calculateTotalPrice(m.change_quantity, m.unit_cost)}
                        </div>

                        <div className="text-xs text-gray-500">
                          {t("inventory_manager.common.unit_cost", { defaultValue: "Unit Cost" })}({m.ingredient_unit}): AFN {m.unit_cost}
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
                    {m.createt_by_name || t("inventory_manager.common.system", { defaultValue: "System" })}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => setSelectedMovement(m)}
                      className="text-blue-600 hover:underline"
                    >
                      {t("inventory_manager.common.edit", { defaultValue: "Edit" })}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* PAGINATION */}
      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-gray-500">
          {t("inventory_manager.common.page_of", {
            defaultValue: "Page {{page}} of {{totalPages}}",
            page,
            totalPages,
          })}
        </span>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {t("inventory_manager.common.prev", { defaultValue: "Prev" })}
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {t("inventory_manager.common.next", { defaultValue: "Next" })}
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

function MobileMovementField({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <span className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </span>
      <div className="mt-1 break-words font-medium text-gray-900">{value}</div>
    </div>
  );
}
