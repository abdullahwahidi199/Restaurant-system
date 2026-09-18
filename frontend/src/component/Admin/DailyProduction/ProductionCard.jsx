import { useState } from "react";
import { useTranslation as useAutoTranslation } from "react-i18next";

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
    <div className="p-4 flex items-center gap-4">
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

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 border rounded-lg px-2 py-1 text-center text-sm"
        />
        <button
          onClick={() => onIncrement(qty)}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
          title={autoT("legacy.cook_more_add_to_batch_66e39279")}
        >
          {autoT("legacy.cook_d8402b40")}
        </button>
        <button
          onClick={() => onDecrement(qty)}
          disabled={!hasProd}
          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40"
          title={autoT("legacy.reduce_batch_0c0db485")}
        >
          {autoT("legacy.reduce_24267c81")}
        </button>
        {hasProd && (
          <button
            onClick={() => onClear(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium"
            title={autoT("legacy.clear_production_b938db48")}
          >
            {autoT("legacy.clear_719ea396")}
          </button>
        )}
      </div>
    </div>
  );
}
