
import { useState } from "react"
export default function BestSellingItems({summary}){
    const [activeTab, setActiveTab] = useState("today")
    const bestSelling =
    activeTab === "today"
      ? summary.best_selling_items.best_selling_today :
      activeTab === "week"
        ? summary.best_selling_items.best_selling_week :
        summary.best_selling_items.best_selling_month
    return(
        <>
        <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Best Selling Items</h3>
              <div className="flex gap-2">
                {["today", "week", "month"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-sm rounded-md cursor-pointer ${activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:text-gray-200 hover:bg-gray-500 "
                      }`}
                  >
                    {tab === "today" ? "Today" : tab === "week" ? "Week" : "Month"}
                  </button>
                ))}
              </div>
            </div>

            {bestSelling && bestSelling.length > 0 ? (
              <ul className="space-y-3">
                {bestSelling.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{item.item_name}</p>
                      <p className="text-sm text-gray-500">
                        Sold: {item.total_sales} | Revenue: Afs{item.total_revenue.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Afs{item.unit_price.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">No sales data available</p>
            )}</>
    )
}