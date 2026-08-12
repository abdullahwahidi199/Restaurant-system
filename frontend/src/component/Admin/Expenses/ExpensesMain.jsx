// src/pages/expenses/ExpensesMain.jsx
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  History as HistoryIcon,
  Printer,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  Eye,
  Trash2,
  Save,
  XCircle,
  AlertCircle,
  X,
  RotateCcw,
  ArrowUpDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import instance from "../../../api/axiosInstance";
import { printVoucher } from "./ExpenseVoucher";
import Pagination from "./Pagination";
import { useDebounce, useLatestRequest } from "./hooks";
import {
  formatCurrency,
  formatDate,
  getCurrencyBadge,
  emptyExpenseForm,
} from "./helpers";

const SORT_OPTIONS = [
  { value: "-date", label: "Newest First" },
  { value: "date", label: "Oldest First" },
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
  { value: "-amount_afn", label: "Amount (High → Low)" },
  { value: "amount_afn", label: "Amount (Low → High)" },
];

function ExpensesMain() {
  // Data
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_count: 0,
    total_afn: "0",
    total_usd: "0",
    this_month_afn: "0",
  });
  const [pagination, setPagination] = useState({
    count: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  // UI
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newExpense, setNewExpense] = useState(emptyExpenseForm());

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("-date");
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();
  const debouncedSearch = useDebounce(searchTerm, 400);
  const { next: nextReq, isLatest } = useLatestRequest();
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

  const fetchExpenses = async (page = 1) => {
    const reqId = nextReq();
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: pageSize };
      if (debouncedSearch) params.search = debouncedSearch;
      if (currencyFilter !== "all") params.currency = currencyFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (sortBy) params.sort_by = sortBy;

      const response = await instance.get("/expenses/expenses/", { params });
      if (!isLatest(reqId)) return; // stale

      setExpenses(response.data.results || []);
      const count = response.data.count || 0;
      setPagination({
        count,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(count / pageSize)),
      });
      if (response.data.stats) setStats(response.data.stats);
    } catch (err) {
      if (!isLatest(reqId)) return;
      setError("Failed to load expenses");
      console.error(err);
    } finally {
      if (isLatest(reqId)) setLoading(false);
    }
  };

  // Refetch (page 1) whenever filters or page size change
  useEffect(() => {
    fetchExpenses(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, currencyFilter, dateFrom, dateTo, sortBy, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || loading) return;
    fetchExpenses(newPage);
  };

  const addNewExpense = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        exchange_rate: parseFloat(newExpense.exchange_rate || 1),
      };
      await instance.post("/expenses/expenses/", payload);
      setNewExpense(emptyExpenseForm());
      setAddModalOpen(false);
      await fetchExpenses(1);
    } catch (err) {
      console.error(err);
      alert("Failed to create expense. Please check the fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await instance.delete(`/expenses/expenses/${deleteId}/`);
      setDeleteId(null);
      await fetchExpenses(1);
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };

  const hasActiveFilters =
    !!searchTerm ||
    currencyFilter !== "all" ||
    !!dateFrom ||
    !!dateTo ||
    sortBy !== "-date";

  const resetFilters = () => {
    setSearchTerm("");
    setCurrencyFilter("all");
    setDateFrom("");
    setDateTo("");
    setSortBy("-date");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all your business expenses
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("history/")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            <HistoryIcon size={18} /> History
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus size={18} /> New Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FileText className="text-indigo-600" size={22} />}
          label="Total Expenses"
          value={stats.total_count}
          bg="bg-indigo-50"
        />
        <StatCard
          icon={<TrendingDown className="text-red-600" size={22} />}
          label="Total (AFN)"
          value={formatCurrency(stats.total_afn, "AFN")}
          bg="bg-red-50"
        />
        <StatCard
          icon={<DollarSign className="text-emerald-600" size={22} />}
          label="Total (USD)"
          value={formatCurrency(stats.total_usd, "USD")}
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<Calendar className="text-amber-600" size={22} />}
          label="This Month (AFN)"
          value={formatCurrency(stats.this_month_afn, "AFN")}
          bg="bg-amber-50"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
          >
            <option value="all">All Currencies</option>
            <option value="AFN">AFN</option>
            <option value="USD">USD</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="From date"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="To date"
          />

          <div className="relative">
            <ArrowUpDown
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              title="Reset filters"
            >
              <RotateCcw size={16} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table + Pagination */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading && expenses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-block w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="mt-3 text-gray-500">Loading expenses...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="inline-block text-red-500 mb-2" size={32} />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => fetchExpenses(1)}
              className="mt-3 text-sm text-indigo-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No expenses found
            </h3>
            <p className="text-gray-500 mb-4">
              {stats.total_count > 0
                ? "Try adjusting your filters"
                : "Get started by creating your first expense"}
            </p>
            {stats.total_count > 0 ? (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <RotateCcw size={16} /> Reset Filters
              </button>
            ) : (
              <button
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus size={18} /> New Expense
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      AFN Equivalent
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {expense.name}
                        </div>
                        {expense.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs mt-0.5">
                            {expense.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getCurrencyBadge(expense.currency)}`}
                        >
                          {formatCurrency(expense.amount, expense.currency)}
                        </span>
                        {expense.currency === "USD" && (
                          <div className="text-xs text-gray-500 mt-1">
                            Rate: 1$ = {expense.exchange_rate} AFN
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                        {formatCurrency(expense.amount_afn, "AFN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <ActionButton
                            onClick={() => navigate(`${expense.id}/`)}
                            icon={<Eye size={16} />}
                            color="indigo"
                            title="View Details"
                          />
                          <ActionButton
                            onClick={() =>
                              printVoucher(
                                expense,
                                restaurant?.name,
                                restaurant?.logo,
                              )
                            }
                            icon={<Printer size={16} />}
                            color="emerald"
                            title="Print Voucher"
                          />
                          <ActionButton
                            onClick={() => setDeleteId(expense.id)}
                            icon={<Trash2 size={16} />}
                            color="red"
                            title="Delete"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.count}
              pageSize={pagination.pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={setPageSize}
              loading={loading}
            />
          </>
        )}
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <ModalShell
          onClose={() => setAddModalOpen(false)}
          title="Add New Expense"
        >
          <form onSubmit={addNewExpense} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Expense Name" required>
                <input
                  type="text"
                  name="name"
                  value={newExpense.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Office Supplies"
                  className="input"
                />
              </Field>
              <Field label="Date" required>
                <input
                  type="date"
                  name="date"
                  value={newExpense.date}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </Field>
              <Field label="Amount" required>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={newExpense.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="input"
                />
              </Field>
              <Field label="Currency">
                <select
                  name="currency"
                  value={newExpense.currency}
                  onChange={handleChange}
                  className="input bg-white"
                >
                  <option value="AFN">AFN - Afghani</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </Field>
              {newExpense.currency === "USD" && (
                <div className="md:col-span-2">
                  <Field label="Exchange Rate (1 USD = ? AFN)">
                    <input
                      type="number"
                      step="0.01"
                      name="exchange_rate"
                      value={newExpense.exchange_rate}
                      onChange={handleChange}
                      placeholder="e.g., 70.50"
                      className="input"
                    />
                  </Field>
                  {newExpense.amount && newExpense.exchange_rate && (
                    <div className="mt-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm">
                      <span className="text-gray-600">AFN Equivalent: </span>
                      <span className="font-semibold text-indigo-700">
                        {(
                          parseFloat(newExpense.amount) *
                          parseFloat(newExpense.exchange_rate)
                        ).toFixed(2)}{" "}
                        AFN
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea
                    name="description"
                    value={newExpense.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional details..."
                    className="input resize-none"
                  />
                </Field>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
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
                {submitting ? "Saving..." : "Save Expense"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {deleteId !== null && (
        <ConfirmDialog
          title="Delete Expense"
          message="Are you sure you want to delete this expense? This action cannot be undone."
          onCancel={() => setDeleteId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/* ---------- Reusable bits ---------- */
function StatCard({ icon, label, value, bg }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 mb-1 truncate">{label}</p>
          <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${bg}`}>{icon}</div>
      </div>
    </div>
  );
}
function ActionButton({ onClick, icon, color, title }) {
  const map = {
    indigo: "hover:text-indigo-600 hover:bg-indigo-50",
    emerald: "hover:text-emerald-600 hover:bg-emerald-50",
    red: "hover:text-red-600 hover:bg-red-50",
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 text-gray-500 rounded-lg transition ${map[color]}`}
    >
      {icon}
    </button>
  );
}
function ModalShell({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <XCircle size={22} className="text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full shrink-0">
            <Trash2 className="text-red-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExpensesMain;
