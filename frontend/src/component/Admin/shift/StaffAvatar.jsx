import { useEffect, useMemo, useState } from "react";

function resolveImageUrl(image) {
  if (!image) return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;

  const baseUrl = import.meta.env.VITE_MEDIA_URL || "";
  if (!baseUrl) return image;

  return `${baseUrl.replace(/\/$/, "")}/${String(image).replace(/^\//, "")}`;
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function StaffAvatar({ member, size = "md", className = "" }) {
  const imageUrl = useMemo(() => resolveImageUrl(member?.image), [member?.image]);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-[10px]"
      : size === "lg"
        ? "h-11 w-11 text-xs"
        : "h-9 w-9 text-[11px]";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[rgb(var(--theme-primary-rgb)/0.18)] bg-[var(--theme-primary-soft)] font-bold text-[var(--theme-primary-hover)] ${sizeClass} ${className}`}
      aria-hidden="true"
    >
      {getInitials(member?.name)}
      {imageUrl && !imageFailed && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      )}
    </span>
  );
}
