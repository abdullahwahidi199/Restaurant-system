import { useState } from "react";
import { ShoppingBag, Utensils } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MEDIA_BASE_URL } from "../../../config/runtimeConfig";

const resolveImage = (source) => {
  if (!source) return "";
  if (/^(https?:|data:|blob:)/i.test(source)) return source;
  const path = source.startsWith("/") ? source : `/media/${source}`;
  return `${MEDIA_BASE_URL}${path}`;
};

const formatAmount = (value) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  );

export default function BestSellingItems({ summary }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("month");
  const isRTL = i18n.dir() === "rtl";

  const collections = summary?.best_selling_items || {};
  const bestSelling =
    activeTab === "today"
      ? collections.best_selling_today
      : activeTab === "week"
        ? collections.best_selling_week
        : collections.best_selling_month;

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold theme-text-primary">
            {t("dashboard.best_selling.title")}
          </h3>
          <p className="mt-0.5 text-[11px] theme-text-muted">
            {t("dashboard.best_selling.subtitle", {
              defaultValue: "Your most popular menu items by quantity sold",
            })}
          </p>
        </div>

        <div className="flex w-fit rounded-lg bg-[var(--theme-muted)] p-0.5">
          {["today", "week", "month"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-7 rounded-md px-2.5 text-[11px] font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-[var(--theme-card)] text-[var(--theme-primary)] shadow-sm"
                  : "theme-text-muted hover:theme-text-primary"
              }`}
              aria-pressed={activeTab === tab}
            >
              {t(`dashboard.best_selling.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      {bestSelling?.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {bestSelling.slice(0, 4).map((item, index) => {
            const image = resolveImage(item.image);
            return (
              <article
                key={`${item.item_name}-${index}`}
                className="group min-w-0 overflow-hidden rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)]"
              >
                <div className="relative h-[104px] overflow-hidden bg-[var(--theme-primary-soft)]">
                  <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[var(--theme-primary-soft)] to-[var(--theme-muted)]">
                    <Utensils className="h-8 w-8 text-[var(--theme-primary)] opacity-50" aria-hidden="true" />
                  </div>
                  {image && (
                    <img
                      src={image}
                      alt=""
                      className="relative h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <span className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                    <ShoppingBag className="h-3 w-3" aria-hidden="true" />
                    {item.total_sales || 0} {t("dashboard.best_selling.sold")}
                  </span>
                </div>

                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="min-w-0 truncate text-[13px] font-semibold theme-text-primary">
                      {item.item_name || t("dashboard.unnamed_item", { defaultValue: "Menu item" })}
                    </h4>
                    <span className="shrink-0 text-[11px] font-semibold text-[var(--theme-warning-hover)]">
                      {formatAmount(item.unit_price)} AFN
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-[var(--theme-border)] pt-2 text-[11px]">
                    <span className="theme-text-muted">
                      {t("dashboard.best_selling.revenue")}
                    </span>
                    <span className="font-semibold tabular-nums text-[var(--theme-success-hover)]">
                      {formatAmount(item.total_revenue)} AFN
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-[160px] place-items-center rounded-lg border border-dashed border-[var(--theme-border-strong)] bg-[var(--theme-muted)] px-4 text-center">
          <div>
            <Utensils className="mx-auto h-7 w-7 theme-text-muted" aria-hidden="true" />
            <p className="mt-2 text-[13px] font-medium theme-text-secondary">
              {t("dashboard.best_selling.no_data")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
