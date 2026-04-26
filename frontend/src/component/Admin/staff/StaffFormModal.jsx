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
    vehicle_number: "",
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
        password: "",
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
      console.log(data);
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
      setShifts([]);
    }
  };

  useEffect(() => {
    getShifts();
  }, []);

  if (!open) return null;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="relative bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
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
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-400 mb-4">
              {t("staff.form.personal_info") || "Personal Information"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("staff.form.full_name")}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  name="name"
                  placeholder={t("staff.form.full_name")}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("staff.form.email")}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder={t("staff.form.email")}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("staff.form.phone")}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  name="phone"
                  placeholder={t("staff.form.phone")}
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  required
                />
              </div>

              {/* Hire Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("staff.form.hire_date") || "Hire Date"}
                </label>
                <input
                  name="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("staff.form.profile_image") || "Profile Image"}
                </label>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Job Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-400 mb-4">
              {t("staff.form.job_details") || "Job Details"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("staff.form.role") || "Role"}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  required
                >
                  <option value="">{t("staff.form.select_role")}</option>
                  <option value="Admin">{t("staff.roles.admin")}</option>
                  <option value="Kitchen_manager">Kitchen Manager</option>
                  <option value="Cashier">{t("staff.roles.cashier")}</option>
                  <option value="Waiter">{t("staff.roles.waiter")}</option>
                  <option value="DeliveryBoy">
                    {t("staff.roles.delivery")}
                  </option>
                  <option value="Other">{t("staff.roles.other")}</option>
                </select>
              </div>

              {/* Shift */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("staff.form.shift") || "Shift"}
                </label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  <option value="">{t("staff.form.select_shift")}</option>
                  {Array.isArray(shifts) &&
                    shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.shift_type} ({shift.start_time} -{" "}
                        {shift.end_time})
                      </option>
                    ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("staff.form.status") || "Status"}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  <option value="Active">{t("staff.status.active")}</option>
                  <option value="Inactive">{t("staff.status.inactive")}</option>
                  <option value="Resigned">{t("staff.status.resigned")}</option>
                </select>
              </div>

              {/* Custom Role (if Other is selected) */}
              {formData.role === "Other" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("staff.form.custom_role")}
                  </label>
                  <input
                    name="custom_role"
                    placeholder={t("staff.form.custom_role")}
                    value={formData.custom_role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
              )}

              {/* Vehicle Number (if DeliveryBoy is selected) */}
              {formData.role === "DeliveryBoy" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("staff.vehicle") || "Vehicle Number"}
                  </label>
                  <input
                    type="text"
                    placeholder={t("staff.vehicle")}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={handleChange}
                    value={formData.vehicle_number}
                    name="vehicle_number"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Account Credentials Section */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-400 mb-4">
              {t("staff.form.account_credentials") || "Account Credentials"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("staff.form.username")}
                </label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  placeholder={t("staff.form.username")}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("staff.form.password")}
                  {!editingStaff && <span className="text-red-400"> *</span>}
                </label>
                <input
                  name="password"
                  value={formData.password}
                  placeholder={
                    editingStaff
                      ? t("staff.form.password_optional") ||
                        "Leave blank to keep current"
                      : t("staff.form.password")
                  }
                  onChange={handleChange}
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-2.5 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-700 transition font-medium"
            >
              {t("staff.cancel")}
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 transition"
            >
              {editingStaff ? t("staff.update") : t("staff.add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
