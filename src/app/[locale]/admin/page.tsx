"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

const ADMIN_EMAILS = ["trimindai@trimindai.com", "90dalal@gmail.com"];

type Tab = "overview" | "users" | "portfolios" | "payments";

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const stats = useQuery(api.admin.getStats);
  const users = useQuery(api.admin.getAllUsers);
  const portfolios = useQuery(api.admin.getAllPortfolios);
  const payments = useQuery(api.admin.getAllPayments);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <p className="text-red-400 text-lg mb-4">Access Denied</p>
        <p className="text-slate-500 text-sm mb-6">You don't have admin privileges.</p>
        <Link href="/" className="text-emerald-400 hover:text-emerald-300">Back to Home</Link>
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-tight">Portfolio Pro</Link>
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-medium">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{email}</span>
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-emerald-500 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === "overview" && stats && <OverviewTab stats={stats} />}
        {activeTab === "users" && users && <UsersTab users={users} />}
        {activeTab === "portfolios" && portfolios && users && <PortfoliosTab portfolios={portfolios} users={users} />}
        {activeTab === "payments" && payments && <PaymentsTab payments={payments} />}
        {!stats && <div className="text-slate-500 text-center py-20">Loading data...</div>}
      </main>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
      <div className="text-sm text-slate-400 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
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
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Revenue (Last 30 Days)</h3>
          <div className="flex items-end gap-1 h-32">
            {revenueDays.map(([day, amount]) => {
              const maxRevenue = Math.max(...revenueDays.map(([, a]) => a as number));
              const height = maxRevenue > 0 ? ((amount as number) / maxRevenue) * 100 : 0;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1" title={`${day}: ${(amount as number).toFixed(3)} KD`}>
                  <div className="w-full bg-emerald-600 rounded-t" style={{ height: `${height}%`, minHeight: "2px" }} />
                  <span className="text-[8px] text-slate-600 rotate-[-45deg]">{day.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Signups Chart */}
      {signupDays.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Signups (Last 30 Days)</h3>
          <div className="flex items-end gap-1 h-32">
            {signupDays.map(([day, count]) => {
              const maxSignups = Math.max(...signupDays.map(([, c]) => c as number));
              const height = maxSignups > 0 ? ((count as number) / maxSignups) * 100 : 0;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1" title={`${day}: ${count} signups`}>
                  <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height}%`, minHeight: "2px" }} />
                  <span className="text-[8px] text-slate-600 rotate-[-45deg]">{day.slice(5)}</span>
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
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400">
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium">Email</th>
            <th className="text-left px-4 py-3 font-medium">Signed Up</th>
            <th className="text-left px-4 py-3 font-medium">ID</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
              <td className="px-4 py-3 text-white">{user.name || "—"}</td>
              <td className="px-4 py-3 text-slate-300">{user.email}</td>
              <td className="px-4 py-3 text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-slate-600 text-xs font-mono">{user._id.slice(0, 12)}...</td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No users yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PortfoliosTab({ portfolios, users }: { portfolios: any[]; users: any[] }) {
  const userMap = new Map(users.map((u) => [u._id, u]));

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400">
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
              <tr key={p._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-3 text-white">{p.basics?.fullName || p.name || "Untitled"}</td>
                <td className="px-4 py-3 text-slate-300">{owner?.email || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.status === "published" ? "bg-emerald-600/20 text-emerald-400" :
                    p.status === "paid" ? "bg-amber-600/20 text-amber-400" :
                    "bg-slate-700/50 text-slate-400"
                  }`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.slug || "—"}</td>
                <td className="px-4 py-3 text-slate-400">{new Date(p.lastEditedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {p.slug && (
                    <a href={`/p/${p.slug}`} target="_blank" rel="noopener" className="text-emerald-400 hover:text-emerald-300 text-xs">View</a>
                  )}
                </td>
              </tr>
            );
          })}
          {portfolios.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No portfolios yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PaymentsTab({ payments }: { payments: any[] }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400">
            <th className="text-left px-4 py-3 font-medium">Amount</th>
            <th className="text-left px-4 py-3 font-medium">Currency</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Invoice ID</th>
            <th className="text-left px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
              <td className="px-4 py-3 text-white font-medium">{p.amount.toFixed(3)}</td>
              <td className="px-4 py-3 text-slate-300">{p.currency}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  p.status === "completed" ? "bg-emerald-600/20 text-emerald-400" :
                  p.status === "pending" ? "bg-amber-600/20 text-amber-400" :
                  "bg-red-600/20 text-red-400"
                }`}>{p.status}</span>
              </td>
              <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.myfatoorahInvoiceId || "—"}</td>
              <td className="px-4 py-3 text-slate-400">{new Date(p.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No payments yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
