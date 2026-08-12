import React, { useContext, useState } from "react";
import { Building2 } from "lucide-react";
import { AuthContext } from "../../api/authforRBC";

export default function BranchSwitcher({ compact = false }) {
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
      } flex items-center gap-2 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm text-[var(--theme-text-secondary)] shadow-[var(--theme-shadow-sm)]`}
    >
      <Building2
        size={16}
        className="branch-switcher-icon shrink-0 text-[var(--theme-text-muted)]"
      />
      {!compact && (
        <span className="branch-switcher-label font-medium text-[var(--theme-text-muted)]">
          Branch
        </span>
      )}
      {branches.length === 1 ? (
        <span className="branch-switcher-current font-semibold text-[var(--theme-text-primary)]">
          {activeBranch?.name || branches[0].name}
        </span>
      ) : (
        <select
          value={activeBranch?.id || ""}
          onChange={handleChange}
          disabled={switching}
          className="branch-switcher-select min-w-36 bg-transparent font-semibold text-[var(--theme-text-primary)] outline-none disabled:opacity-60"
          aria-label="Active branch"
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
