import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Check,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { AuthContext } from "../../api/authforRBC";
import { useTranslation as useAutoTranslation } from "react-i18next";
import { getStaffHomePath } from "../../config/staffRoutes";

export default function BranchSelectionPage() {
  const { t: autoT, i18n } = useAutoTranslation();
  const {
    auth,
    branches,
    activeBranch,
    refreshBranchContext,
    switchActiveBranch,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedBranchId, setSelectedBranchId] = useState(
    activeBranch?.id || "",
  );
  const [loading, setLoading] = useState(false);
  const branchContextRequested = useRef(false);

  const redirectPath = useMemo(() => {
    return (
      location.state?.redirectPath ||
      getStaffHomePath(auth?.user?.role)
    );
  }, [auth?.user?.role, location.state?.redirectPath]);

  useEffect(() => {
    if (branches?.length || branchContextRequested.current) return;
    branchContextRequested.current = true;
    refreshBranchContext().catch(() => {});
  }, [branches?.length, refreshBranchContext]);

  useEffect(() => {
    if (!selectedBranchId && activeBranch?.id) {
      setSelectedBranchId(activeBranch.id);
    }
  }, [activeBranch?.id, selectedBranchId]);

  useEffect(() => {
    if (auth?.user?.role === "BranchAdmin") {
      navigate(redirectPath, { replace: true });
      return;
    }
    if (branches?.length === 1) {
      navigate(redirectPath, { replace: true });
    }
  }, [auth?.user?.role, branches?.length, navigate, redirectPath]);

  const handleContinue = async () => {
    if (!selectedBranchId) return;
    setLoading(true);
    try {
      await switchActiveBranch(selectedBranchId);
      navigate(redirectPath, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="theme-app-shell relative min-h-screen overflow-x-hidden px-4 pb-20 pt-8 sm:px-6 sm:pb-8 lg:py-12"
      dir={i18n.dir()}
    >
      <div
        className="pointer-events-none absolute -start-24 -top-24 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "rgb(var(--theme-primary-rgb) / 0.12)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -end-24 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "rgb(var(--theme-primary-rgb) / 0.08)" }}
      />

      <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <section className="theme-card-raised w-full overflow-hidden rounded-3xl">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative overflow-hidden bg-[var(--theme-primary)] p-7 text-[var(--theme-text-inverse)] sm:p-10 lg:min-h-[580px]">
              <div className="pointer-events-none absolute -end-16 -top-20 h-64 w-64 rounded-full border border-white/15" />
              <div className="pointer-events-none absolute -end-8 -top-12 h-40 w-40 rounded-full border border-white/20" />

              <div className="relative flex h-full flex-col justify-between gap-12">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    {autoT("inventory_manager.topbar.workspace", {
                      defaultValue: "Workspace",
                    })}
                  </span>
                  <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur">
                    <Building2 className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h1 className="mt-5 max-w-sm text-3xl font-bold leading-tight sm:text-4xl">
                    {autoT("legacy.select_branch_fcf716ea")}
                  </h1>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
                    {autoT(
                      "legacy.choose_where_you_want_to_work_for_this_session_c19b960d",
                    )}
                  </p>
                </div>

                <p className="max-w-sm text-xs leading-5 text-white/65">
                  {autoT("legacy.active_branch_5a2ad822")}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 flex-col p-5 sm:p-8 lg:p-10">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--theme-primary)]">
                    {autoT("settings_center.nav.branch")}
                  </p>
                  <h2 className="mt-1 text-xl font-bold theme-text-primary">
                    {autoT("legacy.select_branch_fcf716ea")}
                  </h2>
                </div>
                <span className="rounded-full bg-[var(--theme-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--theme-primary)]">
                  {branches.length}
                </span>
              </div>

              <div className="grid max-h-[390px] gap-3 overflow-y-auto pe-1">
                {branches.map((branch) => {
                  const isSelected = Number(selectedBranchId) === branch.id;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => setSelectedBranchId(branch.id)}
                      aria-pressed={isSelected}
                      className={`group flex w-full items-center gap-3 rounded-2xl border p-3.5 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 ${
                        isSelected
                          ? "border-[var(--theme-primary)] bg-[var(--theme-primary-soft)] shadow-sm"
                          : "border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-border-strong)] hover:bg-[var(--theme-muted)]"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                          isSelected
                            ? "bg-[var(--theme-primary)] text-[var(--theme-text-inverse)]"
                            : "bg-[var(--theme-muted)] text-[var(--theme-text-muted)] group-hover:text-[var(--theme-primary)]"
                        }`}
                        aria-hidden="true"
                      >
                        <Building2 className="h-5 w-5" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold theme-text-primary">
                          {branch.name}
                        </span>
                        <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs theme-text-muted">
                          {branch.address ? (
                            <>
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{branch.address}</span>
                            </>
                          ) : (
                            <span className="truncate uppercase tracking-wide">
                              {branch.code}
                            </span>
                          )}
                        </span>
                      </span>

                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                          isSelected
                            ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-text-inverse)]"
                            : "border-[var(--theme-border-strong)] text-transparent"
                        }`}
                        aria-hidden="true"
                      >
                        <Check className="h-4 w-4" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!selectedBranchId || loading}
                onClick={handleContinue}
                className="theme-btn theme-btn-primary mt-6 h-12 w-full justify-center gap-2 rounded-xl px-5 text-sm shadow-md"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight
                    className="h-4 w-4 rtl:rotate-180"
                    aria-hidden="true"
                  />
                )}
                {loading
                  ? autoT("legacy.switching_8c8980ce")
                  : autoT("legacy.continue_2e026239")}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
