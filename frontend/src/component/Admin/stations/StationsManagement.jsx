import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Utensils,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";
import { useTranslation } from "react-i18next";
import StationFormModal from "./StationFormModal";
import StationDeleteModal from "./StationDeleteModal";

export default function StationManagement() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
  const { auth, activeBranch } = useContext(AuthContext);

  const [stations, setStations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter State
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [stationToDelete, setStationToDelete] = useState(null);

  const fetchStations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await instance.get("/menu/stations/");
      const data = res.data?.results || res.data || [];
      setStations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch stations:", err);
      setError("Failed to load kitchen stations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await instance.get("/restaurant/branches/");
      const data = res.data?.results || res.data || [];
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setBranches([]);
    }
  };

  useEffect(() => {
    fetchStations();
    fetchBranches();
  }, [activeBranch?.id]);

  const handleCreateOrUpdateStation = async (payload, stationId) => {
    if (stationId) {
      await instance.patch(`/menu/stations/${stationId}/`, payload);
    } else {
      await instance.post("/menu/stations/", payload);
    }
    await fetchStations();
  };

  const handleDeleteStation = async (stationId) => {
    await instance.delete(`/menu/stations/${stationId}/`);
    await fetchStations();
  };

  const filteredStations = useMemo(() => {
    return stations.filter((st) => {
      const q = search.toLowerCase();
      const matchesSearch =
        st.name?.toLowerCase().includes(q) ||
        st.name_dari?.toLowerCase().includes(q) ||
        st.name_pashto?.toLowerCase().includes(q) ||
        st.description?.toLowerCase().includes(q);

      const matchesBranch =
        branchFilter === "all" ||
        (branchFilter === "restaurant_wide" && !st.branch) ||
        String(st.branch) === String(branchFilter);

      return matchesSearch && matchesBranch;
    });
  }, [stations, search, branchFilter]);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--theme-background)] p-6 text-[var(--theme-text-primary)]"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-border)] pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--theme-text-primary)]">
                Kitchen Station Management
              </h1>
              <p className="text-sm text-[var(--theme-text-secondary)]">
                Create and manage kitchen preparation stations (e.g., Juice Bar,
                Main Kitchen, Grill).
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingStation(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-text-inverse)] font-bold text-sm shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Add New Station
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--theme-surface)] p-4 rounded-xl border border-[var(--theme-border)] shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]"
            />
            <input
              type="text"
              placeholder="Search stations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--theme-input-border)] bg-[var(--theme-input-bg)] text-sm text-[var(--theme-text-primary)] focus:border-[var(--theme-input-focus)] focus:ring-2 focus:ring-[var(--theme-input-ring)] outline-none transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-[var(--theme-text-secondary)] shrink-0">
              Filter Branch:
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full sm:w-48 rounded-lg border border-[var(--theme-input-border)] bg-[var(--theme-input-bg)] px-3 py-2 text-sm text-[var(--theme-text-primary)] focus:border-[var(--theme-input-focus)] focus:ring-2 focus:ring-[var(--theme-input-ring)] outline-none transition"
            >
              <option value="all">All Stations</option>
              <option value="restaurant_wide">
                Restaurant Wide (All Branches)
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stations Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--theme-primary)]" />
            <p className="text-sm text-[var(--theme-text-muted)]">
              Loading kitchen stations...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchStations}
              className="mt-3 px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-12 text-center space-y-3">
            <Utensils className="h-10 w-10 mx-auto text-[var(--theme-text-muted)] opacity-50" />
            <h3 className="text-lg font-bold text-[var(--theme-text-primary)]">
              No Kitchen Stations Found
            </h3>
            <p className="text-sm text-[var(--theme-text-secondary)] max-w-sm mx-auto">
              No stations match your current search or filter criteria. Add a
              new station or reset filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--theme-table-header)] border-b border-[var(--theme-border)] text-xs uppercase font-semibold text-[var(--theme-text-secondary)] tracking-wider">
                  <th className="py-3.5 px-4">Station Name</th>
                  <th className="py-3.5 px-4">Dari / Pashto</th>
                  <th className="py-3.5 px-4">Assigned Branch</th>
                  <th className="py-3.5 px-4">Routing Status</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border)]">
                {filteredStations.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-[var(--theme-table-row-hover)] transition-colors"
                  >
                    {/* English Name */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-[var(--theme-text-primary)]">
                        {st.name}
                      </div>
                      {st.description && (
                        <div className="text-xs text-[var(--theme-text-muted)] line-clamp-1 mt-0.5">
                          {st.description}
                        </div>
                      )}
                    </td>

                    {/* Dari / Pashto Names */}
                    <td className="py-4 px-4 text-sm">
                      <div
                        className="text-[var(--theme-text-primary)] font-medium"
                        dir="rtl"
                      >
                        {st.name_dari || "—"}
                      </div>
                      <div
                        className="text-xs text-[var(--theme-text-muted)] mt-0.5"
                        dir="rtl"
                      >
                        {st.name_pashto || "—"}
                      </div>
                    </td>

                    {/* Assigned Branch */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--theme-muted)] text-[var(--theme-text-secondary)]">
                        <Building2 className="h-3.5 w-3.5 text-[var(--theme-text-muted)]" />
                        {st.branch_name || "All Branches"}
                      </span>
                    </td>

                    {/* Routing Status (Default badge) */}
                    <td className="py-4 px-4">
                      {st.is_default ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Default (Main Kitchen)
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--theme-text-muted)] font-medium">
                          Custom Station
                        </span>
                      )}
                    </td>

                    {/* Status (Active / Inactive) */}
                    <td className="py-4 px-4">
                      {st.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => {
                            setEditingStation(st);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-hover)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition"
                          title="Edit Station"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setStationToDelete(st);
                            setIsDeleteOpen(true);
                          }}
                          disabled={st.is_default}
                          className="p-1.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-red-50 text-[var(--theme-text-secondary)] hover:text-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            st.is_default
                              ? "Default station cannot be deleted"
                              : "Delete Station"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <StationFormModal
        open={isFormOpen}
        closeModal={() => setIsFormOpen(false)}
        onSave={handleCreateOrUpdateStation}
        editingStation={editingStation}
        branches={branches}
      />

      {/* Delete Confirmation Modal */}
      <StationDeleteModal
        open={isDeleteOpen}
        closeModal={() => setIsDeleteOpen(false)}
        onConfirmDelete={handleDeleteStation}
        station={stationToDelete}
      />
    </div>
  );
}
