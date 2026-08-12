import { useTranslation } from "react-i18next";
import {
  BarChart3,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  PackageCheck,
  ReceiptText,
  Users,
} from "lucide-react";

const mockupConfigs = {
  hero: {
    titleKey: "landing.mockups.hero.title",
    subtitleKey: "landing.mockups.hero.subtitle",
    statKeys: [
      "landing.mockups.hero.stats.orders",
      "landing.mockups.hero.stats.kitchen",
      "landing.mockups.hero.stats.stock",
    ],
    rows: [
      { icon: ReceiptText, labelKey: "landing.mockups.hero.rows.order", valueKey: "landing.mockups.hero.values.order" },
      { icon: ChefHat, labelKey: "landing.mockups.hero.rows.kitchen", valueKey: "landing.mockups.hero.values.kitchen" },
      { icon: PackageCheck, labelKey: "landing.mockups.hero.rows.inventory", valueKey: "landing.mockups.hero.values.inventory" },
    ],
    panelKeys: [
      "landing.mockups.hero.panels.sales",
      "landing.mockups.hero.panels.procurement",
      "landing.mockups.hero.panels.staff",
    ],
  },
  orders: {
    titleKey: "landing.mockups.orders.title",
    subtitleKey: "landing.mockups.orders.subtitle",
    statKeys: [
      "landing.mockups.orders.stats.dineIn",
      "landing.mockups.orders.stats.takeaway",
      "landing.mockups.orders.stats.delivery",
    ],
    rows: [
      { icon: ReceiptText, labelKey: "landing.mockups.orders.rows.table", valueKey: "landing.mockups.orders.values.table" },
      { icon: ChefHat, labelKey: "landing.mockups.orders.rows.station", valueKey: "landing.mockups.orders.values.station" },
      { icon: CheckCircle2, labelKey: "landing.mockups.orders.rows.bill", valueKey: "landing.mockups.orders.values.bill" },
    ],
    panelKeys: [
      "landing.mockups.orders.panels.queue",
      "landing.mockups.orders.panels.ready",
      "landing.mockups.orders.panels.completed",
    ],
  },
  kitchen: {
    titleKey: "landing.mockups.kitchen.title",
    subtitleKey: "landing.mockups.kitchen.subtitle",
    statKeys: [
      "landing.mockups.kitchen.stats.main",
      "landing.mockups.kitchen.stats.juice",
      "landing.mockups.kitchen.stats.production",
    ],
    rows: [
      { icon: ChefHat, labelKey: "landing.mockups.kitchen.rows.main", valueKey: "landing.mockups.kitchen.values.main" },
      { icon: ClipboardList, labelKey: "landing.mockups.kitchen.rows.juice", valueKey: "landing.mockups.kitchen.values.juice" },
      { icon: CheckCircle2, labelKey: "landing.mockups.kitchen.rows.route", valueKey: "landing.mockups.kitchen.values.route" },
    ],
    panelKeys: [
      "landing.mockups.kitchen.panels.new",
      "landing.mockups.kitchen.panels.cooking",
      "landing.mockups.kitchen.panels.ready",
    ],
  },
  inventory: {
    titleKey: "landing.mockups.inventory.title",
    subtitleKey: "landing.mockups.inventory.subtitle",
    statKeys: [
      "landing.mockups.inventory.stats.ingredients",
      "landing.mockups.inventory.stats.suppliers",
      "landing.mockups.inventory.stats.invoices",
    ],
    rows: [
      { icon: PackageCheck, labelKey: "landing.mockups.inventory.rows.recipe", valueKey: "landing.mockups.inventory.values.recipe" },
      { icon: ClipboardList, labelKey: "landing.mockups.inventory.rows.purchase", valueKey: "landing.mockups.inventory.values.purchase" },
      { icon: CheckCircle2, labelKey: "landing.mockups.inventory.rows.transfer", valueKey: "landing.mockups.inventory.values.transfer" },
    ],
    panelKeys: [
      "landing.mockups.inventory.panels.stock",
      "landing.mockups.inventory.panels.procurement",
      "landing.mockups.inventory.panels.suppliers",
    ],
  },
  branches: {
    titleKey: "landing.mockups.branches.title",
    subtitleKey: "landing.mockups.branches.subtitle",
    statKeys: [
      "landing.mockups.branches.stats.branchA",
      "landing.mockups.branches.stats.branchB",
      "landing.mockups.branches.stats.branchC",
    ],
    rows: [
      { icon: BarChart3, labelKey: "landing.mockups.branches.rows.overview", valueKey: "landing.mockups.branches.values.overview" },
      { icon: Users, labelKey: "landing.mockups.branches.rows.access", valueKey: "landing.mockups.branches.values.access" },
      { icon: CheckCircle2, labelKey: "landing.mockups.branches.rows.migration", valueKey: "landing.mockups.branches.values.migration" },
    ],
    panelKeys: [
      "landing.mockups.branches.panels.central",
      "landing.mockups.branches.panels.branch",
      "landing.mockups.branches.panels.reports",
    ],
  },
  staff: {
    titleKey: "landing.mockups.staff.title",
    subtitleKey: "landing.mockups.staff.subtitle",
    statKeys: [
      "landing.mockups.staff.stats.attendance",
      "landing.mockups.staff.stats.payroll",
      "landing.mockups.staff.stats.stations",
    ],
    rows: [
      { icon: Users, labelKey: "landing.mockups.staff.rows.role", valueKey: "landing.mockups.staff.values.role" },
      { icon: ClipboardList, labelKey: "landing.mockups.staff.rows.attendance", valueKey: "landing.mockups.staff.values.attendance" },
      { icon: CheckCircle2, labelKey: "landing.mockups.staff.rows.payroll", valueKey: "landing.mockups.staff.values.payroll" },
    ],
    panelKeys: [
      "landing.mockups.staff.panels.permissions",
      "landing.mockups.staff.panels.stations",
      "landing.mockups.staff.panels.performance",
    ],
  },
  analytics: {
    titleKey: "landing.mockups.analytics.title",
    subtitleKey: "landing.mockups.analytics.subtitle",
    statKeys: [
      "landing.mockups.analytics.stats.sales",
      "landing.mockups.analytics.stats.orders",
      "landing.mockups.analytics.stats.expenses",
    ],
    rows: [
      { icon: BarChart3, labelKey: "landing.mockups.analytics.rows.sales", valueKey: "landing.mockups.analytics.values.sales" },
      { icon: PackageCheck, labelKey: "landing.mockups.analytics.rows.inventory", valueKey: "landing.mockups.analytics.values.inventory" },
      { icon: Users, labelKey: "landing.mockups.analytics.rows.staff", valueKey: "landing.mockups.analytics.values.staff" },
    ],
    panelKeys: [
      "landing.mockups.analytics.panels.branch",
      "landing.mockups.analytics.panels.inventory",
      "landing.mockups.analytics.panels.finance",
    ],
  },
};

function ProductMockup({ variant = "hero", className = "" }) {
  const { t } = useTranslation();
  const config = mockupConfigs[variant] || mockupConfigs.hero;

  return (
    <div
      className={`landing-dashboard-shell w-full max-w-full min-w-0 overflow-hidden rounded-lg border border-white/10 bg-slate-950/85 p-3 shadow-2xl shadow-slate-950/35 backdrop-blur ${className}`}
      role="img"
      aria-label={t("landing.mockups.accessibleLabel")}
    >
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-400" aria-hidden="true" />
            <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden="true" />
          </div>
          <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {t("landing.mockups.workspace")}
          </span>
        </div>

        <div className="grid gap-0 md:grid-cols-[180px_1fr]">
          <aside className="hidden border-r border-slate-200 bg-slate-50 p-4 md:block rtl:border-l rtl:border-r-0">
            <div className="mb-5 flex items-center gap-2">
              <img
                src="/rmsFavicon.png"
                alt=""
                className="h-8 w-8 rounded-md object-contain"
                loading="lazy"
              />
              <div>
                <p className="text-sm font-bold text-slate-950">{t("landing.brand.product")}</p>
                <p className="text-xs text-slate-500">{t("landing.mockups.sidebar")}</p>
              </div>
            </div>
            <div className="space-y-2">
              {config.panelKeys.map((key, index) => (
                <div
                  key={key}
                  className={`rounded-md px-3 py-2 text-xs font-semibold ${
                    index === 0 ? "bg-emerald-100 text-emerald-800" : "text-slate-500"
                  }`}
                >
                  {t(key)}
                </div>
              ))}
            </div>
          </aside>

          <div className="bg-slate-50 p-4 sm:p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-600">
                  {t(config.subtitleKey)}
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">{t(config.titleKey)}</h3>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                {t("landing.mockups.live")}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {config.statKeys.map((key, index) => (
                <div key={key} className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">{t(key)}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0
                          ? "w-10/12 bg-emerald-500"
                          : index === 1
                            ? "w-8/12 bg-cyan-500"
                            : "w-7/12 bg-amber-500"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-950">
                    {t("landing.mockups.activity")}
                  </span>
                  <span className="text-xs text-slate-500">{t("landing.mockups.today")}</span>
                </div>
                <div className="space-y-2">
                  {config.rows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <div
                        key={row.labelKey}
                        className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-emerald-600 shadow-sm">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="truncate text-sm font-semibold text-slate-700">
                            {t(row.labelKey)}
                          </span>
                        </div>
                        <span className="shrink-0 rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                          {t(row.valueKey)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex h-full min-h-40 flex-col justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      {t("landing.mockups.flowTitle")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {t("landing.mockups.flowDescription")}
                    </p>
                  </div>
                  <div className="mt-5 flex items-end gap-2" aria-hidden="true">
                    <span className="h-16 flex-1 rounded-t-md bg-emerald-500" />
                    <span className="h-24 flex-1 rounded-t-md bg-cyan-500" />
                    <span className="h-12 flex-1 rounded-t-md bg-amber-400" />
                    <span className="h-20 flex-1 rounded-t-md bg-slate-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductMockup;
