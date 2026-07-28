// InventorySearch.jsx

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  AlertTriangle,
  ArrowRight,
  X,
  Loader2,
  SearchX,
  ChefHat,
} from "lucide-react";
import debounce from "lodash/debounce";

import instance from "../../../api/axiosInstance";
import { useLocation, useNavigate } from "react-router-dom";

export default function InventorySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardBase = location.pathname.startsWith("/inventory-manager")
    ? "/inventory-manager"
    : "/admin/dashboard";

  const searchIngredients = async (value) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await instance.get(`/inventory/ingredient-usage/?q=${value}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(() => debounce(searchIngredients, 400), []);

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  const showDropdown = focused && query.trim();

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* ── SEARCH BAR ── */}
      <div
        className={`
          relative bg-white border rounded-2xl
          transition-all duration-300 ease-in-out
          ${
            showDropdown
              ? "shadow-lg ring-2 ring-indigo-100 border-indigo-200"
              : "shadow-sm hover:shadow-md border-gray-200"
          }
        `}
      >
        <div className="flex items-center gap-3 px-5 py-3.5">
          {/* Icon */}
          <div
            className={`
              flex-shrink-0 p-2 rounded-xl transition-colors duration-200
              ${showDropdown ? "bg-indigo-50 text-indigo-500" : "bg-gray-100 text-gray-400"}
            `}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          {/* Input */}
          <input
            type="text"
            value={query}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ingredients or menu usage…"
            className="
              w-full bg-transparent outline-none
              text-sm text-gray-800 placeholder-gray-400
              font-medium tracking-tight
            "
          />

          {/* Clear Button */}
          {query && (
            <button
              onClick={clearSearch}
              className="
                flex-shrink-0 p-1.5 rounded-lg
                text-gray-400 hover:text-gray-600
                hover:bg-gray-100
                transition-all duration-150
              "
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── DROPDOWN RESULTS ── */}
      {showDropdown && (
        <div
          className="
            absolute z-50 mt-2 w-full
            bg-white border border-gray-200
            rounded-2xl shadow-2xl
            max-h-[520px] overflow-y-auto
            animate-in fade-in slide-in-from-top-2
          "
          style={{
            animation: "dropdownIn 0.2s ease-out",
          }}
        >
          {/* Loading State */}
          {loading && (
            <div className="p-6">
              {[1, 2].map((i) => (
                <div key={i} className="mb-4 last:mb-0 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl" />
                    <div>
                      <div className="w-32 h-4 bg-gray-100 rounded-lg" />
                      <div className="w-24 h-3 bg-gray-50 rounded-lg mt-2" />
                    </div>
                  </div>
                  <div className="flex gap-2 ml-12">
                    <div className="w-48 h-20 bg-gray-50 rounded-xl" />
                    <div className="w-48 h-20 bg-gray-50 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="p-3 bg-gray-50 rounded-2xl mb-4">
                <SearchX className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                No ingredients found
              </p>
              <p className="text-xs text-gray-400 mt-1 text-center">
                Try a different keyword or check spelling
              </p>
            </div>
          )}

          {/* Results List */}
          {!loading && results.length > 0 && (
            <>
              {/* Results Count */}
              <div className="px-5 pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {results.length} result{results.length !== 1 && "s"} found
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {results.map((ingredient) => {
                  const isLowStock =
                    Number(ingredient.quantity_available) <=
                    Number(ingredient.minimum_threshold);

                  const stockPercentage = Math.min(
                    (Number(ingredient.quantity_available) /
                      Math.max(Number(ingredient.minimum_threshold) * 3, 1)) *
                      100,
                    100,
                  );

                  return (
                    <div
                      key={ingredient.id}
                      className="px-5 py-4 hover:bg-gray-50/50 transition-colors duration-150"
                    >
                      {/* ─ Ingredient Header ─ */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={`
                              flex-shrink-0 p-2 rounded-xl mt-0.5
                              ${isLowStock ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"}
                            `}
                          >
                            <Package className="w-4.5 h-4.5" />
                          </div>

                          {/* Info */}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-gray-900">
                                {ingredient.name}
                              </h3>

                              {isLowStock && (
                                <span
                                  className="
                                    inline-flex items-center gap-1
                                    text-[11px] font-semibold
                                    bg-red-50 text-red-600
                                    border border-red-100
                                    px-2 py-0.5 rounded-full
                                  "
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  Low Stock
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mt-1.5">
                              <p className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-700">
                                  {ingredient.quantity_available}
                                </span>{" "}
                                {ingredient.unit} available
                              </p>

                              {/* Mini Stock Bar */}
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`
                                    h-full rounded-full transition-all duration-500
                                    ${
                                      isLowStock
                                        ? "bg-red-400"
                                        : stockPercentage > 60
                                          ? "bg-emerald-400"
                                          : "bg-amber-400"
                                    }
                                  `}
                                  style={{ width: `${stockPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ─ Menu Items ─ */}
                      <div className="mt-4 ml-11">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <ChefHat className="w-3 h-3 text-gray-400" />
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            Used in{" "}
                            {ingredient.menu_items.length > 0
                              ? `${ingredient.menu_items.length} item${ingredient.menu_items.length !== 1 ? "s" : ""}`
                              : "no items"}
                          </p>
                        </div>

                        {ingredient.menu_items.length === 0 ? (
                          <div
                            className="
                              flex items-center gap-2
                              px-4 py-3 rounded-xl
                              bg-gray-50 border border-dashed border-gray-200
                            "
                          >
                            <p className="text-xs text-gray-400 italic">
                              Not linked to any menu item yet
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {ingredient.menu_items.map((item) => (
                              <div
                                key={item.id}
                                className="
                                  group relative
                                  px-4 py-3 rounded-xl
                                  border border-gray-100 bg-white
                                  hover:border-indigo-200 hover:bg-indigo-50/30
                                  transition-all duration-200
                                  min-w-[200px] max-w-[240px]
                                  cursor-pointer
                                "
                                onClick={() =>
                                  navigate(
                                    `${dashboardBase}/menu/item/${item.id}`,
                                    {
                                      state: {
                                        highlightIngredient: ingredient.id,
                                      },
                                    },
                                  )
                                }
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                                      {item.name}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                      Uses{" "}
                                      <span className="font-semibold text-gray-500">
                                        {item.quantity_required}
                                      </span>{" "}
                                      {ingredient.unit} per serving
                                    </p>
                                  </div>

                                  <div
                                    className="
                                      flex-shrink-0 mt-0.5
                                      p-1.5 rounded-lg
                                      bg-gray-100 text-gray-400
                                      group-hover:bg-indigo-100 group-hover:text-indigo-500
                                      transition-all duration-200
                                    "
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Hint */}
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                <p className="text-[11px] text-gray-400 text-center">
                  Click any menu item to view full details
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── INLINE KEYFRAME ── */}
      <style>{`
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
