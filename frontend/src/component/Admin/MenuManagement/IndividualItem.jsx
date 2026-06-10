import { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import instance from "../../../api/axiosInstance";
import ItemDelete from "./ItemDeleteModal";
import RestrictedToast from "../../RistrictedAction";
import { AuthContext } from "../../../api/authforRBC";
import { useTranslation } from "react-i18next";
import Select from "react-select";

export default function IndividualItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const highlightIngredient = location.state?.highlightIngredient;
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  const BASE_URL = import.meta.env.VITE_MEDIA_URL;
  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;

  const [item, setItem] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showRestriction, setShowRestriction] = useState(false);

  const ingredientRefs = useRef({});

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
      formData.append("name_dari", item.name_dari || "");
      formData.append("name_pashto", item.name_pashto || "");
      formData.append("description", item.description || "");
      formData.append("description_dari", item.description_dari || "");
      formData.append("description_pashto", item.description_pashto || "");
      formData.append("price", item.price);
      formData.append("is_manually_available", item.is_manually_available);
      if (item.image instanceof File) {
        formData.append("image", item.image);
      }

      await instance.patch(`/menu/menu-items/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await saveIngredients();
      navigate("/admin/dashboard/menu", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!highlightIngredient || ingredients.length === 0) return;

    const el = ingredientRefs.current[highlightIngredient];

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [ingredients, highlightIngredient]);

  if (!item) {
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  }

  const unavailableReasons = item.unavailable_reasons || [];
  const hasUnavailableReasons =
    !item.final_availability && unavailableReasons.length > 0;

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

        {/* AVAILABILITY STATUS & UNAVAILABLE REASONS */}
        {!item.final_availability && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-red-500" />
              <span className="font-semibold text-red-700 text-sm uppercase tracking-wide">
                Currently Unavailable
              </span>
            </div>

            {!item.is_manually_available && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-100 rounded-md px-3 py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mt-0.5 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  This item has been{" "}
                  <strong>manually marked unavailable</strong>.
                </span>
              </div>
            )}

            {hasUnavailableReasons && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-800">
                  Insufficient ingredients:
                </p>

                {unavailableReasons.map((reason) => (
                  <div
                    key={`${reason.type}-${reason.id}`}
                    className="flex items-center justify-between bg-white border border-red-200 rounded-md px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-red-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {reason.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Required:{" "}
                          <span className="font-medium text-red-600">
                            {Number(reason.required).toFixed(2)} {reason.unit}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">In Stock</p>
                      <p className="text-sm font-bold text-red-600">
                        {Number(reason.available).toFixed(2)} {reason.unit}
                      </p>
                      <p className="text-xs text-red-500 mt-0.5">
                        Short by{" "}
                        {(
                          Number(reason.required) - Number(reason.available)
                        ).toFixed(2)}{" "}
                        {reason.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {item.final_availability && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-green-500" />
            <span className="font-semibold text-green-700 text-sm">
              Available
            </span>
          </div>
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
          {/* English name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (English)
            </label>
            <input
              name="name"
              value={item.name || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Name"
            />
          </div>

          {/* Dari name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نام (دری)
            </label>
            <input
              name="name_dari"
              value={item.name_dari || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="نام آیتم به دری"
              dir="rtl"
            />
          </div>

          {/* Pashto name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نوم (پښتو)
            </label>
            <input
              name="name_pashto"
              value={item.name_pashto || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="د آیتم نوم په پښتو"
              dir="rtl"
            />
          </div>

          {/* English description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (English)
            </label>
            <textarea
              name="description"
              value={item.description || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Description"
            />
          </div>

          {/* Dari description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              توضیحات (دری)
            </label>
            <textarea
              name="description_dari"
              value={item.description_dari || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="توضیحات به دری"
              dir="rtl"
            />
          </div>

          {/* Pashto description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              توضیحات (پښتو)
            </label>
            <textarea
              name="description_pashto"
              value={item.description_pashto || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="توضیحات په پښتو"
              dir="rtl"
            />
          </div>

          <input
            type="number"
            name="price"
            value={item.price || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Price"
          />

          <div className="border p-3 rounded bg-gray-100">
            <p>
              <b>Total Cost:</b> {item.cost_per_unit.toFixed(2)}
            </p>
            <p className="text-green-600">
              <b>Profit:</b> {item.profit_per_unit.toFixed(2)}
            </p>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_manually_available"
              checked={item.is_manually_available}
              onChange={handleChange}
            />
            {t("available")}
          </label>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Recipe Ingredients</h3>

            {ingredients.map((ing, index) => {
              const isHighlighted = ing.ingredient === highlightIngredient;

              const unavailableReason = unavailableReasons.find(
                (r) => r.type === "ingredient" && r.id === ing.ingredient,
              );

              return (
                <div
                  key={index}
                  ref={(el) => {
                    ingredientRefs.current[ing.ingredient] = el;
                  }}
                  className={`flex flex-col gap-1 mb-3 border p-2 rounded transition-all duration-500 ${
                    isHighlighted
                      ? "border-yellow-400 bg-yellow-50 shadow-lg"
                      : unavailableReason
                        ? "border-red-300 bg-red-50"
                        : ""
                  }`}
                >
                  <div className="flex gap-2">
                    <Select
                      className="w-full"
                      value={allIngredients
                        .map((opt) => ({
                          value: opt.id,
                          label: `${opt.name} (${opt.unit})`,
                        }))
                        .find((o) => o.value === ing.ingredient)}
                      onChange={(selected) =>
                        updateIngredient(index, "ingredient", selected.value)
                      }
                      options={allIngredients.map((opt) => ({
                        value: opt.id,
                        label: `${opt.name} (${opt.unit})`,
                      }))}
                    />

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

                  {unavailableReason && (
                    <div className="flex items-center gap-2 mt-1 px-2 py-1.5 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        <strong>Low stock!</strong> Need{" "}
                        {Number(unavailableReason.required).toFixed(2)}{" "}
                        {unavailableReason.unit}, only{" "}
                        {Number(unavailableReason.available).toFixed(2)}{" "}
                        {unavailableReason.unit} available (short by{" "}
                        {(
                          Number(unavailableReason.required) -
                          Number(unavailableReason.available)
                        ).toFixed(2)}{" "}
                        {unavailableReason.unit})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
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
