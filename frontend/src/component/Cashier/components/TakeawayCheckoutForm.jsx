import React, { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function TakeawayCheckoutForm({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const validateName = (name) => /^[A-Za-z\s]+$/.test(name);
  const validatePhone = (phone) => /^[0-9]{7,15}$/.test(phone);

  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === "ps" || i18n.language === "fa";

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "name") {
      value = value.replace(/[^A-Za-z\s]/g, "");
    }
    if (name === "phone") {
      value = value.replace(/[^0-9]/g, "");
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      return toast.error(t("checkout.errors.nameRequired"));
    }
    if (!validateName(formData.name)) {
      return toast.error(t("checkout.errors.nameInvalid"));
    }

    if (!validatePhone(formData.phone)) {
      return toast.error(t("checkout.errors.phoneInvalid"));
    }

    onSubmit(formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-overlay)]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="theme-surface relative w-80 rounded-xl p-6 shadow-lg md:w-96">
        <button
          onClick={onClose}
          className={`absolute top-3 ${
            isRTL ? "left-3" : "right-3"
          } text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]`}
        >
          ✕
        </button>
        <h2 className="mb-4 text-2xl font-bold text-[var(--theme-text-primary)]">
          {t("checkout.title")}
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder={t("checkout.name")}
            value={formData.name}
            onChange={handleChange}
            className="theme-input w-full p-2"
          />

          <input
            type="text"
            name="phone"
            placeholder={t("checkout.phone")}
            value={formData.phone}
            onChange={handleChange}
            className="theme-input w-full p-2"
          />

          <button
            onClick={handleSubmit}
            className="theme-btn theme-btn-primary w-full rounded-full py-2"
          >
            {t("checkout.placeOrder")}
          </button>
        </div>
      </div>
    </div>
  );
}
