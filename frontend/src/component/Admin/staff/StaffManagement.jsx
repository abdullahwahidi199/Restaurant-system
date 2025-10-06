import React, { useState } from "react";
import StaffTable from "./StaffTable";
import StaffFormModal from "./StaffFormModal";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import StaffModel from "./StaffModal";

const initialStaff = [
  StaffModel(1, "Abdullah", "Team leader", "example@gmail.com"),
  StaffModel(2, "Abbas", "Frontend Developer", "example@gmail.com"),
  StaffModel(3, "Salim", "Backend Developer", "example@gmail.com"),
];

export default function StaffManagement() {
  const [staff, setStaff] = useState(initialStaff);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteStaffId, setDeleteStaffId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase())
  );

  const addStaff = (newStaff) => setStaff((prev) => [...prev, { id: Date.now(), ...newStaff }]);
  const updateStaff = (updatedStaff) =>
    setStaff((prev) => prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s)));
  const deleteStaff = (id) => setStaff((prev) => prev.filter((s) => s.id !== id));

  const openAdd = () => {
    setEditingStaff(null);
    setFormOpen(true);
  };

  const openEdit = (s) => {
    setEditingStaff(s);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingStaff(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Staff Management</h1>
        <button
          onClick={openAdd}
          className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full font-semibold hover:from-purple-500 hover:to-indigo-500 transition"
        >
          Add Staff
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <StaffTable staff={filteredStaff} editStaff={openEdit} deleteStaff={setDeleteStaffId} />

      <StaffFormModal
        open={formOpen}
        closeModal={closeForm}
        addStaff={addStaff}
        updateStaff={updateStaff}
        editingStaff={editingStaff}
      />

      <ConfirmDeleteModal
        open={deleteStaffId !== null}
        closeModal={() => setDeleteStaffId(null)}
        onDelete={() => {
          deleteStaff(deleteStaffId);
          setDeleteStaffId(null);
        }}
      />
    </div>
  );
}