import React, { useContext, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "./FormInput";
import LogoUpload from "./LogoUpload";
import instance from "../../../api/axiosInstance";

import { AuthContext } from "../../../api/authforRBC";

const INITIAL_FORM_DATA = {
  name: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  facebook: "",
  instagram: "",
  x: "",
  delivery_available: false,
  logo: null,
  latitude: "",
  longitude: "",
  delivery_radius_km: "",
  base_delivery_fee: "",
  price_per_km: "",
  min_order_amount: "",
};

export default function RestaurantForm({ restaurant = {} }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;

  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    ...restaurant,
    logo: null,
  });

  const [previewLogo, setPreviewLogo] = useState(
    restaurant.logo ? `${BASE_URL}${restaurant.logo}` : null,
  );
  const [loading, setLoading] = useState(false);
  const [showRestriction, setShowRestriction] = useState(false);
  const [error, setError] = useState(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewLogo && previewLogo.startsWith("blob:")) {
        URL.revokeObjectURL(previewLogo);
      }
    };
  }, [previewLogo]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleLogoChange = useCallback((file) => {
    setFormData((prev) => ({ ...prev, logo: file }));
    setPreviewLogo(URL.createObjectURL(file));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDemo) {
      setShowRestriction(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          data.append(key, value);
        }
      });

      const res = await instance.patch("/restaurant/restaurant/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Restaurant information updated successfully!"); // Replace with toast later
      setPreviewLogo(`${BASE_URL}${res.data.logo}`);
      setFormData((prev) => ({ ...prev, logo: null }));
    } catch (err) {
      console.error(err);
      setError("Failed to update restaurant information.");
      alert("❌ Failed to update restaurant info.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto space-y-10"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Logo Upload */}
      <div className="flex justify-center mb-8">
        <LogoUpload logo={previewLogo} onChange={handleLogoChange} />
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {t("basic_information")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label={t("name")}
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormInput
            label={t("phone")}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="tel"
          />
          <FormInput
            label={t("email")}
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
          />
          <FormInput
            label={t("website")}
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {t("location")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label={t("address")}
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            type="number"
            step="any"
            placeholder="33.9391"
          />
          <FormInput
            label="Longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            type="number"
            step="any"
            placeholder="67.7097"
          />
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {t("delivery_settings")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Delivery Radius (km)"
            name="delivery_radius_km"
            value={formData.delivery_radius_km}
            onChange={handleChange}
            type="number"
            step="0.1"
          />
          <FormInput
            label="Base Delivery Fee"
            name="base_delivery_fee"
            value={formData.base_delivery_fee}
            onChange={handleChange}
            type="number"
            step="0.01"
          />
          <FormInput
            label="Price per km"
            name="price_per_km"
            value={formData.price_per_km}
            onChange={handleChange}
            type="number"
            step="0.01"
          />
          <FormInput
            label="Minimum Order Amount"
            name="min_order_amount"
            value={formData.min_order_amount}
            onChange={handleChange}
            type="number"
            step="0.01"
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <input
            type="checkbox"
            id="delivery_available"
            name="delivery_available"
            checked={formData.delivery_available}
            onChange={handleChange}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
          />
          <label
            htmlFor="delivery_available"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            {t("delivery_available")}
          </label>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {t("social_media")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label={t("facebook")}
            name="facebook"
            value={formData.facebook}
            onChange={handleChange}
            placeholder="https://facebook.com/..."
          />
          <FormInput
            label={t("instagram")}
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            placeholder="https://instagram.com/..."
          />
          <FormInput
            label="X (Twitter)"
            name="x"
            value={formData.x}
            onChange={handleChange}
            placeholder="https://x.com/..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-10 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        >
          {loading ? t("saving") : t("save_changes")}
        </button>
      </div>

      {showRestriction && (
        <RestrictedToast
          actionType="update"
          onClose={() => setShowRestriction(false)}
        />
      )}
    </form>
  );
}
