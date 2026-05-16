import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import Select from "react-select";

export default function PlatterAddModal({
  onClose,
  onItemAdded,
  selectedcategoryid,
}) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
    items: [], // [{ menu_item: id, quantity: number }]
  });

  /* ───────── FETCH MENU ITEMS ───────── */
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

  /* ───────── HANDLERS ───────── */
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const addPlatterItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { menu_item: "", quantity: 1 }],
    }));
  };

  const updatePlatterItem = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const removePlatterItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: selectedcategoryid,
        image: formData.image,
        items: formData.items,
      };

      await instance.post("/menu/platters/", payload);
      onItemAdded();
      onClose(); // optional: close modal after success
    } catch (err) {
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const menuOptions = menuItems.map((mi) => ({
    value: mi.id,
    label: `${mi.name} — AFN ${mi.price}`,
  }));
  /* ───────── RENDER ───────── */
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* ─ HEADER ─ */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <h2 className="text-xl font-bold text-gray-900">Add New Platter</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* ─ FORM ─ */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 flex-1 overflow-y-auto"
        >
          {/* Basic fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platter Name
              </label>
              <input
                name="name"
                placeholder="e.g. Family Feast"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
                onChange={handleChange}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Short description of the platter..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition resize-none"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-lime-50 file:text-lime-700 hover:file:bg-lime-100 transition"
              />
            </div>
          </div>

          {/* ─ PLATTER ITEMS ─ */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">
                Platter Items
              </h3>
              <button
                type="button"
                onClick={addPlatterItem}
                className="text-lime-600 font-medium text-sm hover:text-lime-700 transition"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No items added yet.
                </p>
              )}

              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 shadow-sm transition hover:shadow focus-within:ring-2 focus-within:ring-lime-500"
                >
                  {/* Dropdown */}
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">
                      Menu Item
                    </label>
                    <Select
                      options={menuOptions}
                      value={menuOptions.find(
                        (opt) => opt.value === item.menu_item,
                      )}
                      onChange={(selected) =>
                        updatePlatterItem(
                          index,
                          "menu_item",
                          selected?.value || "",
                        )
                      }
                      placeholder="Select an item"
                      className="text-sm"
                      classNamePrefix="react-select"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="w-24">
                    <label className="text-xs text-gray-500 mb-1 block">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none"
                      value={item.quantity}
                      onChange={(e) =>
                        updatePlatterItem(index, "quantity", e.target.value)
                      }
                    />
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removePlatterItem(index)}
                    className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ─ ACTIONS ─ */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-lime-500 text-white font-medium shadow hover:bg-lime-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Creating…" : "Create Platter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
