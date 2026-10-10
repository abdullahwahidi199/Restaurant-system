import { Card, CardContent } from "../../ui/card";

export default function TopSectionStats({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((item, index) => (
        <Card key={item.label} className="overflow-hidden">
          <CardContent className="flex min-h-[104px] items-center justify-between gap-3 p-3.5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] theme-text-muted">
                {item.label}
              </p>
              <p className="mt-1.5 truncate text-[22px] font-bold leading-none tracking-tight theme-text-primary">
                {item.value}
              </p>
              {item.meta && (
                <p className="mt-2 truncate text-[11px] theme-text-secondary">
                  {item.meta}
                </p>
              )}
            </div>
            <span
              className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full p-[5px]"
              style={{
                background: `conic-gradient(${item.color || "var(--theme-primary)"} 0deg ${220 + index * 22}deg, var(--theme-border) ${220 + index * 22}deg 360deg)`,
              }}
              aria-hidden="true"
            >
              <span className="grid h-full w-full place-items-center rounded-full bg-[var(--theme-card)]">
                {item.icon}
              </span>
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
