import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useContext } from "react";
import instance from "./axiosInstance";

export const AuthContext = createContext();

const BASE_URL = import.meta.env.VITE_API_URL;
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const tokens = JSON.parse(localStorage.getItem("authTokens") || "null");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return { tokens, user };
  });

  const [restaurantDetails, setRestaurantDetails] = useState({
    name: "",
    logo: "",
    address: "",
    phone: "",
  });
  useEffect(() => {}, []);

  const login = async (username, password) => {
    const res = await axios.post(`${BASE_URL}/users/token/`, {
      username,
      password,
    });
    const data = res.data;
    const tokens = { access: data.access, refresh: data.refresh };
    const user = {
      role: data.role,
      staff_id: data.staff_id,
      name: data.name,
      username,
      isDemo: data.is_demo,
      restaurant_id: data.restaurant_id,
    };
    localStorage.setItem("authTokens", JSON.stringify(tokens));
    localStorage.setItem("user", JSON.stringify(user));

    setAuth({ tokens, user });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("authTokens");
    localStorage.removeItem("user");
    setAuth({ tokens: null, user: null });
  };

  const updateTokens = (tokens) => {
    localStorage.setItem("authTokens", JSON.stringify(tokens));
    setAuth((prev) => ({ ...prev, tokens }));
  };

  useEffect(() => {
    if (!auth?.tokens?.access) return;

    // 🚫 Skip for super admin
    if (auth?.user?.role === "super_admin") return;

    const getRestDetails = async () => {
      try {
        const res = await instance.get("/restaurant/me/");
        const r = res.data;

        setRestaurantDetails({
          name: r.name,
          logo: r.logo,
          phone: r.phone,
          address: r.address,
        });
      } catch (err) {
        console.log(err);
      }
    };

    getRestDetails();
  }, [auth?.tokens?.access, auth?.user?.role]);
  return (
    <AuthContext.Provider
      value={{ auth, login, logout, updateTokens, restaurantDetails }}
    >
      {children}
    </AuthContext.Provider>
  );
}
