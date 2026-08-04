import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import instance from "./axiosInstance";

export const AuthContext = createContext();

const BASE_URL = import.meta.env.VITE_API_URL;

const parseStoredJson = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

const normalizeBranches = (branches) => (Array.isArray(branches) ? branches : []);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const tokens = parseStoredJson("authTokens", null);
    const user = parseStoredJson("user", null);

    return { tokens, user };
  });
  const [branches, setBranches] = useState(() =>
    normalizeBranches(parseStoredJson("branches", [])),
  );
  const [activeBranch, setActiveBranchState] = useState(() =>
    parseStoredJson("activeBranch", null),
  );
  const [requiresBranchSelection, setRequiresBranchSelection] = useState(false);

  const [restaurantDetails, setRestaurantDetails] = useState({
    name: "",
    logo: "",
    address: "",
    phone: "",
  });
  useEffect(() => {}, []);

  const persistBranchContext = (payload = {}) => {
    const nextBranches = normalizeBranches(payload.branches);
    const nextActiveBranch = payload.active_branch || null;
    const role = payload.role || auth?.user?.role;
    const requiresSelection =
      role === "BranchAdmin"
        ? false
        : payload.requires_selection ?? payload.requires_branch_selection ?? false;

    setBranches(nextBranches);
    setActiveBranchState(nextActiveBranch);
    setRequiresBranchSelection(Boolean(requiresSelection));

    localStorage.setItem("branches", JSON.stringify(nextBranches));
    if (nextActiveBranch) {
      localStorage.setItem("activeBranch", JSON.stringify(nextActiveBranch));
    } else {
      localStorage.removeItem("activeBranch");
    }

    return {
      branches: nextBranches,
      activeBranch: nextActiveBranch,
      requiresBranchSelection: Boolean(requiresSelection),
    };
  };

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
      active_branch: data.active_branch,
      branches: data.branches || [],
      requires_branch_selection: data.requires_branch_selection,
    };
    localStorage.setItem("authTokens", JSON.stringify(tokens));
    localStorage.setItem("user", JSON.stringify(user));
    persistBranchContext(data);

    setAuth({ tokens, user });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("authTokens");
    localStorage.removeItem("user");
    localStorage.removeItem("branches");
    localStorage.removeItem("activeBranch");
    setBranches([]);
    setActiveBranchState(null);
    setRequiresBranchSelection(false);
    setAuth({ tokens: null, user: null });
  };

  const updateTokens = (tokens) => {
    localStorage.setItem("authTokens", JSON.stringify(tokens));
    setAuth((prev) => ({ ...prev, tokens }));
  };

  const refreshBranchContext = async () => {
    const res = await instance.get("/restaurant/branches/active/");
    const branchState = persistBranchContext(res.data);

    setAuth((prev) => {
      const nextUser = prev.user
        ? {
            ...prev.user,
            active_branch: res.data.active_branch,
            branches: res.data.branches || [],
            requires_branch_selection: res.data.requires_selection,
          }
        : prev.user;
      if (nextUser) localStorage.setItem("user", JSON.stringify(nextUser));
      return { ...prev, user: nextUser };
    });

    return branchState;
  };

  const switchActiveBranch = async (branchId) => {
    if (auth?.user?.role === "BranchAdmin") {
      return refreshBranchContext();
    }

    const res = await instance.patch(
      "/restaurant/branches/active/",
      {
        branch_id: branchId,
      },
      { skipBranchHeader: true },
    );
    const branchState = persistBranchContext(res.data);

    setAuth((prev) => {
      const nextUser = prev.user
        ? {
            ...prev.user,
            active_branch: res.data.active_branch,
            branches: res.data.branches || [],
            requires_branch_selection: res.data.requires_selection,
          }
        : prev.user;
      if (nextUser) localStorage.setItem("user", JSON.stringify(nextUser));
      return { ...prev, user: nextUser };
    });

    return branchState;
  };

  useEffect(() => {
    if (!auth?.tokens?.access) return;

    // 🚫 Skip for super admin
    if (auth?.user?.role === "SuperAdmin") return;

    const getRestDetails = async () => {
      try {
        const res = await instance.get("/restaurant/me/");
        const r = res.data;

        setRestaurantDetails({
          name: r.name,
          logo: r.logo,
          phone: r.phone,
          address: r.address,
          active_branch: r.active_branch,
        });
        persistBranchContext({
          branches: r.branches || [],
          active_branch: r.active_branch,
          requires_selection:
            auth?.user?.role !== "BranchAdmin" && (r.branches || []).length > 1,
        });
      } catch (err) {
        console.log(err);
      }
    };

    getRestDetails();
  }, [auth?.tokens?.access, auth?.user?.role]);
  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        updateTokens,
        restaurantDetails,
        branches,
        activeBranch,
        requiresBranchSelection,
        refreshBranchContext,
        switchActiveBranch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
