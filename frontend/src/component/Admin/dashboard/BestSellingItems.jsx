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
        <h3 className="text-lg font-semibold text-gray-700">
          {t("dashboard.best_selling.title")}
        </h3>

        <div className="flex gap-2">
          {["today", "week", "month"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-300"
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
                  {t("dashboard.best_selling.revenue")}: Afs
                  {item.total_revenue.toFixed(2)}
                </p>
              </div>
              <span className="font-semibold">
                Afs{item.unit_price.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">
          {t("dashboard.best_selling.no_data")}
        </p>
      )}
    </div>
  );
}
