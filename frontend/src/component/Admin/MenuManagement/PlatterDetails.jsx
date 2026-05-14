import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../../../api/axiosInstance";

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
    is_available: true,
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
        is_available: res.data.is_available,
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

    updatedItems[index][field] = value;

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

      // normal JSON payload
      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        is_available: formData.is_available,

        items: formData.items.map((item) => ({
          menu_item: Number(item.menu_item),
          quantity: Number(item.quantity),
        })),
      };

      // if image exists use FormData
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
  if (loading) {
    return <div className="p-5">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-6">Update Platter</h1>

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>
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
            name="is_available"
            checked={formData.is_available}
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
            {formData.items.map((item, index) => (
              <div
                key={index}
                className="border p-4 rounded grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* menu item */}
                <div>
                  <label className="block mb-2 font-medium">Menu Item</label>

                  <select
                    value={item.menu_item}
                    onChange={(e) =>
                      handleItemChange(index, "menu_item", e.target.value)
                    }
                    className="w-full border p-3 rounded"
                  >
                    <option value="">Select Menu Item</option>

                    {menuItems.map((menuItem) => (
                      <option key={menuItem.id} value={menuItem.id}>
                        {menuItem.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Quantity</label>

                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    className="w-full border p-3 rounded"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="bg-red-500 text-white px-4 py-3 rounded w-full"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
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
