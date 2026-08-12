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
    />
  );
}

export function BranchSelectionSkeleton() {
  return (
    <div className="min-h-screen bg-orange-50/40 px-4 py-8">
      <div className="mx-auto max-w-6xl animate-pulse space-y-8">
        <div className="h-64 rounded-lg bg-white shadow-sm" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-5 h-14 w-14 rounded-lg bg-gray-100" />
              <div className="mb-3 h-5 w-2/3 rounded bg-gray-100" />
              <div className="mb-2 h-4 w-full rounded bg-gray-100" />
              <div className="mb-6 h-4 w-1/2 rounded bg-gray-100" />
              <div className="h-10 rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BranchSelectionError({ onRetry }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50/40 px-4">
      <div className="w-full max-w-md rounded-lg border border-red-100 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <h1 className="text-xl font-bold text-gray-950">Unable to load branches</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please refresh and try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export function BranchUnavailable({ restaurant }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50/40 px-4">
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
  );
}

export default function BranchSelectionPage({ restaurant, branches = [] }) {
  const navigate = useNavigate();
  const coverUrl = getMediaUrl(restaurant?.cover_image || restaurant?.logo);

  return (
    <main className="min-h-screen bg-orange-50/40">
      <section className="relative overflow-hidden bg-gray-950 text-white">
        {coverUrl && (
          <img
            src={coverUrl}
            alt={restaurant?.name}
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/50 to-gray-950" />

        <div className="relative mx-auto flex min-h-[360px] max-w-6xl flex-col justify-end px-4 py-10 sm:px-6 lg:px-8">
          <ImageMark
            src={restaurant?.logo}
            name={restaurant?.name || "Restaurant"}
            className="mb-5 h-20 w-20 rounded-lg border border-white/20 bg-white/10 shadow-xl"
          />
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
            Choose a Branch
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
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

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-950">Branches</h2>
            <p className="mt-1 text-sm text-gray-600">
              Select the branch you want to order from.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
            {branches.length} active
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <article
              key={branch.id}
              className="group flex h-full flex-col rounded-lg border border-orange-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
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
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {branch.is_open ? "Open" : "Closed"}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-950">{branch.name}</h3>

              <div className="mt-4 grid gap-3 text-sm text-gray-600">
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
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-orange-600"
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
