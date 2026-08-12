import React from "react";
import { AlertTriangle, Loader2, Save } from "lucide-react";

export function SettingsSection({ title, description, children, actions }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            {description && (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

export function FieldGrid({ children, columns = 2 }) {
  const columnClass =
    columns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  return <div className={`grid ${columnClass} gap-5`}>{children}</div>;
}

export function SettingsSaveButton({ loading, children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {children}
    </button>
  );
}

export function SettingsLoadingState({ label }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-44 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <div className="hidden rounded-lg border border-slate-200 bg-white p-3 lg:block">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="mb-2 h-10 animate-pulse rounded bg-slate-100"
            />
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-6 h-6 w-52 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function SettingsErrorState({ title, message }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
