import React from "react";

export default function FormSection({ title, description, children, aside, className = "" }) {
  return (
    <section className={`theme-card p-4 ${className}`}>
      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold theme-text-primary">{title}</h2>
          {description && <p className="mt-1 text-xs theme-text-muted">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
