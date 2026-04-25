import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../../api/axiosInstance";
import ItemDelete from "./ItemDeleteModal";
import RestrictedToast from "../../RistrictedAction";
import { AuthContext } from "../../../api/authforRBC";
import { useTranslation } from "react-i18next";

export default function IndividualItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;

  const [item, setItem] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showRestriction, setShowRestriction] = useState(false);

  const fetchItem = async () => {
    const res = await instance.get(`/menu/menu-items/${id}/`);
    setItem(res.data);
    console.log(res.data);
    setIngredients(res.data.ingredients || []);
    setPreview(res.data.image ? `${BASE_URL}${res.data.image}` : null);
  };

  const fetchIngredients = async () => {
    const res = await instance.get("/inventory/ingredients/");
    setAllIngredients(res.data);
  };

  useEffect(() => {
    fetchItem();
    fetchIngredients();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setItem({ ...item, image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else if (type === "checkbox") {
      setItem({ ...item, [name]: checked });
    } else {
      setItem({ ...item, [name]: value });
    }
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredientRow = () => {
    setIngredients([...ingredients, { ingredient: "", quantity_required: "" }]);
  };

  const removeIngredient = async (index) => {
    const ing = ingredients[index];
    if (ing.id) {
      await instance.delete(`/inventory/recipes/${ing.id}/`);
    }
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const saveIngredients = async () => {
    for (const ing of ingredients) {
      if (!ing.ingredient || !ing.quantity_required) continue;

      if (ing.id) {
        await instance.patch(`/inventory/recipes/${ing.id}/`, {
          ingredient: ing.ingredient,
          quantity_required: ing.quantity_required,
        });
      } else {
        await instance.post("/inventory/recipes/", {
          menu_item: item.id,
          ingredient: ing.ingredient,
          quantity_required: ing.quantity_required,
        });
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isDemo) {
      setShowRestriction(true);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", item.name);
      formData.append("description", item.description);
      formData.append("price", item.price);
      formData.append("is_available", item.is_available);
      if (item.image instanceof File) {
        formData.append("image", item.image);
      }

      await instance.put(`/menu/menu-items/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await saveIngredients();
      navigate("/admin/dashboard/menu", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 space-y-6 border">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold">{t("edit_menu_item")}</h2>
          <button
            onClick={() => setShowDelete(true)}
            className="px-4 py-1.5 bg-red-500 text-white rounded-lg"
          >
            {t("delete")}
          </button>
        </div>

        {showDelete && (
          <ItemDelete
            itemID={item.id}
            onClose={() => setShowDelete(false)}
            onDelete={() => navigate("/admin/dashboard/menu")}
          />
        )}

        <div className="flex flex-col items-center">
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-36 h-36 object-cover rounded border mb-2"
            />
          )}
          <input type="file" onChange={handleChange} />
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            name="name"
            value={item.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Name"
          />

          <textarea
            name="description"
            value={item.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />

          <input
            type="number"
            name="price"
            value={item.price}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <div className="border p-3 rounded bg-gray-100">
            <p>
              <b>Total Cost:</b> {item.cost_per_unit}
            </p>

            <p className="text-green-600">
              <b>Profit:</b> {item.profit_per_unit}
            </p>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_available"
              checked={item.is_available}
              onChange={handleChange}
            />
            {t("available")}
          </label>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Recipe Ingredients</h3>

            {ingredients.map((ing, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 mb-3 border p-2 rounded"
              >
                <div className="flex gap-2">
                  <select
                    value={ing.ingredient}
                    onChange={(e) =>
                      updateIngredient(index, "ingredient", e.target.value)
                    }
                    className="flex-1 border rounded px-2 py-1"
                  >
                    <option value="">Select ingredient</option>
                    {allIngredients.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} ({opt.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    step="0.001"
                    value={ing.quantity_required}
                    onChange={(e) =>
                      updateIngredient(
                        index,
                        "quantity_required",
                        e.target.value,
                      )
                    }
                    className="w-28 border rounded px-2 py-1"
                    placeholder="Qty"
                  />

                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="bg-red-500 text-white px-3 rounded"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-sm text-gray-600 pl-1">
                  <p>
                    Cost contribution:{" "}
                    <span className="font-medium text-black">
                      {ing.ingredient_cost ?? 0}
                    </span>
                  </p>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredientRow}
              className="mt-2 px-4 py-1 bg-gray-200 rounded"
            >
              + Add Ingredient
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg"
          >
            {loading ? t("updating") : t("update_item")}
          </button>
        </form>
      </div>

      {showRestriction && (
        <RestrictedToast
          action="update"
          onClose={() => setShowRestriction(false)}
        />
      )}
    </div>
  );
}
