import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function DailySalesChart({summary}){
    return(
        <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">
                      Daily Sales (Last 30 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={summary.daily_sales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Revenue"
                        />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Orders"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
    )
}