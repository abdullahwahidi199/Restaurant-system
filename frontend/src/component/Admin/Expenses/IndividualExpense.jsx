// src/pages/expenses/IndividualExpense.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import {
  Pencil,
  Trash2,
  Save,
  XCircle,
  Printer,
  ArrowLeft,
  FileText,
} from "lucide-react";
import instance from "../../../api/axiosInstance";
import { printVoucher } from "./ExpenseVoucher";
import {
  formatCurrency,
  formatDate,
  getCurrencyBadge,
  emptyExpenseForm,
} from "./helpers";
import AuditTimeline from "../../../modules/audit/components/AuditTimeline";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function IndividualExpense() {
                 const { t: autoT } = useAutoTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardBase = location.pathname.startsWith("/operations-manager")
    ? "/operations-manager"
    : location.pathname.startsWith("/inventory-manager")
      ? "/inventory-manager"
      : "/admin/dashboard";
  const expensesPath = `${dashboardBase}/expenses`;

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editFormDisplay, setEditFormDisplay] = useState(false);
  const [editForm, setEditForm] = useState(emptyExpenseForm());
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await instance.get("/restaurant/me/");
        setRestaurant(res.data);
      } catch (error) {
        console.error("Failed to fetch restaurant info", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, []);
  const fetchExpense = async () => {
    try {
      setLoading(true);
      const response = await instance.get(`/expenses/expenses/${id}/`);
      setExpense(response.data);
      setError(null);
    } catch (err) {
      setError(autoT("legacy.failed_to_load_expense_61fb98de"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpense();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openEdit = () => {
    if (!expense) return;
    setEditForm({
      name: expense.name || "",
      date: expense.date || "",
      amount: expense.amount || "",
      currency: expense.currency || "AFN",
      exchange_rate: expense.exchange_rate || "1",
      description: expense.description || "",
    });
    setEditFormDisplay(true);
  };

  const handleExpenseEdit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...editForm,
        amount: parseFloat(editForm.amount),
        exchange_rate: parseFloat(editForm.exchange_rate || 1),
      };
      await instance.patch(`/expenses/expenses/${id}/`, payload);
      setEditFormDisplay(false);
      await fetchExpense();
    } catch (err) {
      console.error(err);
      alert("Failed to update expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await instance.delete(`/expenses/expenses/${id}/`);
      navigate(expensesPath);
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <FileText className="text-gray-400 mb-3" size={48} />
        <p className="text-gray-600 mb-4">{error || autoT("legacy.expense_not_found_af72eeb1")}</p>
        <Link
          to={expensesPath}
          className="text-indigo-600 hover:underline"
        >
          {autoT("legacy.back_to_expenses_6ab10edd")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          to={expensesPath}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 mb-4 transition"
        >
          <ArrowLeft size={16} />
          {autoT("legacy.back_to_expenses_732b199b")}
        </Link>

        {/* Detail Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {expense.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {autoT("legacy.expense_b7d0855c")}{expense.id} • {formatDate(expense.date)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  printVoucher(expense, restaurant?.name, restaurant?.logo)
                }
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition shadow-sm"
              >
                <Printer size={16} />
                {autoT("legacy.print_voucher_e313002f")}
              </button>
              <button
                onClick={openEdit}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                <Pencil size={16} />
                {autoT("staff.table.edit")}
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition shadow-sm"
              >
                <Trash2 size={16} />
                {autoT("staff.table.delete")}
              </button>
            </div>
          </div>

          {/* Amount Hero */}
          <div className="px-6 py-8 bg-gradient-to-br from-indigo-50 to-white border-b border-gray-200">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              {autoT("legacy.total_amount_490aaabf")}
            </p>
            <p className="text-4xl font-bold text-gray-900">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
            {expense.currency === "USD" && (
              <p className="mt-2 text-sm text-gray-600">
                {autoT("legacy.1_usd_d55768e2")} {expense.exchange_rate} {autoT("legacy.afn_9ae1ef71")}{" "}
                <span className="font-semibold text-indigo-700">
                  {formatCurrency(expense.amount_afn, "AFN")}
                </span>
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailRow label={autoT("table.date")} value={formatDate(expense.date)} />
            <DetailRow
              label={autoT("legacy.currency_e070de22")}
              value={
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getCurrencyBadge(
                    expense.currency,
                  )}`}
                >
                  {expense.currency}
                </span>
              }
            />
            {expense.currency === "USD" && (
              <>
                <DetailRow
                  label={autoT("legacy.exchange_rate_6363ae59")}
                  value={`1 USD = ${expense.exchange_rate} AFN`}
                />
                <DetailRow
                  label={autoT("legacy.afn_equivalent_8efe5e23")}
                  value={
                    <span className="font-semibold text-indigo-700">
                      {formatCurrency(expense.amount_afn, "AFN")}
                    </span>
                  }
                />
              </>
            )}
            {expense.description && (
              <div className="sm:col-span-2 pt-2">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1.5">
                  {autoT("description")}
                </p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {expense.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">{autoT("inventory_manager.ingredients.audit_history")}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {autoT("legacy.review_who_changed_this_expense_and_what_changed_080c544b")}
          </p>
          <div className="mt-4">
            <AuditTimeline
              module="EXPENSES"
              objectType="Expenses"
              objectId={expense.id}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editFormDisplay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form
            onSubmit={handleExpenseEdit}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">{autoT("legacy.edit_expense_2e469802")}</h2>
              <button
                type="button"
                onClick={() => setEditFormDisplay(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <XCircle size={22} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditField label={autoT("attendance.table.name")} required>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                    className="input"
                  />
                </EditField>
                <EditField label={autoT("table.date")} required>
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    required
                    className="input"
                  />
                </EditField>
                <EditField label={autoT("legacy.amount_43dc8532")} required>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={editForm.amount}
                    onChange={handleEditChange}
                    required
                    className="input"
                  />
                </EditField>
                <EditField label={autoT("legacy.currency_e070de22")}>
                  <select
                    name="currency"
                    value={editForm.currency}
                    onChange={handleEditChange}
                    className="input bg-white"
                  >
                    <option value="AFN">{autoT("legacy.afn_afghani_96edf857")}</option>
                    <option value="USD">{autoT("legacy.usd_us_dollar_2d6f254e")}</option>
                  </select>
                </EditField>
                {editForm.currency === "USD" && (
                  <div className="md:col-span-2">
                    <EditField label={autoT("legacy.exchange_rate_1_usd_afn_64ac5dcc")}>
                      <input
                        type="number"
                        step="0.01"
                        name="exchange_rate"
                        value={editForm.exchange_rate}
                        onChange={handleEditChange}
                        className="input"
                      />
                    </EditField>
                  </div>
                )}
                <div className="md:col-span-2">
                  <EditField label={autoT("description")}>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows={3}
                      className="input resize-none"
                    />
                  </EditField>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setEditFormDisplay(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                {autoT("staff.cancel")}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Save size={16} />
                {submitting ? autoT("saving") : autoT("save_changes")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full shrink-0">
                <Trash2 className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {autoT("legacy.delete_expense_1816483d")}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {autoT("legacy.are_you_sure_you_want_to_delete_de36321b")}{expense.name}{autoT("legacy.this_action_cannot_be_undone_66ac3236")}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                {autoT("staff.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
              >
                {autoT("staff.table.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-1.5">
        {label}
      </p>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  );
}

function EditField({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
