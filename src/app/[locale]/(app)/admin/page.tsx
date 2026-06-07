"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState, useMemo, useEffect, Component, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ADMIN_EMAILS } from "@/lib/admin";

const TEST_EMAILS = ["test@trimindai.com", "trimindai@trimindai.com"];

type Tab = "users" | "portfolios" | "payments";

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

class AdminErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
          <p className="text-red-400 text-lg mb-4">Admin panel error</p>
          <p className="text-gray-500 text-sm mb-6 max-w-md text-center">
            Could not load admin data.
          </p>
          <Link href="/" className="text-emerald-600 hover:text-emerald-500">Back to Home</Link>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminPage() {
  return (
    <AdminErrorBoundary>
      <AdminPageInner />
    </AdminErrorBoundary>
  );
}

function AdminPageInner() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [hideTestAccounts, setHideTestAccounts] = useState(true);

  const email = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = !!email && ADMIN_EMAILS.includes(email);

  const stats = useQuery(api.admin.getStats, isAdmin ? {} : "skip");
  const users = useQuery(api.admin.getAllUsers, isAdmin ? {} : "skip");
  const portfolios = useQuery(api.admin.getAllPortfolios, isAdmin ? {} : "skip");
  const payments = useQuery(api.admin.getAllPayments, isAdmin ? {} : "skip");

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-400 text-lg mb-4">Access Denied</p>
        <p className="text-gray-500 text-sm mb-6">You don&apos;t have admin privileges.</p>
        <Link href="/" className="text-emerald-600 hover:text-emerald-500">Back to Home</Link>
      </div>
    );
  }

  const realUsers = hideTestAccounts
    ? (users ?? []).filter((u) => !TEST_EMAILS.includes(u.email))
    : (users ?? []);

  const totalUsers = hideTestAccounts
    ? realUsers.length
    : (stats?.totalUsers ?? 0);

  const pendingPaymentsCount = stats?.pendingPayments ?? 0;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "users", label: "Users", count: totalUsers },
    { id: "portfolios", label: "Portfolios", count: stats?.totalPortfolios },
    { id: "payments", label: "Payments", count: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined },
  ];

  // Build wizard funnel data
  const FUNNEL_LABELS = ["Basic Info", "Experience", "Achievements", "Skills", "Education", "CV Details", "Endorsements", "Customize", "Preview", "Paid"];
  const funnelData = stats
    ? FUNNEL_LABELS.map((label, i) => {
        if (i === 9) return { label, count: stats.completedPayments };
        if (i === 8) return { label, count: stats.paidReachedPreview };
        let count = 0;
        for (const [step, c] of Object.entries(stats.funnelSteps)) {
          if (Number(step) >= i) count += (c as number);
        }
        return { label, count };
      })
    : null;
  const maxFunnelCount = funnelData ? Math.max(...funnelData.map((d) => d.count), 1) : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">Portfolio Pro</Link>
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-medium">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-gray-500">{email}</span>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage users, portfolios, and payments</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={hideTestAccounts}
              onChange={(e) => setHideTestAccounts(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            Hide test accounts
          </label>
        </div>

        {/* Stats Cards — 6 cards in 2x3 grid */}
        {stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {/* Card 1: Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-2xl font-bold text-emerald-700">{stats.totalRevenue.toFixed(3)} KD</p>
              <p className="text-gray-500 text-sm">Revenue</p>
              <p className="text-xs text-amber-600 mt-0.5">{stats.pendingRevenue.toFixed(3)} KD pending</p>
            </div>
            {/* Card 2: Conversion */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-2xl font-bold text-emerald-700">{stats.conversionRate}%</p>
              <p className="text-gray-500 text-sm">Conversion</p>
              <p className="text-xs text-gray-400 mt-0.5">signup → paid</p>
            </div>
            {/* Card 3: Users */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-gray-500 text-sm">Users</p>
              <p className="text-xs text-gray-400 mt-0.5">{stats.newUsersThisWeek} new this week</p>
            </div>
            {/* Card 4: Portfolios */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalPortfolios}</p>
              <p className="text-gray-500 text-sm">Portfolios</p>
              <p className="text-xs text-gray-400 mt-0.5">{stats.publishedCount} live · {stats.abandonedPortfolios} abandoned</p>
            </div>
            {/* Card 5: Payments */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-2xl font-bold text-gray-900">{stats.completedPayments}</p>
              <p className="text-gray-500 text-sm">Payments</p>
              <p className="text-xs text-gray-400 mt-0.5">{stats.completedPayments} paid / {stats.pendingPayments} pending / {stats.failedPayments} failed</p>
            </div>
            {/* Card 6: Avg/User */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{stats.avgPortfoliosPerUser}</p>
                {stats.avgPortfoliosPerUser > 5 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">High — possible test data</span>
                )}
              </div>
              <p className="text-gray-500 text-sm">Avg/User</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-7 w-16 bg-gray-100 rounded mb-2" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Wizard Funnel */}
        {funnelData && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Wizard Funnel</h2>
            <div className="space-y-2">
              {funnelData.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 shrink-0 text-right">{d.label}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-hidden">
                    <div
                      className={`h-full rounded-md transition-all ${i === 9 ? "bg-emerald-500" : i === 8 ? "bg-amber-400" : "bg-gray-300"}`}
                      style={{ width: `${(d.count / maxFunnelCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-8">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending payments alert */}
        {pendingPaymentsCount > 0 && stats && (
          <button
            onClick={() => setActiveTab("payments")}
            className="w-full flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 hover:bg-amber-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold text-sm">{pendingPaymentsCount}</span>
              <div>
                <p className="text-sm font-medium text-amber-800">{pendingPaymentsCount} pending — {stats.pendingRevenue.toFixed(3)} KD potential recovery</p>
                <p className="text-xs text-amber-600">Review stuck payments now</p>
              </div>
            </div>
            <span className="text-amber-600 text-sm font-medium">View &rarr;</span>
          </button>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 text-xs ${activeTab === tab.id ? "text-gray-400" : "text-gray-400"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "users" && (realUsers.length > 0 ? <UsersTab users={realUsers} /> : <EmptyState label="No users found" />)}
        {activeTab === "portfolios" && (portfolios && users ? <PortfoliosTab portfolios={portfolios} users={users} /> : <EmptyState label="Loading..." />)}
        {activeTab === "payments" && (payments && users ? <PaymentsTab payments={payments} users={users} portfolios={portfolios ?? []} /> : <EmptyState label="Loading..." />)}
      </main>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (fn: (p: number) => number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-sm rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40">Prev</button>
      <span className="text-xs text-gray-400">{page} / {totalPages}</span>
      <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-sm rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40">Next</button>
    </div>
  );
}

// ─── Users Tab ──────────────────────────────────────────────────────────────

function UsersTab({ users }: { users: any[] }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 20;
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const allPortfolios = useQuery(api.admin.getAllPortfolios, selectedUser ? {} : "skip");
  const allPayments = useQuery(api.admin.getAllPayments, selectedUser ? {} : "skip");

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u) => u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q));
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const userPortfolios = useMemo(() => !selectedUser || !allPortfolios ? [] : allPortfolios.filter((p) => p.userId === selectedUser._id), [selectedUser, allPortfolios]);
  const userPayments = useMemo(() => !selectedUser || !allPayments ? [] : allPayments.filter((p) => p.userId === selectedUser._id), [selectedUser, allPayments]);

  return (
    <>
      <input
        type="text"
        placeholder="Search by email or name..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
      />

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((u) => (
              <tr key={u._id} className="border-t border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setSelectedUser(u)}>
                <td className="py-3 px-4">
                  <p className="text-sm font-medium text-gray-900">{u.name || "—"}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  {ADMIN_EMAILS.includes(u.email) && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">admin</span>}
                </td>
              </tr>
            ))}
            {paged.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">No users found</td></tr>}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {paged.map((u) => (
          <button key={u._id} onClick={() => setSelectedUser(u)} className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{u.name || "—"}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</p>
                {ADMIN_EMAILS.includes(u.email) && <span className="text-[10px] text-purple-600 font-medium">admin</span>}
              </div>
            </div>
          </button>
        ))}
        {paged.length === 0 && <EmptyState label="No users found" />}
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      {/* Slide-over */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelectedUser(null)}>
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">User Details</h2>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="font-semibold text-gray-900">{selectedUser.name || selectedUser.email}</p>
                {selectedUser.name && <p className="text-sm text-gray-500">{selectedUser.email}</p>}
                <p className="text-xs text-gray-400 mt-2">Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <MiniStat value={userPortfolios.length} label="Portfolios" color="gray" />
                <MiniStat value={userPortfolios.filter((p) => p.status === "published").length} label="Published" color="emerald" />
                <MiniStat value={userPayments.filter((p) => p.status === "completed").length} label="Paid" color="emerald" />
              </div>
              {userPortfolios.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">Portfolios</h3>
                  <div className="space-y-2 mb-6">
                    {userPortfolios.map((p) => (
                      <div key={p._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <span className="text-gray-700">{p.basics?.fullName || p.name || "Untitled"}</span>
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                </>
              )}
              {userPayments.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">Payments</h3>
                  <div className="space-y-2">
                    {userPayments.map((p) => (
                      <div key={p._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <span className="text-gray-700">{p.amount.toFixed(3)} {p.currency}</span>
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                </>
              )}
              {userPortfolios.length === 0 && userPayments.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-6">No activity yet</p>
              )}

              {/* Action buttons */}
              <div className="mt-6 border-t border-gray-200 pt-4 space-y-2">
                <a
                  href={`mailto:${selectedUser.email}?subject=${encodeURIComponent("Your Portfolio Pro draft is waiting")}&body=${encodeURIComponent("Hi! Your professional portfolio is almost ready. Come back to finish it: https://portfolio-trimind.com/en/dashboard")}`}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Send reminder email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Portfolios Tab ─────────────────────────────────────────────────────────

function PortfoliosTab({ portfolios, users }: { portfolios: any[]; users: any[] }) {
  const userMap = new Map(users.map((u) => [u._id, u]));
  const markPaid = useMutation(api.admin.markPortfolioPaid);
  const deletePortfolio = useMutation(api.admin.deletePortfolio);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filtered = useMemo(() => {
    let result = portfolios;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const owner = p.userId ? userMap.get(p.userId) : null;
        return p.basics?.fullName?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q) || owner?.email?.toLowerCase().includes(q);
      });
    }
    if (statusFilter === "abandoned") {
      const cutoff = Date.now() - 48 * 60 * 60 * 1000;
      result = result.filter((p) => p.status === "draft" && p.lastEditedAt < cutoff);
    } else if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [portfolios, search, statusFilter, userMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="text" placeholder="Search..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900">
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="paid">Paid</option>
          <option value="published">Published</option>
          <option value="abandoned">Abandoned (&gt;48h)</option>
        </select>
      </div>

      {/* Desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => {
              const owner = p.userId ? userMap.get(p.userId) : null;
              return (
                <tr key={p._id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.basics?.fullName || p.name || "Untitled"}</p>
                        {p.slug && <p className="text-xs text-gray-400 font-mono">/p/{p.slug}</p>}
                      </div>
                      {p.templateId && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 capitalize">{p.templateId}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{owner?.email || "—"}</td>
                  <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                  <td className="py-3 px-4">
                    {p.lastCompletedStep != null && (
                      <span className="text-xs text-gray-500">Step {p.lastCompletedStep} of 8</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">{relativeTime(p.lastEditedAt)}</td>
                  <td className="py-3 px-4">
                    <PortfolioActions p={p} confirmDelete={confirmDelete} setConfirmDelete={setConfirmDelete} markPaid={markPaid} deletePortfolio={deletePortfolio} />
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No portfolios found</td></tr>}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-2">
        {paged.map((p) => {
          const owner = p.userId ? userMap.get(p.userId) : null;
          return (
            <div key={p._id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{p.basics?.fullName || p.name || "Untitled"}</p>
                    {p.templateId && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 capitalize">{p.templateId}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{owner?.email || "—"}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <div className="flex items-center gap-2">
                  <span>{relativeTime(p.lastEditedAt)}</span>
                  {p.lastCompletedStep != null && (
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-medium">Step {p.lastCompletedStep}/8</span>
                  )}
                </div>
                {p.slug && <span className="font-mono">/p/{p.slug}</span>}
              </div>
              <PortfolioActions p={p} confirmDelete={confirmDelete} setConfirmDelete={setConfirmDelete} markPaid={markPaid} deletePortfolio={deletePortfolio} />
            </div>
          );
        })}
        {paged.length === 0 && <EmptyState label="No portfolios found" />}
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </>
  );
}

function PortfolioActions({ p, confirmDelete, setConfirmDelete, markPaid, deletePortfolio }: any) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Link href={`/dashboard/${p._id}/edit`} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Edit</Link>
      <Link href={`/dashboard/${p._id}/preview`} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Preview</Link>
      {p.slug && <a href={`/p/${p.slug}`} target="_blank" rel="noopener" className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100">View</a>}
      {p.status === "draft" && <button onClick={() => markPaid({ id: p._id })} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100">Mark Paid</button>}
      {confirmDelete === p._id ? (
        <>
          <button onClick={async () => { await deletePortfolio({ id: p._id }); setConfirmDelete(null); }} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Confirm</button>
          <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">Cancel</button>
        </>
      ) : (
        <button onClick={() => setConfirmDelete(p._id)} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
      )}
    </div>
  );
}

// ─── Payments Tab ───────────────────────────────────────────────────────────

function PaymentsTab({ payments, users, portfolios }: { payments: any[]; users: any[]; portfolios: any[] }) {
  const userMap = new Map(users.map((u) => [u._id, u]));
  const portfolioMap = new Map(portfolios.map((p) => [p._id, p]));
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const LIMIT = 20;
  const [reconciling, setReconciling] = useState(false);
  const [recheckingId, setRecheckingId] = useState<string | null>(null);
  const [reconcileResult, setReconcileResult] = useState<any>(null);

  async function reconcileAll() {
    setReconciling(true);
    setReconcileResult(null);
    try {
      const res = await fetch("/api/admin/reconcile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      setReconcileResult(data);
    } catch (e: any) {
      setReconcileResult({ error: e.message });
    } finally {
      setReconciling(false);
    }
  }

  async function recheckOne(paymentDocId: string) {
    setRecheckingId(paymentDocId);
    try {
      const res = await fetch("/api/admin/reconcile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentDocId }) });
      const data = await res.json();
      setReconcileResult(data);
    } catch (e: any) {
      setReconcileResult({ error: e.message });
    } finally {
      setRecheckingId(null);
    }
  }

  const pendingCount = payments.filter((p) => p.status === "pending").length;

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filtered = useMemo(() => {
    let result = payments;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const owner = p.userId ? userMap.get(p.userId) : null;
        return owner?.email?.toLowerCase().includes(q) || owner?.name?.toLowerCase().includes(q) || p.myfatoorahInvoiceId?.toLowerCase().includes(q);
      });
    }
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    return result;
  }, [payments, search, statusFilter, userMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <>
      {pendingCount > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800"><span className="font-semibold">{pendingCount}</span> pending payment{pendingCount !== 1 ? "s" : ""} — may include stuck revenue</p>
          <button onClick={reconcileAll} disabled={reconciling} className="shrink-0 rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors">
            {reconciling ? "Checking..." : "Re-check all"}
          </button>
        </div>
      )}
      {reconcileResult && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${reconcileResult.error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {reconcileResult.error ? (
            <p>Error: {reconcileResult.error}</p>
          ) : (
            <div className="flex items-center justify-between">
              <p>
                <span className="font-semibold">{reconcileResult.summary.recovered}</span> recovered,{" "}
                <span className="font-semibold">{reconcileResult.summary.failed}</span> failed,{" "}
                <span className="font-semibold">{reconcileResult.summary.stillPending}</span> still pending
                {reconcileResult.summary.errors > 0 && <>, <span className="font-semibold text-red-600">{reconcileResult.summary.errors}</span> errors</>}
              </p>
              <button onClick={() => setReconcileResult(null)} className="text-xs text-emerald-600 hover:underline">Dismiss</button>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="text" placeholder="Search..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900">
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => {
              const owner = p.userId ? userMap.get(p.userId) : null;
              return (
                <tr key={p._id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-gray-900">{owner?.name || "—"}</p>
                    <p className="text-xs text-gray-400">{owner?.email || "—"}</p>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{p.amount.toFixed(3)} {p.currency}</td>
                  <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                  <td className="py-3 px-4 text-xs font-mono text-gray-400">{p.myfatoorahInvoiceId ? p.myfatoorahInvoiceId.slice(0, 12) : "—"}</td>
                  <td className="py-3 px-4 text-sm text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    {p.status === "pending" && (
                      <button onClick={() => recheckOne(p._id)} disabled={recheckingId === p._id} className="text-xs text-amber-600 hover:text-amber-800 disabled:opacity-50 font-medium">
                        {recheckingId === p._id ? "..." : "Re-check"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No payments found</td></tr>}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-2">
        {paged.map((p) => {
          const owner = p.userId ? userMap.get(p.userId) : null;
          return (
            <div key={p._id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{owner?.name || owner?.email || "—"}</p>
                  <p className="text-xs text-gray-400">{p.amount.toFixed(3)} {p.currency}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-3">
                  {p.myfatoorahInvoiceId && <span className="font-mono">{p.myfatoorahInvoiceId.slice(0, 12)}</span>}
                  {p.status === "pending" && (
                    <button onClick={() => recheckOne(p._id)} disabled={recheckingId === p._id} className="text-xs text-amber-600 hover:text-amber-800 disabled:opacity-50 font-medium">
                      {recheckingId === p._id ? "..." : "Re-check"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {paged.length === 0 && <EmptyState label="No payments found" />}
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </>
  );
}

// ─── Shared ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700",
    completed: "bg-emerald-50 text-emerald-700",
    paid: "bg-amber-50 text-amber-700",
    pending: "bg-amber-50 text-amber-700",
    draft: "bg-gray-100 text-gray-600",
    failed: "bg-red-50 text-red-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>{status}</span>;
}

function MiniStat({ value, label, color }: { value: number; label: string; color: "emerald" | "gray" }) {
  return (
    <div className={`rounded-xl p-3 text-center ${color === "emerald" ? "bg-emerald-50" : "bg-gray-50"}`}>
      <p className={`text-xl font-bold ${color === "emerald" ? "text-emerald-700" : "text-gray-900"}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
