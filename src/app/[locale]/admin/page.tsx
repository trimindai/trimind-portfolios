"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState, Component, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";

const ADMIN_EMAILS = ["trimindai@trimindai.com", "90dalal@gmail.com", "test@trimindai.com"];

type Tab = "overview" | "users" | "portfolios" | "payments";

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
        <div className="min-h-screen bg-[var(--land-bg)] flex flex-col items-center justify-center">
          <p className="text-red-400 text-lg mb-4">Admin panel error</p>
          <p className="text-[var(--land-muted)] text-sm mb-6 max-w-md text-center">
            Could not load admin data. Check that ADMIN_EMAILS is configured in the Convex dashboard.
          </p>
          <Link href="/" className="text-[var(--land-accent-hover)] hover:text-[var(--land-accent)]">Back to Home</Link>
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
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const email = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = !!email && ADMIN_EMAILS.includes(email);

  // Skip all Convex queries unless user is confirmed admin — prevents
  // server-side requireAdmin() from throwing and crashing the component.
  const stats = useQuery(api.admin.getStats, isAdmin ? {} : "skip");
  const users = useQuery(api.admin.getAllUsers, isAdmin ? {} : "skip");
  const portfolios = useQuery(api.admin.getAllPortfolios, isAdmin ? {} : "skip");
  const payments = useQuery(api.admin.getAllPayments, isAdmin ? {} : "skip");

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[var(--land-bg)] flex items-center justify-center">
        <div className="text-[var(--land-body)]">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--land-bg)] flex flex-col items-center justify-center">
        <p className="text-red-400 text-lg mb-4">Access Denied</p>
        <p className="text-[var(--land-muted)] text-sm mb-6">You don't have admin privileges.</p>
        <Link href="/" className="text-[var(--land-accent-hover)] hover:text-[var(--land-accent)]">Back to Home</Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "portfolios", label: "Portfolios" },
    { id: "payments", label: "Payments" },
  ];

  return (
    <div className="min-h-screen bg-[var(--land-bg)] text-white">
      {/* Header */}
      <header className="border-b border-[var(--land-border)] bg-[var(--land-surface)]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-tight">Portfolio Pro</Link>
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-medium">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--land-body)]">{email}</span>
            <Link href="/dashboard" className="text-sm text-[var(--land-muted)] hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-[var(--land-border)]">
        <div className="mx-auto max-w-7xl px-6 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-[var(--land-accent)] text-white"
                  : "border-transparent text-[var(--land-muted)] hover:text-[var(--land-bright)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === "overview" && (stats ? <OverviewTab stats={stats} /> : <LoadingSkeleton />)}
        {activeTab === "users" && (users ? <UsersTab users={users} /> : <LoadingSkeleton />)}
        {activeTab === "portfolios" && (portfolios && users ? <PortfoliosTab portfolios={portfolios} users={users} /> : <LoadingSkeleton />)}
        {activeTab === "payments" && (payments ? <PaymentsTab payments={payments} /> : <LoadingSkeleton />)}
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[var(--land-surface)]/50 border border-[var(--land-border)] rounded-xl p-5 animate-pulse">
          <div className="h-3 w-20 bg-[var(--land-border)] rounded mb-3" />
          <div className="h-6 w-14 bg-[var(--land-border)] rounded" />
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[var(--land-surface)]/50 border border-[var(--land-border)] rounded-xl p-5">
      <div className="text-sm text-[var(--land-body)] mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-[var(--land-muted)] mt-1">{sub}</div>}
    </div>
  );
}

function OverviewTab({ stats }: { stats: any }) {
  const revenueDays = Object.entries(stats.revenueByDay || {}).sort(([a], [b]) => a.localeCompare(b));
  const signupDays = Object.entries(stats.signupsByDay || {}).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Portfolios" value={stats.totalPortfolios} sub={`${stats.publishedCount} published, ${stats.paidCount} paid, ${stats.draftCount} draft`} />
        <StatCard label="Total Revenue" value={`${stats.totalRevenue.toFixed(3)} KD`} sub={`${stats.completedPayments} completed payments`} />
        <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} sub="Signup → Paid" />
      </div>

      {/* Payment Status */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Completed Payments" value={stats.completedPayments} />
        <StatCard label="Pending Payments" value={stats.pendingPayments} />
        <StatCard label="Failed Payments" value={stats.failedPayments} />
      </div>

      {/* Revenue Chart (simple bar) */}
      {revenueDays.length > 0 && (
        <div className="bg-[var(--land-surface)]/50 border border-[var(--land-border)] rounded-xl p-5">
          <h3 className="text-sm font-medium text-[var(--land-bright)] mb-4">Revenue (Last 30 Days)</h3>
          <div className="flex items-end gap-1 h-32">
            {revenueDays.map(([day, amount]) => {
              const maxRevenue = Math.max(...revenueDays.map(([, a]) => a as number));
              const height = maxRevenue > 0 ? ((amount as number) / maxRevenue) * 100 : 0;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1" title={`${day}: ${(amount as number).toFixed(3)} KD`}>
                  <div className="w-full bg-[var(--land-accent)] rounded-t" style={{ height: `${height}%`, minHeight: "2px" }} />
                  <span className="text-[8px] text-[var(--land-muted)] rotate-[-45deg]">{day.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Signups Chart */}
      {signupDays.length > 0 && (
        <div className="bg-[var(--land-surface)]/50 border border-[var(--land-border)] rounded-xl p-5">
          <h3 className="text-sm font-medium text-[var(--land-bright)] mb-4">Signups (Last 30 Days)</h3>
          <div className="flex items-end gap-1 h-32">
            {signupDays.map(([day, count]) => {
              const maxSignups = Math.max(...signupDays.map(([, c]) => c as number));
              const height = maxSignups > 0 ? ((count as number) / maxSignups) * 100 : 0;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1" title={`${day}: ${count} signups`}>
                  <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height}%`, minHeight: "2px" }} />
                  <span className="text-[8px] text-[var(--land-muted)] rotate-[-45deg]">{day.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab({ users }: { users: any[] }) {
  return (
    <div className="bg-[var(--land-surface)]/50 border border-[var(--land-border)] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--land-border)] text-[var(--land-body)]">
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium">Email</th>
            <th className="text-left px-4 py-3 font-medium">Signed Up</th>
            <th className="text-left px-4 py-3 font-medium">ID</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-[var(--land-border)]/50 hover:bg-[var(--land-surface-raised)]/30">
              <td className="px-4 py-3 text-white">{user.name || "—"}</td>
              <td className="px-4 py-3 text-[var(--land-bright)]">{user.email}</td>
              <td className="px-4 py-3 text-[var(--land-body)]">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-[var(--land-muted)] text-xs font-mono">{user._id.slice(0, 12)}...</td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-8 text-center text-[var(--land-muted)]">No users yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PortfoliosTab({ portfolios, users }: { portfolios: any[]; users: any[] }) {
  const userMap = new Map(users.map((u) => [u._id, u]));
  const markPaid = useMutation(api.admin.markPortfolioPaid);
  const deletePortfolio = useMutation(api.admin.deletePortfolio);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleMarkPaid = async (id: Id<"portfolios">) => {
    await markPaid({ id });
  };

  const handleDelete = async (id: Id<"portfolios">) => {
    await deletePortfolio({ id });
    setConfirmDelete(null);
  };

  return (
    <div className="bg-[var(--land-surface)]/50 border border-[var(--land-border)] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--land-border)] text-[var(--land-body)]">
            <th className="text-left px-4 py-3 font-medium">Portfolio</th>
            <th className="text-left px-4 py-3 font-medium">Owner</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Slug</th>
            <th className="text-left px-4 py-3 font-medium">Last Edited</th>
            <th className="text-left px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {portfolios.map((p) => {
            const owner = p.userId ? userMap.get(p.userId) : null;
            return (
              <tr key={p._id} className="border-b border-[var(--land-border)]/50 hover:bg-[var(--land-surface-raised)]/30">
                <td className="px-4 py-3 text-white">{p.basics?.fullName || p.name || "Untitled"}</td>
                <td className="px-4 py-3 text-[var(--land-bright)]">{owner?.email || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.status === "published" ? "bg-[var(--land-accent-subtle)] text-[var(--land-accent-hover)]" :
                    p.status === "paid" ? "bg-amber-600/20 text-amber-400" :
                    "bg-[var(--land-border)]/50 text-[var(--land-body)]"
                  }`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-[var(--land-body)] font-mono text-xs">{p.slug || "—"}</td>
                <td className="px-4 py-3 text-[var(--land-body)]">{new Date(p.lastEditedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/dashboard/${p._id}/edit`}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/dashboard/${p._id}/preview`}
                      className="text-[var(--land-body)] hover:text-[var(--land-bright)] text-xs"
                    >
                      Preview
                    </Link>
                    {p.slug && (
                      <a href={`/p/${p.slug}`} target="_blank" rel="noopener" className="text-[var(--land-accent-hover)] hover:text-[var(--land-accent)] text-xs">View</a>
                    )}
                    {p.status === "draft" && (
                      <button
                        onClick={() => handleMarkPaid(p._id)}
                        className="text-amber-400 hover:text-amber-300 text-xs"
                      >
                        Mark Paid
                      </button>
                    )}
                    {(p.status === "paid" && !p.slug) && (
                      <Link
                        href={`/dashboard/${p._id}/publish`}
                        className="text-[var(--land-accent-hover)] hover:text-[var(--land-accent)] text-xs"
                      >
                        Publish
                      </Link>
                    )}
                    {confirmDelete === p._id ? (
                      <span className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-red-500 hover:text-red-400 text-xs font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-[var(--land-muted)] hover:text-[var(--land-body)] text-xs"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(p._id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {portfolios.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--land-muted)]">No portfolios yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PaymentsTab({ payments }: { payments: any[] }) {
  return (
    <div className="bg-[var(--land-surface)]/50 border border-[var(--land-border)] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--land-border)] text-[var(--land-body)]">
            <th className="text-left px-4 py-3 font-medium">Amount</th>
            <th className="text-left px-4 py-3 font-medium">Currency</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Invoice ID</th>
            <th className="text-left px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p._id} className="border-b border-[var(--land-border)]/50 hover:bg-[var(--land-surface-raised)]/30">
              <td className="px-4 py-3 text-white font-medium">{p.amount.toFixed(3)}</td>
              <td className="px-4 py-3 text-[var(--land-bright)]">{p.currency}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  p.status === "completed" ? "bg-[var(--land-accent-subtle)] text-[var(--land-accent-hover)]" :
                  p.status === "pending" ? "bg-amber-600/20 text-amber-400" :
                  "bg-red-600/20 text-red-400"
                }`}>{p.status}</span>
              </td>
              <td className="px-4 py-3 text-[var(--land-body)] font-mono text-xs">{p.myfatoorahInvoiceId || "—"}</td>
              <td className="px-4 py-3 text-[var(--land-body)]">{new Date(p.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--land-muted)]">No payments yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
