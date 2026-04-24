import React, { useEffect, useState, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import instance from "./axiosInstance";
import { AuthContext } from "./authforRBC";

export default function RequireActiveRestaurant({ children }) {
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const location = useLocation();
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const checkRestaurant = async () => {
      try {
        const res = await instance.get("/restaurant/me/");
        const r = res.data;

        const active = r.is_active && r.subscription?.is_valid;

        setIsActive(active);
      } catch (err) {
        setIsActive(false);
      } finally {
        setLoading(false);
      }
    };

    checkRestaurant();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (!isActive) {
    return (
      <Navigate
        to="/subscription-inactive"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
