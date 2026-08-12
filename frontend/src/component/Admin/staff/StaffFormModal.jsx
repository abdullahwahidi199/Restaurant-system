import React, { useContext, useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, X } from "lucide-react";
import { AuthContext } from "../../../api/authforRBC";

export default function StaffFormModal({
  open,
  closeModal,
  addStaff,
  updateStaff,
  editingStaff,
}) {
  const { t, i18n } = useTranslation();
  const { auth, activeBranch } = useContext(AuthContext);
  const isRTL = i18n.language !== "en";
  const canManageAdminRoles = auth?.user?.role === "Admin";
  const [showPassword, setShowPassword] = useState(false);

  const [availableStations, setAvailableStations] = useState([]);
  const [selectedStations, setSelectedStations] = useState([]);

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
    salary_type: "monthly",
    payroll_base_salary: "",
    payment_day: 1,
    payroll_allowances: "",
    payroll_deductions: "",
    overtime_rate: "",
    payroll_notes: "",
    is_payroll_active: true,
  });

  const [error, setError] = useState("");
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    if (editingStaff) {
      setSelectedStations(editingStaff.stations || []);
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
        salary_type: editingStaff.salary_type || "monthly",
        payroll_base_salary: editingStaff.payroll_base_salary ?? "",
        payment_day: editingStaff.payment_day || 1,
        payroll_allowances: editingStaff.payroll_allowances ?? "",

        payroll_deductions: editingStaff.payroll_deductions ?? "",
        overtime_rate: editingStaff.overtime_rate ?? "",
        payroll_notes: editingStaff.payroll_notes || "",
        is_payroll_active: editingStaff.is_payroll_active !== false,
      });
    } else {
      setSelectedStations([]);
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
        salary_type: "monthly",
        payroll_base_salary: "",
        payment_day: 1,
        payroll_allowances: "",
        payroll_deductions: "",
        overtime_rate: "",
        payroll_notes: "",
        is_payroll_active: true,
      });
    }
    setError("");
  }, [editingStaff, open]);

  const handleChange = (e) => {
    const { name, value, files, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  const handleStationToggle = (stationId) => {
    setSelectedStations((prev) =>
      prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId],
    );
  };

  const formatApiError = (detail) => {
    if (!detail) return t("staff.errors.save_failed", "Could not save staff.");
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.join(" ");
    if (typeof detail === "object") {
      return Object.entries(detail)
        .map(([field, messages]) => {
          const text = Array.isArray(messages) ? messages.join(" ") : messages;
          return `${field}: ${text}`;
        })
        .join(" ");
    }
    return t("staff.errors.save_failed", "Could not save staff.");
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

    const decimalFields = new Set([
      "payroll_base_salary",
      "payroll_allowances",
      "payroll_deductions",
      "overtime_rate",
    ]);
    const integerFields = new Set(["payment_day"]);
    const optionalTextFields = new Set([
      "username",
      "password",
      "payroll_notes",
    ]);
    const data = new FormData();

    for (const key in formData) {
      const value = formData[key];

      if (key === "image" && !value) continue;
      if (value === null || value === undefined) continue;

      if (decimalFields.has(key)) {
        data.append(key, value === "" ? "0" : String(value).trim());
        continue;
      }

      if (integerFields.has(key)) {
        data.append(key, value === "" ? "1" : String(value));
        continue;
      }

      if (typeof value === "boolean") {
        data.append(key, value ? "true" : "false");
        continue;
      }

      if (value === "" && optionalTextFields.has(key)) continue;
      if (value !== "") {
        data.append(key, value);
      }
      selectedStations.forEach((stationId) => {
        data.append("stations", stationId);
      });
    }

    try {
      if (editingStaff) await updateStaff(editingStaff.id, data);
      else await addStaff(data);
      closeModal();
    } catch (err) {
      setError(formatApiError(err.response?.data || err.message));
    }
  };

  const getStations = async () => {
    try {
      const res = await instance.get("/menu/stations/"); // Adjust endpoint to your station API
      const data = res.data?.results || res.data || [];
      setAvailableStations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load kitchen stations:", err);
      setAvailableStations([]);
    }
  };
  const getShifts = async () => {
    try {
      const res = await instance.get("/users/shift/");
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
    if (open) {
      getShifts();
      getStations();
    }
  }, [open, activeBranch?.id]);

  if (!open) return null;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6 backdrop-blur-sm animate-fade-in ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {editingStaff ? t("staff.edit") : t("staff.add")}
          </h2>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg p-2 text-[0px] text-gray-500 transition hover:bg-white hover:text-gray-900"
            aria-label={t("common.close", "Close")}
          >
            <X size={22} />✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-gray-900">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("staff.form.personal_info") || "Personal Information"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("staff.form.full_name")}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  name="name"
                  placeholder={t("staff.form.full_name")}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("staff.form.email")}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder={t("staff.form.email")}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("staff.form.phone")}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  name="phone"
                  placeholder={t("staff.form.phone")}
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Hire Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("staff.form.hire_date") || "Hire Date"}
                </label>
                <input
                  name="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("staff.form.profile_image") || "Profile Image"}
                </label>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700"
                />
              </div>
            </div>
          </div>

          {/* Job Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("staff.form.job_details") || "Job Details"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("staff.form.role") || "Role"}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">{t("staff.form.select_role")}</option>
                  {canManageAdminRoles && (
                    <>
                      <option value="Admin">{t("staff.roles.admin")}</option>
                      <option value="BranchAdmin">Branch Admin</option>
                    </>
                  )}
                  <option value="Manager">
                    {t("staff.roles.manager") || "Manager"}
                  </option>
                  <option value="Kitchen_manager">Kitchen Manager</option>
                  <option value="InventoryManager">Inventory Manager</option>
                  <option value="FinanceManager">Finance Manager</option>
                  <option value="OperationsManager">Operations Manager</option>
                  <option value="Cashier">{t("staff.roles.cashier")}</option>
                  <option value="Call_operator">Call Operator</option>
                  <option value="Waiter">{t("staff.roles.waiter")}</option>
                  <option value="DeliveryBoy">
                    {t("staff.roles.delivery")}
                  </option>
                  <option value="Other">{t("staff.roles.other")}</option>
                </select>
              </div>
              {formData.role === "Kitchen_manager" && (
                <div className="md:col-span-2 bg-indigo-50/60 p-4 rounded-xl border border-indigo-200">
                  <label className="block text-sm font-semibold text-indigo-900 mb-2">
                    {t("staff.form.assign_stations", "Assign Kitchen Stations")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-indigo-700 mb-3">
                    Select which stations this Kitchen Manager will see and
                    manage orders for:
                  </p>

                  {availableStations.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No stations found. Default Main Kitchen will be assigned.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availableStations.map((st) => {
                        const isChecked = selectedStations.includes(st.id);
                        return (
                          <label
                            key={st.id}
                            onClick={() => handleStationToggle(st.id)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                              isChecked
                                ? "bg-emerald-100 border-emerald-600 shadow-sm ring-2 ring-emerald-500 text-emerald-950 font-bold"
                                : "bg-white/80 border-gray-200 hover:bg-white text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="block text-sm truncate">
                                {st.name}
                              </span>
                              {st.is_default && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] uppercase font-extrabold tracking-wider bg-emerald-200/80 text-emerald-900">
                                  Default
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Shift */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("staff.form.shift") || "Shift"}
                </label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("staff.form.status") || "Status"}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">{t("staff.status.active")}</option>
                  <option value="Inactive">{t("staff.status.inactive")}</option>
                  <option value="Resigned">{t("staff.status.resigned")}</option>
                </select>
              </div>

              {/* Custom Role (if Other is selected) */}
              {formData.role === "Other" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("staff.form.custom_role")}
                  </label>
                  <input
                    name="custom_role"
                    placeholder={t("staff.form.custom_role")}
                    value={formData.custom_role}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Vehicle Number (if DeliveryBoy is selected) */}
              {formData.role === "DeliveryBoy" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("staff.vehicle") || "Vehicle Number"}
                  </label>
                  <input
                    type="text"
                    placeholder={t("staff.vehicle")}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    onChange={handleChange}
                    value={formData.vehicle_number}
                    name="vehicle_number"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Salary Profile Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Salary Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Type
                </label>
                <select
                  name="salary_type"
                  value={formData.salary_type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Salary
                </label>
                <input
                  name="payroll_base_salary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.payroll_base_salary}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Day
                </label>
                <input
                  name="payment_day"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.payment_day}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowances
                </label>
                <input
                  name="payroll_allowances"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.payroll_allowances}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deductions
                </label>
                <input
                  name="payroll_deductions"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.payroll_deductions}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overtime Rate
                </label>
                <input
                  name="overtime_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.overtime_rate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payroll Notes
                </label>
                <textarea
                  name="payroll_notes"
                  value={formData.payroll_notes}
                  onChange={handleChange}
                  className="min-h-24 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <label className="md:col-span-2 flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700">
                <input
                  name="is_payroll_active"
                  type="checkbox"
                  checked={formData.is_payroll_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Active Payroll Status
              </label>
            </div>
          </div>

          {/* Account Credentials Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("staff.form.account_credentials") || "Account Credentials"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("staff.form.username")}
                </label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  placeholder={t("staff.form.username")}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Password */}
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("staff.form.password")}
                  {!editingStaff && <span className="text-red-400"> *</span>}
                </label>

                <div className="relative">
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
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 ${
                      isRTL ? "left-4" : "right-4"
                    }`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-white transition font-medium"
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
