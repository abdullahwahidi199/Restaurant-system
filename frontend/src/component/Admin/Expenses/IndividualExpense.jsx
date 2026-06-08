// src/pages/expenses/IndividualExpense.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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

export default function IndividualExpense() {
  const { id } = useParams();
  const navigate = useNavigate();

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
        const res = await instance.get("/restaurant/restaurant/");
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
      setError("Failed to load expense");
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
      navigate("/admin/dashboard/expenses");
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
        <p className="text-gray-600 mb-4">{error || "Expense not found"}</p>
        <Link
          to="/admin/dashboard/expenses"
          className="text-indigo-600 hover:underline"
        >
          Back to expenses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          to="/admin/dashboard/expenses"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 mb-4 transition"
        >
          <ArrowLeft size={16} />
          Back to Expenses
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
                Expense #{expense.id} • {formatDate(expense.date)}
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
                Print Voucher
              </button>
              <button
                onClick={openEdit}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                <Pencil size={16} />
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition shadow-sm"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>

          {/* Amount Hero */}
          <div className="px-6 py-8 bg-gradient-to-br from-indigo-50 to-white border-b border-gray-200">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              Total Amount
            </p>
            <p className="text-4xl font-bold text-gray-900">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
            {expense.currency === "USD" && (
              <p className="mt-2 text-sm text-gray-600">
                1 USD = {expense.exchange_rate} AFN •{" "}
                <span className="font-semibold text-indigo-700">
                  {formatCurrency(expense.amount_afn, "AFN")}
                </span>
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailRow label="Date" value={formatDate(expense.date)} />
            <DetailRow
              label="Currency"
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
                  label="Exchange Rate"
                  value={`1 USD = ${expense.exchange_rate} AFN`}
                />
                <DetailRow
                  label="AFN Equivalent"
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
                  Description
                </p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {expense.description}
                </p>
              </div>
            )}
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
              <h2 className="text-xl font-bold text-gray-900">Edit Expense</h2>
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
                <EditField label="Name" required>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                    className="input"
                  />
                </EditField>
                <EditField label="Date" required>
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    required
                    className="input"
                  />
                </EditField>
                <EditField label="Amount" required>
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
                <EditField label="Currency">
                  <select
                    name="currency"
                    value={editForm.currency}
                    onChange={handleEditChange}
                    className="input bg-white"
                  >
                    <option value="AFN">AFN - Afghani</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </EditField>
                {editForm.currency === "USD" && (
                  <div className="md:col-span-2">
                    <EditField label="Exchange Rate (1 USD = ? AFN)">
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
                  <EditField label="Description">
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Save size={16} />
                {submitting ? "Saving..." : "Save Changes"}
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
                  Delete Expense
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete "{expense.name}"? This action
                  cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
              >
                Delete
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
