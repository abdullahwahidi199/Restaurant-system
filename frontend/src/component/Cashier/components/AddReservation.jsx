import React, { useEffect, useState, useMemo, useCallback } from "react";
import instance from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import { useTranslation as useAutoTranslation } from "react-i18next";

// ─── STATUS BADGE ─────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    available: "bg-green-100 text-green-700",
    occupied: "bg-red-100 text-red-700",
    reserved: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────
export default function AddReservation({ onClose, onReservationSaved }) {
                 const { t: autoT } = useAutoTranslation();
  const [tables, setTables] = useState([]);
  const [existingReservations, setExistingReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    table: "",
    customer_name: "",
    phone: "",
    guests: 1,
    reservation_date: "",
    start_time: "",
    duration_minutes: 60,
    reservation_type: "free",
    paid_amount: 0,
    notes: "",
  });

  // ── Load Tables ──
  useEffect(() => {
    fetchTables();
  }, []);

  const sortTables = (tables) => {
    return [...tables].sort((a, b) => {
      const extractNumber = (name) => {
        const match = String(name).match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
      };

      const numA = extractNumber(a.name);
      const numB = extractNumber(b.name);

      if (numA !== null && numB !== null) return numA - numB;
      if (numA !== null) return -1;
      if (numB !== null) return 1;

      return a.name.localeCompare(b.name);
    });
  };

  const fetchTables = async () => {
    try {
      const res = await instance.get("orders/tables/");
      setTables(sortTables(res.data));
    } catch {
      toast.error(autoT("legacy.failed_to_load_tables_19fe4c0c"));
    }
  };

  // ── Fetch Existing Reservations When Table + Date Change ──
  useEffect(() => {
    if (form.table && form.reservation_date) {
      fetchExistingReservations(form.table, form.reservation_date);
    } else {
      setExistingReservations([]);
    }
  }, [form.table, form.reservation_date]);

  const fetchExistingReservations = async (tableId, date) => {
    try {
      const res = await instance.get(
        `orders/reservations/?table=${tableId}&date=${date}&status=reserved&paginate=false`,
      );
      setExistingReservations(res.data.results || res.data);
    } catch {
      setExistingReservations([]);
    }
  };

  // ── Selected Table Object ──
  const selectedTable = useMemo(
    () => tables.find((t) => t.id === Number(form.table)),
    [tables, form.table],
  );

  // ── Computed End Time ──
  const endTimePreview = useMemo(() => {
    if (!form.start_time || !form.duration_minutes) return null;
    const start = new Date(form.start_time);
    if (isNaN(start)) return null;
    const end = new Date(start.getTime() + form.duration_minutes * 60000);
    return end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [form.start_time, form.duration_minutes]);

  // ── Computed Estimated Price ──
  const estimatedPrice = useMemo(() => {
    if (!selectedTable || !form.duration_minutes) return null;
    if (form.reservation_type === "free") return 0;

    const pricePerHour = parseFloat(selectedTable.price_per_hour);
    if (!pricePerHour) return 0;

    const billedHours = Math.ceil(form.duration_minutes / 60);
    return billedHours * pricePerHour;
  }, [selectedTable, form.duration_minutes, form.reservation_type]);

  // ── Today's date for min ──
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  // ── Handlers ──
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFieldErrors((prev) => ({ ...prev, [name]: null }));

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-sync reservation_date when start_time changes
      if (name === "start_time" && value) {
        const dateStr = value.split("T")[0];
        if (dateStr) updated.reservation_date = dateStr;
      }

      // Reset paid_amount when switching away from prepaid
      if (name === "reservation_type" && value !== "prepaid") {
        updated.paid_amount = 0;
      }

      return updated;
    });
  }, []);

  const handleTableChange = useCallback(
    (e) => {
      const tableId = e.target.value;
      const selected = tables.find((t) => t.id === Number(tableId));

      setFieldErrors({});

      setForm((prev) => ({
        ...prev,
        table: tableId,
        reservation_type:
          selected && selected.allow_free_reservation ? "free" : "fee",
        guests: selected
          ? Math.min(prev.guests || 1, selected.capacity)
          : prev.guests,
      }));
    },
    [tables],
  );

  // ── Frontend Validation ──
  const validateForm = () => {
    const errs = {};

    if (!form.table) errs.table = "Please select a table";
    if (!form.customer_name.trim())
      errs.customer_name = "Customer name is required";
    if (!form.start_time) errs.start_time = "Start time is required";
    if (!form.reservation_date)
      errs.reservation_date = "Reservation date is required";

    if (form.duration_minutes < 30)
      errs.duration_minutes = "Minimum 30 minutes";

    if (selectedTable && form.guests > selectedTable.capacity) {
      errs.guests = `Max capacity is ${selectedTable.capacity}`;
    }

    // Check past time
    if (form.start_time) {
      const startDate = new Date(form.start_time);
      if (startDate < new Date()) {
        errs.start_time = "Cannot create reservation in the past";
      }
    }

    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      const first = Object.values(errs)[0];
      toast.error(first);
      return false;
    }
    return true;
  };

  // ── Parse Backend Errors ──
  const parseBackendErrors = (data) => {
    if (!data) return;

    if (typeof data === "string") {
      toast.error(data);
      return;
    }

    if (data.detail) {
      toast.error(data.detail);
      return;
    }

    if (Array.isArray(data)) {
      data.forEach((msg) => toast.error(msg));
      return;
    }

    // Field-specific errors from DRF
    const errs = {};
    Object.entries(data).forEach(([field, messages]) => {
      const msgList = Array.isArray(messages) ? messages : [messages];
      errs[field] = msgList[0];

      msgList.forEach((msg) => {
        const label =
          field === "non_field_errors" ? "" : `${field.replace(/_/g, " ")}: `;
        toast.error(`${label}${msg}`);
      });
    });
    setFieldErrors((prev) => ({ ...prev, ...errs }));
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setFieldErrors({});

    try {
      const payload = {
        ...form,
        guests: Number(form.guests),
        duration_minutes: Number(form.duration_minutes),
        paid_amount: Number(form.paid_amount),
        start_time: new Date(form.start_time).toISOString(),
      };

      await instance.post("orders/reservations/", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      toast.success(autoT("legacy.reservation_created_successfully_f8bc8ae0"));

      setForm({
        table: "",
        customer_name: "",
        phone: "",
        guests: 1,
        reservation_date: "",
        start_time: "",
        duration_minutes: 60,
        reservation_type: "free",
        paid_amount: 0,
        notes: "",
      });

      if (onReservationSaved) onReservationSaved();
      if (onClose) onClose();
    } catch (error) {
      parseBackendErrors(error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // ── Render helper for field error ──
  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p className="text-xs text-red-500 mt-1">{fieldErrors[name]}</p>
    ) : null;

  // ────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl relative overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{autoT("legacy.new_reservation_21fc3a90")}</h2>
          <button
            onClick={onClose}
            aria-label={autoT("menuDetails.close")}
            className="text-white/80 hover:text-white transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 overflow-y-auto max-h-[78vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ═══════ TABLE SELECTION ═══════ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {autoT("legacy.table_0424f6e7")} <span className="text-red-500">*</span>
              </label>
              <select
                name="table"
                value={form.table}
                onChange={handleTableChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
                  fieldErrors.table ? "border-red-400" : "border-gray-300"
                }`}
                required
              >
                <option value="">{autoT("legacy.select_a_table_94a81f25")}</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {autoT("legacy.table_0424f6e7")} {t.name} — {t.capacity} {autoT("legacy.seats_05d560fe")}
                    {parseFloat(t.price_per_hour) > 0
                      ? ` — AFN${t.price_per_hour}/hr`
                      : autoT("legacy.free_aaf7e02c")}{" "}
                    ({t.status})
                  </option>
                ))}
              </select>
              <FieldError name="table" />
            </div>

            {/* ── Table Info Card ── */}
            {selectedTable && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">
                    {autoT("legacy.table_0424f6e7")} {selectedTable.name}
                  </span>
                  <StatusBadge status={selectedTable.status} />
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-400">{autoT("legacy.capacity_218347e0")}</span>{" "}
                    <strong>{selectedTable.capacity}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">{autoT("legacy.rate_cf6b5fa8")}</span>{" "}
                    <strong>
                      {parseFloat(selectedTable.price_per_hour) > 0
                        ? `AFN${selectedTable.price_per_hour}/hr`
                        : autoT("legacy.free_75f52718")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400">{autoT("legacy.free_allowed_c5b8e4de")}</span>{" "}
                    <strong>
                      {selectedTable.allow_free_reservation ? autoT("info.yes") : autoT("info.no")}
                    </strong>
                  </div>
                </div>

                {/* Warnings */}
                {selectedTable.status === "occupied" && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-3 py-2 rounded-lg">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      {autoT("legacy.this_table_is_currently_occupied_you_can_still_book_a__98ed1760")}
                    </span>
                  </div>
                )}

                {selectedTable.current_reservation && (
                  <div className="text-sm bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg">
                    <strong>{autoT("legacy.current_reservation_c261d3be")}</strong>{" "}
                    {selectedTable.current_reservation.customer_name} —{" "}
                    {new Date(
                      selectedTable.current_reservation.time,
                    ).toLocaleString()}
                  </div>
                )}

                {selectedTable.upcoming_reservation && (
                  <div className="text-sm bg-purple-50 border border-purple-200 text-purple-700 px-3 py-2 rounded-lg">
                    <strong>{autoT("legacy.upcoming_13d1b787")}</strong>{" "}
                    {selectedTable.upcoming_reservation.customer_name} —{" "}
                    {new Date(
                      selectedTable.upcoming_reservation.time,
                    ).toLocaleString()}
                    {selectedTable.upcoming_reservation.duration && (
                      <span>
                        {" "}
                        ({selectedTable.upcoming_reservation.duration} {autoT("legacy.min_c5cceefd")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ═══════ CUSTOMER INFO ═══════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {autoT("legacy.customer_name_75636316")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder={autoT("legacy.enter_name_5df85959")}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
                    fieldErrors.customer_name
                      ? "border-red-400"
                      : "border-gray-300"
                  }`}
                  required
                />
                <FieldError name="customer_name" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {autoT("staff.form.phone")}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={autoT("legacy.enter_phone_afe4ff5a")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                />
                <FieldError name="phone" />
              </div>
            </div>

            {/* ═══════ GUESTS ═══════ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {autoT("legacy.number_of_guests_1acae9a2")}
              </label>
              <input
                type="number"
                name="guests"
                min="1"
                max={selectedTable?.capacity || 50}
                value={form.guests}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
                  fieldErrors.guests ? "border-red-400" : "border-gray-300"
                }`}
              />
              {selectedTable && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        form.guests > selectedTable.capacity
                          ? "bg-red-500"
                          : form.guests > selectedTable.capacity * 0.8
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min((form.guests / selectedTable.capacity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {form.guests}/{selectedTable.capacity}
                  </span>
                </div>
              )}
              <FieldError name="guests" />
            </div>

            {/* ═══════ DATE & TIME ═══════ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {autoT("legacy.start_time_41c1074d")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  min={`${todayStr}T00:00`}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
                    fieldErrors.start_time
                      ? "border-red-400"
                      : "border-gray-300"
                  }`}
                  required
                />
                <FieldError name="start_time" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {autoT("legacy.duration_min_b9d7d9c7")}
                </label>
                <select
                  name="duration_minutes"
                  value={form.duration_minutes}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
                    fieldErrors.duration_minutes
                      ? "border-red-400"
                      : "border-gray-300"
                  }`}
                >
                  <option value={30}>{autoT("legacy.30_min_d3ddf7a3")}</option>
                  <option value={60}>{autoT("legacy.1_hour_f030c3d6")}</option>
                  <option value={90}>{autoT("legacy.1_5_hours_6bc4eb60")}</option>
                  <option value={120}>{autoT("legacy.2_hours_2046e49e")}</option>
                  <option value={180}>{autoT("legacy.3_hours_63d26e82")}</option>
                  <option value={240}>{autoT("legacy.4_hours_7b47150d")}</option>
                  <option value={300}>{autoT("legacy.5_hours_1fe288aa")}</option>
                  <option value={360}>{autoT("legacy.6_hours_1e35c222")}</option>
                  <option value={480}>{autoT("legacy.8_hours_191800b7")}</option>
                </select>
                <FieldError name="duration_minutes" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {autoT("legacy.end_time_4c640e92")}
                </label>
                <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium">
                  {endTimePreview || "—"}
                </div>
              </div>
            </div>

            <input
              type="hidden"
              name="reservation_date"
              value={form.reservation_date}
            />

            {existingReservations.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {autoT("legacy.existing_bookings_on_1ec7a7d9")} {form.reservation_date}
                </h4>
                <div className="space-y-1">
                  {existingReservations.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded border border-orange-100 text-sm"
                    >
                      <span className="font-medium text-gray-800">
                        {r.customer_name || autoT("legacy.guest_face83ee")}
                      </span>
                      <span className="text-gray-500">
                        {r.start_time
                          ? new Date(r.start_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "?"}{" "}
                        –{" "}
                        {r.end_time
                          ? new Date(r.end_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "?"}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          r.status === "arrived"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════ RESERVATION TYPE & PRICING ═══════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {autoT("legacy.reservation_type_006ac5e0")}
                </label>
                <select
                  name="reservation_type"
                  value={form.reservation_type}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${
                    fieldErrors.reservation_type
                      ? "border-red-400"
                      : "border-gray-300"
                  }`}
                >
                  {selectedTable?.allow_free_reservation && (
                    <option value="free">{autoT("legacy.free_3e80dce3")}</option>
                  )}
                  <option value="fee">{autoT("legacy.fee_based_pay_on_arrival_afed3d87")}</option>
                  <option value="prepaid">{autoT("legacy.prepaid_73b7e76f")}</option>
                </select>
                <FieldError name="reservation_type" />
              </div>

              {form.reservation_type === "prepaid" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {autoT("legacy.prepaid_amount_a26e0152")}
                  </label>
                  <input
                    type="number"
                    name="paid_amount"
                    min="0"
                    max={estimatedPrice || undefined}
                    value={form.paid_amount}
                    onChange={handleChange}
                    placeholder={autoT("legacy.enter_amount_01f20462")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <FieldError name="paid_amount" />
                </div>
              )}
            </div>

            {/* ── Price Estimate Card ── */}
            {selectedTable && estimatedPrice !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">
                      {autoT("legacy.estimated_total_1636f5a9")}
                    </p>
                    <p className="text-xs text-blue-400">
                      {Math.ceil(form.duration_minutes / 60)} {autoT("legacy.hr_s_afn_77661bac")}
                      {selectedTable.price_per_hour}/hr
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {form.reservation_type === "free" ? (
                      <span className="text-green-600">{autoT("legacy.free_4a9768fa")}</span>
                    ) : (
                      `AFN${estimatedPrice.toFixed(2)}`
                    )}
                  </p>
                </div>

                {form.reservation_type === "prepaid" &&
                  Number(form.paid_amount) > 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-200 flex justify-between text-sm">
                      <span className="text-blue-600">
                        {autoT("legacy.remaining_on_arrival_510cac9e")}
                      </span>
                      <span className="font-semibold text-blue-800">
                        {autoT("labels.afn")}
                        {Math.max(
                          estimatedPrice - Number(form.paid_amount),
                          0,
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
              </div>
            )}

            {/* ═══════ NOTES ═══════ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {autoT("legacy.special_notes_e47e02c8")}
              </label>
              <textarea
                rows="2"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder={autoT("legacy.any_special_requests_74eb7ed0")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
            </div>

            {/* ═══════ ACTIONS ═══════ */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                {autoT("staff.cancel")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {autoT("legacy.creating_94d7d8ee")}
                  </>
                ) : (
                  autoT("legacy.create_reservation_30303fe6")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
