const runtimeEnv = import.meta.env || {};

const trimTrailingSlashes = (value) => String(value || "").replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlashes(
  runtimeEnv.VITE_API_URL || "/api",
);

export const MEDIA_BASE_URL = trimTrailingSlashes(
  runtimeEnv.VITE_MEDIA_URL || "",
);

const getBrowserOrigin = () =>
  typeof window === "undefined" ? "http://localhost" : window.location.origin;

export function deriveWebSocketBaseUrl(
  apiBaseUrl = API_BASE_URL,
  browserOrigin = getBrowserOrigin(),
) {
  const url = new URL(apiBaseUrl || "/api", browserOrigin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = url.pathname.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
  url.search = "";
  url.hash = "";
  return trimTrailingSlashes(url.toString());
}

export const WEBSOCKET_BASE_URL = trimTrailingSlashes(
  runtimeEnv.VITE_WEBSOCKET_URL || deriveWebSocketBaseUrl(),
);

export function buildWebSocketUrl(path) {
  return `${WEBSOCKET_BASE_URL}/${String(path || "").replace(/^\/+/, "")}`;
}
