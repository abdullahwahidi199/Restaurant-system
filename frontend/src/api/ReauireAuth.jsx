// src/auth/RequireAuth.jsx
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./authforRBC";
import { getStaffLoginPath } from "../config/appEnvironment";

export default function RequireAuth({ children, allowedRoles = [] }) {
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  // console.log(auth);
  if (!auth?.tokens?.access) {
    return (
      <Navigate
        to={getStaffLoginPath()}
        state={{ from: location }}
        replace
      />
    );
  }

  const role = auth.user?.role;

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // unauthorized
    return (
      <Navigate
        to={getStaffLoginPath()}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
