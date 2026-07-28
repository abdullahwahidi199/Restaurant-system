import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import instance from "../../../api/axiosInstance";
import Select from "react-select";
import {
  AlertTriangle,
  XCircle,
  Trash2,
  ArrowRight,
  Plus,
  Loader2,
  CheckCircle,
  XSquare,
} from "lucide-react";

export default function PlatterDetails() {
  const { id } = useParams();
  const location = useLocation();
  const dashboardBase = location.pathname.startsWith("/inventory-manager")
    ? "/inventory-manager"
    : "/admin/dashboard";

  const [platterDetails, setPlatterDetails] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    name_dari: "",
    name_pashto: "",
    description: "",
    description_dari: "",
    description_pashto: "",
    price: "",
    category: "",
    is_manually_available: true,
    items: [],
    image: "",
  });

  const fetchPlatterDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await instance.get(`/menu/platters/${id}/`);

      setPlatterDetails(res.data);

      setFormData({
        name: res.data.name || "",
        name_dari: res.data.name_dari || "",
        name_pashto: res.data.name_pashto || "",
        description: res.data.description || "",
        description_dari: res.data.description_dari || "",
        description_pashto: res.data.description_pashto || "",
        price: res.data.price || "",
        category: res.data.category || "",
        is_manually_available: res.data.is_manually_available,
        image: res.data.image || null,
        items: res.data.items || [],
      });
    } catch (error) {
      console.log(error);
      setError("Failed to fetch platter details");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await instance.get("/menu/menu-items/");
      setMenuItems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPlatterDetails();
    fetchMenuItems();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    updatedItems[index][field] = field === "menu_item" ? Number(value) : value;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          menu_item: "",
          quantity: 1,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        name_dari: formData.name_dari,
        name_pashto: formData.name_pashto,
        description: formData.description,
        description_dari: formData.description_dari,
        description_pashto: formData.description_pashto,
        price: formData.price,
        category: formData.category,
        is_manually_available: formData.is_manually_available,

        items: formData.items.map((item) => ({
          menu_item: Number(item.menu_item),
          quantity: Number(item.quantity),
        })),
      };

      if (selectedImage) {
        const fd = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
          if (key === "items") {
            fd.append("items", JSON.stringify(value));
          } else {
            fd.append(key, value);
          }
        });

        fd.append("image", selectedImage);

        await instance.put(`/menu/platters/${id}/`, fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await instance.put(`/menu/platters/${id}/`, payload);
      }

      alert("Platter updated successfully");

      fetchPlatterDetails();
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);

      setError("Failed to update platter");
    } finally {
      setSaving(false);
    }
  };

  const totalCost = Number(platterDetails?.total_cost || 0);
  const profit = Number(formData.price || 0) - totalCost;

  const menuOptions = menuItems.map((mi) => ({
    value: mi.id,
    label: mi.name,
  }));

  if (loading) {
    return <div className="p-5">Loading...</div>;
  }

  const unavailableReasons = platterDetails?.unavailable_reasons || [];
  const finalAvailability = platterDetails?.final_availability ?? true;
  const isManuallyAvailable = platterDetails?.is_manually_available ?? true;
  const hasUnavailableReasons =
    !finalAvailability && unavailableReasons.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-6">Update Platter</h1>

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>
      )}

      {/* AVAILABILITY STATUS & UNAVAILABLE REASONS */}
      {!finalAvailability && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-red-500" />
            <span className="font-semibold text-red-700 text-sm uppercase tracking-wide">
              Currently Unavailable
            </span>
          </div>

          {!isManuallyAvailable && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-100 rounded-md px-3 py-2">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <span>
                This platter has been{" "}
                <strong>manually marked unavailable</strong>.
              </span>
            </div>
          )}

          {hasUnavailableReasons && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-800">
                The following menu items in this platter are unavailable:
              </p>

              {unavailableReasons.map((reason) => (
                <div
                  key={`${reason.type}-${reason.id}`}
                  className="flex items-center justify-between bg-white border border-red-200 rounded-md px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {reason.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {reason.type === "menu_item"
                          ? "Menu item is unavailable"
                          : reason.type === "ingredient"
                            ? `Need ${Number(reason.required).toFixed(2)} ${reason.unit}, only ${Number(reason.available).toFixed(2)} ${reason.unit} in stock`
                            : "Unavailable"}
                      </p>
                    </div>
                  </div>

                  {reason.type === "menu_item" && (
                    <Link
                      to={`${dashboardBase}/menu/item/${reason.id}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline whitespace-nowrap"
                    >
                      View Item →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {finalAvailability && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-2 mb-6">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="font-semibold text-green-700 text-sm">
            Available
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* image */}
        <div>
          <label className="block mb-2 font-semibold">Platter Image</label>

          {formData.image && !selectedImage && (
            <img
              src={formData.image}
              alt="platter"
              className="w-40 h-40 object-cover rounded mb-3 border"
            />
          )}

          {selectedImage && (
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="preview"
              className="w-40 h-40 object-cover rounded mb-3 border"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setSelectedImage(file);
              }
            }}
            className="w-full border p-3 rounded"
          />
        </div>

        {/* English Name */}
        <div>
          <label className="block mb-2 font-semibold">Name (English)</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />
        </div>

        {/* Dari Name */}
        <div>
          <label className="block mb-2 font-semibold">نام (دری)</label>
          <input
            type="text"
            name="name_dari"
            value={formData.name_dari}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            dir="rtl"
            placeholder="نام پلاتر به دری"
          />
        </div>

        {/* Pashto Name */}
        <div>
          <label className="block mb-2 font-semibold">نوم (پښتو)</label>
          <input
            type="text"
            name="name_pashto"
            value={formData.name_pashto}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            dir="rtl"
            placeholder="د پلاتر نوم په پښتو"
          />
        </div>

        {/* English Description */}
        <div>
          <label className="block mb-2 font-semibold">
            Description (English)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            rows={4}
          />
        </div>

        {/* Dari Description */}
        <div>
          <label className="block mb-2 font-semibold">توضیحات (دری)</label>
          <textarea
            name="description_dari"
            value={formData.description_dari}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            rows={4}
            dir="rtl"
            placeholder="توضیحات پلاتر به دری..."
          />
        </div>

        {/* Pashto Description */}
        <div>
          <label className="block mb-2 font-semibold">توضیحات (پښتو)</label>
          <textarea
            name="description_pashto"
            value={formData.description_pashto}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            rows={4}
            dir="rtl"
            placeholder="د پلاتر توضیحات په پښتو..."
          />
        </div>

        {/* price */}
        <div>
          <label className="block mb-2 font-semibold">Price</label>

          <input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <div className="mt-3 space-y-1 text-sm">
            <p>
              <span className="font-semibold">Total Cost:</span>{" "}
              {totalCost.toFixed(2)}
            </p>

            <p>
              <span className="font-semibold">Profit:</span> {profit.toFixed(2)}
            </p>
          </div>
        </div>

        {/* availability */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_manually_available"
            checked={formData.is_manually_available}
            onChange={handleChange}
          />

          <label className="font-semibold">Available</label>
        </div>

        {/* platter items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Platter Items</h2>

            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => {
              const unavailableReason = unavailableReasons.find(
                (r) =>
                  r.type === "menu_item" && r.id === Number(item.menu_item),
              );

              const selectedMenuItem = menuItems.find(
                (mi) => mi.id === Number(item.menu_item),
              );

              return (
                <div
                  key={index}
                  className={`rounded-xl border transition-all duration-300 ${
                    unavailableReason
                      ? "border-red-300 shadow-sm shadow-red-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className={`flex items-center justify-between px-4 py-2.5 rounded-t-xl ${
                      unavailableReason
                        ? "bg-red-50 border-b border-red-200"
                        : "bg-gray-50 border-b border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-500">
                        #{index + 1}
                      </span>
                      {selectedMenuItem && (
                        <span className="text-sm font-medium text-gray-800">
                          {selectedMenuItem.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {unavailableReason && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Unavailable
                        </span>
                      )}

                      {!unavailableReason && selectedMenuItem && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 bg-white rounded-b-xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      {/* Menu Item Select */}
                      <div className="md:col-span-6">
                        <label className="block mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Menu Item
                        </label>
                        <Select
                          options={menuOptions}
                          value={menuOptions.find(
                            (opt) => opt.value === Number(item.menu_item),
                          )}
                          onChange={(selected) =>
                            handleItemChange(
                              index,
                              "menu_item",
                              selected ? selected.value : "",
                            )
                          }
                          placeholder="Select menu item..."
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                            control: (base, state) => ({
                              ...base,
                              borderColor: unavailableReason
                                ? "#fca5a5"
                                : state.isFocused
                                  ? "#6366f1"
                                  : "#d1d5db",
                              boxShadow: state.isFocused
                                ? "0 0 0 1px #6366f1"
                                : "none",
                              "&:hover": {
                                borderColor: unavailableReason
                                  ? "#f87171"
                                  : "#6366f1",
                              },
                            }),
                          }}
                        />
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-3">
                        <label className="block mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
                            unavailableReason
                              ? "border-red-300 focus:ring-red-300"
                              : "border-gray-300 focus:ring-indigo-300"
                          }`}
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="md:col-span-3">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-white text-red-600 text-sm font-medium
                         hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Unavailable Warning Banner */}
                    {unavailableReason && (
                      <div className="mt-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 shrink-0">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-red-800">
                            {unavailableReason.name} is currently unavailable
                          </p>
                          <p className="text-xs text-red-600 mt-0.5">
                            This item cannot be served due to stock or
                            availability issues.
                          </p>
                        </div>

                        <Link
                          to={`${dashboardBase}/menu/item/${unavailableReason.id}`}
                          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-red-200 text-xs font-semibold text-red-700
                         hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                        >
                          View Details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Updating..." : "Update Platter"}
        </button>
      </form>
    </div>
  );
}
