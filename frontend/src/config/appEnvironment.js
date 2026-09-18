export const APP_MODES = Object.freeze({
  CUSTOMER: "customer",
  STAFF: "staff",
});

export const APP_HOSTS = Object.freeze({
  MAIN: "pakhlai.com",
  WWW: "www.pakhlai.com",
  STAFF: "app.pakhlai.com",
});

const normalize = (value) => String(value || "").trim().toLowerCase();

const configuredMode = () => normalize(import.meta.env?.VITE_APP_MODE);

const browserHostname = () =>
  typeof window === "undefined" ? "" : normalize(window.location.hostname);

export function resolveAppMode({ hostname = "", mode = "" } = {}) {
  const normalizedHostname = normalize(hostname);

  // Production hostnames always win over a build-time/local override.
  if (normalizedHostname === APP_HOSTS.STAFF) return APP_MODES.STAFF;
  if (
    normalizedHostname === APP_HOSTS.MAIN ||
    normalizedHostname === APP_HOSTS.WWW
  ) {
    return APP_MODES.CUSTOMER;
  }

  const normalizedMode = normalize(mode);
  if (normalizedMode === APP_MODES.STAFF) return APP_MODES.STAFF;
  if (normalizedMode === APP_MODES.CUSTOMER) return APP_MODES.CUSTOMER;

  return APP_MODES.CUSTOMER;
}

export function getAppMode() {
  return resolveAppMode({
    hostname: browserHostname(),
    mode: configuredMode(),
  });
}

export function isStaffApp() {
  return getAppMode() === APP_MODES.STAFF;
}

export function isCustomerApp() {
  return getAppMode() === APP_MODES.CUSTOMER;
}

export function getStaffLoginPath() {
  return isStaffApp() ? "/login" : "/staff-login";
}
