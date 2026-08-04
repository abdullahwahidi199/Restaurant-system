import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Building2, Check } from "lucide-react";
import { AuthContext } from "../../api/authforRBC";

const routeByRole = {
  SuperAdmin: "/super-admin",
  Admin: "/admin/dashboard",
  BranchAdmin: "/admin/dashboard",
  Manager: "/manager",
  Cashier: "/cashier",
  InventoryManager: "/inventory-manager",
  Call_operator: "/call-operator",
  Waiter: "/waiter",
  Kitchen_manager: "/kitchen",
};

export default function BranchSelectionPage() {
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

  const redirectPath = useMemo(() => {
    return (
      location.state?.redirectPath ||
      routeByRole[auth?.user?.role] ||
      "/"
    );
  }, [auth?.user?.role, location.state?.redirectPath]);

  useEffect(() => {
    if (branches?.length) return;
    refreshBranchContext().catch(() => {});
  }, [branches?.length]);

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
    <div className="min-h-screen bg-gray-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center">
        <div className="mb-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-red-500">
            <Building2 size={24} />
          </div>
          <h1 className="text-3xl font-bold">Select branch</h1>
          <p className="mt-2 text-gray-300">
            Choose where you want to work for this session.
          </p>
        </div>

        <div className="grid gap-3">
          {branches.map((branch) => {
            const isSelected = Number(selectedBranchId) === branch.id;
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => setSelectedBranchId(branch.id)}
                className={`flex items-center justify-between rounded-lg border px-4 py-4 text-left transition ${
                  isSelected
                    ? "border-red-400 bg-red-500/15"
                    : "border-gray-800 bg-gray-900 hover:border-gray-600"
                }`}
              >
                <span>
                  <span className="block font-semibold">{branch.name}</span>
                  <span className="mt-1 block text-sm text-gray-400">
                    {branch.code}
                  </span>
                </span>
                {isSelected && <Check size={20} className="text-red-300" />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selectedBranchId || loading}
          onClick={handleContinue}
          className="mt-8 rounded-lg bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-700"
        >
          {loading ? "Switching..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
