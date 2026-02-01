import { useTranslation } from "react-i18next"


useTranslation
export default function MonthOverView({summary}){
  const {t,i18n}=useTranslation()
  const isRTL = i18n.language === "fa" || i18n.language === "ps";
    return(
        <div className="lg:col-span-1 space-y-4" dir={isRTL ? "rtl" : "ltr"}>
                    <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
                      {new Date().toLocaleString("en-US", { month: "long" })} Overview
                    </h3>
                    <div className="bg-gray-100 rounded-xl p-4">
                      <p className="text-sm text-gray-500">{t('overview.totalSold')}</p>
                      <h2 className="text-3xl font-bold text-gray-800">
                        {summary.total_sold_products_month}
                      </h2>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4">
                      <p className="text-sm text-gray-500">{t('overview.totalRevenue')}</p>
                      <h2 className="text-3xl font-bold text-green-600">
                        Afs {summary.revenue_month.toLocaleString()}
                      </h2>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4">
                      <p className="text-sm text-gray-500">{t('overview.totalOrders')}</p>
                      <h2 className="text-3xl font-bold text-blue-600">
                        {summary.total_orders_month}
                      </h2>
                    </div>
                  </div>
    )
}