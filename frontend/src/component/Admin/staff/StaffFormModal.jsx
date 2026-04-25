import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";

export default function StaffFormModal({
  open,
  closeModal,
  addStaff,
  updateStaff,
  editingStaff,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    hire_date: "",
    status: "Active",
    custom_role: "",
    image: null,
    username: "",
    password: "",
    shift: "",
  });

  const [error, setError] = useState("");
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        name: editingStaff.name || "",
        role: editingStaff.role || "",
        email: editingStaff.email || "",
        phone: editingStaff.phone || "",
        hire_date: editingStaff.hire_date || "",
        status: editingStaff.status || "Active",
        custom_role: editingStaff.custom_role || "",
        image: null,
        vehicle_number: editingStaff.vehicle_number || "",
        shift: editingStaff.shift || "",
        username: editingStaff.username || "",
        password: editingStaff.password || "",
      });
    } else {
      setFormData({
        name: "",
        role: "",
        email: "",
        phone: "",
        hire_date: "",
        status: "Active",
        custom_role: "",
        vehicle_number: "",
        image: null,
        shift: "",
        username: "",
        password: "",
      });
    }
    setError("");
  }, [editingStaff, open]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.role ||
      !formData.email ||
      !formData.phone
    ) {
      setError(t("staff.errors.required"));
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      if (formData[key]) data.append(key, formData[key]);
    }

    if (editingStaff) await updateStaff(editingStaff.id, data);
    else await addStaff(data);
    closeModal();
  };

  const getShifts = async () => {
    try {
      const res = await instance("/users/shift");

      const data = res.data;

      // 👇 normalize response into array
      const shiftArray = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.data)
            ? data.data
            : [];

      setShifts(shiftArray);
    } catch (error) {
      console.error("Failed to load shifts:", error);
      setShifts([]); // prevent crash
    }
  };

  useEffect(() => {
    getShifts();
  }, []);
  if (!open) return null;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in  ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="relative bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-100">
            {editingStaff ? t("staff.edit") : t("staff.add")}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-200 transition text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder={t("staff.form.full_name")}
              value={formData.name}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              name="email"
              type="email"
              placeholder={t("staff.form.email")}
              value={formData.email}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              name="phone"
              placeholder={t("staff.form.phone")}
              value={formData.phone}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              name="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">{t("staff.form.select_shift")}</option>
              {Array.isArray(shifts) &&
                shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.shift_type} ({shift.start_time} - {shift.end_time})
                  </option>
                ))}
            </select>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">{t("staff.form.select_role")}</option>
              <option value="Admin">{t("staff.roles.admin")}</option>
              <option value="Kitchen_manager">Kitchen manager</option>
              <option value="Cashier">{t("staff.roles.cashier")}</option>
              <option value="Waiter">{t("staff.roles.waiter")}</option>
              <option value="DeliveryBoy">{t("staff.roles.delivery")}</option>
              <option value="Other">{t("staff.roles.other")}</option>
            </select>

            {formData.role === "DeliveryBoy" && (
              <input
                type="number"
                placeholder={t("staff.vehicle")}
                className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                onChange={handleChange}
                value={formData.vehicle_number}
                name="vehicle_number"
              />
            )}
          </div>

          {formData.role === "Other" && (
            <input
              name="custom_role"
              placeholder={t("staff.form.custom_role")}
              value={formData.custom_role}
              onChange={handleChange}
              className="input-field w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Active">{t("staff.status.active")}</option>
              <option value="Inactive">{t("staff.status.inactive")}</option>
              <option value="Resigned">{t("staff.status.resigned")}</option>
            </select>

            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="input-field px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 outline-none"
            />
          </div>

          <div>
            <p>{t("staff.form.create_account")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="username"
                type="text"
                value={formData.username}
                placeholder={t("staff.form.username")}
                onChange={handleChange}
                className="input-field px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 outline-none"
              />
              <input
                name="password"
                value={formData.password}
                placeholder={t("staff.form.password")}
                onChange={handleChange}
                type="password"
                className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
            >
              {t("staff.cancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition"
            >
              {editingStaff ? t("staff.update") : t("staff.add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
