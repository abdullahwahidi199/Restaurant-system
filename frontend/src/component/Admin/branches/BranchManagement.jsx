import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  Copy,
  ClipboardList,
  Database,
  Download,
  ExternalLink,
  Layers3,
  PackageOpen,
  Pencil,
  Plus,
  Power,
  QrCode,
  RefreshCw,
  Save,
  Trash2,
  UploadCloud,
  Utensils,
  X,
  XCircle,
} from "lucide-react";
import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";
import ConfirmationDialog from "../../ui/ConfirmationDialog";
import {
  copyText,
  downloadFile,
  getMediaUrl,
} from "../../../api/publicOrdering";

const MIGRATION_CARDS = [
  {
    type: "ingredients",
    title: "Migrate Ingredients",
    description:
      "Copy ingredient master data, units, costs, thresholds, and status. Stock starts at zero.",
    icon: Database,
  },
  {
    type: "categories",
    title: "Migrate Menu Categories",
    description:
      "Copy category names, localized names, rank, descriptions, and images.",
    icon: ClipboardList,
  },
  {
    type: "menu_items",
    title: "Migrate Menu Items",
    description:
      "Copy items, pricing, availability, images, categories, and recipes.",
    icon: Utensils,
  },
  {
    type: "platters",
    title: "Migrate Platters",
    description: "Copy platters and included menu items with quantities.",
    icon: PackageOpen,
  },
  {
    type: "modifiers",
    title: "Migrate Modifiers",
    description:
      "Reserved for modifier data when a modifier model is configured.",
    icon: Layers3,
  },
  {
    type: "everything",
    title: "Migrate Everything",
    description:
      "Copy configuration and menu structure only. Inventory stock and purchase history are excluded.",
    icon: RefreshCw,
  },
];

const MIGRATION_FLOW_ITEMS = [
  {
    label: "Units",
    includedIn: ["ingredients", "menu_items", "platters", "everything"],
  },
  {
    label: "Ingredient Categories",
    includedIn: ["ingredients", "menu_items", "platters", "everything"],
  },
  {
    label: "Ingredients",
    includedIn: ["ingredients", "menu_items", "platters", "everything"],
  },
  {
    label: "Menu Categories",
    includedIn: ["categories", "menu_items", "platters", "everything"],
  },
  {
    label: "Menu Items",
    includedIn: ["menu_items", "platters", "everything"],
  },
  {
    label: "Recipes",
    includedIn: ["menu_items", "platters", "everything"],
  },
  {
    label: "Platters",
    includedIn: ["platters", "everything"],
  },
  {
    label: "Modifiers",
    includedIn: ["modifiers", "everything"],
  },
  { label: "Inventory Stock", excluded: true },
  { label: "Purchase History", excluded: true },
  { label: "Stock Transactions", excluded: true },
];

const createEmptyForm = () => ({
  name: "",
  code: "",
  address: "",
  phone: "",
  email: "",
  latitude: "",
  longitude: "",
  is_active: true,
});

export default function BranchManagement() {
  const { activeBranch, refreshBranchContext } = useContext(AuthContext);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState(createEmptyForm);
  const [migrationSourceId, setMigrationSourceId] = useState("");
  const [migratingType, setMigratingType] = useState("");
  const [migrationError, setMigrationError] = useState("");
  const [migrationResult, setMigrationResult] = useState(null);
  const [migrationLogs, setMigrationLogs] = useState([]);
  const [pendingMigrationType, setPendingMigrationType] = useState("");
  const [branchPendingDelete, setBranchPendingDelete] = useState(null);
  const [deletingBranchId, setDeletingBranchId] = useState("");
  const [regeneratingBranchId, setRegeneratingBranchId] = useState("");
  const [branchLimit, setBranchLimit] = useState({
    max_branches: 0,
    branches_used: 0,
    branches_remaining: 0,
  });

  const activeCount = useMemo(
    () => branches.filter((branch) => branch.is_active).length,
    [branches],
  );
  const migrationSourceBranches = useMemo(
    () =>
      branches.filter(
        (branch) => branch.is_active && branch.id !== activeBranch?.id,
      ),
    [activeBranch?.id, branches],
  );
  const selectedSourceBranch = useMemo(
    () =>
      branches.find(
        (branch) => String(branch.id) === String(migrationSourceId),
      ),
    [branches, migrationSourceId],
  );
  const pendingMigrationCard = useMemo(
    () => MIGRATION_CARDS.find((card) => card.type === pendingMigrationType),
    [pendingMigrationType],
  );
  const pendingMigrationItems = useMemo(
    () =>
      MIGRATION_FLOW_ITEMS.map((item) => ({
        ...item,
        included:
          !item.excluded && item.includedIn?.includes(pendingMigrationType),
      })),
    [pendingMigrationType],
  );

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await instance.get(
        "/restaurant/branches/?include_inactive=true",
      );
      setBranches(res.data.branches);

      setBranchLimit(
        res.data.branch_limit || {
          max_branches: 0,
          branches_used: 0,
          branches_remaining: 0,
        },
      );
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load branches.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMigrationLogs = async () => {
    try {
      const res = await instance.get("/restaurant/branch-data-migrations/");
      setMigrationLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load branch migration history:", err);
    }
  };

  const reloadBranchState = async () => {
    await fetchBranches();
    await fetchMigrationLogs();
    await refreshBranchContext().catch(() => {});
  };

  useEffect(() => {
    fetchBranches();
    fetchMigrationLogs();
  }, []);

  useEffect(() => {
    if (
      migrationSourceId &&
      migrationSourceBranches.some(
        (branch) => String(branch.id) === String(migrationSourceId),
      )
    ) {
      return;
    }
    setMigrationSourceId(migrationSourceBranches[0]?.id || "");
  }, [migrationSourceBranches, migrationSourceId]);

  const openCreate = () => {
    if (branchLimit.branches_remaining <= 0) {
      setError(
        `Your subscription allows only ${branchLimit.max_branches} branches. Upgrade your subscription to add more branches.`,
      );
      return;
    }
    setEditingBranch(null);
    setFormData(createEmptyForm());
    setError("");
    setFormOpen(true);
  };

  const openEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name || "",
      code: branch.code || "",
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
      latitude: branch.latitude ?? "",
      longitude: branch.longitude ?? "",
      is_active: branch.is_active,
    });
    setError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingBranch(null);
    setFormData(createEmptyForm());
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...formData,
        latitude: formData.latitude === "" ? null : formData.latitude,
        longitude: formData.longitude === "" ? null : formData.longitude,
      };

      if (editingBranch) {
        await instance.patch(
          `/restaurant/branches/${editingBranch.id}/`,
          payload,
        );
      } else {
        await instance.post("/restaurant/branches/", payload);
      }
      closeForm();
      await reloadBranchState();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail ||
          Object.values(data || {})
            ?.flat?.()
            ?.join(" ") ||
          "Could not save branch.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openMigrationConfirmation = (migrationType) => {
    if (!migrationSourceId || !activeBranch?.id) return;
    setMigrationError("");
    setPendingMigrationType(migrationType);
  };

  const closeMigrationConfirmation = () => {
    if (!migratingType) setPendingMigrationType("");
  };

  const runMigration = async () => {
    if (!pendingMigrationType || !migrationSourceId || !activeBranch?.id)
      return;

    setMigratingType(pendingMigrationType);
    setMigrationError("");
    setMigrationResult(null);
    try {
      const res = await instance.post("/restaurant/branch-data-migrations/", {
        source_branch_id: migrationSourceId,
        migration_type: pendingMigrationType,
      });
      setMigrationResult(res.data);
      await fetchMigrationLogs();
      setPendingMigrationType("");
    } catch (err) {
      const data = err.response?.data;
      setMigrationError(
        data?.detail ||
          Object.values(data || {})
            ?.flat?.()
            ?.join(" ") ||
          "Could not run branch data migration.",
      );
    } finally {
      setMigratingType("");
    }
  };

  const toggleActive = async (branch) => {
    setError("");
    try {
      await instance.patch(`/restaurant/branches/${branch.id}/`, {
        is_active: !branch.is_active,
      });
      await reloadBranchState();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail ||
          Object.values(data || {})
            ?.flat?.()
            ?.join(" ") ||
          "Could not update branch status.",
      );
    }
  };

  const copyBranchLink = async (branch) => {
    if (!branch.public_url) return;
    try {
      await copyText(branch.public_url);
    } catch (err) {
      setError("Could not copy branch link.");
    }
  };

  const downloadBranchQr = async (branch) => {
    const qrUrl = getMediaUrl(branch.qr_code);
    if (!qrUrl) return;
    try {
      await downloadFile(qrUrl, `${branch.slug || branch.code}_menu_qr.png`);
    } catch (err) {
      setError("Could not download branch QR code.");
    }
  };

  const regenerateBranchQr = async (branch) => {
    setError("");
    setRegeneratingBranchId(branch.id);
    try {
      await instance.post(`/restaurant/branches/${branch.id}/regenerate-qr/`);
      await reloadBranchState();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail ||
          Object.values(data || {})
            ?.flat?.()
            ?.join(" ") ||
          "Could not regenerate branch QR code.",
      );
    } finally {
      setRegeneratingBranchId("");
    }
  };

  const closeDeleteConfirmation = () => {
    if (!deletingBranchId) setBranchPendingDelete(null);
  };

  const deleteBranch = async () => {
    if (!branchPendingDelete) return;
    setError("");
    setDeletingBranchId(branchPendingDelete.id);
    try {
      await instance.delete(`/restaurant/branches/${branchPendingDelete.id}/`);
      setBranchPendingDelete(null);
      await reloadBranchState();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail.join(" ")
          : detail || "Could not delete branch.",
      );
    } finally {
      setDeletingBranchId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Branch management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {branchLimit.branches_used} / {branchLimit.max_branches} branches
            used
            {branchLimit.branches_remaining > 0
              ? ` (${branchLimit.branches_remaining} remaining)`
              : " (limit reached)"}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={branchLimit.branches_remaining <= 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <Plus size={18} />
          Add branch
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-5 py-3">Branch</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Public Menu</th>
              <th className="px-5 py-3">Staff</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td className="px-5 py-8 text-center text-gray-500" colSpan={6}>
                  Loading branches...
                </td>
              </tr>
            ) : branches.length ? (
              branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                        <Building2 size={18} />
                      </span>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {branch.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span>{branch.code}</span>
                          {branch.is_main_branch && (
                            <span className="rounded bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                              Main
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    <div>{branch.phone || "No phone"}</div>
                    <div className="text-xs text-gray-500">
                      {branch.email || branch.address || "No contact details"}
                    </div>
                  </td>
                  <td className="min-w-[340px] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {branch.qr_code ? (
                          <img
                            src={getMediaUrl(branch.qr_code)}
                            alt={`${branch.name} QR code`}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <QrCode size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium text-gray-900">
                          {branch.public_url || "No public URL yet"}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyBranchLink(branch)}
                            disabled={!branch.public_url}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Copy link"
                          >
                            <Copy size={13} />
                            Copy
                          </button>
                          <a
                            href={branch.public_url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 ${
                              !branch.public_url
                                ? "pointer-events-none opacity-40"
                                : ""
                            }`}
                            title="Open menu"
                          >
                            <ExternalLink size={13} />
                            Open
                          </a>
                          <button
                            type="button"
                            onClick={() => downloadBranchQr(branch)}
                            disabled={!branch.qr_code}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Download QR"
                          >
                            <Download size={13} />
                            QR
                          </button>
                          <button
                            type="button"
                            onClick={() => regenerateBranchQr(branch)}
                            disabled={regeneratingBranchId === branch.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Regenerate QR"
                          >
                            <RefreshCw
                              size={13}
                              className={
                                regeneratingBranchId === branch.id
                                  ? "animate-spin"
                                  : ""
                              }
                            />
                            Regenerate
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {branch.staff_count}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded px-2.5 py-1 text-xs font-semibold ${
                        branch.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {branch.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(branch)}
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                        title="Edit branch"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(branch)}
                        disabled={branch.is_main_branch}
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        title={branch.is_active ? "Deactivate" : "Activate"}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBranchPendingDelete(branch)}
                        disabled={!branch.can_delete}
                        className="rounded-lg border border-red-100 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Delete branch"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-8 text-center text-gray-500" colSpan={6}>
                  No branches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="space-y-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Data Migration</h2>
            <p className="mt-1 text-sm text-gray-500">
              Copy data one time from another branch into the currently selected
              branch. No records stay linked after migration.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Source Branch
              <select
                value={migrationSourceId}
                onChange={(event) => setMigrationSourceId(event.target.value)}
                className="min-w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-gray-900"
              >
                {migrationSourceBranches.length ? (
                  migrationSourceBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))
                ) : (
                  <option value="">No source branch</option>
                )}
              </select>
            </label>
            <ArrowRight className="hidden text-gray-400 sm:block" size={20} />
            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Destination
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900">
                {activeBranch?.name || "No active branch"}
              </div>
            </label>
          </div>
        </div>

        {migrationError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {migrationError}
          </div>
        )}

        {migrationResult && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Migration completed successfully. Imported{" "}
            {migrationResult.imported_count}, skipped{" "}
            {migrationResult.skipped_count}, failed{" "}
            {migrationResult.failed_count}.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MIGRATION_CARDS.map(({ type, title, description, icon: Icon }) => (
            <div
              key={type}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openMigrationConfirmation(type)}
                disabled={
                  !migrationSourceId ||
                  !activeBranch?.id ||
                  Boolean(migratingType)
                }
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
              >
                {migratingType === type ? "Migrating..." : "Migrate"}
              </button>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Imported</th>
                <th className="px-4 py-3">Skipped</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {migrationLogs.length ? (
                migrationLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {log.migration_type}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.source_branch_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.destination_branch_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {log.imported_count}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {log.skipped_count}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={6}
                  >
                    No migrations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBranch ? "Edit branch" : "Add branch"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-gray-700">
                  Name
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-gray-700">
                  Code
                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    className="rounded-lg border border-gray-300 px-3 py-2 uppercase outline-none focus:border-gray-900"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium text-gray-700">
                Address
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-gray-700">
                  Phone
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-gray-700">
                  Email
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-gray-700">
                  Latitude
                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="34.5553"
                    className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-gray-700">
                  Longitude
                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="69.2075"
                    className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                  />
                </label>
              </div>

              {editingBranch && !editingBranch.is_main_branch && (
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  Active branch
                </label>
              )}

              <div className="mt-3 flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(pendingMigrationType)}
        title="Confirm Data Migration"
        description={`You are about to copy menu-related data from ${
          selectedSourceBranch?.name || "the source branch"
        } into ${activeBranch?.name || "the destination branch"}.`}
        warning="Inventory is intentionally excluded from migration because each branch maintains its own physical stock. You must add the opening inventory separately after the migration is complete."
        confirmLabel="Start Migration"
        loadingLabel="Migrating..."
        confirmIcon={UploadCloud}
        loading={Boolean(migratingType)}
        onCancel={closeMigrationConfirmation}
        onConfirm={runMigration}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This is a one-time copy operation.
          </p>
          {migrationError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {migrationError}
            </div>
          )}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div>
                <div className="text-xs font-semibold uppercase text-gray-500">
                  Source Branch
                </div>
                <div className="mt-1 font-semibold text-gray-950">
                  {selectedSourceBranch?.name || "Source Branch"}
                </div>
              </div>
              <ArrowRight className="hidden text-gray-400 sm:block" size={18} />
              <ArrowDown className="text-gray-400 sm:hidden" size={18} />
              <div>
                <div className="text-xs font-semibold uppercase text-gray-500">
                  Destination Branch
                </div>
                <div className="mt-1 font-semibold text-gray-950">
                  {activeBranch?.name || "Destination Branch"}
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="text-xs font-semibold uppercase text-gray-500">
                Migration Type
              </div>
              <div className="mt-2 font-semibold text-gray-950">
                {pendingMigrationCard?.title || "Data Migration"}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {pendingMigrationItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      item.included
                        ? "bg-green-50 text-green-800"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    {item.included ? (
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-green-600"
                      />
                    ) : (
                      <XCircle size={16} className="shrink-0 text-gray-400" />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
            <div className="mb-2 font-semibold text-gray-900">
              After migration:
            </div>
            <ul className="grid gap-2">
              <li>Existing data will not be deleted.</li>
              <li>Duplicate records will be skipped.</li>
              <li>Both branches will remain completely independent.</li>
              <li>Future changes in one branch will not affect the other.</li>
              <li>
                Inventory quantities and stock records will NOT be migrated.
              </li>
              <li>This action cannot be automatically undone.</li>
            </ul>
          </div>
        </div>
      </ConfirmationDialog>

      <ConfirmationDialog
        open={Boolean(branchPendingDelete)}
        title="Delete Branch"
        description={`Delete ${branchPendingDelete?.name || "this branch"}?`}
        warning="Deleting a branch cannot be automatically undone."
        confirmLabel="Delete Branch"
        loadingLabel="Deleting..."
        confirmIcon={Trash2}
        loading={Boolean(deletingBranchId)}
        onCancel={closeDeleteConfirmation}
        onConfirm={deleteBranch}
        sizeClassName="max-w-md"
      >
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-800">
          Existing records that depend on this branch may prevent deletion.
        </div>
      </ConfirmationDialog>
    </div>
  );
}
