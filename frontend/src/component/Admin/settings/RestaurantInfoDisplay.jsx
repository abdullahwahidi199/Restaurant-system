import React, { useContext, useState } from "react";
import axios from "axios";
import FormInput from "./FormInput";
import LogoUpload from "./LogoUpload";
import instance from "../../../api/axiosInstance";
import RestrictedToast from "../../RistrictedAction";
import { AuthContext } from "../../../api/authforRBC";
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  const [showRestriction,setShowRestriction]=useState(false)
  
  const {auth}=useContext(AuthContext)
  const isDemo=auth?.user?.isDemo;
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
    if (isDemo){
      setShowRestriction(true);
      return
    }
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
    <form onSubmit={handleSubmit} className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <LogoUpload logo={previewLogo} onChange={handleLogoChange} />

      <FormInput label={t("name")} name="name" value={formData.name} onChange={handleChange} required />
      <FormInput label={t("address")} name="address" value={formData.address} onChange={handleChange} required />
      <FormInput label={t("phone")}  name="phone" value={formData.phone} onChange={handleChange} />
      <FormInput label={t("email")} name="email" value={formData.email} onChange={handleChange} type="email" />
      <FormInput label={t("website")} name="website" value={formData.website} onChange={handleChange} />
      <FormInput label={t("opening_hours")} name="opening_hours" value={formData.opening_hours} onChange={handleChange} />
      <FormInput label={t("facebook")} name="facebook" value={formData.facebook} onChange={handleChange} />
      <FormInput label={t("instagram")} name="instagram" value={formData.instagram} onChange={handleChange} />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="delivery_available"
          checked={formData.delivery_available}
          onChange={handleChange}
          className="w-5 h-5"
        />
        <label className="font-medium">{t("delivery_available")}</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
      >
        {loading ? t("saving") : t("save_changes")}
      </button>
      {showRestriction&&(
        <RestrictedToast actionType="update" onClose={()=>setShowRestriction(false)}/>
      )}
    </form>
  );
}
