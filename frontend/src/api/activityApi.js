import instance from "./axiosInstance";

const compactParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );

export const sendHeartbeat = (idleSeconds = 0) =>
  instance.post("/users/activity/heartbeat/", { idle_seconds: idleSeconds });

export const getActivityOverview = (params) =>
  instance.get("/users/activity/overview/", { params: compactParams(params) });

export const getActivitySessions = (params) =>
  instance.get("/users/activity/sessions/", { params: compactParams(params) });

export const getActivityHistory = (params) =>
  instance.get("/users/activity/history/", { params: compactParams(params) });

export const getActivitySocketTicket = (params) =>
  instance.get("/users/activity/socket-ticket/", { params: compactParams(params) });

export const revokeActivitySession = (sessionId, params = {}) =>
  instance.post(`/users/activity/sessions/${sessionId}/revoke/`, compactParams(params));

export const revokeUserSessions = (userId, params = {}) =>
  instance.post(`/users/activity/users/${userId}/revoke/`, compactParams(params));
