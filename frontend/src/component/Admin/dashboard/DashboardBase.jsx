import { act, useEffect, useState } from "react";
import {
  Users,
  Utensils,
  CalendarCheck,
  Star,
  DollarSign,
  ShoppingBag,
  Bell
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";

import TopSectionStats from "./TopSectionStatsCard";
import MonthOverView from "./MonthOverview";
import DailySalesChart from "./DailySalesChart";
import BestSellingItems from "./BestSellingItems";
import Notifications from "./Notifications";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const date = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(date);
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/reports/dashboard-summary/");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const data = await res.json();
        console.log(data)
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  // Map API data to stats cards
  const stats = [
    { label: "Total Staff", value: summary.total_staff, icon: <Users className="w-6 h-6 text-blue-500" /> },
    { label: "Menu Items", value: summary.menu_items, icon: <Utensils className="w-6 h-6 text-orange-500" /> },
    { label: "Attendance Rate", value: `${summary.attendance_rate}%`, icon: <CalendarCheck className="w-6 h-6 text-purple-500" /> },
    { label: "Average Rating", value: `${summary.average_rating} ⭐`, icon: <Star className="w-6 h-6 text-yellow-500" /> },
  ];

 



  

  const notifications = [
    "3 staff absent today",
    "Shift schedule updated for Sunday",
    "New item 'Chocolate Lava Cake' added to menu",
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          Welcome back, Admin
        </h1>
        <p className="text-gray-500">
          Here’s an overview of your restaurant today — {currentDate}
        </p>
      </div>

      <TopSectionStats stats={stats}/>

      <Card className="shadow-sm mb-10">
        <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
          <MonthOverView summary={summary}/>

          <DailySalesChart summary={summary}/>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <BestSellingItems summary={summary}/>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <Notifications/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
