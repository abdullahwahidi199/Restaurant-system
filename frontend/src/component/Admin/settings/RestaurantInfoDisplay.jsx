import React, { useContext, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "./FormInput";
import LogoUpload from "./LogoUpload";
import instance from "../../../api/axiosInstance";
import RestrictedToast from "../../RistrictedAction";

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
  slogan: "",
  latitude: "",
  longitude: "",
  delivery_radius_km: "",
  base_delivery_fee: "",
  price_per_km: "",
  min_order_amount: "",
  manager_discount_limit: "",
  admin_discount_limit: "",
};

const INITIAL_BRANCH_SETTINGS = {
  receipt_header: "",
  receipt_footer: "",
  receipt_template: "",
  tax_rate: "",
  service_charge_rate: "",
  kitchen_printer: "",
  opening_hours: "",
  delivery_available: "",
  delivery_radius_km: "",
  base_delivery_fee: "",
  price_per_km: "",
  min_order_amount: "",
  cash_drawer_enabled: true,
  cash_drawer_name: "",
};

export default function RestaurantForm({ restaurant = {}, branchOnly = false }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  const BASE_URL = import.meta.env.VITE_MEDIA_URL;
  const { auth, activeBranch } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;

  const [qrCode, setQrCode] = useState(
    restaurant.qr_code ? `${BASE_URL}${restaurant.qr_code}` : null,
  );

  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    ...restaurant,
    logo: null,
  });

  const [previewLogo, setPreviewLogo] = useState(
    restaurant.logo ? `${BASE_URL}${restaurant.logo}` : null,
  );
  const [loading, setLoading] = useState(false);
  const [branchSettings, setBranchSettings] = useState(INITIAL_BRANCH_SETTINGS);
  const [branchSettingsLoaded, setBranchSettingsLoaded] = useState(false);
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

  const handleBranchSettingsChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setBranchSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "delivery_available"
            ? value === ""
              ? null
              : value === "true"
            : value,
    }));
  }, []);

  const branchPayload = () => {
    const nullableFields = new Set([
      "tax_rate",
      "service_charge_rate",
      "delivery_available",
      "delivery_radius_km",
      "base_delivery_fee",
      "price_per_km",
      "min_order_amount",
    ]);

    return Object.fromEntries(
      Object.keys(INITIAL_BRANCH_SETTINGS).map((key) => {
        const value = branchSettings[key];
        return [key, value === "" && nullableFields.has(key) ? null : value];
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDemo) {
      setShowRestriction(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res = null;

      if (!branchOnly) {
        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
          if (
            ["menu_mode", "ingredient_mode", "recipe_mode", "pricing_mode"].includes(
              key,
            )
          ) {
            return;
          }
          if (value !== null && value !== undefined && value !== "") {
            data.append(key, value);
          }
        });

        res = await instance.patch("/restaurant/restaurant/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (branchSettingsLoaded) {
        await instance.patch(
          "/restaurant/branches/active/settings/",
          branchPayload(),
        );
      }

      alert(
        branchOnly
          ? "Branch settings updated successfully!"
          : "Restaurant information updated successfully!",
      );
      if (!branchOnly && res?.data?.logo) {
        setPreviewLogo(`${BASE_URL}${res.data.logo}`);
      }
      if (!branchOnly) setFormData((prev) => ({ ...prev, logo: null }));
    } catch (err) {
      console.error(err);
      setError("Failed to update restaurant information.");
      alert("❌ Failed to update restaurant info.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setFormData({
      ...INITIAL_FORM_DATA,
      ...Object.fromEntries(
        Object.entries(restaurant).map(([key, value]) => [
          key,
          value ?? INITIAL_FORM_DATA[key] ?? "",
        ]),
      ),
      logo: null,
    });
  }, [restaurant]);

  useEffect(() => {
    let ignore = false;

    const loadBranchSettings = async () => {
      if (!activeBranch?.id) return;
      setBranchSettingsLoaded(false);
      try {
        const res = await instance.get("/restaurant/branches/active/settings/");
        if (ignore) return;
        setBranchSettings({
          ...INITIAL_BRANCH_SETTINGS,
          ...Object.fromEntries(
            Object.keys(INITIAL_BRANCH_SETTINGS).map((key) => [
              key,
              res.data?.[key] ?? INITIAL_BRANCH_SETTINGS[key] ?? "",
            ]),
          ),
        });
        setBranchSettingsLoaded(true);
      } catch (err) {
        if (!ignore) console.error(err);
      }
    };

    loadBranchSettings();

    return () => {
      ignore = true;
    };
  }, [activeBranch?.id]);

  const downloadQR = async () => {
    const response = await fetch(qrCode);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "restaurant-qr.png";
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto space-y-10"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {!branchOnly && (
        <>
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
            label={t("slogan")}
            name="slogan"
            value={formData.slogan}
            onChange={handleChange}
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

      {/* Discount Settings */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Discount Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Manager Discount Limit (%)"
            name="manager_discount_limit"
            value={formData.manager_discount_limit}
            onChange={handleChange}
            type="number"
            step="0.01"
            placeholder="10"
          />

          <FormInput
            label="Admin Discount Limit (%)"
            name="admin_discount_limit"
            value={formData.admin_discount_limit}
            onChange={handleChange}
            type="number"
            step="0.01"
            placeholder="100"
          />
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Discounts above the manager limit require admin approval.
        </p>
      </div>
        </>
      )}

      {activeBranch && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Active Branch Settings
            </h2>
            <p className="text-sm text-gray-500 mt-1">{activeBranch.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Receipt Header"
              name="receipt_header"
              value={branchSettings.receipt_header ?? ""}
              onChange={handleBranchSettingsChange}
            />
            <FormInput
              label="Kitchen Printer"
              name="kitchen_printer"
              value={branchSettings.kitchen_printer ?? ""}
              onChange={handleBranchSettingsChange}
            />
            <FormInput
              label="Tax Rate (%)"
              name="tax_rate"
              value={branchSettings.tax_rate ?? ""}
              onChange={handleBranchSettingsChange}
              type="number"
              step="0.001"
            />
            <FormInput
              label="Service Charge (%)"
              name="service_charge_rate"
              value={branchSettings.service_charge_rate ?? ""}
              onChange={handleBranchSettingsChange}
              type="number"
              step="0.001"
            />
            <FormInput
              label="Opening Hours"
              name="opening_hours"
              value={branchSettings.opening_hours ?? ""}
              onChange={handleBranchSettingsChange}
            />
            <FormInput
              label="Cash Drawer Name"
              name="cash_drawer_name"
              value={branchSettings.cash_drawer_name ?? ""}
              onChange={handleBranchSettingsChange}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Receipt Footer
              <textarea
                name="receipt_footer"
                value={branchSettings.receipt_footer ?? ""}
                onChange={handleBranchSettingsChange}
                rows={3}
                className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-600"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Receipt Template
              <textarea
                name="receipt_template"
                value={branchSettings.receipt_template ?? ""}
                onChange={handleBranchSettingsChange}
                rows={3}
                className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-600"
              />
            </label>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Delivery Availability
              <select
                name="delivery_available"
                value={
                  branchSettings.delivery_available === null ||
                  branchSettings.delivery_available === ""
                    ? ""
                    : String(branchSettings.delivery_available)
                }
                onChange={handleBranchSettingsChange}
                className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-600"
              >
                <option value="">Use Restaurant Default</option>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </label>
            <FormInput
              label="Delivery Radius (km)"
              name="delivery_radius_km"
              value={branchSettings.delivery_radius_km ?? ""}
              onChange={handleBranchSettingsChange}
              type="number"
              step="0.1"
            />
            <FormInput
              label="Base Delivery Fee"
              name="base_delivery_fee"
              value={branchSettings.base_delivery_fee ?? ""}
              onChange={handleBranchSettingsChange}
              type="number"
              step="0.01"
            />
            <FormInput
              label="Price per km"
              name="price_per_km"
              value={branchSettings.price_per_km ?? ""}
              onChange={handleBranchSettingsChange}
              type="number"
              step="0.01"
            />
            <FormInput
              label="Minimum Order Amount"
              name="min_order_amount"
              value={branchSettings.min_order_amount ?? ""}
              onChange={handleBranchSettingsChange}
              type="number"
              step="0.01"
            />
          </div>

          <label className="mt-6 flex items-center gap-3 text-sm font-medium text-gray-700">
            <input
              name="cash_drawer_enabled"
              type="checkbox"
              checked={Boolean(branchSettings.cash_drawer_enabled)}
              onChange={handleBranchSettingsChange}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
            Cash drawer enabled
          </label>
        </div>
      )}

      {!branchOnly && (
        <>
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

        {qrCode && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Restaurant QR Code
            </h2>

            <img
              src={qrCode}
              alt="QR Code"
              className="w-48 h-48 object-contain border rounded-xl p-2"
            />

            <a
              onClick={downloadQR}
              className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
            >
              Download QR Code
            </a>
          </div>
          )}
      </div>
        </>
      )}

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
