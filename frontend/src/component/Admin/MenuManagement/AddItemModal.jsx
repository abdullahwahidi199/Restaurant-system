import { motion } from "framer-motion";
import {
  BookOpen,
  DollarSign,
  ImagePlus,
  Languages,
  Loader2,
  Plus,
  Upload,
  Utensils,
  X,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";

import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";
import { addRecipeIngredient, getIngredients } from "../../../api/inventoryApi";
import RestrictedToast from "../../RistrictedAction";
import RecipeIngredientRow from "./RecipeIngredientRow";

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="mt-2 block">{children}</span>
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10";

const textAreaClass =
  "min-h-24 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10";

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
  const [nameDari, setNameDari] = useState("");
  const [namePashto, setNamePashto] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionDari, setDescriptionDari] = useState("");
  const [descriptionPashto, setDescriptionPashto] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState([
    { ingredient: "", quantity_required: "" },
  ]);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await getIngredients();
        setIngredients(res.data);
      } catch (error) {
        console.error("Failed to load ingredients:", error);
      }
    };

    fetchIngredients();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const addRecipeRow = () => {
    setRecipe((current) => [
      ...current,
      { ingredient: "", quantity_required: "" },
    ]);
  };

  const updateRecipeRow = (index, value) => {
    setRecipe((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? value : row)),
    );
  };

  const removeRecipeRow = (index) => {
    setRecipe((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview("");
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
      formData.append("name_dari", nameDari);
      formData.append("name_pashto", namePashto);
      formData.append("description", description);
      formData.append("description_dari", descriptionDari);
      formData.append("description_pashto", descriptionPashto);
      formData.append("price", price);
      formData.append("category", selectedcategoryid);
      formData.append("final_availability", "True");
      if (image) formData.append("image", image);

      const itemRes = await instance.post("/menu/menu-items/", formData);
      const menuItemId = itemRes.data.id;

      for (const row of recipe) {
        if (!row.ingredient || !row.quantity_required) continue;

        await addRecipeIngredient({
          menu_item: menuItemId,
          ingredient: row.ingredient,
          quantity_required: row.quantity_required,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: 18, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 18, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-gray-50 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Menu item
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-950">
              Add New Item
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create the dish, attach media, price it, and link recipe usage.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-950"
            aria-label="Close add item modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <Section
                icon={Utensils}
                title="General"
                description="Core naming and description shown to staff and customers."
              >
                <div className="space-y-4">
                  <Field label="Item name" hint="Use the name staff will search for most often.">
                    <input
                      className={inputClass}
                      placeholder="e.g. Chicken Karahi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      className={textAreaClass}
                      placeholder="Short customer-facing description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Field>
                </div>
              </Section>

              <Section
                icon={Languages}
                title="Translations"
                description="Optional localized names and descriptions for multilingual menus."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Dari name">
                    <input
                      className={inputClass}
                      placeholder="Item name in Dari"
                      dir="rtl"
                      value={nameDari}
                      onChange={(e) => setNameDari(e.target.value)}
                    />
                  </Field>
                  <Field label="Pashto name">
                    <input
                      className={inputClass}
                      placeholder="Item name in Pashto"
                      dir="rtl"
                      value={namePashto}
                      onChange={(e) => setNamePashto(e.target.value)}
                    />
                  </Field>
                  <Field label="Dari description">
                    <textarea
                      className={textAreaClass}
                      placeholder="Description in Dari"
                      dir="rtl"
                      value={descriptionDari}
                      onChange={(e) => setDescriptionDari(e.target.value)}
                    />
                  </Field>
                  <Field label="Pashto description">
                    <textarea
                      className={textAreaClass}
                      placeholder="Description in Pashto"
                      dir="rtl"
                      value={descriptionPashto}
                      onChange={(e) => setDescriptionPashto(e.target.value)}
                    />
                  </Field>
                </div>
              </Section>
            </div>

            <div className="space-y-4">
              <Section
                icon={ImagePlus}
                title="Image"
                description="Upload a clear item photo for ordering screens and menu browsing."
              >
                <div className="overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Menu item preview"
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-sm transition hover:bg-white hover:text-rose-600"
                        aria-label="Remove selected image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center px-6 text-center transition hover:bg-white">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="mt-3 text-sm font-semibold text-gray-700">
                        Upload item image
                      </span>
                      <span className="mt-1 text-xs text-gray-500">
                        PNG or JPG, ideally square or 4:3
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  )}
                </div>
                {imagePreview && (
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    Replace image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                )}
              </Section>

              <Section
                icon={DollarSign}
                title="Pricing"
                description="Set the selling price for this branch menu item."
              >
                <Field label="Price">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      AFN
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={`${inputClass} pl-14`}
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </Field>
              </Section>

              <Section
                icon={BookOpen}
                title="Recipe"
                description="Link ingredients so inventory and availability stay accurate."
              >
                <div className="space-y-3">
                  {recipe.map((row, index) => (
                    <RecipeIngredientRow
                      key={index}
                      ingredients={ingredients}
                      value={row}
                      onChange={(value) => updateRecipeRow(index, value)}
                      onRemove={() => removeRecipeRow(index)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addRecipeRow}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                  >
                    <Plus className="h-4 w-4" />
                    Add ingredient
                  </button>
                </div>
              </Section>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-5 mt-5 flex flex-col gap-3 border-t border-gray-200 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-950"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedcategoryid}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {loading ? "Saving..." : "Add item"}
            </button>
          </div>
        </form>
      </motion.div>

      {showRestriction && (
        <RestrictedToast action="add" onClose={() => setShowRestriction(false)} />
      )}
    </div>
  );
}
