import React, { useEffect, useRef } from "react";
import Select from "react-select";
import { Plus, Trash2 } from "lucide-react";
import { inputClass, selectTheme } from "../../shared/erp/constants";
import { displayUnit } from "../utils/calculations";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function PurchaseLineEditor({
  lines,
  ingredients,
  ingredientMap,
  onLineChange,
  onAddLine,
  onRemoveLine,
}) {
                 const { t: autoT } = useAutoTranslation();
  const previousLineCount = useRef(lines.length);
  const lastIngredientRef = useRef(null);
  const ingredientOptions = ingredients.map((item) => ({
    value: item.id,
    label: `${item.name} (${displayUnit(item.unit)})`,
  }));

  useEffect(() => {
    if (lines.length > previousLineCount.current) {
      const frame = window.requestAnimationFrame(() => lastIngredientRef.current?.focus());
      previousLineCount.current = lines.length;
      return () => window.cancelAnimationFrame(frame);
    }
    previousLineCount.current = lines.length;
    return undefined;
  }, [lines.length]);

  const preventEnterSubmit = (event) => {
    if (event.key === "Enter") event.preventDefault();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--theme-border)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed text-left text-[13px]">
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[18%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
            <col className="w-12" />
          </colgroup>
          <thead className="bg-[var(--theme-table-header)] text-[11px] font-semibold uppercase tracking-wide theme-text-muted">
            <tr>
              <th className="px-3 py-2">{autoT("inventory_manager.ingredients.ingredient")}</th>
              <th className="px-3 py-2">{autoT("inventory_manager.common.quantity")}</th>
              <th className="px-3 py-2 text-right">{autoT("inventory_manager.reports.unit_price")}</th>
              <th className="px-3 py-2 text-right">{autoT("legacy.line_total_2d1a09ef")}</th>
              <th className="px-2 py-2 text-right"><span className="sr-only">{autoT("inventory_manager.common.action")}</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--theme-border)]">
            {lines.map((line, index) => {
              const ingredient = ingredientMap[String(line.ingredient)];
              return (
                <tr key={line.key}>
                  <td className="px-3 py-2">
                    <Select
                      ref={index === lines.length - 1 ? lastIngredientRef : undefined}
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
                      placeholder={autoT("legacy.select_ingredient_c80652c3")}
                      isClearable
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.001"
                        value={line.quantity}
                        onChange={(event) => onLineChange(line.key, "quantity", event.target.value)}
                        onKeyDown={preventEnterSubmit}
                        className={`${inputClass} text-right tabular-nums`}
                      />
                      <span className="w-9 truncate text-[11px] theme-text-muted">
                        {displayUnit(ingredient?.unit)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.0001"
                      value={line.unit_price}
                      onChange={(event) => onLineChange(line.key, "unit_price", event.target.value)}
                      onKeyDown={preventEnterSubmit}
                      className={`${inputClass} text-right tabular-nums`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={line.total_price}
                      onChange={(event) => onLineChange(line.key, "total_price", event.target.value)}
                      onKeyDown={preventEnterSubmit}
                      className={`${inputClass} text-right font-semibold tabular-nums`}
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveLine(line.key)}
                      className="theme-btn theme-btn-ghost theme-btn-icon text-[var(--theme-danger)] hover:bg-[var(--theme-danger-soft)]"
                      title={autoT("legacy.remove_line_c54cf886")}
                      aria-label={autoT("legacy.remove_line_c54cf886")}
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
        className="theme-btn theme-btn-ghost h-8 w-full justify-start rounded-none border-t border-[var(--theme-border)] px-3 text-xs theme-text-secondary"
      >
        <Plus className="h-4 w-4" />
        {autoT("legacy.add_line_63dcfb67")}
      </button>
    </div>
  );
}
