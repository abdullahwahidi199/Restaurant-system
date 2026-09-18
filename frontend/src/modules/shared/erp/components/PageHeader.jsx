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
    <header
      className={
        compactMobile
          ? "erp-page-header -mx-4 border-b px-4 py-3 shadow-sm theme-surface sm:py-4 lg:-mx-6 lg:px-6"
          : "erp-page-header -mx-4 border-b px-4 py-4 shadow-sm theme-surface lg:-mx-6 lg:px-6"
      }
    >
      <div className={`flex flex-col ${compactMobile ? "gap-3 sm:gap-4" : "gap-4"} xl:flex-row xl:items-center xl:justify-between`}>
        <div className="min-w-0">
          <div className={compactMobile ? "flex flex-wrap items-center gap-x-1.5 gap-y-1 sm:block" : ""}>
            {breadcrumb && (
              <div className={`${compactMobile ? "sm:mb-2" : "mb-2"} text-xs font-semibold theme-text-muted`}>{breadcrumb}</div>
            )}
            {(eyebrow || Icon) && (
              <div className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide theme-muted ${compactMobile ? "px-1.5 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]" : "px-2.5 py-1 text-[11px]"}`}>
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {eyebrow}
              </div>
            )}
          </div>
          <h1 className={`erp-page-title ${compactMobile ? "mt-1.5 sm:mt-2" : "mt-2"} font-bold tracking-tight theme-text-primary`}>
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-3xl text-xs leading-5 theme-text-muted">{description}</p>
          )}
        </div>
        <div className={`flex min-w-0 flex-col ${compactMobile ? "gap-2 sm:gap-3" : "gap-3"} sm:flex-row sm:items-center`}>
          {quickStats.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:flex">
              {quickStats.map((stat) => (
                <div key={stat.label} className={`min-w-0 theme-card ${compactMobile ? "px-2.5 py-2 sm:px-3" : "px-3 py-2"}`}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 break-words text-[13px] font-bold leading-tight tabular-nums theme-text-primary">{stat.value}</p>
                </div>
              ))}
            </div>
          )}
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
      {tabs.length > 0 && (
        <nav className={`${compactMobile ? "erp-tabs-scroll -mx-4 mt-3 gap-1.5 px-4 sm:mx-0 sm:mt-4 sm:gap-2 sm:px-0" : "mt-4 gap-2"} flex overflow-x-auto`}>
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
