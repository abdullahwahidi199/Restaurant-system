import React, { useContext, useState } from "react";
import { Building2, ChevronDown, Loader2 } from "lucide-react";
import { AuthContext } from "../../api/authforRBC";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function BranchSwitcher({ compact = false }) {
  const { t: autoT } = useAutoTranslation();
  const { auth, branches, activeBranch, switchActiveBranch } =
    useContext(AuthContext);
  const [switching, setSwitching] = useState(false);

  if (auth?.user?.role === "BranchAdmin") return null;
  if (!branches?.length) return null;

  const handleChange = async (event) => {
    const branchId = event.target.value;
    if (!branchId || Number(branchId) === activeBranch?.id) return;

    setSwitching(true);
    try {
      await switchActiveBranch(branchId);
      window.location.reload();
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div
      className={`branch-switcher ${
        compact ? "branch-switcher-compact" : ""
      } group flex min-h-9 items-center gap-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-elevated)] px-2.5 py-1 text-sm text-[var(--theme-text-secondary)] shadow-[var(--theme-shadow-sm)] transition hover:border-[var(--theme-border-strong)]`}
    >
      <span className="branch-switcher-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
        {switching ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Building2 className="h-4 w-4" aria-hidden="true" />
        )}
      </span>
      {branches.length === 1 ? (
        <span className="branch-switcher-current min-w-0 pe-1">
          {!compact && (
            <span className="branch-switcher-label block text-[9px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
              {autoT("settings_center.nav.branch")}
            </span>
          )}
          <span className="block max-w-40 truncate text-xs font-bold text-[var(--theme-text-primary)]">
            {activeBranch?.name || branches[0].name}
          </span>
        </span>
      ) : (
        <label className="branch-switcher-current relative min-w-0">
          {!compact && (
            <span className="branch-switcher-label block text-[9px] font-bold uppercase leading-none tracking-wider text-[var(--theme-text-muted)]">
              {autoT("settings_center.nav.branch")}
            </span>
          )}
          <select
            value={activeBranch?.id || ""}
            onChange={handleChange}
            disabled={switching}
            className="branch-switcher-select h-5 min-w-36 max-w-48 appearance-none bg-transparent pe-6 text-xs font-bold text-[var(--theme-text-primary)] outline-none disabled:opacity-60"
            aria-label={autoT("legacy.active_branch_5a2ad822")}
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <ChevronDown className="branch-switcher-chevron pointer-events-none absolute bottom-0.5 end-0 h-3.5 w-3.5 text-[var(--theme-text-muted)]" />
        </label>
      )}
    </div>
  );
}
