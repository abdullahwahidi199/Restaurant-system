import { useEffect, useState } from "react";
import {
  Users,
  Clock,
  Utensils,
  CalendarCheck,
  Bell,
  Star,
  Activity,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { Card,CardContent } from "../../ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function AdminDashboard() {
  // Dummy stats
  const stats = [
    { label: "Total Staff", value: 25, icon: <Users className="w-6 h-6 text-blue-500" /> },
    { label: "Active Shifts", value: 4, icon: <Clock className="w-6 h-6 text-green-500" /> },
    { label: "Menu Items", value: 48, icon: <Utensils className="w-6 h-6 text-orange-500" /> },
    { label: "Attendance Rate", value: "86%", icon: <CalendarCheck className="w-6 h-6 text-purple-500" /> },
    { label: "Avg Rating", value: "4.5 ⭐", icon: <Star className="w-6 h-6 text-yellow-500" /> },
  ];

  // Dummy data for attendance trend
  const attendanceTrend = [
    { day: "Mon", present: 20 },
    { day: "Tue", present: 22 },
    { day: "Wed", present: 19 },
    { day: "Thu", present: 23 },
    { day: "Fri", present: 24 },
    { day: "Sat", present: 21 },
    { day: "Sun", present: 18 },
  ];

  // 🟢 Orders & Revenue Chart Data
  const orderRevenueData = [
    { label: "Today", orders: 45, revenue: 320 },
    { label: "This Week", orders: 280, revenue: 2100 },
    { label: "This Month", orders: 1120, revenue: 8700 },
  ];

  const menuHighlights = [
    { name: "Grilled Chicken", category: "Main Course", price: "$12.50" },
    { name: "Pasta Alfredo", category: "Main Course", price: "$10.00" },
    { name: "Caesar Salad", category: "Salad", price: "$7.50" },
  ];

  const notifications = [
    "3 staff absent today",
    "Shift schedule updated for Sunday",
    "New item 'Chocolate Lava Cake' added to menu",
  ];

  const activities = [
    "Tomas updated attendance records",
    "Admin created a new shift schedule",
    "Chef Ali added 'Veggie Pizza' to menu",
    "Staff Sara marked attendance for Morning shift",
  ];

  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const date = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(date);
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          Welcome back, Tomas 👋
        </h1>
        <p className="text-gray-500">
          Here’s an overview of your restaurant today — {currentDate}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((item, idx) => (
          <Card key={idx} className="shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <h2 className="text-2xl font-bold text-gray-800">
                  {item.value}
                </h2>
              </div>
              {item.icon}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Attendance Trend Chart */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Attendance Trend (Past 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#4f46e5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders & Revenue Chart */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Orders & Revenue Overview
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={orderRevenueData} barGap={10}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="orders"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  name="Orders"
                />
                <Bar
                  dataKey="revenue"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  name="Revenue ($)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Highlights */}
        <Card className="shadow-sm col-span-1 lg:col-span-1">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Menu Highlights
            </h3>
            <ul className="space-y-2">
              {menuHighlights.map((item, idx) => (
                <li key={idx} className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {item.price}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-sm col-span-1 lg:col-span-1">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" /> Notifications
            </h3>
            <ul className="space-y-2">
              {notifications.map((note, idx) => (
                <li key={idx} className="text-gray-600 border-b pb-2">
                  {note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="shadow-sm col-span-1 lg:col-span-1">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" /> Recent Activity
            </h3>
            <ul className="space-y-2">
              {activities.map((act, idx) => (
                <li key={idx} className="text-gray-600 border-b pb-2">
                  {act}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
