// src/auth/RequireAuth.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './authforRBC';

export default function RequireAuth({ children, allowedRoles = [] }) {
  const { auth } = useContext(AuthContext);
  const location = useLocation();

  if (!auth?.tokens?.access) {
    return <Navigate to="/staff-login" state={{ from: location }} replace />;
  }

  const role = auth.user?.role;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // unauthorized
    return <Navigate to="/staff-login" state={{ from: location }} replace />;
  }

  return children;
}
