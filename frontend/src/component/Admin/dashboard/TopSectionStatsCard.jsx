import { Card, CardContent } from "../../ui/card";

export default function TopSectionStats({ stats }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item, idx) => (
        <Card key={idx} className="min-h-[120px]">
          <CardContent className="flex h-full items-start justify-between p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide theme-text-muted">{item.label}</p>
              <p className="mt-2 text-[1.875rem] font-bold leading-none tracking-tight theme-text-primary">{item.value}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--theme-muted)]">
              {item.icon}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
