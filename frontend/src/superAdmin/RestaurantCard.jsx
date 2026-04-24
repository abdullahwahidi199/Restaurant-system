import React from "react";
import instance from "../api/axiosInstance";

export default function RestaurantCard({
  restaurant,
  onEdit,
  onDelete,
  onManageSub,
}) {
  // Destructure subscription if it exists
  const { subscription } = restaurant;
  console.log(subscription);
  console.log(restaurant);

  const endSubscription = async (restaurantId) => {
    try {
      await instance.post(`restaurant/disable-subscription/${restaurantId}/`);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div className="p-5">
        <div className="flex items-center space-x-4">
          {/* Logo Display */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt="logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No Logo
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">
              {restaurant.name}
            </h3>
            <p className="text-sm text-gray-600">{restaurant.email}</p>
            <p className="text-sm text-gray-500">{restaurant.phone}</p>
          </div>
        </div>

        {/* Subscription Status Badge */}
        <div className="mt-4 flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              restaurant.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {restaurant.is_active ? "Active" : "Inactive"}
          </span>

          {subscription ? (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                subscription.is_valid
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {subscription.is_valid ? "Subscribed" : "Expired"}
              <button onClick={() => endSubscription(restaurant.id)}>
                End
              </button>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
              No Subscription
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex justify-end space-x-2 border-t pt-4">
          <button
            onClick={() => onManageSub(restaurant)}
            className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 text-sm font-medium"
          >
            Subscription
          </button>
          <button
            onClick={() => onEdit(restaurant)}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(restaurant.id)}
            className="px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
