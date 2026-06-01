"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState, useMemo, useEffect, Component, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ADMIN_EMAILS } from "@/lib/admin";

type Tab = "users" | "portfolios" | "payments";

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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center">
          <p className="text-red-400 text-lg mb-4">Admin panel error</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md text-center">
            Could not load admin data. Check that ADMIN_EMAILS is configured in the Convex dashboard.
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-500">Back to Home</Link>
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

  const email = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = !!email && ADMIN_EMAILS.includes(email);

  const stats = useQuery(api.admin.getStats, isAdmin ? {} : "skip");
  const users = useQuery(api.admin.getAllUsers, isAdmin ? {} : "skip");
  const portfolios = useQuery(api.admin.getAllPortfolios, isAdmin ? {} : "skip");
  const payments = useQuery(api.admin.getAllPayments, isAdmin ? {} : "skip");

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <p className="text-red-400 text-lg mb-4">Access Denied</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">You don&apos;t have admin privileges.</p>
        <Link href="/" className="text-blue-600 hover:text-blue-500">Back to Home</Link>
      </div>
    );
  }

  const totalUsers = stats?.totalUsers ?? 0;
  const signupsThisWeek = (() => {
    if (!users) return 0;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return users.filter((u) => u.createdAt > weekAgo).length;
  })();
  const pendingPaymentsCount = stats?.pendingPayments ?? 0;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "users", label: "Users", count: totalUsers },
    { id: "portfolios", label: "Portfolios", count: stats?.totalPortfolios },
    { id: "payments", label: "Payments", count: stats ? stats.completedPayments + stats.pendingPayments + stats.failedPayments : undefined },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Portfolio Pro</Link>
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-medium">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">{email}</span>
            <Link href="/dashboard" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Manage users, portfolios, and payments</p>

        {/* Stats Cards */}
        {stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 p-5">
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Users</p>
              {signupsThisWeek > 0 && (
                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  +{signupsThisWeek} this week
                </span>
              )}
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 p-5">
              <p className="text-3xl font-bold text-green-600">{stats.publishedCount}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Published</p>
              <span className="inline-block mt-1 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                {stats.conversionRate}% conversion
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 p-5">
              <p className="text-3xl font-bold text-teal-600">{stats.totalRevenue.toFixed(3)} KD</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Revenue</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 p-5">
              <p className="text-3xl font-bold text-emerald-600">{stats.totalPortfolios}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Portfolios</p>
              <span className="inline-block mt-1 text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                {stats.draftCount} draft, {stats.paidCount} paid
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 p-5">
              <p className="text-3xl font-bold text-purple-600">{stats.completedPayments}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Successful Payments</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-5 animate-pulse">
                <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          {pendingPaymentsCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-sm text-amber-700 dark:text-amber-400">
                {pendingPaymentsCount} pending payment{pendingPaymentsCount > 1 ? "s" : ""}
              </span>
              <button
                onClick={() => setActiveTab("payments")}
                className="text-xs text-amber-600 dark:text-amber-400 underline"
              >
                View
              </button>
            </div>
          )}
          {stats && stats.draftCount > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2">
              <span className="text-sm text-blue-700 dark:text-blue-400">
                {stats.draftCount} draft portfolio{stats.draftCount > 1 ? "s" : ""}
              </span>
              <button
                onClick={() => setActiveTab("portfolios")}
                className="text-xs text-blue-600 dark:text-blue-400 underline"
              >
                View
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "users" && (users ? <UsersTab users={users} /> : <LoadingSkeleton />)}
        {activeTab === "portfolios" && (portfolios && users ? <PortfoliosTab portfolios={portfolios} users={users} /> : <LoadingSkeleton />)}
        {activeTab === "payments" && (payments && users ? <PaymentsTab payments={payments} users={users} portfolios={portfolios ?? []} /> : <LoadingSkeleton />)}
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-slate-700 rounded" />
        ))}
      </div>
    </div>
  );
}

// ─── Users Tab ──────────────────────────────────────────────────────────────

function UsersTab({ users }: { users: any[] }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  // User detail slide-over
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Convex queries for selected user's portfolios/payments
  const allPortfolios = useQuery(api.admin.getAllPortfolios, selectedUser ? {} : "skip");
  const allPayments = useQuery(api.admin.getAllPayments, selectedUser ? {} : "skip");

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.email?.toLowerCase().includes(q)) ||
        (u.name?.toLowerCase().includes(q))
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const userPortfolios = useMemo(() => {
    if (!selectedUser || !allPortfolios) return [];
    return allPortfolios.filter((p) => p.userId === selectedUser._id);
  }, [selectedUser, allPortfolios]);

  const userPayments = useMemo(() => {
    if (!selectedUser || !allPayments) return [];
    return allPayments.filter((p) => p.userId === selectedUser._id);
  }, [selectedUser, allPayments]);

  return (
    <>
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Signed Up</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">ID</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-gray-100 dark:border-slate-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{user.name || "—"}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-xs font-mono text-gray-400">{user._id.slice(0, 12)}...</td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* User Detail Slide-Over */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelectedUser(null)}>
          <div
            className="bg-white dark:bg-slate-800 w-full max-w-lg h-full overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 mb-6">
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{selectedUser.name || selectedUser.email}</p>
                {selectedUser.name && <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>}
                <div className="flex gap-2 mt-2">
                  {ADMIN_EMAILS.includes(selectedUser.email) && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">admin</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Portfolios */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-blue-600">{userPortfolios.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Portfolios</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-green-600">{userPortfolios.filter((p) => p.status === "published").length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Published</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-purple-600">{userPayments.filter((p) => p.status === "completed").length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Payments</p>
                </div>
              </div>

              {/* User Portfolios List */}
              {userPortfolios.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Portfolios</h3>
                  <div className="space-y-2 mb-6">
                    {userPortfolios.map((p) => (
                      <div key={p._id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-900 rounded-lg px-3 py-2 text-sm">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">{p.basics?.fullName || p.name || "Untitled"}</span>
                          {p.slug && <span className="text-gray-400 text-xs ml-2">/p/{p.slug}</span>}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === "published" ? "bg-green-100 text-green-700" :
                          p.status === "paid" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* User Payments List */}
              {userPayments.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Payments</h3>
                  <div className="space-y-2">
                    {userPayments.map((p) => (
                      <div key={p._id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-900 rounded-lg px-3 py-2 text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{p.amount.toFixed(3)} {p.currency}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === "completed" ? "bg-green-100 text-green-700" :
                          p.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>{p.status}</span>
                        <span className="text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {userPortfolios.length === 0 && userPayments.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-6">No portfolios or payments yet</p>
              )}
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
        return (
          (p.basics?.fullName?.toLowerCase().includes(q)) ||
          (p.name?.toLowerCase().includes(q)) ||
          (p.slug?.toLowerCase().includes(q)) ||
          (owner?.email?.toLowerCase().includes(q))
        );
      });
    }
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [portfolios, search, statusFilter, userMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleMarkPaid = async (id: Id<"portfolios">) => {
    await markPaid({ id });
  };

  const handleDelete = async (id: Id<"portfolios">) => {
    await deletePortfolio({ id });
    setConfirmDelete(null);
  };

  return (
    <>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, slug, or owner..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="paid">Paid</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Portfolio</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Owner</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Slug</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Last Edited</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => {
                const owner = p.userId ? userMap.get(p.userId) : null;
                return (
                  <tr key={p._id} className="border-t border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{p.basics?.fullName || p.name || "Untitled"}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{owner?.email || "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "published" ? "bg-green-100 text-green-700" :
                        p.status === "paid" ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-500 dark:text-gray-400">{p.slug || "—"}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{new Date(p.lastEditedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/dashboard/${p._id}/edit`}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/dashboard/${p._id}/preview`}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Preview
                        </Link>
                        {p.slug && (
                          <a href={`/p/${p.slug}`} target="_blank" rel="noopener" className="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                            View
                          </a>
                        )}
                        {p.status === "draft" && (
                          <button
                            onClick={() => handleMarkPaid(p._id)}
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        {confirmDelete === p._id ? (
                          <span className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(p._id)}
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No portfolios found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
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
        const portfolio = portfolioMap.get(p.portfolioId);
        return (
          (owner?.email?.toLowerCase().includes(q)) ||
          (owner?.name?.toLowerCase().includes(q)) ||
          (p.myfatoorahInvoiceId?.toLowerCase().includes(q)) ||
          (portfolio?.basics?.fullName?.toLowerCase().includes(q))
        );
      });
    }
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [payments, search, statusFilter, userMap, portfolioMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by email, name, or invoice..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Invoice ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Portfolio</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => {
                const owner = p.userId ? userMap.get(p.userId) : null;
                const portfolio = portfolioMap.get(p.portfolioId);
                return (
                  <tr key={p._id} className="border-t border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
                    <td className="py-3 px-4 text-sm font-mono text-gray-800 dark:text-gray-200">{p.myfatoorahInvoiceId || "—"}</td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <p className="text-gray-800 dark:text-gray-200">{owner?.name || "—"}</p>
                        <p className="text-gray-400 text-xs">{owner?.email || "—"}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{portfolio?.basics?.fullName || portfolio?.name || "—"}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-gray-200">{p.amount.toFixed(3)} {p.currency}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "completed" ? "bg-green-100 text-green-700" :
                        p.status === "pending" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}
