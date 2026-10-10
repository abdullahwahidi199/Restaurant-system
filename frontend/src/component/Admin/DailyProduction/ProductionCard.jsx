import { useState } from "react";
import { useTranslation as useAutoTranslation } from "react-i18next";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function ProductionCard({
  item,
  onIncrement,
  onDecrement,
  onClear,
}) {
  const { t: autoT } = useAutoTranslation();
  const [qty, setQty] = useState(1);
  const prod = item.production;
  const hasProd = !!prod;
  const soldOut = hasProd && prod.quantity_remaining <= 0;
  const sold = hasProd ? prod.quantity_produced - prod.quantity_remaining : 0;

  return (
    <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold truncate">{item.name}</h3>
          {hasProd ? (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                soldOut
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {soldOut ? autoT("legacy.sold_out_02ff6590") : autoT("staff.status.active")}
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {autoT("legacy.no_batch_514402aa")}
            </span>
          )}
        </div>
        {item.category_name && (
          <p className="text-xs text-gray-500">{item.category_name}</p>
        )}
        <p className="text-sm text-gray-600 mt-1">
          {hasProd ? (
            <>
              <span className="font-medium text-gray-900">
                {prod.quantity_remaining}
              </span>{" "}
              {autoT("legacy.remaining_398658a6")}
              <span className="text-gray-400">
                {" "}
                / {prod.quantity_produced} {autoT("legacy.cooked_045d92ef")}
              </span>
              {sold > 0 && (
                <span className="text-gray-400"> / {sold} {autoT("legacy.sold_147f6d85")}</span>
              )}
            </>
          ) : (
            <span className="text-gray-400">{autoT("legacy.not_cooked_yet_af56dfef")}</span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2 lg:justify-end">
        <label className="min-w-24">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider theme-text-muted">
            {autoT("inventory_manager.common.quantity", {
              defaultValue: "Quantity",
            })}
          </span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={qty}
            aria-label={autoT("inventory_manager.common.quantity", {
              defaultValue: "Quantity",
            })}
            onChange={(event) =>
              setQty(Math.max(1, parseInt(event.target.value, 10) || 1))
            }
            className="theme-input h-10 w-24 rounded-xl px-3 text-center text-sm font-bold tabular-nums"
          />
        </label>
        <button
          type="button"
          onClick={() => onIncrement(qty)}
          className="theme-btn theme-btn-primary h-10 gap-2 rounded-xl px-3.5 text-sm shadow-sm"
          title={autoT("legacy.cook_more_add_to_batch_66e39279")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {autoT("legacy.cook_d8402b40")}
        </button>
        <button
          type="button"
          onClick={() => onDecrement(qty)}
          disabled={!hasProd}
          className="theme-btn theme-btn-warning h-10 gap-2 rounded-xl px-3.5 text-sm"
          title={autoT("legacy.reduce_batch_0c0db485")}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
          {autoT("legacy.reduce_24267c81")}
        </button>
        {hasProd && (
          <button
            type="button"
            onClick={() => onClear(false)}
            className="theme-btn theme-btn-ghost h-10 gap-2 rounded-xl px-3 text-sm text-[var(--theme-danger)]"
            title={autoT("legacy.clear_production_b938db48")}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {autoT("legacy.clear_719ea396")}
          </button>
        )}
      </div>
    </div>
  );
}
