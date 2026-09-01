import { useEffect, useState } from "react";

const CUSTOMER_SESSION_EVENT = "pakhlai:customer-session";

export function readCustomerSession() {
  try {
    const customer = JSON.parse(localStorage.getItem("customer") || "null");
    const accessToken = localStorage.getItem("access_token");
    return customer && accessToken ? customer : null;
  } catch {
    return null;
  }
}

export function notifyCustomerSessionChanged() {
  window.dispatchEvent(new Event(CUSTOMER_SESSION_EVENT));
}

export function useCustomerSession() {
  const [customer, setCustomer] = useState(readCustomerSession);

  useEffect(() => {
    const syncSession = () => setCustomer(readCustomerSession());
    window.addEventListener("storage", syncSession);
    window.addEventListener(CUSTOMER_SESSION_EVENT, syncSession);
    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener(CUSTOMER_SESSION_EVENT, syncSession);
    };
  }, []);

  return customer;
}
