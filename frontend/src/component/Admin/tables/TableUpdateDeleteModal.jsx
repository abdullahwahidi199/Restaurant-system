import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";

export default function TableUpdateDeleteModal({ table, onClose, onUpdated }) {
  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [allowFreeReservation, setAllowFreeReservation] = useState(true);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Prefill data
  useEffect(() => {
    if (table) {
      setName(table.name || "");
      setCapacity(table.capacity || "");
      setPricePerHour(table.price_per_hour || 0);
      setAllowFreeReservation(table.allow_free_reservation ?? true);
      setNote(table.note || "");
    }
  }, [table]);

  // ✅ UPDATE
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isDemo) return;

    setLoading(true);
    try {
      await instance.put(`/orders/tables/${table.id}/`, {
        name,
        capacity,
        price_per_hour: pricePerHour,
        allow_free_reservation: allowFreeReservation,
        note,
      });

      onUpdated(); // refresh parent
      onClose();
    } catch (err) {
      setError(err.response?.data || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE
  const handleDelete = async () => {
    if (isDemo) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this table?",
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await instance.delete(`/orders/tables/${table.id}/`);
      onUpdated();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Something went wrong";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Update Table</h2>

        {/* FORM */}
        <form onSubmit={handleUpdate} className="space-y-3">
          {/* Name */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Table Name (e.g. VIP_1)"
            className="w-full p-2 border rounded"
            required
          />

          {/* Capacity */}
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Capacity"
            className="w-full p-2 border rounded"
            required
          />

          {/* Price */}
          <input
            type="number"
            value={pricePerHour}
            onChange={(e) => setPricePerHour(e.target.value)}
            placeholder="Price per hour"
            className="w-full p-2 border rounded"
            required
          />

          {/* Free Reservation */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowFreeReservation}
              onChange={(e) => setAllowFreeReservation(e.target.checked)}
            />
            Allow Free Reservation
          </label>

          {/* Note */}
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
            className="w-full p-2 border rounded"
          />

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-2 rounded">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              <Trash2 size={16} /> Delete
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
