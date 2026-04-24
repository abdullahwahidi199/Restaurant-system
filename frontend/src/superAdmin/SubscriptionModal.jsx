import React, { useState, useEffect } from "react";

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSave,
  restaurant,
}) {
  const [formData, setFormData] = useState({
    starts_at: "",
    expires_at: "",
    is_active: true,
  });
  const [existingSubId, setExistingSubId] = useState(null);

  useEffect(() => {
    if (restaurant && restaurant.subscription) {
      // If subscription exists, populate form
      setFormData({
        starts_at: restaurant.subscription.starts_at || "",
        expires_at: restaurant.subscription.expires_at || "",
        is_active: restaurant.subscription.is_active ?? true,
      });
      setExistingSubId(restaurant.subscription.id);
    } else {
      // Reset for new subscription
      setFormData({ starts_at: "", expires_at: "", is_active: true });
      setExistingSubId(null);
    }
  }, [restaurant, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Payload needs restaurant ID if creating new
    const payload = {
      ...formData,
      restaurant: restaurant.id,
    };
    onSave(payload, existingSubId);
  };

  if (!isOpen || !restaurant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-2">Manage Subscription</h2>
        <p className="text-sm text-gray-500 mb-4">For: {restaurant.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="starts_at"
              value={formData.starts_at}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              type="date"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
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
              Subscription Active
            </label>
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
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {existingSubId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
