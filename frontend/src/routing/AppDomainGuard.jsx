import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../api/authforRBC";
import { getStaffLoginPath, isStaffApp } from "../config/appEnvironment";
import {
  getStaffHomePath,
  isStaffManagementPath,
} from "../config/staffRoutes";

export default function AppDomainGuard({ children }) {
  const { auth, activeBranch, requiresBranchSelection } =
    useContext(AuthContext);
  const location = useLocation();

  if (!isStaffApp()) return children;

  if (
    location.pathname === "/login" ||
    isStaffManagementPath(location.pathname)
  ) {
    return children;
  }

  if (!auth?.tokens?.access) {
    return (
      <Navigate
        to={getStaffLoginPath()}
        state={{ from: location }}
        replace
      />
    );
  }

  const needsBranchSelection =
    auth.user?.role !== "BranchAdmin" &&
    (requiresBranchSelection || auth.user?.requires_branch_selection) &&
    !activeBranch;
  const destination = needsBranchSelection
    ? "/select-branch"
    : getStaffHomePath(auth.user?.role, getStaffLoginPath());

  return <Navigate to={destination} replace />;
}
