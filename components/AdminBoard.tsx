"use client";

import { useEffect, useState } from "react";
import type { Ticket, TicketStatus, SLAPriority } from "@/lib/types";

const TEAM_NAMES: Record<string, string> = {
  T1: "Network & VPN",
  T2: "Accounts & Access",
  T3: "Hardware",
  T4: "Software & Apps",
  T5: "Security",
};

export default function AdminBoard({
  refreshKey,
  onTicketUpdated,
}: {
  refreshKey: number;
  onTicketUpdated?: () => void;
}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    loadTickets();
  }, [refreshKey]);

  async function loadTickets() {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch tickets");
      setTickets(data.tickets || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(ticketId: number, nextStatus: TicketStatus) {
    setUpdatingId(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Status update failed");

      // Update in local state
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t))
      );
      onTicketUpdated?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating status");
    } finally {
      setUpdatingId(null);
    }
  }

  const p1OpenTickets = tickets.filter(
    (t) => t.priority === "P1" && ["open", "in_progress", "waiting_for_user"].includes(t.status)
  );

  const filteredTickets = tickets.filter((t) => {
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  return (
    <div className="space-y-4">
      {/* P1 Critical Incident Alert Banner */}
      {p1OpenTickets.length > 0 && (
        <div className="rounded-2xl border border-red-300 bg-red-50/90 p-4 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-900">
                  Critical Incident Alert: {p1OpenTickets.length} Open P1 Incident(s)
                </h3>
                <p className="text-xs text-red-700">
                  SLA Target: 1 hour response time / 4 hours resolution.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {p1OpenTickets.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-red-200 bg-white/90 p-3 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-red-900">#{p.id} · {p.title}</span>
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-800">
                    {p.status}
                  </span>
                </div>
                <p className="mt-1 text-slate-600 line-clamp-1">{p.description}</p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Emp: {p.employee_id}</span>
                  <span>Team: {TEAM_NAMES[p.team_id] || p.team_id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main IT Admin Board */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/60 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">IT Staff Triage Board</h2>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                {tickets.length} total tickets
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage enterprise tickets across Zentrix Software · Real-time status update
            </p>
          </div>

          {/* Filter dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_user">Waiting for User</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="P1">P1 (Critical)</option>
              <option value="P2">P2 (High)</option>
              <option value="P3">P3 (Medium)</option>
              <option value="P4">P4 (Low)</option>
            </select>

            <button
              onClick={loadTickets}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-xs"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Tickets Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title & Issue</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assigned Team</th>
                <th className="px-4 py-3">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading triage board...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-red-600 bg-red-50">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No tickets matching current filters.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredTickets.map((t) => {
                  const priorityColor =
                    t.priority === "P1"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : t.priority === "P2"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : t.priority === "P3"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        #{t.id}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-slate-900">{t.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {t.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-mono">
                        {t.employee_id}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${priorityColor}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {TEAM_NAMES[t.team_id] || t.team_id}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          disabled={updatingId === t.id}
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value as TicketStatus)}
                          className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none transition-colors ${
                            t.status === "resolved"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                              : t.status === "in_progress"
                              ? "border-purple-300 bg-purple-50 text-purple-800"
                              : t.status === "waiting_for_user"
                              ? "border-yellow-300 bg-yellow-50 text-yellow-800"
                              : t.status === "closed"
                              ? "border-slate-200 bg-slate-100 text-slate-500"
                              : "border-blue-300 bg-blue-50 text-blue-800"
                          }`}
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="waiting_for_user">Waiting for User</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
