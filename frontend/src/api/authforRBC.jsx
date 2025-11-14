
import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const BASE_URL=import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const tokens = JSON.parse(localStorage.getItem('authTokens') || 'null');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return { tokens, user };
  });

  useEffect(() => {
    
  }, []);

  const login = async (username, password) => {
    const res = await axios.post(`${BASE_URL}/users/token/`, { username, password });
    const data = res.data;
    const tokens = { access: data.access, refresh: data.refresh };
    const user = { role: data.role, staff_id: data.staff_id, name: data.name, username };
    localStorage.setItem('authTokens', JSON.stringify(tokens));
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({ tokens, user });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('authTokens');
    localStorage.removeItem('user');
    setAuth({ tokens: null, user: null });
  };

  const updateTokens = (tokens) => {
    localStorage.setItem('authTokens', JSON.stringify(tokens));
    setAuth(prev => ({ ...prev, tokens }));
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, updateTokens }}>
      {children}
    </AuthContext.Provider>
  );
}
