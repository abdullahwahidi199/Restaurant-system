export const PRESENCE_HEARTBEAT_MS = 30_000;

export const parseJwtSessionId = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(payload)))).sid || "legacy";
  } catch {
    return "legacy";
  }
};

export const canClaimPresenceLeadership = (leader, tabId, now, isVisible = true) =>
  Boolean(isVisible && (!leader || leader.expiresAt < now || leader.tabId === tabId));

export const calculateIdleSeconds = (activityAt, now = Date.now()) =>
  Math.max(0, Math.floor((now - activityAt) / 1000));

export const shouldSendHeartbeat = (lastHeartbeat, now, force = false) =>
  Boolean(force || now - lastHeartbeat >= PRESENCE_HEARTBEAT_MS - 1_000);
