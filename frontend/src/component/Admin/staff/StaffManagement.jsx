import React, { useContext, useEffect, useState } from "react";
import StaffTable from "./StaffTable";
import StaffFormModal from "./StaffFormModal";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import { AuthContext } from "../../../api/authforRBC";
import instance from "../../../api/axiosInstance";
import RestrictedToast from "../../RistrictedAction";
import { useTranslation } from "react-i18next";
import { Plus, UsersRound } from "lucide-react";
import PageHeader from "../../../modules/shared/erp/components/PageHeader";
import ActionButton from "../../../modules/shared/erp/components/ActionButton";
import SearchBox from "../../../modules/shared/erp/components/SearchBox";
import LoadingState from "../../../modules/shared/erp/components/LoadingState";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteStaffId, setDeleteStaffId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRistiction, setShowRistriction] = useState(false);

  const { auth, activeBranch } = useContext(AuthContext);
  const isDemo = auth?.user?.isDemo;
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await instance.get("/users/staff/");
      setStaff(response.data);
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
  }, [activeBranch?.id]);

  const addStaff = async (formData) => {
    if (isDemo) {
      setShowRistriction(true);
      return;
    }

    try {
      const res = await instance.post("/users/staff/", formData);

      setStaff((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Could not add staff", err.response?.data || err.message);
      throw err;
    }
  };

  const updateStaff = async (id, formData) => {
    if (isDemo) {
      setShowRistriction(true);
      return;
    }
    try {
      const res = await instance.patch(`/users/staff/${id}/`, formData);

      setStaff((prev) => prev.map((s) => (s.id === id ? res.data : s)));
    } catch (err) {
      console.error("Failed to update staff:", err.response?.data || err.message);
      throw err;
    }
  };

  const deleteStaff = async (id) => {
    if (isDemo) {
      setShowRistriction(true);
      return;
    }

    try {
      await instance.delete(`/users/staff/${id}/`);
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
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        icon={UsersRound}
        title={t("staff.management")}
        description={t("staff.management_description", {
          defaultValue: "Manage staff profiles, assignments, and employment details.",
        })}
        actions={<ActionButton icon={Plus} variant="primary" onClick={openAdd}>{t("staff.add")}</ActionButton>}
      />

      <div className="theme-card max-w-xl p-3">
        <SearchBox
          placeholder={t("staff.search")}
          value={search}
          onChange={setSearch}
        />
      </div>

      {loading ? (
        <LoadingState label={t("staff.loading")} />
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
