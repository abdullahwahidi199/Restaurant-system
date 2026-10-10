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
import { useTranslation as useAutoTranslation } from "react-i18next";

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
                 const { t: autoT } = useAutoTranslation();
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
              {autoT("legacy.menu_item_f23d4cbe")}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-950">
              {autoT("legacy.add_new_item_1cc26e7e")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {autoT("legacy.create_the_dish_attach_media_price_it_and_link_recipe__459f60bb")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-950"
            aria-label={autoT("legacy.close_add_item_modal_ef037490")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <Section
                icon={Utensils}
                title={autoT("settings_center.nav.general")}
                description={autoT("legacy.core_naming_and_description_shown_to_staff_and_custome_b2932076")}
              >
                <div className="space-y-4">
                  <Field label={autoT("legacy.item_name_b56b71bb")} hint={autoT("legacy.use_the_name_staff_will_search_for_most_often_a6cf835a")}>
                    <input
                      className={inputClass}
                      placeholder={autoT("legacy.e_g_chicken_karahi_50844b49")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label={autoT("description")}>
                    <textarea
                      className={textAreaClass}
                      placeholder={autoT("legacy.short_customer_facing_description_7b01de1c")}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Field>
                </div>
              </Section>

              <Section
                icon={Languages}
                title={autoT("legacy.translations_8ad8302d")}
                description={autoT("legacy.optional_localized_names_and_descriptions_for_multilin_dbedfa9e")}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={autoT("legacy.dari_name_39072a2e")}>
                    <input
                      className={inputClass}
                      placeholder={autoT("legacy.item_name_in_dari_7561085c")}
                      dir="rtl"
                      value={nameDari}
                      onChange={(e) => setNameDari(e.target.value)}
                    />
                  </Field>
                  <Field label={autoT("legacy.pashto_name_fcbb52c5")}>
                    <input
                      className={inputClass}
                      placeholder={autoT("legacy.item_name_in_pashto_6d8225d5")}
                      dir="rtl"
                      value={namePashto}
                      onChange={(e) => setNamePashto(e.target.value)}
                    />
                  </Field>
                  <Field label={autoT("legacy.dari_description_f2d9dcc8")}>
                    <textarea
                      className={textAreaClass}
                      placeholder={autoT("legacy.description_in_dari_ee53e8af")}
                      dir="rtl"
                      value={descriptionDari}
                      onChange={(e) => setDescriptionDari(e.target.value)}
                    />
                  </Field>
                  <Field label={autoT("legacy.pashto_description_4c13a593")}>
                    <textarea
                      className={textAreaClass}
                      placeholder={autoT("legacy.description_in_pashto_e7e4e941")}
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
                title={autoT("legacy.image_50e19fda")}
                description={autoT("legacy.upload_a_clear_item_photo_for_ordering_screens_and_men_0223f722")}
              >
                <div className="overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt={autoT("legacy.menu_item_preview_0b7e03e3")}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-sm transition hover:bg-white hover:text-rose-600"
                        aria-label={autoT("legacy.remove_selected_image_5e01adf1")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center px-6 text-center transition hover:bg-white">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="mt-3 text-sm font-semibold text-gray-700">
                        {autoT("legacy.upload_item_image_d1dc4ac5")}
                      </span>
                      <span className="mt-1 text-xs text-gray-500">
                        {autoT("legacy.png_or_jpg_ideally_square_or_4_3_8f4e13b5")}
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
                    {autoT("legacy.replace_image_bc0a102a")}
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
                title={autoT("landing.marketplace.footer.links.pricing")}
                description={autoT("legacy.set_the_selling_price_for_this_branch_menu_item_d0541016")}
              >
                <Field label={autoT("menuDetails.price")}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      {autoT("labels.afn")}
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
                title={autoT("legacy.recipe_1dcda804")}
                description={autoT("legacy.link_ingredients_so_inventory_and_availability_stay_ac_6b9c267f")}
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
                    {autoT("legacy.add_ingredient_4ca518bb")}
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
              {autoT("staff.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading || !selectedcategoryid}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--theme-primary)] px-5 text-sm font-semibold text-[var(--theme-text-inverse)] shadow-sm transition hover:bg-[var(--theme-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {loading ? autoT("saving") : autoT("legacy.add_item_5bcf4db4")}
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
