import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import instance from "../../../api/axiosInstance";
import Select from "react-select";

export default function PlatterDetails() {
  const { id } = useParams();

  const [platterDetails, setPlatterDetails] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    is_manually_available: true,
    items: [],
    image: "",
  });

  // fetch platter details
  const fetchPlatterDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await instance.get(`/menu/platters/${id}/`);

      setPlatterDetails(res.data);

      setFormData({
        name: res.data.name || "",
        description: res.data.description || "",
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

  // fetch menu items
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

  // handle normal inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // handle platter item change
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    updatedItems[index][field] = field === "menu_item" ? Number(value) : value;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // add new platter item
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

  // remove item
  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // update platter
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        description: formData.description,
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
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-red-500" />
            <span className="font-semibold text-red-700 text-sm uppercase tracking-wide">
              Currently Unavailable
            </span>
          </div>

          {/* Manual toggle off */}
          {!isManuallyAvailable && (
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
                This platter has been{" "}
                <strong>manually marked unavailable</strong>.
              </span>
            </div>
          )}

          {/* Menu item unavailability reasons */}
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
                      to={`/admin/dashboard/menu/item/${reason.id}`}
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

      {/* Available status */}
      {finalAvailability && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-2 mb-6">
          <span className="flex h-3 w-3 rounded-full bg-green-500" />
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
        {/* name */}
        <div>
          <label className="block mb-2 font-semibold">Name</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />
        </div>

        {/* description */}
        <div>
          <label className="block mb-2 font-semibold">Description</label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-3 rounded"
            rows={4}
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
              className="bg-black text-white px-4 py-2 rounded"
            >
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
                  className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                    unavailableReason
                      ? "border-red-300 shadow-sm shadow-red-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className={`flex items-center justify-between px-4 py-2.5 ${
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
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      {/* Menu Item Select — wider */}
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
                          styles={{
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Unavailable Warning Banner */}
                    {unavailableReason && (
                      <div className="mt-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-red-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
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
                          to={`/admin/dashboard/menu/item/${unavailableReason.id}`}
                          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-red-200 text-xs font-semibold text-red-700
                         hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                        >
                          View Details
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
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
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          {saving ? "Updating..." : "Update Platter"}
        </button>
      </form>
    </div>
  );
}
