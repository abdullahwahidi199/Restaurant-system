import React from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";
import StatusBadge from "../../../modules/shared/erp/components/StatusBadge";

const DiscountRequestCard = ({ request, onApprove, onReject, loading = false }) => {
  const { t: autoT } = useAutoTranslation();

  return (
    <article className="theme-card min-w-0 overflow-hidden">
      <header className="flex items-start justify-between gap-3 border-b border-[var(--theme-border)] px-4 py-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold theme-text-primary">
              #{request.order_number}
            </h2>
            {request.table_name && (
              <span className="truncate text-xs theme-text-muted">
                {autoT("legacy.table_692eeda0")} {request.table_name}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs theme-text-secondary">
            {request.customer_name || autoT("legacy.walk_in_801d866b")}
          </p>
        </div>
        <StatusBadge status={request.status} label={request.status} showIcon />
      </header>

      <div className="space-y-3 p-4">
        <dl className="grid grid-cols-3 divide-x divide-[var(--theme-border)] rounded-lg bg-[var(--theme-muted)] px-2 py-2.5 rtl:divide-x-reverse">
          <div className="min-w-0 px-2 first:ps-1">
            <dt className="truncate text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
              {autoT("legacy.original_c0a8060f")}
            </dt>
            <dd className="mt-1 truncate text-xs font-semibold tabular-nums theme-text-primary">
              {request.original_total} {autoT("labels.afn")}
            </dd>
          </div>
          <div className="min-w-0 px-2">
            <dt className="truncate text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
              {autoT("menu_item_sales.discount")}
            </dt>
            <dd className="mt-1 truncate text-xs font-semibold tabular-nums text-[var(--theme-warning-hover)]">
              {request.discount_percent}%
            </dd>
          </div>
          <div className="min-w-0 px-2 last:pe-1">
            <dt className="truncate text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
              {autoT("legacy.final_672b22cc")}
            </dt>
            <dd className="mt-1 truncate text-xs font-semibold tabular-nums text-[var(--theme-primary-hover)]">
              {request.final_total} {autoT("labels.afn")}
            </dd>
          </div>
        </dl>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
            {autoT("legacy.reason_f219cc06")}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 theme-text-secondary">
            {request.reason || "—"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--theme-border)] pt-3 text-xs theme-text-muted">
          <span className="truncate">
            {autoT("legacy.requested_by_83ddd3bb")}{" "}
            <strong className="font-medium theme-text-secondary">
              {request.requested_by_name || "—"}
            </strong>
          </span>
        </div>
      </div>

      {request.status === "pending" && (
        <footer className="flex justify-end gap-2 border-t border-[var(--theme-border)] bg-[var(--theme-muted)] px-4 py-3">
          <button
            type="button"
            onClick={() => onApprove(request.id)}
            disabled={loading}
            className="theme-btn theme-btn-success h-8 gap-1.5 px-3 text-xs"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {autoT("inventory_manager.common.approve")}
          </button>
          <button
            type="button"
            onClick={() => onReject(request.id)}
            disabled={loading}
            className="theme-btn theme-btn-danger h-8 gap-1.5 px-3 text-xs"
          >
            <XCircle className="h-3.5 w-3.5" />
            {autoT("inventory_manager.common.reject")}
          </button>
        </footer>
      )}
    </article>
  );
};

export default DiscountRequestCard;
