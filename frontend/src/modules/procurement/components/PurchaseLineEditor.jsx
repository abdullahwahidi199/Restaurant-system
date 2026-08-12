import React from "react";
import Select from "react-select";
import { Plus, Trash2 } from "lucide-react";
import { inputClass, selectTheme } from "../../shared/erp/constants";
import { displayUnit } from "../utils/calculations";

export default function PurchaseLineEditor({
  lines,
  ingredients,
  ingredientMap,
  onLineChange,
  onAddLine,
  onRemoveLine,
}) {
  const ingredientOptions = ingredients.map((item) => ({
    value: item.id,
    label: `${item.name} (${displayUnit(item.unit)})`,
  }));

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3">Ingredient</th>
              <th className="px-3 py-3">Quantity</th>
              <th className="px-3 py-3">Unit Price</th>
              <th className="px-3 py-3">Line Total</th>
              <th className="px-3 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((line) => {
              const ingredient = ingredientMap[String(line.ingredient)];
              return (
                <tr key={line.key}>
                  <td className="px-3 py-3">
                    <Select
                      options={ingredientOptions}
                      styles={selectTheme}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      menuShouldScrollIntoView
                      value={
                        line.ingredient
                          ? {
                              value: line.ingredient,
                              label: `${ingredient?.name || "Ingredient"} (${displayUnit(ingredient?.unit)})`,
                            }
                          : null
                      }
                      onChange={(option) => onLineChange(line.key, "ingredient", option?.value || "")}
                      placeholder="Select ingredient"
                      isClearable
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.001"
                        value={line.quantity}
                        onChange={(event) => onLineChange(line.key, "quantity", event.target.value)}
                        className={inputClass}
                      />
                      <span className="w-10 text-xs text-slate-500">
                        {displayUnit(ingredient?.unit)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      step="0.0001"
                      value={line.unit_price}
                      onChange={(event) => onLineChange(line.key, "unit_price", event.target.value)}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      step="0.01"
                      value={line.total_price}
                      onChange={(event) => onLineChange(line.key, "total_price", event.target.value)}
                      className={`${inputClass} font-semibold`}
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveLine(line.key)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-rose-600 transition hover:bg-rose-50"
                      title="Remove line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={onAddLine}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" />
        Add Line
      </button>
    </div>
  );
}
