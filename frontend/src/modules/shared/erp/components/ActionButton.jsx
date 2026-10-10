import React from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "theme-btn-primary",
  secondary: "theme-btn-outline",
  outline: "theme-btn-outline",
  ghost: "theme-btn-ghost",
  danger: "theme-btn-danger",
  success: "theme-btn-success",
  warning: "theme-btn-warning",
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
      {...props}
      type={props.type || "button"}
      className={`erp-action-button theme-btn disabled:opacity-60 ${variants[variant] || variants.secondary} ${className}`}
      data-size={size}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
