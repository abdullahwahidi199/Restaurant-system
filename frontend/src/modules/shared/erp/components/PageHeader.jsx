import React, { useEffect, useRef } from "react";
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
  compactMobile = false,
}) {
  const activeTabRef = useRef(null);

  useEffect(() => {
    if (
      !compactMobile ||
      typeof window === "undefined" ||
      !window.matchMedia("(max-width: 979px)").matches
    ) {
      return;
    }

    activeTabRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeTab, compactMobile]);

  return (
    <header className="erp-page-header">
      {breadcrumb && (
        <div className="mb-2 text-xs font-medium theme-text-muted">{breadcrumb}</div>
      )}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon && (
            <span className="erp-page-icon grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[rgb(var(--theme-primary-rgb)/0.2)] bg-[var(--theme-primary-soft)] text-[var(--theme-primary-hover)]">
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide theme-text-muted">{eyebrow}</p>
            )}
            <h1 className="erp-page-title font-semibold tracking-tight theme-text-primary">{title}</h1>
            {description && (
              <p className="mt-0.5 max-w-3xl text-[13px] leading-[1.4] theme-text-secondary">{description}</p>
            )}
          </div>
        </div>
        <div className={`flex min-w-0 flex-col ${compactMobile ? "gap-2" : "gap-3"} sm:flex-row sm:items-center sm:justify-end`}>
          {quickStats.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:flex">
              {quickStats.map((stat) => (
                <div key={stat.label} className="min-w-0 border-s border-[var(--theme-border)] px-3 py-0.5 first:border-s-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 break-words text-[13px] font-semibold leading-tight tabular-nums theme-text-primary">{stat.value}</p>
                </div>
              ))}
            </div>
          )}
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
      {tabs.length > 0 && (
        <nav className="erp-tabs-scroll mt-3 flex gap-1 overflow-x-auto border-b border-[var(--theme-border)]">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            const className = `erp-tab inline-flex items-center gap-2 whitespace-nowrap transition ${
              active ? "" : "theme-btn-ghost"
            }`;
            const content = (
              <>
                {tab.icon && React.createElement(tab.icon, { className: "h-4 w-4" })}
                {tab.label}
              </>
            );
            return tab.to ? (
              <Link
                key={tab.key}
                ref={active ? activeTabRef : undefined}
                to={tab.to}
                className={className}
                data-active={active}
                aria-current={active ? "page" : undefined}
              >
                {content}
              </Link>
            ) : (
              <button
                key={tab.key}
                ref={active ? activeTabRef : undefined}
                type="button"
                onClick={() => onTab?.(tab.key)}
                className={className}
                data-active={active}
                aria-pressed={active}
              >
                {content}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
