import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  RefreshCw,
  Search,
  ShieldAlert,
  Signal,
  SignalZero,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { AuthContext } from "../../api/authforRBC";
import {
  getActivityHistory,
  getActivitySessions,
  getActivitySocketTicket,
  revokeActivitySession,
  revokeUserSessions,
} from "../../api/activityApi";
import { buildWebSocketUrl } from "../../config/runtimeConfig";
import ConfirmModal from "../shared/erp/components/ConfirmModal";
import PageHeader from "../shared/erp/components/PageHeader";

const emptySummary = {
  unique_active_users: 0,
  active_sessions: 0,
  idle_users: 0,
  valid_accounts: 0,
  online_users: 0,
};

const statusStyles = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  idle: "border-amber-200 bg-amber-50 text-amber-700",
  offline: "border-slate-200 bg-slate-100 text-slate-600",
  revoked: "border-rose-200 bg-rose-50 text-rose-700",
  logout: "border-slate-200 bg-slate-100 text-slate-600",
  expired: "border-violet-200 bg-violet-50 text-violet-700",
};

const formatTime = (value) => {
  if (!value) return "Never seen";
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleString();
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[status] || statusStyles.offline}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function LoadingRows() {
  return Array.from({ length: 5 }, (_, index) => (
    <tr key={index} className="animate-pulse border-t border-[var(--theme-border)]">
      {Array.from({ length: 8 }, (__, cell) => <td key={cell} className="px-4 py-4"><div className="h-4 rounded bg-slate-200" /></td>)}
    </tr>
  ));
}

export default function ActivityDashboard() {
  const { auth, branches, activeBranch } = useContext(AuthContext);
  const isAdmin = auth?.user?.role === "Admin";
  const canRevoke = Boolean(auth?.user?.can_revoke_sessions || isAdmin);
  const [view, setView] = useState("live");
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    branch: isAdmin ? "all" : String(activeBranch?.id || ""),
    page: 1,
    page_size: 20,
  });
  const [data, setData] = useState({ results: [], count: 0, pages: 1, summary: emptySummary, filter_options: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [socketState, setSocketState] = useState("connecting");
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const socketRef = useRef(null);
  const retryRef = useRef(null);

  const requestParams = useMemo(() => ({ ...filters }), [filters]);
  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const response = view === "history"
        ? await getActivityHistory(requestParams)
        : await getActivitySessions(requestParams);
      setData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Activity data could not be loaded.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [requestParams, view]);

  useEffect(() => {
    const delay = filters.search ? 300 : 0;
    const timer = window.setTimeout(() => load(), delay);
    return () => window.clearTimeout(timer);
  }, [load, filters.search]);

  useEffect(() => {
    if (view !== "live") {
      setSocketState("offline");
      return undefined;
    }
    let disposed = false;
    const connect = async () => {
      setSocketState("connecting");
      try {
        const response = await getActivitySocketTicket({ branch: filters.branch });
        if (disposed) return;
        const socket = new WebSocket(buildWebSocketUrl(`ws/activity/?ticket=${encodeURIComponent(response.data.ticket)}`));
        socketRef.current = socket;
        socket.onopen = () => setSocketState("connected");
        socket.onmessage = (event) => {
          try {
            if (JSON.parse(event.data).type === "presence_changed") load({ quiet: true });
          } catch { /* ignore malformed server events */ }
        };
        socket.onerror = () => setSocketState("offline");
        socket.onclose = () => {
          if (disposed) return;
          setSocketState("offline");
          retryRef.current = window.setTimeout(connect, 5_000);
        };
      } catch {
        setSocketState("offline");
        retryRef.current = window.setTimeout(connect, 10_000);
      }
    };
    connect();
    return () => {
      disposed = true;
      window.clearTimeout(retryRef.current);
      socketRef.current?.close();
    };
  }, [filters.branch, load, view]);

  useEffect(() => {
    const interval = window.setInterval(() => load({ quiet: true }), socketState === "connected" ? 120_000 : 60_000);
    return () => window.clearInterval(interval);
  }, [load, socketState]);

  const changeFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === "page" ? value : 1 }));
  const summary = data.summary || emptySummary;
  const options = data.filter_options || {};
  const tabs = [
    { key: "live", label: "Live sessions" },
    { key: "history", label: "Security history" },
  ];
  const quickStats = view === "live"
    ? [
        { label: "Active users", value: summary.unique_active_users },
        { label: "Live sessions", value: summary.active_sessions },
        { label: "Idle users", value: summary.idle_users },
        { label: "Valid accounts", value: summary.valid_accounts },
      ]
    : [];

  const executeRevocation = async () => {
    if (!confirm) return;
    setSaving(true);
    try {
      const params = { branch: filters.branch };
      if (confirm.mode === "all") await revokeUserSessions(confirm.session.user_id, params);
      else await revokeActivitySession(confirm.session.session_id, params);
      toast.success(confirm.mode === "all" ? "All account sessions were revoked." : "Session revoked successfully.");
      setConfirm(null);
      await load({ quiet: true });
    } catch (requestError) {
      toast.error(requestError.response?.data?.detail || "The session could not be revoked.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <Toaster position="bottom-right" />
      <PageHeader
        eyebrow="Security & access"
        icon={ShieldAlert}
        title="User activity"
        description="Live, tenant-isolated visibility into authenticated accounts, devices, and session health."
        quickStats={quickStats}
        actions={(
          <span className="theme-btn theme-btn-ghost inline-flex items-center gap-2 text-xs font-semibold">
            {socketState === "connected" ? <Signal className="h-4 w-4 text-[var(--theme-success)]" /> : <SignalZero className="h-4 w-4 text-[var(--theme-warning)]" />}
            {socketState === "connected" ? "Live updates" : socketState === "connecting" ? "Connecting…" : "Polling fallback"}
          </span>
        )}
        tabs={tabs}
        activeTab={view}
        onTab={(tab) => {
          setView(tab);
          changeFilter("status", "");
        }}
        compactMobile
      />

      {view === "live" && !!summary.by_role?.length && <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-sm"><span className="font-semibold text-[var(--theme-text-primary)]">Online by role</span>{summary.by_role.map((item) => <span key={item.role} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.role}: {item.users} user{item.users === 1 ? "" : "s"} · {item.sessions} session{item.sessions === 1 ? "" : "s"}</span>)}</div>}

      <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-sm">
        <div className="grid gap-3 border-b border-[var(--theme-border)] p-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_180px_190px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={(event) => changeFilter("search", event.target.value)} placeholder="Search name or username" className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400" />
          </label>
          <select value={filters.role} onChange={(event) => changeFilter("role", event.target.value)} className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-3 py-2.5 text-sm"><option value="">All roles</option>{(options.roles || []).map((role) => <option key={role} value={role}>{role}</option>)}</select>
          <select value={filters.status} onChange={(event) => changeFilter("status", event.target.value)} className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-3 py-2.5 text-sm"><option value="">All statuses</option>{(options.statuses || []).map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select>
          <select value={filters.branch} onChange={(event) => changeFilter("branch", event.target.value)} className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-3 py-2.5 text-sm">{isAdmin && <option value="all">All branches</option>}{(options.branches || branches || []).map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>
          <button type="button" onClick={() => load()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--theme-border)] px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
        </div>

        {error && <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role / branch</th><th className="px-4 py-3">Device</th><th className="px-4 py-3">Session</th><th className="px-4 py-3">Started</th><th className="px-4 py-3">Last seen</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody>
              {loading ? <LoadingRows /> : data.results?.map((session) => (
                <tr key={session.session_id} className="border-t border-[var(--theme-border)] hover:bg-slate-50/70">
                  <td className="px-4 py-4"><p className="font-semibold text-[var(--theme-text-primary)]">{session.display_name}</p><p className="text-xs text-[var(--theme-text-muted)]">@{session.username} · {session.concurrent_sessions} concurrent</p></td>
                  <td className="px-4 py-4"><p className="font-medium">{session.role}</p><p className="text-xs text-[var(--theme-text-muted)]">{session.branch?.name || "All branches"}</p></td>
                  <td className="px-4 py-4"><p className="font-medium">{session.browser}</p><p className="text-xs text-[var(--theme-text-muted)]">{session.operating_system}</p></td>
                  <td className="px-4 py-4 font-mono text-xs text-slate-600">{session.session_label}</td>
                  <td className="px-4 py-4 text-slate-600">{formatTime(session.started_at)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatTime(session.last_seen_at || session.ended_at)}</td>
                  <td className="px-4 py-4"><StatusBadge status={session.status} /></td>
                  <td className="px-4 py-4"><div className="flex justify-end gap-2">{canRevoke && session.can_revoke && <><button type="button" onClick={() => setConfirm({ mode: "one", session })} className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">Revoke</button>{session.concurrent_sessions > 1 && <button type="button" onClick={() => setConfirm({ mode: "all", session })} className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">Revoke all</button>}</>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !data.results?.length && <div className="flex flex-col items-center px-6 py-14 text-center"><Activity className="h-9 w-9 text-slate-300" /><p className="mt-3 font-semibold">No sessions match these filters</p><p className="mt-1 text-sm text-[var(--theme-text-muted)]">Try another branch, role, status, or search term.</p></div>}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--theme-border)] p-4 text-sm">
          <span className="text-[var(--theme-text-muted)]">{data.count || 0} session{data.count === 1 ? "" : "s"}</span>
          <div className="flex items-center gap-2"><button disabled={filters.page <= 1} onClick={() => changeFilter("page", filters.page - 1)} className="rounded-lg border px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button><span>Page {filters.page} of {data.pages || 1}</span><button disabled={filters.page >= (data.pages || 1)} onClick={() => changeFilter("page", filters.page + 1)} className="rounded-lg border px-3 py-1.5 font-semibold disabled:opacity-40">Next</button></div>
        </footer>
      </div>

      {confirm && <ConfirmModal title={confirm.mode === "all" ? "Revoke all account sessions?" : "Revoke this session?"} message={confirm.mode === "all" ? `${confirm.session.display_name} will be signed out from every visible device in your authorized scope.` : `${confirm.session.display_name} will be signed out from ${confirm.session.device}.`} confirmLabel={confirm.mode === "all" ? "Revoke all sessions" : "Revoke session"} saving={saving} onClose={() => setConfirm(null)} onConfirm={executeRevocation} />}
    </section>
  );
}
