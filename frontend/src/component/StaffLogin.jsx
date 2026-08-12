import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../api/authforRBC";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Building2,
  ChefHat,
  Clock3,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";

// Maps technical errors to friendly messages
const formatRetryAfter = (seconds) => {
  const value = Number(seconds || 0);
  if (!value || value < 1) return "a moment";
  if (value < 60) return `${value} second${value === 1 ? "" : "s"}`;
  const minutes = Math.ceil(value / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
};

const getFriendlyError = (error) => {
  if (error?.response?.status === 429) {
    const retryAfter =
      error.response.data?.retry_after || error.response.headers?.["retry-after"];
    return `Too many login attempts. Please try again in ${formatRetryAfter(retryAfter)}.`;
  }

  const errorMessage = error?.message || error;
  if (!errorMessage) return "Something went wrong. Please try again.";

  const msg = errorMessage.toLowerCase();

  if (
    msg.includes("invalid credentials") ||
    msg.includes("401") ||
    msg.includes("unauthorized")
  )
    return "Incorrect username or password. Please try again.";

  if (
    msg.includes("user not found") ||
    msg.includes("404") ||
    msg.includes("does not exist")
  )
    return "No account found with that username.";

  if (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("failed to fetch")
  )
    return "Network error. Please check your internet connection.";

  if (msg.includes("timeout") || msg.includes("timed out"))
    return "The request timed out. Please try again.";

  if (
    msg.includes("too many") ||
    msg.includes("429") ||
    msg.includes("rate limit")
  )
    return "Too many login attempts. Please wait a moment and try again.";

  if (msg.includes("server") || msg.includes("500") || msg.includes("internal"))
    return "Server error. Please try again later or contact support.";

  if (
    msg.includes("account disabled") ||
    msg.includes("inactive") ||
    msg.includes("suspended")
  )
    return "Your account has been disabled. Please contact your administrator.";

  if (msg.includes("password expired"))
    return "Your password has expired. Please contact your administrator.";

  // Fallback for anything not matched
  return "Login failed. Please check your credentials and try again.";
};

const getRedirectPath = (role) => {
  if (role === "SuperAdmin") return "/super-admin";
  if (role === "Admin") return "/admin/dashboard";
  if (role === "BranchAdmin") return "/admin/dashboard";
  if (role === "Manager") return "/manager";
  if (role === "Cashier") return "/cashier";
  if (role === "InventoryManager") return "/inventory-manager";
  if (role === "FinanceManager") return "/finance-manager";
  if (role === "OperationsManager") return "/operations-manager";
  if (role === "Call_operator") return "/call-operator";
  if (role === "Waiter") return "/waiter";
  if (role === "Kitchen_manager") return "/kitchen";
  return "/";
};

export default function StaffLogin() {
  const { login } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isRTL = i18n.dir ? i18n.dir() === "rtl" : i18n.language !== "en";

  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(username, password);
      const role = data.role;

      toast.success(t("login.success", "Welcome back! Redirecting..."));

      const redirectPath = getRedirectPath(role);
      if (data.requires_branch_selection) {
        nav("/select-branch", { state: { redirectPath } });
      } else {
        nav(redirectPath);
      }
    } catch (err) {
      console.error(err); // Keep technical log for debugging
      const friendlyMessage = getFriendlyError(err);

      toast.error(friendlyMessage, {
        duration: 4000,
        style: {
          background: "var(--theme-secondary)",
          color: "var(--theme-surface)",
          border: "1px solid var(--theme-danger)",
        },
        iconTheme: {
          primary: "var(--theme-danger)",
          secondary: "var(--theme-surface)",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text-primary)]"
    >
      <Toaster position="bottom-center" />

      <main className="relative grid min-h-screen overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[var(--theme-primary)] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.2),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_44%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-4 py-3 shadow-sm backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[var(--theme-primary)]">
                <UtensilsCrossed size={21} />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-wide">
                  {t("login.brand", "Pakhlai RMS")}
                </p>
                <p className="text-xs text-white/70">
                  {t("login.eyebrow", "Restaurant operations platform")}
                </p>
              </div>
            </div>
          </div>

          <div className="relative max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/10 px-3 py-1 text-sm text-white/80">
              <ShieldCheck size={16} />
              {t("login.trustedBadge", "Built for daily restaurant operations")}
            </div>
            <h1 className="text-5xl font-bold leading-tight">
              {t(
                "login.headline",
                "Run service with clarity from the first login.",
              )}
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-white/75">
              {t(
                "login.description",
                "Secure staff access for orders, kitchen, inventory, reports, and branch operations.",
              )}
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            {[
              {
                icon: <ChefHat size={20} className="mb-3 text-white" />,
                text: t("login.realTimeKitchen", "Real-time kitchen flow"),
              },
              {
                icon: <Building2 size={20} className="mb-3 text-white" />,
                text: t("login.branchReady", "Branch-ready controls"),
              },
              {
                icon: <Clock3 size={20} className="mb-3 text-white" />,
                text: t("login.secureAccess", "Secure access"),
              },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur"
              >
                {icon}
                <p className="text-sm font-medium leading-5 text-white/85">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[460px]">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--theme-primary)] text-white shadow-sm">
                <UtensilsCrossed size={22} />
              </span>
              <div>
                <p className="text-base font-bold">
                  {t("login.brand", "Pakhlai RMS")}
                </p>
                <p className="text-xs text-[var(--theme-text-secondary)]">
                  {t("login.eyebrow", "Restaurant operations platform")}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-xl shadow-black/5 sm:p-8">
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
                  <LockKeyhole size={23} />
                </div>
                <h2 className="text-2xl font-bold">
                  {t("login.panelTitle", "Staff sign in")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--theme-text-secondary)]">
                  {t(
                    "login.panelDescription",
                    "Use your staff username and password to continue.",
                  )}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[var(--theme-text-primary)]">
                    {t("login.username", "Username")}
                  </span>
                  <span className="relative block">
                    <UserRound
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] rtl:left-auto rtl:right-4"
                    />
                    <input
                      type="text"
                      name="username"
                      autoComplete="username"
                      placeholder={t(
                        "login.usernamePlaceholder",
                        "Enter username",
                      )}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12 w-full rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg)] px-11 text-[var(--theme-text-primary)] outline-none transition placeholder:text-[var(--theme-text-muted)] focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10"
                      required
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[var(--theme-text-primary)]">
                    {t("login.password", "Password")}
                  </span>
                  <span className="relative block">
                    <LockKeyhole
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] rtl:left-auto rtl:right-4"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      placeholder={t(
                        "login.passwordPlaceholder",
                        "Enter password",
                      )}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg)] px-11 text-[var(--theme-text-primary)] outline-none transition placeholder:text-[var(--theme-text-muted)] focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--theme-text-muted)] transition hover:bg-[var(--theme-elevated)] hover:text-[var(--theme-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/40 rtl:left-3 rtl:right-auto"
                      aria-label={
                        showPassword
                          ? t("login.hidePassword", "Hide password")
                          : t("login.showPassword", "Show password")
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--theme-primary)] px-5 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-[var(--theme-primary)]/90 focus:outline-none focus:ring-4 focus:ring-[var(--theme-primary)]/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {t("login.loading", "Logging in...")}
                    </>
                  ) : (
                    <>
                      {t("login.button", "Login")}
                      <ArrowRight
                        size={18}
                        className={isRTL ? "rotate-180" : ""}
                      />
                    </>
                  )}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm text-[var(--theme-text-secondary)]">
              {t(
                "login.supportText",
                "Need access? Contact your restaurant administrator.",
              )}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
