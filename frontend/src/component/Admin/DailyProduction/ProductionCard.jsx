import { useState } from "react";

export default function ProductionCard({
  item,
  onIncrement,
  onDecrement,
  onClear,
}) {
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
              {soldOut ? "Sold out" : "Active"}
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              No batch
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
              remaining
              <span className="text-gray-400">
                {" "}
                / {prod.quantity_produced} cooked
              </span>
              {sold > 0 && (
                <span className="text-gray-400"> / {sold} sold</span>
              )}
            </>
          ) : (
            <span className="text-gray-400">Not cooked yet</span>
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
          title="Cook more / add to batch"
        >
          + Cook
        </button>
        <button
          onClick={() => onDecrement(qty)}
          disabled={!hasProd}
          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40"
          title="Reduce batch"
        >
          − Reduce
        </button>
        {hasProd && (
          <button
            onClick={() => onClear(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium"
            title="Clear production"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
