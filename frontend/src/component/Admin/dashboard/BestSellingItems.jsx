import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function BestSellingItems({ summary }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("today");
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

  const bestSelling =
    activeTab === "today"
      ? summary.best_selling_items.best_selling_today
      : activeTab === "week"
        ? summary.best_selling_items.best_selling_week
        : summary.best_selling_items.best_selling_month;

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold theme-text-primary">
          {t("dashboard.best_selling.title")}
        </h3>

        <div className="flex gap-2">
          {["today", "week", "month"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`theme-btn h-8 px-3 text-xs ${
                activeTab === tab
                  ? "theme-btn-primary"
                  : "theme-btn-ghost"
              }`}
            >
              {t(`dashboard.best_selling.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      {bestSelling?.length ? (
        <ul className="space-y-3">
          {bestSelling.map((item, idx) => (
            <li key={idx} className="flex justify-between border-b pb-2">
              <div>
                <p className="font-medium">{item.item_name}</p>
                <p className="text-sm text-gray-500">
                  {t("dashboard.best_selling.sold")}: {item.total_sales} |{" "}
                  {t("dashboard.best_selling.revenue")}{t("legacy.afs_9eff30c8")}
                  {Number(item.total_revenue || 0).toFixed(2)}
                </p>
              </div>
              <span className="font-semibold">
                {t("legacy.afs_2050680c")}{Number(item.unit_price || 0).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg bg-[var(--theme-muted)] px-4 py-6 text-center text-[13px] theme-text-muted">
          {t("dashboard.best_selling.no_data")}
        </p>
      )}
    </div>
  );
}
