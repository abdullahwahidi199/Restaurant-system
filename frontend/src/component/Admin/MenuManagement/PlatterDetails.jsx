import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import instance from "../../../api/axiosInstance";
import Select from "react-select";
import {
  AlertTriangle,
  XCircle,
  Trash2,
  ArrowRight,
  Plus,
  Loader2,
  CheckCircle,
  Utensils,
} from "lucide-react";

export default function PlatterDetails() {
  const { id } = useParams();
  const location = useLocation();
  const dashboardBase = location.pathname.startsWith("/operations-manager")
    ? "/operations-manager"
    : location.pathname.startsWith("/inventory-manager")
      ? "/inventory-manager"
      : "/admin/dashboard";

  const [platterDetails, setPlatterDetails] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [stations, setStations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    name_dari: "",
    name_pashto: "",
    description: "",
    description_dari: "",
    description_pashto: "",
    price: "",
    category: "",
    station: "",
    is_manually_available: true,
    items: [],
    image: "",
  });

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await instance.delete(`/menu/platters/${id}/`);
      navigate(`${dashboardBase}/menu`, { replace: true });
    } catch (err) {
      console.error("Failed to delete platter:", err);
      setError("Failed to delete platter.");
    } finally {
      setDeleting(false);
    }
  };

  const fetchStations = async (currentPlatterStation) => {
    try {
      const res = await instance.get("/menu/stations/");
      const data = res.data?.results || res.data || [];
      const stationList = Array.isArray(data) ? data : [];
      setStations(stationList);

      // Automatically turn ON the default station if platter doesn't have one assigned
      if (!currentPlatterStation && stationList.length > 0) {
        const defaultSt =
          stationList.find((st) => st.is_default) || stationList[0];
        if (defaultSt) {
          setFormData((prev) => ({ ...prev, station: Number(defaultSt.id) }));
        }
      }
    } catch (error) {
      console.log(error);
      setStations([]);
    }
  };

  const fetchPlatterDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await instance.get(`/menu/platters/${id}/`);

      setPlatterDetails(res.data);

      const currentStationId = res.data.station?.id || res.data.station || "";

      setFormData({
        name: res.data.name || "",
        name_dari: res.data.name_dari || "",
        name_pashto: res.data.name_pashto || "",
        description: res.data.description || "",
        description_dari: res.data.description_dari || "",
        description_pashto: res.data.description_pashto || "",
        price: res.data.price || "",
        category: res.data.category || "",
        station: currentStationId ? Number(currentStationId) : "",
        is_manually_available: res.data.is_manually_available,
        image: res.data.image || null,
        items: res.data.items || [],
      });

      fetchStations(currentStationId);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch platter details");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await instance.get("/menu/menu-items/");
      setMenuItems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPlatterDetails();
    fetchMenuItems();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    updatedItems[index][field] = field === "menu_item" ? Number(value) : value;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          menu_item: "",
          quantity: 1,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        name_dari: formData.name_dari,
        name_pashto: formData.name_pashto,
        description: formData.description,
        description_dari: formData.description_dari,
        description_pashto: formData.description_pashto,
        price: formData.price,
        category: formData.category,
        station: formData.station ? Number(formData.station) : null,
        is_manually_available: formData.is_manually_available,

        items: formData.items.map((item) => ({
          menu_item: Number(item.menu_item),
          quantity: Number(item.quantity),
        })),
      };

      if (selectedImage) {
        const fd = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
          if (key === "items") {
            fd.append("items", JSON.stringify(value));
          } else {
            fd.append(key, value ?? "");
          }
        });

        fd.append("image", selectedImage);

        await instance.put(`/menu/platters/${id}/`, fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await instance.put(`/menu/platters/${id}/`, payload);
      }

      alert("Platter updated successfully");

      fetchPlatterDetails();
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);

      setError("Failed to update platter");
    } finally {
      setSaving(false);
    }
  };

  const totalCost = Number(platterDetails?.total_cost || 0);
  const profit = Number(formData.price || 0) - totalCost;

  const menuOptions = menuItems.map((mi) => ({
    value: mi.id,
    label: mi.name,
  }));

  if (loading) {
    return (
      <div className="p-5 text-[var(--theme-text-primary)]">Loading...</div>
    );
  }

  const unavailableReasons = platterDetails?.unavailable_reasons || [];
  const finalAvailability = platterDetails?.final_availability ?? true;
  const isManuallyAvailable = platterDetails?.is_manually_available ?? true;
  const hasUnavailableReasons =
    !finalAvailability && unavailableReasons.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-5 bg-[var(--theme-background)] min-h-screen">
      {/* HEADER WITH DELETE BUTTON */}
      <div className="flex justify-between items-center border-b border-[var(--theme-border)] pb-4 mb-6">
        <h1 className="text-3xl font-bold text-[var(--theme-text-primary)]">
          Update Platter
        </h1>
        <button
          type="button"
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition"
        >
          <Trash2 className="h-4 w-4" />
          Delete Platter
        </button>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Platter
                </h3>
                <p className="text-xs text-gray-500">Confirmation Required</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to permanently delete{" "}
              <strong className="text-gray-900">
                "{formData.name || "this platter"}"
              </strong>
              ? This action cannot be undone and will remove it from all menus.
            </p>
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete Platter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>
      )}

      {/* AVAILABILITY STATUS & UNAVAILABLE REASONS */}
      {!finalAvailability && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-red-500" />
            <span className="font-semibold text-red-700 text-sm uppercase tracking-wide">
              Currently Unavailable
            </span>
          </div>

          {!isManuallyAvailable && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-100 rounded-md px-3 py-2">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <span>
                This platter has been{" "}
                <strong>manually marked unavailable</strong>.
              </span>
            </div>
          )}

          {hasUnavailableReasons && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-800">
                The following menu items in this platter are unavailable:
              </p>

              {unavailableReasons.map((reason) => (
                <div
                  key={`${reason.type}-${reason.id}`}
                  className="flex items-center justify-between bg-white border border-red-200 rounded-md px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {reason.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {reason.type === "menu_item"
                          ? "Menu item is unavailable"
                          : reason.type === "ingredient"
                            ? `Need ${Number(reason.required).toFixed(2)} ${reason.unit}, only ${Number(reason.available).toFixed(2)} ${reason.unit} in stock`
                            : "Unavailable"}
                      </p>
                    </div>
                  </div>

                  {reason.type === "menu_item" && (
                    <Link
                      to={`${dashboardBase}/menu/item/${reason.id}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline whitespace-nowrap"
                    >
                      View Item →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {finalAvailability && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-2 mb-6">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="font-semibold text-green-700 text-sm">
            Available
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* KITCHEN STATION ROUTING BOXES */}
        <div className="border border-[var(--theme-border)] rounded-xl p-4 bg-[var(--theme-surface)] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-[var(--theme-text-primary)]">
              <Utensils className="h-4 w-4 text-[var(--theme-primary)]" />
              <span>Platter Station Routing</span>
            </label>
            <span className="text-xs font-semibold text-[var(--theme-text-muted)]">
              Where should this platter be prepared?
            </span>
          </div>
          <p className="text-xs text-[var(--theme-text-secondary)]">
            Select which kitchen station prepares this entire platter when
            ordered:
          </p>
          {stations.length === 0 ? (
            <p className="text-xs text-[var(--theme-text-muted)] italic py-2">
              No stations available. Using default Main Kitchen.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {stations.map((st) => {
                const isSelected = Number(formData.station) === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => setFormData({ ...formData, station: st.id })}
                    className={`cursor-pointer rounded-lg border p-3 flex flex-col justify-between transition-all duration-200 ${
                      isSelected
                        ? "border-[var(--theme-primary)] bg-[var(--theme-primary-subtle)] shadow-sm ring-1 ring-[var(--theme-primary)]"
                        : "border-[var(--theme-border)] bg-[var(--theme-card)] hover:border-[var(--theme-border-strong)] hover:bg-[var(--theme-hover)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-[var(--theme-text-primary)] truncate">
                        {st.name}
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]"
                            : "border-[var(--theme-border-strong)]"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    {st.is_default && (
                      <div className="mt-2 flex justify-start">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--theme-primary-soft)] text-[var(--theme-primary)] uppercase shrink-0">
                          Default
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* image */}
        <div>
          <label className="block mb-2 font-semibold text-[var(--theme-text-primary)]">
            Platter Image
          </label>

          {formData.image && !selectedImage && (
            <img
              src={formData.image}
              alt="platter"
              className="w-40 h-40 object-cover rounded mb-3 border border-[var(--theme-border)]"
            />
          )}

          {selectedImage && (
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="preview"
              className="w-40 h-40 object-cover rounded mb-3 border border-[var(--theme-border)]"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setSelectedImage(file);
              }
            }}
            className="w-full border border-[var(--theme-input-border)] p-3 rounded-lg bg-[var(--theme-input-bg)] text-[var(--theme-text-primary)]"
          />
        </div>

        {/* English Name */}
        <div>
          <label className="block mb-2 font-semibold text-[var(--theme-text-primary)]">
            Name (English)
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-[var(--theme-input-border)] p-3 rounded-lg bg-[var(--theme-input-bg)] text-[var(--theme-text-primary)]"
          />
        </div>

        {/* Dari Name */}
        <div>
          <label className="block mb-2 font-semibold text-[var(--theme-text-primary)]">
            نام (دری)
          </label>
          <input
            type="text"
            name="name_dari"
            value={formData.name_dari}
            onChange={handleChange}
            className="w-full border border-[var(--theme-input-border)] p-3 rounded-lg bg-[var(--theme-input-bg)] text-[var(--theme-text-primary)]"
            dir="rtl"
            placeholder="نام پلاتر به دری"
          />
        </div>

        {/* Pashto Name */}
        <div>
          <label className="block mb-2 font-semibold text-[var(--theme-text-primary)]">
            نوم (پښتو)
          </label>
          <input
            type="text"
            name="name_pashto"
            value={formData.name_pashto}
            onChange={handleChange}
            className="w-full border border-[var(--theme-input-border)] p-3 rounded-lg bg-[var(--theme-input-bg)] text-[var(--theme-text-primary)]"
            dir="rtl"
            placeholder="د پلاتر نوم په پښتو"
          />
        </div>

        {/* English Description */}
        <div>
          <label className="block mb-2 font-semibold text-[var(--theme-text-primary)]">
            Description (English)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-[var(--theme-input-border)] p-3 rounded-lg bg-[var(--theme-input-bg)] text-[var(--theme-text-primary)]"
            rows={4}
          />
        </div>

        {/* Dari Description */}
        <div>
          <label className="block mb-2 font-semibold text-[var(--theme-text-primary)]">
            توضیحات (دری)
          </label>
          <textarea
            name="description_dari"
            value={formData.description_dari}
            onChange={handleChange}
            className="w-full border border-[var(--theme-input-border)] p-3 rounded-lg bg-[var(--theme-input-bg)] text-[var(--theme-text-primary)]"
            rows={4}
            dir="rtl"
            placeholder="توضیحات پلاتر به دری..."
          />
        </div>

        {/* Pashto Description */}
        <div>
          <label className="block mb-2 font-semibold text-[var(--theme-text-primary)]">
            توضیحات (پښتو)
          </label>
          <textarea
            name="description_pashto"
            value={formData.description_pashto}
            onChange={handleChange}
            className="w-full border border-[var(--theme-input-border)] p-3 rounded-lg bg-[var(--theme-input-bg)] text-[var(--theme-text-primary)]"
            rows={4}
            dir="rtl"
            placeholder="د پلاتر توضیحات په پښتو..."
          />
        </div>

        {/* price */}
        <div>
          <label className="block mb-2 font-semibold text-[var(--theme-text-primary)]">
            Price
          </label>

          <input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border border-[var(--theme-input-border)] p-3 rounded-lg bg-[var(--theme-input-bg)] text-[var(--theme-text-primary)]"
          />

          <div className="mt-3 space-y-1 text-sm text-[var(--theme-text-primary)]">
            <p>
              <span className="font-semibold">Total Cost:</span>{" "}
              {totalCost.toFixed(2)}
            </p>

            <p className="text-[var(--theme-success)]">
              <span className="font-semibold">Profit:</span> {profit.toFixed(2)}
            </p>
          </div>
        </div>

        {/* availability */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_manually_available"
            checked={formData.is_manually_available}
            onChange={handleChange}
            className="rounded border-[var(--theme-border-strong)] text-[var(--theme-primary)]"
          />

          <label className="font-semibold text-[var(--theme-text-primary)]">
            Available
          </label>
        </div>

        {/* platter items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--theme-text-primary)]">
              Platter Items
            </h2>

            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-text-inverse)] px-4 py-2 rounded-lg font-semibold transition"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => {
              const unavailableReason = unavailableReasons.find(
                (r) =>
                  r.type === "menu_item" && r.id === Number(item.menu_item),
              );

              const selectedMenuItem = menuItems.find(
                (mi) => mi.id === Number(item.menu_item),
              );

              return (
                <div
                  key={index}
                  className={`rounded-xl border transition-all duration-300 ${
                    unavailableReason
                      ? "border-red-300 shadow-sm shadow-red-100"
                      : "border-[var(--theme-border)] hover:border-[var(--theme-border-strong)]"
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className={`flex items-center justify-between px-4 py-2.5 rounded-t-xl ${
                      unavailableReason
                        ? "bg-red-50 border-b border-red-200"
                        : "bg-[var(--theme-muted)] border-b border-[var(--theme-border)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--theme-text-muted)]">
                        #{index + 1}
                      </span>
                      {selectedMenuItem && (
                        <span className="text-sm font-medium text-[var(--theme-text-primary)]">
                          {selectedMenuItem.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {unavailableReason && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Unavailable
                        </span>
                      )}

                      {!unavailableReason && selectedMenuItem && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 bg-[var(--theme-card)] rounded-b-xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      {/* Menu Item Select */}
                      <div className="md:col-span-6">
                        <label className="block mb-1.5 text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
                          Menu Item
                        </label>
                        <Select
                          options={menuOptions}
                          value={menuOptions.find(
                            (opt) => opt.value === Number(item.menu_item),
                          )}
                          onChange={(selected) =>
                            handleItemChange(
                              index,
                              "menu_item",
                              selected ? selected.value : "",
                            )
                          }
                          placeholder="Select menu item..."
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                            control: (base, state) => ({
                              ...base,
                              borderColor: unavailableReason
                                ? "var(--theme-danger)"
                                : state.isFocused
                                  ? "var(--theme-input-focus)"
                                  : "var(--theme-input-border)",
                              boxShadow: state.isFocused
                                ? "0 0 0 4px var(--theme-input-ring)"
                                : "none",
                              "&:hover": {
                                borderColor: unavailableReason
                                  ? "var(--theme-danger-hover)"
                                  : "var(--theme-input-focus)",
                              },
                            }),
                          }}
                        />
                      </div>

                      {/* Quantity (Supports fractional floats like 0.2, 0.5) */}
                      <div className="md:col-span-3">
                        <label className="block mb-1.5 text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          className={`w-full border rounded-lg px-3 py-2 text-sm bg-[var(--theme-input-bg)] text-[var(--theme-text-primary)] focus:outline-none focus:ring-2 transition-colors ${
                            unavailableReason
                              ? "border-red-300 focus:ring-red-300"
                              : "border-[var(--theme-input-border)] focus:ring-[var(--theme-input-ring)]"
                          }`}
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="md:col-span-3">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Unavailable Warning Banner */}
                    {unavailableReason && (
                      <div className="mt-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 shrink-0">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-red-800">
                            {unavailableReason.name} is currently unavailable
                          </p>
                          <p className="text-xs text-red-600 mt-0.5">
                            This item cannot be served due to stock or
                            availability issues.
                          </p>
                        </div>

                        <Link
                          to={`${dashboardBase}/menu/item/${unavailableReason.id}`}
                          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                        >
                          View Details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-text-inverse)] font-bold px-6 py-3 rounded-lg shadow-sm disabled:opacity-50 transition"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Updating..." : "Update Platter"}
        </button>
      </form>
    </div>
  );
}
