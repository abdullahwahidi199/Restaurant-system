import React, { useContext, useEffect, useState } from "react";
import StaffTable from "./StaffTable";
import StaffFormModal from "./StaffFormModal";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import { AuthContext } from "../../../api/authforRBC";
import instance from "../../../api/axiosInstance";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteStaffId, setDeleteStaffId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const {auth}=useContext(AuthContext)
  const token = auth?.tokens?.access;
  const BASE_URL = "http://127.0.0.1:8000";


  const fetchStaff = async () => {
   setLoading(true)
    try {
      const response=await instance.get('/users/staff/')
      setStaff(response.data)
      
      
    } catch (err) {
      console.error("Failed to fetch staff:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

 
  const addStaff = async (formData) => {
    try {
      const res =await instance.post('/users/staff/',formData)
      
      
      setStaff((prev) => [...prev, res.data]);

    } catch (err) {
      console.error("Could not add staff",err.res?.data||err.message);
    }
  };

 
  const updateStaff = async (id, formData) => {
    try {
      const res = await instance.put(`/users/staff/${id}/`,formData)
      
     
      setStaff((prev) => prev.map((s) => (s.id === id ? res.data : s)));
    } catch (err) {
      console.error("Failed to update staff:", err.res?.data || err.message);
    }
  };


  const deleteStaff = async (id) => {
    try {
      const res = await instance.delete(`/users/staff/${id}/`)
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete staff:", err.response?.data || err.message);
    }
  };

 
  const filteredStaff = staff.filter((s) => {
  const name = s.name?.toLowerCase() || "";
  const role = s.role?.toLowerCase() || "";
  const term = search.toLowerCase();
  return name.includes(term) || role.includes(term);
});


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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Staff Management
        </h1>
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

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Loading staff...
        </p>
      ) : (
        <StaffTable staff={filteredStaff} editStaff={openEdit} deleteStaff={setDeleteStaffId} />
      )}

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
