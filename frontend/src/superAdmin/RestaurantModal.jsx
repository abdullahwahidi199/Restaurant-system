import React, { useState, useEffect } from "react";

export default function RestaurantModal({ isOpen, onClose, onSave, editData }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    is_active: true,

    // 🔥 NEW ADMIN FIELDS
    admin_name: "",
    admin_email: "",
    admin_phone: "",
    admin_password: "",
  });
  const [logo, setLogo] = useState(null);

  // Populate form if editing
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        email: editData.email || "",
        phone: editData.phone || "",
        address: editData.address || "",
        is_active: editData.is_active ?? true,

        admin_name: "",
        admin_email: "",
        admin_phone: "",
        admin_password: "",
      });
      setLogo(null);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        is_active: true,

        admin_name: "",
        admin_email: "",
        admin_phone: "",
        admin_password: "",
      });
      setLogo(null);
    }
  }, [editData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setLogo(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    // Restaurant fields
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("address", formData.address);
    data.append("is_active", formData.is_active);

    // Admin fields 🔥
    data.append("admin_name", formData.admin_name);
    data.append("admin_email", formData.admin_email);
    data.append("admin_phone", formData.admin_phone);
    data.append("admin_password", formData.admin_password);

    // Logo
    if (logo) {
      data.append("logo", logo);
    }

    onSave(data, editData?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-auto bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editData ? "Edit Restaurant" : "Add New Restaurant"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Is Active
            </label>
          </div>
          <div className="border p-3 rounded bg-gray-50 mb-4">
            <h3 className="text-sm font-semibold mb-2">Restaurant Admin</h3>

            <input
              type="text"
              name="admin_name"
              placeholder="Admin Name"
              value={formData.admin_name}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-2"
              required
            />

            <input
              type="email"
              name="admin_email"
              placeholder="Admin Email"
              value={formData.admin_email}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-2"
              required
            />

            <input
              type="text"
              name="admin_phone"
              placeholder="Admin Phone"
              value={formData.admin_phone}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-2"
            />

            <input
              type="password"
              name="admin_password"
              placeholder="Password (optional)"
              value={formData.admin_password}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
