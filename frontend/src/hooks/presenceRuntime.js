import { sendHeartbeat } from "../api/activityApi";
import {
  calculateIdleSeconds,
  canClaimPresenceLeadership,
  parseJwtSessionId,
  shouldSendHeartbeat,
} from "./presenceRuntimeUtils";

const LEADER_TTL_MS = 45_000;
const ACTIVITY_THROTTLE_MS = 5_000;
const LEADER_KEY = "pakhlai-presence-leader";
const ACTIVITY_KEY = "pakhlai-presence-last-activity";

let runtime = null;

const readJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

export function startPresenceRuntime(accessToken) {
  stopPresenceRuntime();
  if (!accessToken || typeof window === "undefined") return () => {};

  const tabId = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const sessionId = parseJwtSessionId(accessToken);
  const leaderKey = `${LEADER_KEY}:${sessionId}`;
  const activityKey = `${ACTIVITY_KEY}:${sessionId}`;
  let stopped = false;
  let lastActivityWrite = 0;
  let lastHeartbeat = 0;

  const recordActivity = () => {
    const now = Date.now();
    if (now - lastActivityWrite < ACTIVITY_THROTTLE_MS) return;
    lastActivityWrite = now;
    localStorage.setItem(activityKey, String(now));
  };

  const acquireLeadership = () => {
    const now = Date.now();
    const leader = readJson(leaderKey);
    if (canClaimPresenceLeadership(leader, tabId, now, document.visibilityState !== "hidden")) {
      localStorage.setItem(
        leaderKey,
        JSON.stringify({ tabId, expiresAt: now + LEADER_TTL_MS }),
      );
      return readJson(leaderKey)?.tabId === tabId;
    }
    return false;
  };

  const heartbeat = async (force = false) => {
    if (stopped || !acquireLeadership()) return;
    const now = Date.now();
    if (!shouldSendHeartbeat(lastHeartbeat, now, force)) return;
    lastHeartbeat = now;
    const activityAt = Number(localStorage.getItem(activityKey)) || now;
    try {
      await sendHeartbeat(calculateIdleSeconds(activityAt, now));
    } catch {
      // Presence is deliberately best-effort and must not interrupt operations.
    }
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      recordActivity();
      heartbeat(true);
    } else if (readJson(leaderKey)?.tabId === tabId) {
      localStorage.removeItem(leaderKey);
    }
  };
  const activityEvents = ["pointerdown", "keydown", "touchstart", "scroll"];
  activityEvents.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
  document.addEventListener("visibilitychange", onVisibility);
  recordActivity();
  heartbeat(true);
  const timer = window.setInterval(() => heartbeat(false), 10_000);

  const stop = () => {
    if (stopped) return;
    stopped = true;
    window.clearInterval(timer);
    activityEvents.forEach((event) => window.removeEventListener(event, recordActivity));
    document.removeEventListener("visibilitychange", onVisibility);
    if (readJson(leaderKey)?.tabId === tabId) localStorage.removeItem(leaderKey);
  };
  runtime = { stop };
  return stop;
}

export function stopPresenceRuntime() {
  runtime?.stop?.();
  runtime = null;
}
