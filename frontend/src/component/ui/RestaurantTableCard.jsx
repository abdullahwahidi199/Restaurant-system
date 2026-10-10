const statusDots = {
  available: "bg-[var(--theme-success)]",
  occupied: "bg-[var(--theme-warning)]",
  reserved: "bg-[var(--theme-info)]",
  unavailable: "bg-[var(--theme-text-muted)]",
};

export default function RestaurantTableCard({
  table,
  status = table.status,
  statusLabel,
  tableLabel,
  capacityLabel,
  noteLabel,
  actionLabel,
  actions,
  onClick,
  children,
}) {
  const name = String(table.name ?? "");
  const title = /^\d+$/.test(name) ? `${tableLabel} ${name}` : name;

  return (
    <article className="relative flex h-full min-h-44 min-w-0 flex-col rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] p-4 transition-colors hover:border-[var(--theme-border-strong)]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 text-[15px] font-semibold leading-5 theme-text-primary">
          <button
            type="button"
            onClick={onClick}
            aria-label={`${actionLabel}: ${title}`}
            className="cursor-pointer break-words text-start after:absolute after:inset-0 after:rounded-lg after:content-[''] focus:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--theme-input-focus)]"
          >
            <bdi>{title}</bdi>
          </button>
        </h2>
        <span className="inline-flex shrink-0 items-center gap-1.5 pt-0.5 text-xs leading-4 theme-text-secondary">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDots[status] || statusDots.unavailable}`}
            aria-hidden="true"
          />
          {statusLabel}
        </span>
      </div>

      <p className="mt-1 text-xs leading-5 theme-text-muted">
        {capacityLabel}: {table.capacity ?? 0}
      </p>
      {table.note && (
        <p
          className="mt-1 line-clamp-2 break-words text-xs leading-5 theme-text-muted"
          title={`${noteLabel}: ${table.note}`}
        >
          {table.note}
        </p>
      )}

      {children && (
        <div className="mt-auto pt-4">
          <div className="space-y-3 border-t border-[var(--theme-border)] pt-3">
            {children}
          </div>
        </div>
      )}

      {actions && (
        <div className="relative z-10 mt-2 flex justify-end">
          {actions}
        </div>
      )}
    </article>
  );
}
