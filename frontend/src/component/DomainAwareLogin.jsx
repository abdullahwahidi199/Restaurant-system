import CustomerLogin from "./Customer/CustomerLoginModal";
import StaffLogin from "./StaffLogin";
import { isStaffApp } from "../config/appEnvironment";

export default function DomainAwareLogin() {
  return isStaffApp() ? <StaffLogin /> : <CustomerLogin />;
}
