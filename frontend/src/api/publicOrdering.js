const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "";

export function getMediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  return `${MEDIA_URL}${path}`;
}

export function getPublicContextFromParams(params = {}) {
  const restaurantSlug = params.restaurantSlug || params.slug || "";
  const branchSlug = params.branchSlug || "";
  return { restaurantSlug, branchSlug };
}

export function getBranchPath({ restaurantSlug, branchSlug }) {
  if (!restaurantSlug || !branchSlug) return "/";
  return `/${restaurantSlug}/${branchSlug}`;
}

export function getMenuApiBase({ restaurantSlug, branchSlug }) {
  if (restaurantSlug && branchSlug) {
    return `/menu/public/${restaurantSlug}/${branchSlug}`;
  }
  return `/menu/public/${restaurantSlug}`;
}

export function getOnlineOrderApiPath({ restaurantSlug, branchSlug }, orderId = null) {
  const base =
    restaurantSlug && branchSlug
      ? `/orders/online-orders/${restaurantSlug}/${branchSlug}`
      : `/orders/online-orders/${restaurantSlug}`;

  return orderId ? `${base}/${orderId}/cancel/` : `${base}/`;
}

export function getReviewApiPath({ restaurantSlug, branchSlug }) {
  if (restaurantSlug && branchSlug) {
    return `/menu/send-review/${restaurantSlug}/${branchSlug}/`;
  }
  return `/menu/send-review/${restaurantSlug}/`;
}

export function getMenuItemPath({ restaurantSlug, branchSlug }, id) {
  if (restaurantSlug && branchSlug) {
    return `/${restaurantSlug}/${branchSlug}/menu/item/${id}/`;
  }
  return `/${restaurantSlug}/menu/item/${id}/`;
}

export function getPlatterPath({ restaurantSlug, branchSlug }, id) {
  if (restaurantSlug && branchSlug) {
    return `/${restaurantSlug}/${branchSlug}/menu/platter/${id}/`;
  }
  return `/${restaurantSlug}/menu/platter/${id}/`;
}

export function getPublicCartKey({ restaurantSlug, branchSlug }) {
  return branchSlug
    ? `online_cart_${restaurantSlug}_${branchSlug}`
    : `online_cart_${restaurantSlug}`;
}

export function persistPublicOrderingContext({ restaurant, branch }) {
  if (!restaurant) return;

  const payload = {
    restaurantId: restaurant.id,
    restaurantSlug: restaurant.slug,
    branchId: branch?.id || null,
    branchSlug: branch?.slug || null,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem("public_ordering_context", JSON.stringify(payload));
}

export function getStoredPublicOrderingContext() {
  try {
    return JSON.parse(localStorage.getItem("public_ordering_context") || "null");
  } catch {
    return null;
  }
}

export async function copyText(value) {
  if (!value) return false;

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "absolute";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(input);
  return copied;
}

export async function downloadFile(url, filename) {
  if (!url) return;

  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}
