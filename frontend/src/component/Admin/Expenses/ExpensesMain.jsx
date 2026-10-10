// src/pages/expenses/ExpensesMain.jsx
import { useEffect, useState } from "react";
import {
  Plus,
  History as HistoryIcon,
  Printer,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  Eye,
  Trash2,
  Save,
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
import { useTranslation as useAutoTranslation } from "react-i18next";
import i18n from "../../../i18n";
import PageHeader from "../../../modules/shared/erp/components/PageHeader";
import SharedActionButton from "../../../modules/shared/erp/components/ActionButton";
import StatCard from "../../../modules/shared/erp/components/StatCard";
import Toolbar from "../../../modules/shared/erp/components/Toolbar";
import SharedField from "../../../modules/shared/erp/components/Field";
import SearchBox from "../../../modules/shared/erp/components/SearchBox";
import LoadingState from "../../../modules/shared/erp/components/LoadingState";
import Alert from "../../../modules/shared/erp/components/Alert";
import EmptyState from "../../../modules/shared/erp/components/EmptyState";
import Modal from "../../../modules/shared/erp/components/Modal";
import ConfirmModal from "../../../modules/shared/erp/components/ConfirmModal";

const SORT_OPTIONS = [
  { value: "-date", label: i18n.t("legacy.newest_first_a40bb555") },
  { value: "date", label: i18n.t("legacy.oldest_first_06dc8190") },
  { value: "name", label: i18n.t("legacy.name_a_z_5d3eb278") },
  { value: "-name", label: i18n.t("legacy.name_z_a_080ec6fc") },
  { value: "-amount_afn", label: i18n.t("legacy.amount_high_low_75d5809e") },
  { value: "amount_afn", label: i18n.t("legacy.amount_low_high_3d4fbe41") },
];

function ExpensesMain() {
  const { t: autoT } = useAutoTranslation();
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
      setError(autoT("legacy.failed_to_load_expenses_1758fee1"));
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
    <div className="space-y-4">
      <PageHeader
        icon={DollarSign}
        title={autoT("nav.expenses")}
        description={autoT("legacy.manage_and_track_all_your_business_expenses_3c30f633")}
        actions={
          <>
            <SharedActionButton icon={HistoryIcon} onClick={() => navigate("history/")}>
              {autoT("legacy.history_90ccd649")}
            </SharedActionButton>
            <SharedActionButton icon={Plus} variant="primary" onClick={() => setAddModalOpen(true)}>
              {autoT("legacy.new_expense_7c3ae05c")}
            </SharedActionButton>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FileText}
          label={autoT("legacy.total_expenses_750134b6")}
          value={stats.total_count}
          tone="blue"
        />
        <StatCard
          icon={TrendingDown}
          label={autoT("legacy.total_afn_622d18e0")}
          value={formatCurrency(stats.total_afn, "AFN")}
          tone="rose"
        />
        <StatCard
          icon={DollarSign}
          label={autoT("legacy.total_usd_34e65e0b")}
          value={formatCurrency(stats.total_usd, "USD")}
          tone="green"
        />
        <StatCard
          icon={Calendar}
          label={autoT("legacy.this_month_afn_5b038dab")}
          value={formatCurrency(stats.this_month_afn, "AFN")}
          tone="amber"
        />
      </div>

      {/* Filters */}
      <Toolbar compactMobile>
        <SharedField label={autoT("legacy.search_by_name_or_description_5b22616a")}>
          <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder={autoT("legacy.search_by_name_or_description_5b22616a")} />
        </SharedField>
        <SharedField label={autoT("legacy.currency_e070de22")}>
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="theme-select w-full cursor-pointer px-3"
          >
            <option value="all">{autoT("legacy.all_currencies_f41665a4")}</option>
            <option value="AFN">{autoT("labels.afn")}</option>
            <option value="USD">{autoT("legacy.usd_57814cfb")}</option>
          </select>
        </SharedField>
        <SharedField label={autoT("legacy.from_date_3b5d11ae")}>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="theme-input w-full px-3"
            title={autoT("legacy.from_date_3b5d11ae")}
          />
        </SharedField>
        <SharedField label={autoT("legacy.to_date_af244da3")}>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="theme-input w-full px-3"
            title={autoT("legacy.to_date_af244da3")}
          />
        </SharedField>
        <SharedField label={autoT("legacy.sort_by", { defaultValue: "Sort by" })}>
          <div className="relative">
            <ArrowUpDown
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 theme-text-muted"
              size={16}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="theme-select w-full cursor-pointer px-3 ps-9"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </SharedField>
          {hasActiveFilters && (
            <SharedActionButton
              onClick={resetFilters}
              icon={RotateCcw}
              className="self-end"
              title={autoT("legacy.reset_filters_56553100")}
            >
              {autoT("inventory_manager.common.reset")}
            </SharedActionButton>
          )}
      </Toolbar>

      {/* Table + Pagination */}
      <div className="theme-table overflow-hidden">
        {loading && expenses.length === 0 ? (
          <div className="p-4"><LoadingState label={autoT("legacy.loading_expenses_fd739bdc")} /></div>
        ) : error ? (
          <div className="space-y-3 p-4">
            <Alert tone="error" message={error} />
            <SharedActionButton onClick={() => fetchExpenses(1)}>
              {autoT("landing.marketplace.discovery.retry")}
            </SharedActionButton>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={autoT("legacy.no_expenses_found_15f51995")}
              description={stats.total_count > 0
                ? autoT("legacy.try_adjusting_your_filters_11962c19")
                : autoT("legacy.get_started_by_creating_your_first_expense_3f57ced2")}
              action={stats.total_count > 0
                ? <SharedActionButton icon={RotateCcw} variant="primary" onClick={resetFilters}>{autoT("legacy.reset_filters_5be69856")}</SharedActionButton>
                : <SharedActionButton icon={Plus} variant="primary" onClick={() => setAddModalOpen(true)}>{autoT("legacy.new_expense_7c3ae05c")}</SharedActionButton>}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[var(--theme-border)]">
                  <tr>
                    <th className="text-start">
                      {autoT("attendance.table.name")}
                    </th>
                    <th className="text-start">
                      {autoT("table.date")}
                    </th>
                    <th className="text-start">
                      {autoT("legacy.amount_43dc8532")}
                    </th>
                    <th className="text-start">
                      {autoT("legacy.afn_equivalent_8efe5e23")}
                    </th>
                    <th className="text-end">
                      {autoT("table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--theme-border)]">
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="transition-colors"
                    >
                      <td>
                        <div className="font-semibold theme-text-primary">
                          {expense.name}
                        </div>
                        {expense.description && (
                          <div className="mt-0.5 max-w-xs truncate text-xs theme-text-muted">
                            {expense.description}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap theme-text-secondary">
                        {formatDate(expense.date)}
                      </td>
                      <td className="whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getCurrencyBadge(expense.currency)}`}
                        >
                          {formatCurrency(expense.amount, expense.currency)}
                        </span>
                        {expense.currency === "USD" && (
                          <div className="text-xs text-gray-500 mt-1">
                            {autoT("legacy.rate_1_257b02a9")} {expense.exchange_rate} {autoT("labels.afn")}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap font-semibold tabular-nums theme-text-primary">
                        {formatCurrency(expense.amount_afn, "AFN")}
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <IconActionButton
                            onClick={() => navigate(`${expense.id}/`)}
                            icon={<Eye size={16} />}
                            color="indigo"
                            title={autoT("legacy.view_details_907b3bee")}
                          />
                          <IconActionButton
                            onClick={() =>
                              printVoucher(
                                expense,
                                restaurant?.name,
                                restaurant?.logo,
                              )
                            }
                            icon={<Printer size={16} />}
                            color="emerald"
                            title={autoT("legacy.print_voucher_e313002f")}
                          />
                          <IconActionButton
                            onClick={() => setDeleteId(expense.id)}
                            icon={<Trash2 size={16} />}
                            color="red"
                            title={autoT("staff.table.delete")}
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
        <Modal
          onClose={() => setAddModalOpen(false)}
          title={autoT("legacy.add_new_expense_0721cfa5")}
        >
          <form onSubmit={addNewExpense} className="space-y-4 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SharedField label={autoT("legacy.expense_name_866f5080")} required>
                <input
                  type="text"
                  name="name"
                  value={newExpense.name}
                  onChange={handleChange}
                  required
                  placeholder={autoT("legacy.e_g_office_supplies_3a60cc40")}
                  className="theme-input w-full px-3"
                />
              </SharedField>
              <SharedField label={autoT("table.date")} required>
                <input
                  type="date"
                  name="date"
                  value={newExpense.date}
                  onChange={handleChange}
                  required
                  className="theme-input w-full px-3"
                />
              </SharedField>
              <SharedField label={autoT("legacy.amount_43dc8532")} required>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={newExpense.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="theme-input w-full px-3"
                />
              </SharedField>
              <SharedField label={autoT("legacy.currency_e070de22")}>
                <select
                  name="currency"
                  value={newExpense.currency}
                  onChange={handleChange}
                  className="theme-select w-full px-3"
                >
                  <option value="AFN">{autoT("legacy.afn_afghani_96edf857")}</option>
                  <option value="USD">{autoT("legacy.usd_us_dollar_2d6f254e")}</option>
                </select>
              </SharedField>
              {newExpense.currency === "USD" && (
                <div className="md:col-span-2">
                  <SharedField label={autoT("legacy.exchange_rate_1_usd_afn_64ac5dcc")}>
                    <input
                      type="number"
                      step="0.01"
                      name="exchange_rate"
                      value={newExpense.exchange_rate}
                      onChange={handleChange}
                      placeholder={autoT("legacy.e_g_70_50_7ce1e013")}
                      className="theme-input w-full px-3"
                    />
                  </SharedField>
                  {newExpense.amount && newExpense.exchange_rate && (
                    <div className="mt-2 rounded-lg border border-[rgb(var(--theme-primary-rgb)/0.18)] bg-[var(--theme-primary-soft)] px-3 py-2 text-[13px]">
                      <span className="theme-text-secondary">{autoT("legacy.afn_equivalent_6a6056ff")} </span>
                      <span className="font-semibold text-[var(--theme-primary-hover)]">
                        {(
                          parseFloat(newExpense.amount) *
                          parseFloat(newExpense.exchange_rate)
                        ).toFixed(2)}{" "}
                        {autoT("labels.afn")}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="md:col-span-2">
                <SharedField label={autoT("description")}>
                  <textarea
                    name="description"
                    value={newExpense.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder={autoT("legacy.additional_details_04831c63")}
                    className="theme-textarea w-full resize-none px-3 py-2"
                  />
                </SharedField>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <SharedActionButton
                type="button"
                onClick={() => setAddModalOpen(false)}
              >
                {autoT("staff.cancel")}
              </SharedActionButton>
              <SharedActionButton
                type="submit"
                disabled={submitting}
                loading={submitting}
                icon={Save}
                variant="primary"
              >
                {submitting ? autoT("saving") : autoT("legacy.save_expense_b89a5c08")}
              </SharedActionButton>
            </div>
          </form>
        </Modal>
      )}

      {deleteId !== null && (
        <ConfirmModal
          title={autoT("legacy.delete_expense_1816483d")}
          message={autoT("legacy.are_you_sure_you_want_to_delete_this_expense_this_acti_b54a7692")}
          confirmLabel={autoT("staff.table.delete")}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function IconActionButton({ onClick, icon, color, title }) {
  const map = {
    indigo: "hover:text-indigo-600 hover:bg-indigo-50",
    emerald: "hover:text-emerald-600 hover:bg-emerald-50",
    red: "hover:text-red-600 hover:bg-red-50",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`theme-btn theme-btn-ghost theme-btn-icon ${map[color]}`}
    >
      {icon}
    </button>
  );
}

export default ExpensesMain;
