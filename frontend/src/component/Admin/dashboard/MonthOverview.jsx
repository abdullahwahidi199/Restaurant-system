import { useTranslation } from "react-i18next"


useTranslation
export default function MonthOverView({summary}){
  const {t,i18n}=useTranslation()
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
    return(
        <div className="space-y-2 lg:col-span-1" dir={isRTL ? "rtl" : "ltr"}>
                    <h3 className="text-sm font-semibold uppercase tracking-wide theme-text-secondary">
                      {new Date().toLocaleString("en-US", { month: "long" })} {t("legacy.overview_0efc2e6b")}
                    </h3>
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-xs theme-text-muted">{t('overview.totalSold')}</p>
                      <p className="mt-1 text-2xl font-semibold leading-none theme-text-primary">
                        {summary.total_sold_products_month}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-xs theme-text-muted">{t('overview.totalRevenue')}</p>
                      <p className="mt-1 text-2xl font-semibold leading-none text-[var(--theme-success-hover)]">
                        {t("legacy.afs_2050680c")} {summary.revenue_month.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-100 p-3">
                      <p className="text-xs theme-text-muted">{t('overview.totalOrders')}</p>
                      <p className="mt-1 text-2xl font-semibold leading-none text-[var(--theme-info-hover)]">
                        {summary.total_orders_month}
                      </p>
                    </div>
                  </div>
    )
}
