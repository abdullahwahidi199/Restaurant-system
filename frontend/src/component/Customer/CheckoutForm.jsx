import React, { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function CheckoutForm({ user, onSubmit, onClose }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ps" || i18n.language === "fa";

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.username || "",
    phone: user?.phone || "",
    address: user?.address || "",
    email: user?.email || "",
    otp: "",
  });

  const [errors, setErrors] = useState({});

  const validateName = (name) => /^[A-Za-z\s]{2,50}$/.test(name.trim());
  const validatePhone = (phone) => /^[0-9]{7,15}$/.test(phone);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "name") value = value.replace(/[^A-Za-z\s]/g, "");
    if (name === "phone") value = value.replace(/[^0-9]/g, "");

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    let newErrors = {};

    if (!user && !validateName(formData.name))
      newErrors.name = t("checkout.errors.nameInvalid");

    if (!validatePhone(formData.phone))
      newErrors.phone = t("checkout.errors.phoneInvalid");

    if (formData.address.trim().length < 5)
      newErrors.address = t("checkout.errors.addressInvalid");

    if (!validateEmail(formData.email))
      newErrors.email = t("checkout.errors.emailInvalid");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!validate()) return;

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err) {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-[#111] p-6 rounded-xl w-80 md:w-96 relative">
        <button
          onClick={onClose}
          className={`absolute top-3 ${isRTL ? "left-3" : "right-3"}`}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-4">
          {t("checkout.title")}
        </h2>

        <div className="space-y-3">
          {!user && (
            <>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("checkout.name")}
                className="w-full p-2 rounded bg-black text-white"
              />
              {errors.name && <p className="text-red-400">{errors.name}</p>}
            </>
          )}

          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t("checkout.phone")}
            className="w-full p-2 rounded bg-black text-white"
          />
          {errors.phone && <p className="text-red-400">{errors.phone}</p>}

          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder={t("checkout.address")}
            className="w-full p-2 rounded bg-black text-white"
          />
          {errors.address && <p className="text-red-400">{errors.address}</p>}

          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("checkout.email")}
            className="w-full p-2 rounded bg-black text-white"
          />
          {errors.email && <p className="text-red-400">{errors.email}</p>}

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-red-500 py-2 rounded text-white"
          >
            {loading ? "Placing..." : t("checkout.placeOrder")}
          </button>
        </div>
      </div>
    </div>
  );
}
