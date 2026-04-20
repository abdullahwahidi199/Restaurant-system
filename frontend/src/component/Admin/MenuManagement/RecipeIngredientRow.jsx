import { Trash2 } from "lucide-react";

export default function RecipeIngredientRow({
  ingredients,
  value,
  onChange,
  onRemove,
}) {
  return (
    <div className="flex gap-2 items-center">
      <select
        value={value.ingredient}
        onChange={(e) =>
          onChange({ ...value, ingredient: e.target.value })
        }
        className="flex-1 border rounded px-2 py-2"
      >
        <option value="">Ingredient</option>
        {ingredients.map((ing) => (
          <option key={ing.id} value={ing.id}>
            {ing.name} ({ing.unit})
          </option>
        ))}
      </select>

      <input
        type="number"
        step="0.001"
        placeholder="Qty"
        value={value.quantity_required}
        onChange={(e) =>
          onChange({
            ...value,
            quantity_required: e.target.value,
          })
        }
        className="w-28 border rounded px-2 py-2"
      />

      <button
        type="button"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
