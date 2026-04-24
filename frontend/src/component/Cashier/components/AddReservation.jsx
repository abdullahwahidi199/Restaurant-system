import React, { useEffect, useState, useMemo, useCallback } from "react";
import instance from "../../../api/axiosInstance";
import toast from "react-hot-toast";

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

  const fetchTables = async () => {
    try {
      const res = await instance.get("orders/tables/");
      setTables(res.data);
    } catch {
      toast.error("Failed to load tables");
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
        `orders/reservations/?table=${tableId}&date=${date}&status=reserved`,
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

      toast.success("Reservation created successfully!");

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
          <h2 className="text-xl font-bold text-white">✦ New Reservation</h2>
          <button
            onClick={onClose}
            aria-label="Close"
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
                Table <span className="text-red-500">*</span>
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
                <option value="">— Select a table —</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    Table {t.name} — {t.capacity} seats
                    {parseFloat(t.price_per_hour) > 0
                      ? ` — AFN${t.price_per_hour}/hr`
                      : " — Free"}{" "}
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
                    Table {selectedTable.name}
                  </span>
                  <StatusBadge status={selectedTable.status} />
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-400">Capacity:</span>{" "}
                    <strong>{selectedTable.capacity}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Rate:</span>{" "}
                    <strong>
                      {parseFloat(selectedTable.price_per_hour) > 0
                        ? `AFN${selectedTable.price_per_hour}/hr`
                        : "Free"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Free allowed:</span>{" "}
                    <strong>
                      {selectedTable.allow_free_reservation ? "Yes" : "No"}
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
                      This table is currently occupied. You can still book a
                      future slot.
                    </span>
                  </div>
                )}

                {selectedTable.current_reservation && (
                  <div className="text-sm bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg">
                    <strong>Current reservation:</strong>{" "}
                    {selectedTable.current_reservation.customer_name} —{" "}
                    {new Date(
                      selectedTable.current_reservation.time,
                    ).toLocaleString()}
                  </div>
                )}

                {selectedTable.upcoming_reservation && (
                  <div className="text-sm bg-purple-50 border border-purple-200 text-purple-700 px-3 py-2 rounded-lg">
                    <strong>Upcoming:</strong>{" "}
                    {selectedTable.upcoming_reservation.customer_name} —{" "}
                    {new Date(
                      selectedTable.upcoming_reservation.time,
                    ).toLocaleString()}
                    {selectedTable.upcoming_reservation.duration && (
                      <span>
                        {" "}
                        ({selectedTable.upcoming_reservation.duration} min)
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
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder="Enter name"
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                />
                <FieldError name="phone" />
              </div>
            </div>

            {/* ═══════ GUESTS ═══════ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Number of Guests
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
                  Start Time <span className="text-red-500">*</span>
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
                  Duration (min)
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
                  <option value={30}>30 min</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                  <option value={240}>4 hours</option>
                  <option value={300}>5 hours</option>
                  <option value={360}>6 hours</option>
                  <option value={480}>8 hours</option>
                </select>
                <FieldError name="duration_minutes" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  End Time
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
                  Existing Bookings on {form.reservation_date}
                </h4>
                <div className="space-y-1">
                  {existingReservations.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded border border-orange-100 text-sm"
                    >
                      <span className="font-medium text-gray-800">
                        {r.customer_name || "Guest"}
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
                  Reservation Type
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
                    <option value="free">🆓 Free</option>
                  )}
                  <option value="fee">💲 Fee-Based (pay on arrival)</option>
                  <option value="prepaid">💳 Prepaid</option>
                </select>
                <FieldError name="reservation_type" />
              </div>

              {form.reservation_type === "prepaid" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Prepaid Amount
                  </label>
                  <input
                    type="number"
                    name="paid_amount"
                    min="0"
                    max={estimatedPrice || undefined}
                    value={form.paid_amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
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
                      Estimated Total
                    </p>
                    <p className="text-xs text-blue-400">
                      {Math.ceil(form.duration_minutes / 60)} hr(s) × AFN
                      {selectedTable.price_per_hour}/hr
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {form.reservation_type === "free" ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `AFN${estimatedPrice.toFixed(2)}`
                    )}
                  </p>
                </div>

                {form.reservation_type === "prepaid" &&
                  Number(form.paid_amount) > 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-200 flex justify-between text-sm">
                      <span className="text-blue-600">
                        Remaining on arrival:
                      </span>
                      <span className="font-semibold text-blue-800">
                        AFN
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
                Special Notes
              </label>
              <textarea
                rows="2"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any special requests…"
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
                Cancel
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
                    Creating…
                  </>
                ) : (
                  "Create Reservation"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
