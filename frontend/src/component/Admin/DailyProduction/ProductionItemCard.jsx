import { useState } from "react";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ProductionItemCard({
  item,
  onIncrement,
  onDecrement,
  onCustomAmount,
}) {
                 const { t: autoT } = useAutoTranslation();
  const [showCustom, setShowCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState(1);
  const [customAction, setCustomAction] = useState("increment");

  const production = item.production;
  const hasProduction = production && production.quantity_produced > 0;
  const isActive = production?.is_active;

  const progressPercent = hasProduction
    ? (production.quantity_remaining / production.quantity_produced) * 100
    : 0;

  return (
    <div
      className={`bg-white border rounded-xl p-4 ${!isActive && hasProduction ? "opacity-60" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
              🍽️
            </div>
          )}
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-500">${item.price}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isActive
              ? "bg-green-100 text-green-700"
              : hasProduction
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {isActive ? autoT("staff.status.active") : hasProduction ? autoT("legacy.sold_out_76fd5600") : autoT("legacy.not_started_8e9f1d6e")}
        </span>
      </div>

      {/* Production Stats */}
      {hasProduction ? (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{autoT("legacy.produced_5d717336")}</span>
            <span className="font-medium">{production.quantity_produced}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{autoT("legacy.remaining_cc632b5e")}</span>
            <span
              className={`font-medium ${production.quantity_remaining === 0 ? "text-red-500" : ""}`}
            >
              {production.quantity_remaining}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all ${
                progressPercent > 50
                  ? "bg-green-500"
                  : progressPercent > 20
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-400 mb-4">
          {autoT("legacy.no_production_yet_0d23d4d1")}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={onIncrement}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          {autoT("legacy.cook_d8402b40")}
        </button>

        {hasProduction && (
          <button
            onClick={onDecrement}
            className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            {autoT("legacy.remove_d74a7695")}
          </button>
        )}
      </div>

      {/* Custom Amount Toggle */}
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
      >
        {showCustom ? autoT("legacy.hide_custom_amount_89727160") : autoT("legacy.custom_amount_9251757a")}
      </button>

      {showCustom && (
        <div className="mt-3 pt-3 border-t space-y-2">
          <div className="flex gap-2">
            <select
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              className="flex-1 border rounded-lg px-2 py-1 text-sm"
            >
              <option value="increment">{autoT("legacy.cook_more_3a116871")}</option>
              <option value="decrement">{autoT("legacy.remove_e963907d")}</option>
            </select>
            <input
              type="number"
              min="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              className="flex-1 border rounded-lg px-2 py-1 text-sm"
            />
          </div>
          <button
            onClick={() => {
              onCustomAmount(customAmount, customAction);
              setShowCustom(false);
            }}
            className="w-full bg-indigo-600 text-white py-1 rounded-lg text-sm hover:bg-indigo-700"
          >
            {autoT("filters.apply")}
          </button>
        </div>
      )}
    </div>
  );
}
