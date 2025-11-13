import React, { useState, useEffect } from "react";

import RestaurantForm from "./RestaurantInfoDisplay";
import instance from "../../../api/axiosInstance";
export default function RestaurantSettings() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await instance.get("/system/restaurant-info/1/");
        setRestaurant(res.data);
      } catch (error) {
        console.error("Failed to fetch restaurant info", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!restaurant) return <p>Restaurant data not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
      <h1 className="text-2xl font-bold mb-6">Restaurant Settings</h1>
      <RestaurantForm restaurant={restaurant}  />
    </div>
  );
}
