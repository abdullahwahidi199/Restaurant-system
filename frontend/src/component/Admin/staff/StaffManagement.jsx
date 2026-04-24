import React, { useContext, useEffect, useState } from "react";
import StaffTable from "./StaffTable";
import StaffFormModal from "./StaffFormModal";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import { AuthContext } from "../../../api/authforRBC";
import instance from "../../../api/axiosInstance";
import RestrictedToast from "../../RistrictedAction";
import { useTranslation } from "react-i18next";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteStaffId, setDeleteStaffId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRistiction, setShowRistriction] = useState(false);

  const { auth } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language !== "en";

  const token = auth?.tokens?.access;
  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await instance.get("/users/staff/");
      setStaff(response.data);
      console.log(response.data);
    } catch (err) {
      console.error(
        "Failed to fetch staff:",
        err.response?.data || err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const addStaff = async (formData) => {
    if (isDemo) {
      setShowRistriction(true);
      return;
    }

    try {
      const res = await instance.post("/users/staff/", formData);

      setStaff((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Could not add staff", err.res?.data || err.message);
    }
  };

  const updateStaff = async (id, formData) => {
    if (isDemo) {
      setShowRistriction(true);
      return;
    }
    try {
      const res = await instance.put(`/users/staff/${id}/`, formData);

      setStaff((prev) => prev.map((s) => (s.id === id ? res.data : s)));
    } catch (err) {
      console.error("Failed to update staff:", err.res?.data || err.message);
    }
  };

  const deleteStaff = async (id) => {
    if (isDemo) {
      setShowRistriction(true);
      return;
    }

    try {
      const res = await instance.delete(`/users/staff/${id}/`);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(
        "Failed to delete staff:",
        err.response?.data || err.message,
      );
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
    <div className="max-w-7xl mx-auto p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {t("staff.management")}
        </h1>
        <button
          onClick={openAdd}
          className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full font-semibold hover:from-purple-500 hover:to-indigo-500 transition"
        >
          {t("staff.add")}
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder={t("staff.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          {t("staff.loading")}
        </p>
      ) : (
        <StaffTable
          staff={filteredStaff}
          editStaff={openEdit}
          deleteStaff={setDeleteStaffId}
        />
      )}
      {showRistiction ? (
        <RestrictedToast onClose={() => setShowRistriction(false)} />
      ) : (
        <StaffFormModal
          open={formOpen}
          closeModal={closeForm}
          addStaff={addStaff}
          updateStaff={updateStaff}
          editingStaff={editingStaff}
        />
      )}

      {showRistiction ? (
        <RestrictedToast
          actionType="delete"
          onClose={() => setShowRistriction(false)}
        />
      ) : (
        <ConfirmDeleteModal
          open={deleteStaffId !== null}
          closeModal={() => setDeleteStaffId(null)}
          onDelete={() => {
            deleteStaff(deleteStaffId);
            setDeleteStaffId(null);
          }}
        />
      )}
    </div>
  );
}
