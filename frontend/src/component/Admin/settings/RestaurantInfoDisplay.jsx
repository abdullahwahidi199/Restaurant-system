import React, { useState } from "react";
import axios from "axios";
import FormInput from "./FormInput";
import LogoUpload from "./LogoUpload";
import instance from "../../../api/axiosInstance";

export default function RestaurantForm({ restaurant }) {
  const [formData, setFormData] = useState({
    name: restaurant.name || "",
    address: restaurant.address || "",
    phone: restaurant.phone || "",
    email: restaurant.email || "",
    website: restaurant.website || "",
    opening_hours: restaurant.opening_hours || "",
    facebook: restaurant.facebook || "",
    instagram: restaurant.instagram || "",
    x: restaurant.x || "",
    delivery_available: restaurant.delivery_available || false,
    logo: null,
  });
  const [previewLogo, setPreviewLogo] = useState(restaurant.logo);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleLogoChange = (file) => {
    setFormData({ ...formData, logo: file });
    setPreviewLogo(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) data.append(key, formData[key]);
      }
      const res = await instance.put("/system/restaurant-info/1/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Restaurant info updated successfully!");
      setPreviewLogo(res.data.logo);
      setFormData({ ...formData, logo: null });
    } catch (error) {
      console.error(error);
      alert("Failed to update restaurant info.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <LogoUpload logo={previewLogo} onChange={handleLogoChange} />

      <FormInput label="Name" name="name" value={formData.name} onChange={handleChange} required />
      <FormInput label="Address" name="address" value={formData.address} onChange={handleChange} required />
      <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
      <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
      <FormInput label="Website" name="website" value={formData.website} onChange={handleChange} />
      <FormInput label="Opening Hours" name="opening_hours" value={formData.opening_hours} onChange={handleChange} />
      <FormInput label="Facebook" name="facebook" value={formData.facebook} onChange={handleChange} />
      <FormInput label="Instagram" name="instagram" value={formData.instagram} onChange={handleChange} />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="delivery_available"
          checked={formData.delivery_available}
          onChange={handleChange}
          className="w-5 h-5"
        />
        <label className="font-medium">Delivery Available</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
