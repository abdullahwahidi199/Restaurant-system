import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, RefreshCw, Send, X } from "lucide-react";
import instance from "../../../api/axiosInstance";

const emptyForm = {
  ingredient: "",
  to_branch: "",
  quantity: "",
  notes: "",
};

export default function StockTransferPanel() {
  const { t } = useTranslation();
  const [ingredients, setIngredients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [ingredientRes, branchRes, transferRes] = await Promise.all([
        instance.get("/inventory/ingredients/"),
        instance.get("/restaurant/branches/?include_inactive=false"),
        instance.get("/inventory/stock-transfers/"),
      ]);
      setIngredients(Array.isArray(ingredientRes.data) ? ingredientRes.data : []);
      setBranches(Array.isArray(branchRes.data) ? branchRes.data : []);
      setTransfers(Array.isArray(transferRes.data) ? transferRes.data : []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          t("inventory_manager.stock_transfers.load_failed", {
            defaultValue: "Could not load transfers.",
          }),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createTransfer = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await instance.post("/inventory/stock-transfers/", form);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          t("inventory_manager.stock_transfers.create_failed", {
            defaultValue: "Could not create transfer.",
          }),
      );
    } finally {
      setSaving(false);
    }
  };

  const transferAction = async (transfer, action) => {
    setSaving(true);
    setError("");
    try {
      await instance.post(`/inventory/stock-transfers/${transfer.id}/action/`, {
        action,
      });
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          t("inventory_manager.stock_transfers.update_failed", {
            defaultValue: "Could not update transfer.",
          }),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-900">
          {t("inventory_manager.stock_transfers.title", {
            defaultValue: "Stock Transfers",
          })}
        </h3>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          title={t("inventory_manager.stock_transfers.refresh", {
            defaultValue: "Refresh transfers",
          })}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={createTransfer} className="grid gap-3">
        <select
          name="ingredient"
          value={form.ingredient}
          onChange={handleChange}
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        >
          <option value="">
            {t("inventory_manager.ingredients.ingredient", { defaultValue: "Ingredient" })}
          </option>
          {ingredients.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.id}>
              {ingredient.name}
            </option>
          ))}
        </select>

        <select
          name="to_branch"
          value={form.to_branch}
          onChange={handleChange}
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        >
          <option value="">
            {t("inventory_manager.stock_transfers.destination_branch", {
              defaultValue: "Destination branch",
            })}
          </option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>

        <input
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          required
          min="0.001"
          step="0.001"
          type="number"
          placeholder={t("inventory_manager.common.quantity", {
            defaultValue: "Quantity",
          })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />

        <input
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder={t("inventory_manager.common.notes", {
            defaultValue: "Notes",
          })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-500"
        >
          <Send size={16} />
          {saving
            ? t("inventory_manager.common.saving", { defaultValue: "Saving..." })
            : t("inventory_manager.stock_transfers.request_transfer", {
                defaultValue: "Request Transfer",
              })}
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">
            {t("inventory_manager.stock_transfers.loading", {
              defaultValue: "Loading transfers...",
            })}
          </p>
        ) : transfers.length ? (
          transfers.slice(0, 5).map((transfer) => (
            <div
              key={transfer.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm"
            >
              <div className="font-medium text-gray-900">
                {transfer.ingredient_name} - {transfer.quantity}
              </div>
              <div className="mt-1 text-gray-500">
                {t("inventory_manager.stock_transfers.transfer_route", {
                  defaultValue: "{{from}} to {{to}}",
                  from: transfer.from_branch_name,
                  to: transfer.to_branch_name,
                })}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-700">
                  {t(`inventory_manager.statuses.${transfer.status}`, {
                    defaultValue: transfer.status,
                  })}
                </span>
                {transfer.status === "pending" && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => transferAction(transfer, "approve")}
                      disabled={saving}
                      className="rounded-lg border border-green-200 p-1.5 text-green-700 hover:bg-green-50"
                      title={t("inventory_manager.common.approve", {
                        defaultValue: "Approve",
                      })}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => transferAction(transfer, "reject")}
                      disabled={saving}
                      className="rounded-lg border border-red-200 p-1.5 text-red-700 hover:bg-red-50"
                      title={t("inventory_manager.common.reject", {
                        defaultValue: "Reject",
                      })}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            {t("inventory_manager.stock_transfers.empty", {
              defaultValue: "No transfers yet.",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
