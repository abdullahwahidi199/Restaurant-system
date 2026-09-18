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
  size = "md",
  loading = false,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={`erp-action-button theme-btn disabled:opacity-60 ${variants[variant] || variants.secondary} ${className}`}
      data-size={size}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
