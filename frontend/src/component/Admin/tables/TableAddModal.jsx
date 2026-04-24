import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";
import RestrictedToast from "../../RistrictedAction";

import { useTranslation } from "react-i18next";

export default function TableAddModal({ onTableAdded, onClose }) {
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [note, setNote] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [allowFreeReservation, setAllowFreeReservation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRestriction, setShowRestriction] = useState(false);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDemo) {
      setShowRestriction(true);
      return;
    }
    if (!tableName) {
      setError("Table must have name!");
    }
    setLoading(true);

    try {
      const response = await instance.post(`/orders/tables/`, {
        name: tableName,
        capacity: capacity,
        note: note,
      });
      onTableAdded();
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        dir={isRTL ? "rtl" : "ltr"}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          {t("add_new_table")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            required
            placeholder="name"
          />

          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            required
            placeholder={t("capacity")}
          />
          <input
            type="number"
            value={pricePerHour}
            onChange={(e) => setPricePerHour(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            required
            placeholder="Price per hour(Reservations)"
          />

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            // required
            placeholder={t("note")}
          />
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={allowFreeReservation}
              onChange={(e) => setAllowFreeReservation(e.target.checked)}
            />
            Allow free reservation
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? t("adding") : t("add_table")}
          </button>

          {error && <p className="text-red-600">{error.message}</p>}
        </form>
      </motion.div>
      {showRestriction && (
        <RestrictedToast
          actionType="add"
          onClose={() => setShowRestriction(false)}
        />
      )}
    </div>
  );
}
