import React, { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";

export default function StaffFormModal({
  open,
  closeModal,
  addStaff,
  updateStaff,
  editingStaff,
}) {
  if (!open) return null;

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    hire_date: "",
    status: "Active",
    custom_role: "",
    image: null,
    username:"",
    password:"",
    shift: "",
  });

  const [error, setError] = useState("");
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        name: editingStaff.name || "",
        role: editingStaff.role || "",
        email: editingStaff.email || "",
        phone: editingStaff.phone || "",
        hire_date: editingStaff.hire_date || "",
        status: editingStaff.status || "Active",
        custom_role: editingStaff.custom_role || "",
        image: null,
        shift: editingStaff.shift || "",
        username:editingStaff.username||"",
        password:editingStaff.password||""
      });
    } else {
      setFormData({
        name: "",
        role: "",
        email: "",
        phone: "",
        hire_date: "",
        status: "Active",
        custom_role: "",
        image: null,
        shift: "",
        username:"",
        password:""
      });
    }
    setError("");
  }, [editingStaff, open]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.email || !formData.phone) {
      setError("Please fill all required fields.");
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      if (formData[key]) data.append(key, formData[key]);
    }

    if (editingStaff) await updateStaff(editingStaff.id, data);
    else await addStaff(data);
    closeModal();
  };

  const getShifts = async () => {
    const res = await instance('/users/shift');
    const data = res.data
    setShifts(data);
  };

  useEffect(() => {
    getShifts();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-100">
            {editingStaff ? "Edit Staff Member" : "Add New Staff"}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-200 transition text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-gray-100">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Full Name *"
              value={formData.name}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              name="phone"
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              name="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select Shift</option>
              {shifts.length>0 && (shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.shift_type} ({shift.start_time} - {shift.end_time})
                </option>
              )))}
              
            </select>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Cashier">Cashier</option>
              <option value="Waiter">Waiter</option>
              <option value="Kitchen_manager">Kitchen manager</option>
              <option value="DeliveryBoy">Delivery Boy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {formData.role === "Other" && (
            <input
              name="custom_role"
              placeholder="Custom Role"
              value={formData.custom_role}
              onChange={handleChange}
              className="input-field w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Resigned">Resigned</option>
            </select>

            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="input-field px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 outline-none"
            />
          </div>

          <div>
            <p>Create Accout for this staff!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              className="input-field px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
             
           

            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="input-field px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 outline-none"
            />
          </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition"
            >
              {editingStaff ? "Update Staff" : "Add Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
