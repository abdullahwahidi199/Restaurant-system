import React from "react";
import instance from "../api/axiosInstance";

export default function RestaurantCard({
  restaurant,
  onEdit,
  onDelete,
  onManageSub,
  onLandingVisibilityChange,
  landingVisibilityStatus,
}) {
  // Destructure subscription if it exists
  const { subscription } = restaurant;
  const BASE_URL = import.meta.env.VITE_MEDIA_URL;
  const isLandingVisibilityPending =
    landingVisibilityStatus?.state === "pending";
  const isShownOnLanding = Boolean(restaurant.show_on_landing);
  const visibilityDescriptionId = `landing-visibility-description-${restaurant.id}`;
  const visibilityStatusId = `landing-visibility-status-${restaurant.id}`;
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
                src={`${BASE_URL}${restaurant.logo}`}
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

          {subscription && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              {subscription.branches_used}/{subscription.max_branches} Branches
              Used
            </span>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                Show on landing
              </p>
              <p
                id={visibilityDescriptionId}
                className="mt-0.5 text-xs leading-5 text-gray-600"
              >
                Controls curated landing-page lists only. Search, direct links,
                menus, and ordering stay active.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isShownOnLanding}
              aria-describedby={`${visibilityDescriptionId} ${visibilityStatusId}`}
              aria-label={`Show ${restaurant.name} on the landing page`}
              disabled={isLandingVisibilityPending}
              onClick={() =>
                onLandingVisibilityChange(restaurant, !isShownOnLanding)
              }
              className="inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              <span
                aria-hidden="true"
                className={`relative block h-6 w-11 rounded-full transition-colors ${
                  isShownOnLanding ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    isShownOnLanding ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          </div>
          <p
            id={visibilityStatusId}
            role={landingVisibilityStatus?.state === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`mt-2 min-h-5 text-xs font-medium ${
              landingVisibilityStatus?.state === "error"
                ? "text-red-700"
                : landingVisibilityStatus?.state === "success"
                  ? "text-green-700"
                  : "text-gray-500"
            }`}
          >
            {landingVisibilityStatus?.message ||
              (isShownOnLanding
                ? "Included in landing-page collections."
                : "Not included in landing-page collections.")}
          </p>
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
