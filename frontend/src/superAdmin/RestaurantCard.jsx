import React from "react";
import instance from "../api/axiosInstance";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function RestaurantCard({
  restaurant,
  onEdit,
  onDelete,
  onManageSub,
  onLandingVisibilityChange,
  landingVisibilityStatus,
}) {
                 const { t: autoT } = useAutoTranslation();
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
                alt={autoT("legacy.logo_5807dd60")}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                {autoT("legacy.no_logo_6fc0b633")}
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
            {restaurant.is_active ? autoT("staff.status.active") : autoT("staff.status.inactive")}
          </span>

          {subscription ? (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                subscription.is_valid
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {subscription.is_valid ? autoT("legacy.subscribed_dd1242a8") : autoT("legacy.expired_a689a999")}
              <button onClick={() => endSubscription(restaurant.id)}>
                {autoT("legacy.end_a2bb9d34")}
              </button>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
              {autoT("legacy.no_subscription_a78e39c3")}
            </span>
          )}

          {subscription && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              {subscription.branches_used}/{subscription.max_branches} {autoT("legacy.branches_used_13864ccb")}
            </span>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {autoT("legacy.show_on_landing_6835375e")}
              </p>
              <p
                id={visibilityDescriptionId}
                className="mt-0.5 text-xs leading-5 text-gray-600"
              >
                {autoT("legacy.controls_curated_landing_page_lists_only_search_direct_3ef372a0")}
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
                ? autoT("legacy.included_in_landing_page_collections_37053657")
                : autoT("legacy.not_included_in_landing_page_collections_2d97eba7"))}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex justify-end space-x-2 border-t pt-4">
          <button
            onClick={() => onManageSub(restaurant)}
            className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 text-sm font-medium"
          >
            {autoT("legacy.subscription_8fde48f3")}
          </button>
          <button
            onClick={() => onEdit(restaurant)}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm font-medium"
          >
            {autoT("staff.table.edit")}
          </button>
          <button
            onClick={() => onDelete(restaurant.id)}
            className="px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 text-sm font-medium"
          >
            {autoT("staff.table.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
