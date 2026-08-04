import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";
import RestrictedToast from "../../RistrictedAction";

export default function ItemDelete({
  itemID,
  onDelete,
  onClose,
  title = "Delete menu item?",
  message = "This menu item will be permanently removed from the active branch.",
}) {
  const [showRestriction, setShowRestriction] = useState(false);
  const [loading, setLoading] = useState(false);
  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;

  const handleDelete = async () => {
    if (isDemo) {
      setShowRestriction(true);
      return;
    }

    setLoading(true);
    try {
      const response = await instance.delete(`/menu/menu-items/${itemID}/`);
      if (response.status !== 200 && response.status !== 204) {
        console.log("Failed to delete the item");
        return;
      }
      onDelete();
    } catch (error) {
      console.log("Failed to delete the item", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: 18, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 18, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-rose-100 bg-rose-50 px-5 py-4">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600 ring-1 ring-rose-200">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-rose-700">
                This action is permanent.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-500 transition hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-label="Close delete confirmation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm leading-6 text-gray-600">{message}</p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-950"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        </div>
      </motion.div>

      {showRestriction && (
        <RestrictedToast
          action="delete"
          onClose={() => setShowRestriction(false)}
        />
      )}
    </div>
  );
}
