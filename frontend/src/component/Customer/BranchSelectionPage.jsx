import React from "react";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Store,
  Utensils,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMediaUrl } from "../../api/publicOrdering";
import Header from "./Header";

function ImageMark({ src, name, className = "" }) {
  const imageUrl = getMediaUrl(src);

  if (!imageUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-orange-50 text-orange-600 ${className}`}
      >
        <Utensils className="h-6 w-6" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      className={`object-cover ${className}`}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = "/rmsFavicon.png";
      }}
    />
  );
}

export function BranchSelectionSkeleton() {
  return (
    <div className="customer-ordering-page min-h-screen bg-[#fbfaf7] px-4 py-8">
      <div className="mx-auto max-w-6xl animate-pulse space-y-8">
        <div className="h-20 rounded-2xl border border-stone-200 bg-white shadow-sm" />
        <div className="h-64 rounded-lg bg-stone-200 shadow-sm" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-5 h-14 w-14 rounded-lg bg-stone-100" />
              <div className="mb-3 h-5 w-2/3 rounded bg-stone-100" />
              <div className="mb-2 h-4 w-full rounded bg-stone-100" />
              <div className="mb-6 h-4 w-1/2 rounded bg-stone-100" />
              <div className="h-10 rounded-lg bg-stone-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BranchSelectionError({ onRetry }) {
  return (
    <div className="customer-ordering-page flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
      <div className="w-full max-w-md rounded-lg border border-red-100 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <h1 className="text-xl font-bold text-gray-950">Unable to load branches</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please refresh and try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export function BranchUnavailable({ restaurant }) {
  return (
    <main className="customer-ordering-page min-h-screen bg-[#fbfaf7]">
      <Header restaurantInfo={restaurant} restaurantSlug={restaurant?.slug} />
      <div className="flex min-h-[calc(100dvh-6rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-lg border border-orange-100 bg-white p-8 text-center shadow-sm">
          <ImageMark
            src={restaurant?.logo}
            name={restaurant?.name || "Restaurant"}
            className="mx-auto mb-5 h-20 w-20 rounded-lg border border-orange-100"
          />
          <h1 className="text-2xl font-bold text-gray-950">
            {restaurant?.name || "This restaurant"} is unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Online menu access is not available for any branch right now.
            Please check back later.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function BranchSelectionPage({ restaurant, branches = [] }) {
  const navigate = useNavigate();
  const coverUrl = getMediaUrl(restaurant?.cover_image || restaurant?.logo);

  return (
    <main className="customer-ordering-page min-h-screen bg-[#fbfaf7] text-stone-950">
      <Header restaurantInfo={restaurant} restaurantSlug={restaurant?.slug} />

      <section className="relative overflow-hidden border-y border-stone-800 bg-stone-950 text-white">
        {coverUrl && (
          <img
            src={coverUrl}
            alt={restaurant?.name}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/75 to-stone-950/45 rtl:bg-gradient-to-l" />

        <div className="relative mx-auto flex min-h-[330px] max-w-7xl flex-col justify-end px-4 py-10 sm:min-h-[370px] sm:px-6 lg:px-8">
          <ImageMark
            src={restaurant?.logo}
            name={restaurant?.name || "Restaurant"}
            className="mb-5 h-20 w-20 rounded-lg border border-white/20 bg-white/10 shadow-xl"
          />
          <p className="mb-2 text-xs font-black uppercase text-orange-200">
            Choose a Branch
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            {restaurant?.name}
          </h1>
          {restaurant?.slogan && (
            <p className="mt-3 max-w-2xl text-lg text-orange-50">
              {restaurant.slogan}
            </p>
          )}
          {restaurant?.description && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
              {restaurant.description}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-stone-950">Branches</h2>
            <p className="mt-1 text-sm text-stone-600">
              Select the branch you want to order from.
            </p>
          </div>
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-bold text-stone-600 shadow-sm">
            {branches.length} active
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <article
              key={branch.id}
              className="group flex h-full flex-col rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-stone-950/10"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <ImageMark
                  src={branch.logo || restaurant?.logo}
                  name={branch.name}
                  className="h-14 w-14 rounded-lg border border-gray-100"
                />
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    branch.is_open
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {branch.is_open ? "Open" : "Closed"}
                </span>
              </div>

              <h3 className="text-xl font-black text-stone-950">{branch.name}</h3>

              <div className="mt-4 grid gap-3 text-sm text-stone-600">
                {branch.address && (
                  <div className="flex gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    <span>{branch.address}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    <span>{branch.phone}</span>
                  </div>
                )}
                {branch.opening_hours && (
                  <div className="flex gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    <span>{branch.opening_hours}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate(`/${restaurant.slug}/${branch.slug}`)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              >
                <Store className="h-4 w-4" />
                View Menu
                <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
