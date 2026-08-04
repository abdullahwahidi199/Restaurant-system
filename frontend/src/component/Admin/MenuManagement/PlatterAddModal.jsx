import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ImagePlus,
  Languages,
  Layers3,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Utensils,
  X,
} from "lucide-react";
import Select from "react-select";

import instance from "../../../api/axiosInstance";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10";

const textAreaClass =
  "min-h-24 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 8,
    borderColor: state.isFocused ? "#111827" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(17, 24, 39, 0.10)" : "none",
    ":hover": { borderColor: state.isFocused ? "#111827" : "#d1d5db" },
  }),
  menu: (base) => ({ ...base, zIndex: 60 }),
};

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="mt-2 block">{children}</span>
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

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

export default function PlatterAddModal({
  onClose,
  onItemAdded,
  selectedcategoryid,
}) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    name_dari: "",
    name_pashto: "",
    description: "",
    description_dari: "",
    description_pashto: "",
    price: "",
    image: null,
    items: [{ menu_item: "", quantity: 1 }],
  });

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const res = await instance.get("/menu/menu-items/");
        setMenuItems(res.data);
      } catch (err) {
        console.error("Failed to load menu items:", err);
      }
    };

    fetchMenuItems();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const menuOptions = useMemo(
    () =>
      menuItems.map((item) => ({
        value: item.id,
        label: `${item.name} - AFN ${item.price}`,
      })),
    [menuItems],
  );

  const validItems = formData.items.filter(
    (item) => item.menu_item && Number(item.quantity) > 0,
  );

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview("");
  };

  const addPlatterItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { menu_item: "", quantity: 1 }],
    }));
  };

  const updatePlatterItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, rowIndex) =>
        rowIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removePlatterItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("name_dari", formData.name_dari);
      payload.append("name_pashto", formData.name_pashto);
      payload.append("description", formData.description);
      payload.append("description_dari", formData.description_dari);
      payload.append("description_pashto", formData.description_pashto);
      payload.append("price", formData.price);
      payload.append("category", selectedcategoryid);
      payload.append("is_manually_available", "true");
      payload.append(
        "items",
        JSON.stringify(
          validItems.map((item) => ({
            menu_item: Number(item.menu_item),
            quantity: Number(item.quantity),
          })),
        ),
      );

      if (formData.image) payload.append("image", formData.image);

      await instance.post("/menu/platters/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onItemAdded();
      onClose();
    } catch (err) {
      console.error(err.response?.data || err);
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
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-gray-50 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Platter
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-950">
              Add New Platter
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Bundle multiple menu items with a single price and availability state.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-950"
            aria-label="Close platter modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5">
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <Section
                icon={Layers3}
                title="General"
                description="Name and describe the platter for staff and customer-facing screens."
              >
                <div className="space-y-4">
                  <Field label="Platter name">
                    <input
                      name="name"
                      placeholder="e.g. Family Feast"
                      className={inputClass}
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      name="description"
                      placeholder="Short description of the platter..."
                      rows={3}
                      className={textAreaClass}
                      value={formData.description}
                      onChange={handleChange}
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
                      name="name_dari"
                      placeholder="Platter name in Dari"
                      dir="rtl"
                      className={inputClass}
                      value={formData.name_dari}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="Pashto name">
                    <input
                      name="name_pashto"
                      placeholder="Platter name in Pashto"
                      dir="rtl"
                      className={inputClass}
                      value={formData.name_pashto}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="Dari description">
                    <textarea
                      name="description_dari"
                      placeholder="Description in Dari"
                      dir="rtl"
                      rows={3}
                      className={textAreaClass}
                      value={formData.description_dari}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="Pashto description">
                    <textarea
                      name="description_pashto"
                      placeholder="Description in Pashto"
                      dir="rtl"
                      rows={3}
                      className={textAreaClass}
                      value={formData.description_pashto}
                      onChange={handleChange}
                    />
                  </Field>
                </div>
              </Section>

              <Section
                icon={Utensils}
                title="Platter items"
                description="Choose the menu items included in this platter and their quantities."
              >
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-[1fr_110px_40px]"
                    >
                      <div>
                        <span className="mb-2 block text-xs font-medium text-gray-500">
                          Menu item
                        </span>
                        <Select
                          options={menuOptions}
                          value={menuOptions.find(
                            (option) => option.value === item.menu_item,
                          )}
                          onChange={(selected) =>
                            updatePlatterItem(
                              index,
                              "menu_item",
                              selected?.value || "",
                            )
                          }
                          placeholder="Select an item"
                          styles={selectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </div>

                      <label>
                        <span className="mb-2 block text-xs font-medium text-gray-500">
                          Quantity
                        </span>
                        <input
                          type="number"
                          min="1"
                          className={inputClass}
                          value={item.quantity}
                          onChange={(event) =>
                            updatePlatterItem(index, "quantity", event.target.value)
                          }
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => removePlatterItem(index)}
                        className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        aria-label="Remove platter item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addPlatterItem}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                  >
                    <Plus className="h-4 w-4" />
                    Add menu item
                  </button>
                </div>
              </Section>
            </div>

            <div className="space-y-4">
              <Section
                icon={ImagePlus}
                title="Image"
                description="Use a clear image that represents the complete platter."
              >
                <div className="overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Platter preview"
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
                        Upload platter image
                      </span>
                      <span className="mt-1 text-xs text-gray-500">
                        PNG or JPG, ideally 4:3
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
                description="Set the selling price customers and staff will see."
              >
                <Field label="Price">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      AFN
                    </span>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={`${inputClass} pl-14`}
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Field>
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
              disabled={loading || !selectedcategoryid || validItems.length === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Layers3 className="h-4 w-4" />
              )}
              {loading ? "Creating..." : "Create platter"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
