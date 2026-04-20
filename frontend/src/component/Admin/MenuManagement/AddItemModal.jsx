import { X, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";

import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";
import RestrictedToast from "../../RistrictedAction";

import { getIngredients, addRecipeIngredient } from "../../../api/inventoryApi";
import RecipeIngredientRow from "./RecipeIngredientRow";

export default function AddItemModal({
  onClose,
  onItemAdded,
  selectedcategoryid,
}) {
  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;

  const [loading, setLoading] = useState(false);
  const [showRestriction, setShowRestriction] = useState(false);

  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState([
    { ingredient: "", quantity_required: "" },
  ]);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    const res = await getIngredients();
    setIngredients(res.data);
  };

  const addRecipeRow = () => {
    setRecipe([...recipe, { ingredient: "", quantity_required: "" }]);
  };

  const updateRecipeRow = (index, value) => {
    const updated = [...recipe];
    updated[index] = value;
    setRecipe(updated);
  };

  const removeRecipeRow = (index) => {
    setRecipe(recipe.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDemo) {
      setShowRestriction(true);
      return;
    }

    setLoading(true);

    try {
      
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", selectedcategoryid);
      formData.append("is_available", "True");
      if (image) formData.append("image", image);

      const itemRes = await instance.post(
        "/menu/menu-items/",
        formData
      );

      const menuItemId = itemRes.data.id;

      
      for (const r of recipe) {
        if (!r.ingredient || !r.quantity_required) continue;

        await addRecipeIngredient({
          menu_item: menuItemId,
          ingredient: r.ingredient,
          quantity_required: r.quantity_required,
        });
      }

      onItemAdded();
      onClose();
    } catch (err) {
      console.error("Failed to add item:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          Add Menu Item
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          {/* RECIPE SECTION */}
          <div className="border rounded-lg p-3 space-y-3">
            <h3 className="font-medium text-sm text-gray-700">
              Ingredients (Recipe)
            </h3>

            {recipe.map((r, idx) => (
              <RecipeIngredientRow
                key={idx}
                ingredients={ingredients}
                value={r}
                onChange={(val) => updateRecipeRow(idx, val)}
                onRemove={() => removeRecipeRow(idx)}
              />
            ))}

            <button
              type="button"
              onClick={addRecipeRow}
              className="flex items-center gap-2 text-sm text-indigo-600"
            >
              <Plus size={16} /> Add ingredient
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Item"}
          </button>
        </form>
      </motion.div>

      {showRestriction && (
        <RestrictedToast
          action="add"
          onClose={() => setShowRestriction(false)}
        />
      )}
    </div>
  );
}
