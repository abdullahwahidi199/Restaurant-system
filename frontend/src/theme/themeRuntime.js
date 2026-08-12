export const getThemeCssValue = (name) => {
  if (typeof window === "undefined" || !window.document) return "";
  return window
    .getComputedStyle(window.document.documentElement)
    .getPropertyValue(name)
    .trim();
};

export const buildThemedImagePlaceholder = ({
  width = 600,
  height = 400,
  fontSize = 16,
  label = "No Image",
  textOpacity = 0.4,
} = {}) => {
  const background = getThemeCssValue("--theme-text-primary") || "CanvasText";
  const accent = getThemeCssValue("--theme-secondary") || "currentColor";
  const safeLabel = String(label)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${background}"/><text x="50%" y="50%" font-family="serif" font-size="${fontSize}" fill="${accent}" fill-opacity="${textOpacity}" text-anchor="middle">${safeLabel}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
