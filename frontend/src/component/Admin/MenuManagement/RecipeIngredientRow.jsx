import { Trash2 } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function RecipeIngredientRow({
  ingredients,
  value,
  onChange,
  onRemove,
}) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="grid gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-[1fr_120px_40px]">
      <select
        value={value.ingredient}
        onChange={(e) => onChange({ ...value, ingredient: e.target.value })}
        className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
      >
        <option value="">{autoT("legacy.choose_ingredient_9eb4723b")}</option>
        {ingredients.map((ing) => (
          <option key={ing.id} value={ing.id}>
            {ing.name} ({ing.unit})
          </option>
        ))}
      </select>

      <input
        type="number"
        step="0.001"
        placeholder={autoT("inventory_manager.common.qty")}
        value={value.quantity_required}
        onChange={(e) =>
          onChange({
            ...value,
            quantity_required: e.target.value,
          })
        }
        className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
      />

      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
        aria-label={autoT("legacy.remove_ingredient_bdb4c1e6")}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
