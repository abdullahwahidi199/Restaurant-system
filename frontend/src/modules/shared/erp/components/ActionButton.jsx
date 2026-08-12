import React from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "theme-btn-primary shadow-sm",
  secondary: "theme-btn-outline shadow-sm",
  outline: "theme-btn-outline shadow-sm",
  ghost: "theme-btn-ghost",
  danger: "theme-btn-danger shadow-sm",
  success: "theme-btn-success shadow-sm",
  warning: "theme-btn-warning shadow-sm",
};

export default function ActionButton({
  children,
  icon: Icon,
  variant = "secondary",
  loading = false,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={`theme-btn px-4 py-2.5 text-sm disabled:opacity-60 ${variants[variant] || variants.secondary} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
