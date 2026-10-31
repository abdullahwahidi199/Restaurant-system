const firstMessage = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(firstMessage).find(Boolean) || "";
  }
  if (value && typeof value === "object") {
    return Object.values(value).map(firstMessage).find(Boolean) || "";
  }
  return "";
};

export const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    for (const key of ["message", "error", "detail", "non_field_errors"]) {
      const message = firstMessage(data[key]);
      if (message) return message;
    }
  }

  return firstMessage(data) || fallback;
};

