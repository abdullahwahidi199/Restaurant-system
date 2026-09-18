import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Panel({ title, description, to, actions, children, className = "" }) {
  return (
    <section className={`theme-card p-4 ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold theme-text-primary">{title}</h2>
          {description && <p className="mt-1 text-xs theme-text-muted">{description}</p>}
        </div>
        {to ? (
          <Link
            to={to}
            className="theme-btn theme-btn-ghost theme-btn-icon"
            aria-label={`Open ${title}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : (
          actions
        )}
      </div>
      {children}
    </section>
  );
}
