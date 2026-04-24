import { useContext, useState } from "react";
import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";

export default function ItemDelete({
  itemID,
  onDelete,
  onClose,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item!",
}) {
  const [showRestriction, setShowRestriction] = useState(false);
  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;
  const handleDelete = async () => {
    if (isDemo) {
      setShowRestriction(true);
      return;
    }
    const response = await instance.delete(`/menu/menu-items/${itemID}/`);
    if (response.status !== 200 && response.status !== 204) {
      console.log("Failed to delete the item");
      return;
    }
    onDelete();
    window.location.reload();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm animate-slide-down">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          {title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
      {showRestriction && (
        <RestrictedToast
          action="update"
          onClose={() => setShowRestriction(false)}
        />
      )}
    </div>
  );
}
