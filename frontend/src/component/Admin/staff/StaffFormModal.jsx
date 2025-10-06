import React, { useEffect, useState } from "react";

export default function StaffFormModal({
  open,
  closeModal,
  addStaff,
  updateStaff,
  editingStaff,
}) {
  if (!open) return null;

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingStaff) {
      setName(editingStaff.name || "");
      setRole(editingStaff.role || "");
      setEmail(editingStaff.email || "");
    } else {
      setName("");
      setRole("");
      setEmail("");
    }
    setError("");
  }, [editingStaff, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !email.trim()) {
      setError("All fields are required.");
      return;
    }
    const staffData = { name: name.trim(), role: role.trim(), email: email.trim() };
    if (editingStaff) updateStaff({ ...staffData, id: editingStaff.id });
    else addStaff(staffData);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md animate-slide-down">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {editingStaff ? "Edit Staff" : "Add Staff"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}

            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-purple-500 hover:to-indigo-500 transition"
            >
              {editingStaff ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}