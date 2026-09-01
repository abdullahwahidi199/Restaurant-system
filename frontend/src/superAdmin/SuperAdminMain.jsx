import React, { useEffect, useState } from "react";
import instance from "../api/axiosInstance"; // Adjust path as needed
import RestaurantCard from "./RestaurantCard";
import RestaurantModal from "./RestaurantModal";
import SubscriptionModal from "./SubscriptionModal";
import { Building2, Save, ShieldCheck } from "lucide-react";

export default function SuperAdminMain() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("restaurants");
  const [securitySettings, setSecuritySettings] = useState(null);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [landingVisibilityStatus, setLandingVisibilityStatus] = useState({});

  // Modal States
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  // Data for Edit/Manage
  const [editRestaurant, setEditRestaurant] = useState(null);
  const [selectedRestaurantForSub, setSelectedRestaurantForSub] =
    useState(null);

  // --- API CALLS ---

  const getRestaurants = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/restaurant/restaurants/");
      setRestaurants(res.data);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSecuritySettings = async () => {
    try {
      setSecurityLoading(true);
      const res = await instance.get("/users/security/login-rate-limit/");
      setSecuritySettings(res.data);
    } catch (err) {
      console.error("Failed to fetch security settings:", err);
    } finally {
      setSecurityLoading(false);
    }
  };

  useEffect(() => {
    getRestaurants();
    getSecuritySettings();
  }, []);

  // Create or Update Restaurant
  const handleSaveRestaurant = async (formData, id) => {
    try {
      if (id) {
        // Update
        await instance.patch(`/restaurant/restaurants/${id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Create
        await instance.post("/restaurant/restaurants/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setIsRestModalOpen(false);
      setEditRestaurant(null);
      getRestaurants(); // Refresh list
    } catch (err) {
      console.error("Failed to save restaurant:", err.response?.data || err);
      alert("Error saving restaurant. Check console for details.");
    }
  };

  // Delete Restaurant
  const handleDeleteRestaurant = async (id) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      try {
        await instance.delete(`/restaurant/restaurants/${id}/`);
        getRestaurants();
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    }
  };

  // Create or Update Subscription
  const handleSaveSubscription = async (payload, existingId) => {
    try {
      if (existingId) {
        // Update existing subscription
        await instance.patch(
          `/restaurant/subscriptions/${existingId}/`,
          payload,
        );
      } else {
        // Create new subscription
        await instance.post("/restaurant/subscriptions/", payload);
      }
      setIsSubModalOpen(false);
      setSelectedRestaurantForSub(null);
      getRestaurants(); // Refresh to show updated status
    } catch (err) {
      console.error("Failed to save subscription:", err.response?.data || err);
      alert("Error saving subscription.");
    }
  };

  // --- HANDLERS TO OPEN MODALS ---

  const handleOpenEdit = (restaurant) => {
    setEditRestaurant(restaurant);
    setIsRestModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditRestaurant(null);
    setIsRestModalOpen(true);
  };

  const handleOpenSubModal = (restaurant) => {
    setSelectedRestaurantForSub(restaurant);
    setIsSubModalOpen(true);
  };

  const handleLandingVisibilityChange = async (restaurant, nextValue) => {
    const previousValue = Boolean(restaurant.show_on_landing);

    setRestaurants((current) =>
      current.map((item) =>
        item.id === restaurant.id
          ? { ...item, show_on_landing: nextValue }
          : item,
      ),
    );
    setLandingVisibilityStatus((current) => ({
      ...current,
      [restaurant.id]: {
        state: "pending",
        message: nextValue ? "Adding to landing page..." : "Removing from landing page...",
      },
    }));

    try {
      const response = await instance.patch(
        `/restaurant/restaurants/${restaurant.id}/`,
        { show_on_landing: nextValue },
      );
      const savedValue =
        typeof response.data?.show_on_landing === "boolean"
          ? response.data.show_on_landing
          : nextValue;

      setRestaurants((current) =>
        current.map((item) =>
          item.id === restaurant.id
            ? { ...item, show_on_landing: savedValue }
            : item,
        ),
      );
      setLandingVisibilityStatus((current) => ({
        ...current,
        [restaurant.id]: {
          state: "success",
          message: savedValue
            ? "Now shown in landing-page collections."
            : "Hidden from landing-page collections.",
        },
      }));
    } catch (err) {
      setRestaurants((current) =>
        current.map((item) =>
          item.id === restaurant.id
            ? { ...item, show_on_landing: previousValue }
            : item,
        ),
      );

      const responseMessage = err.response?.data?.show_on_landing;
      const message = Array.isArray(responseMessage)
        ? responseMessage[0]
        : typeof responseMessage === "string"
          ? responseMessage
          : "Could not update landing visibility. Try again.";

      setLandingVisibilityStatus((current) => ({
        ...current,
        [restaurant.id]: { state: "error", message },
      }));
      console.error(
        "Failed to update landing visibility:",
        err.response?.data || err,
      );
    }
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSecurity = async (event) => {
    event.preventDefault();
    try {
      setSecuritySaving(true);
      const payload = {
        enabled: Boolean(securitySettings.enabled),
        max_failed_attempts: Number(securitySettings.max_failed_attempts),
        window_minutes: Number(securitySettings.window_minutes),
        lockout_minutes: Number(securitySettings.lockout_minutes),
      };
      const res = await instance.patch(
        "/users/security/login-rate-limit/",
        payload,
      );
      setSecuritySettings(res.data);
    } catch (err) {
      console.error("Failed to save security settings:", err.response?.data || err);
      alert("Error saving security settings.");
    } finally {
      setSecuritySaving(false);
    }
  };

  const tabClasses = (tab) =>
    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
      activeTab === tab
        ? "bg-gray-900 text-white shadow-sm"
        : "text-gray-600 hover:bg-white hover:text-gray-900"
    }`;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-5 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Super Admin Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("restaurants")}
                className={tabClasses("restaurants")}
              >
                <Building2 size={16} />
                Restaurants
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={tabClasses("security")}
              >
                <ShieldCheck size={16} />
                Security
              </button>
            </div>
            {activeTab === "restaurants" && (
              <button
                onClick={handleOpenAdd}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
              >
                + Add Restaurant
              </button>
            )}
          </div>
        </div>

        {activeTab === "restaurants" &&
          (loading ? (
            <div className="text-center py-10 text-gray-500">
              Loading restaurants...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((rest) => (
                <RestaurantCard
                  key={rest.id}
                  restaurant={rest}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteRestaurant}
                  onManageSub={handleOpenSubModal}
                  onLandingVisibilityChange={handleLandingVisibilityChange}
                  landingVisibilityStatus={landingVisibilityStatus[rest.id]}
                />
              ))}
            </div>
          ))}

        {activeTab === "security" && (
          <form
            onSubmit={handleSaveSecurity}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Login Rate Limiting
                </h2>
                <p className="text-sm text-gray-500">
                  Applies separately to staff and customer login attempts.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(securitySettings?.enabled)}
                  onChange={(e) => handleSecurityChange("enabled", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={securityLoading || !securitySettings}
                />
                Enabled
              </label>
            </div>

            {securityLoading || !securitySettings ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Loading security settings...
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="text-sm font-medium text-gray-700">
                    Failed attempts
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={securitySettings.max_failed_attempts}
                      onChange={(e) =>
                        handleSecurityChange("max_failed_attempts", e.target.value)
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    Window minutes
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={securitySettings.window_minutes}
                      onChange={(e) =>
                        handleSecurityChange("window_minutes", e.target.value)
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    Lockout minutes
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={securitySettings.lockout_minutes}
                      onChange={(e) =>
                        handleSecurityChange("lockout_minutes", e.target.value)
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                </div>
                <div className="mt-5 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={securitySaving}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
                  >
                    <Save size={16} />
                    {securitySaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Modals */}
        <RestaurantModal
          isOpen={isRestModalOpen}
          onClose={() => setIsRestModalOpen(false)}
          onSave={handleSaveRestaurant}
          editData={editRestaurant}
        />

        <SubscriptionModal
          isOpen={isSubModalOpen}
          onClose={() => setIsSubModalOpen(false)}
          onSave={handleSaveSubscription}
          restaurant={selectedRestaurantForSub}
        />
      </div>
    </div>
  );
}
