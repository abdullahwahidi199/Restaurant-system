import React, { useState, useEffect } from "react";
import axios from "axios";
import RestaurantForm from "./RestaurantInfoDisplay";
export default function RestaurantSettings() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = "http://127.0.0.1:8000/system/restaurant-info/1/";

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await axios.get(API_URL);
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
      <RestaurantForm restaurant={restaurant} API_URL={API_URL} />
    </div>
  );
}
