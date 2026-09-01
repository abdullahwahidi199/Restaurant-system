import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { logoutCustomer } from "../../api/auth";
import {
  notifyCustomerSessionChanged,
  useCustomerSession,
} from "../../api/customerSession";

export default function CustomerAccountMenu({
  className = "",
  compact = false,
  onNavigate,
  showGuestActions = true,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customer = useCustomerSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const closeOnPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (!customer) {
    if (!showGuestActions) return null;

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Link to="/login" className="marketplace-login-link" onClick={onNavigate}>
          {t("landing.marketplace.nav.login")}
        </Link>
        <Link to="/signup" className="marketplace-signup-link" onClick={onNavigate}>
          {t("landing.marketplace.nav.register")}
        </Link>
      </div>
    );
  }

  const username = customer.username || "Customer";
  const initial = username.trim().charAt(0).toUpperCase() || "C";

  const handleLogout = () => {
    logoutCustomer();
    notifyCustomerSessionChanged();
    setOpen(false);
    onNavigate?.();
    navigate("/", { replace: true });
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-1.5 text-stone-700 shadow-sm transition hover:border-orange-300 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        aria-label={`${t("landing.actions.profile", "Profile")}: ${username}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-sm font-black text-white">
          {initial}
        </span>
        {!compact ? (
          <span className="max-w-28 truncate text-sm font-bold">{username}</span>
        ) : null}
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-[90] mt-2 w-64 overflow-hidden rounded-xl border border-stone-200 bg-white p-2 text-left shadow-2xl shadow-stone-950/15 rtl:left-0 rtl:right-auto rtl:text-right"
        >
          <div className="border-b border-stone-100 px-3 py-2.5">
            <p className="truncate text-sm font-black text-stone-950">{username}</p>
            {customer.email ? (
              <p className="mt-0.5 truncate text-xs text-stone-500">{customer.email}</p>
            ) : null}
          </div>
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="mt-1 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-stone-700 transition hover:bg-orange-50 hover:text-orange-800"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {t("landing.actions.profile", "View profile")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t("auth.logout", "Logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
