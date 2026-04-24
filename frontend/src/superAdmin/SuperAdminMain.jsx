import React, { useEffect, useState } from "react";
import instance from "../api/axiosInstance"; // Adjust path as needed
import RestaurantCard from "./RestaurantCard";
import RestaurantModal from "./RestaurantModal";
import SubscriptionModal from "./SubscriptionModal";

export default function SuperAdminMain() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    getRestaurants();
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Super Admin Dashboard
          </h1>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
          >
            + Add Restaurant
          </button>
        </div>

        {loading ? (
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
              />
            ))}
          </div>
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
