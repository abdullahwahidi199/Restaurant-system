import React from "react";
import { Link } from "react-router-dom";

export default function PageHeader({
  breadcrumb,
  eyebrow,
  icon: Icon,
  title,
  description,
  actions,
  quickStats = [],
  tabs = [],
  activeTab,
  onTab,
}) {
  return (
    <header className="-mx-4 border-b px-4 py-4 shadow-sm theme-surface lg:-mx-5 lg:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          {breadcrumb && (
            <div className="mb-2 text-xs font-semibold theme-text-muted">{breadcrumb}</div>
          )}
          <div className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide theme-muted">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {eyebrow}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-normal theme-text-primary">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-3xl text-sm theme-text-muted">{description}</p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {quickStats.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:flex">
              {quickStats.map((stat) => (
                <div key={stat.label} className="theme-card px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide theme-text-muted">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 text-sm font-bold theme-text-primary">{stat.value}</p>
                </div>
              ))}
            </div>
          )}
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
      {tabs.length > 0 && (
        <nav className="mt-4 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            const className = `inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition ${
              active
                ? "theme-btn-primary shadow-sm"
                : "theme-btn-ghost"
            }`;
            const content = (
              <>
                {tab.icon && React.createElement(tab.icon, { className: "h-4 w-4" })}
                {tab.label}
              </>
            );
            return tab.to ? (
              <Link key={tab.key} to={tab.to} className={className}>
                {content}
              </Link>
            ) : (
              <button key={tab.key} type="button" onClick={() => onTab?.(tab.key)} className={className}>
                {content}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
