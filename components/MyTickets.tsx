"use client";

import { useEffect, useState } from "react";
import type { Ticket, SLAPriority } from "@/lib/types";

const TEAM_NAMES: Record<string, string> = {
  T1: "Network & VPN",
  T2: "Accounts & Access",
  T3: "Hardware",
  T4: "Software & Apps",
  T5: "Security",
};

const SLA_INFO: Record<SLAPriority, { label: string; time: string; badge: string }> = {
  P1: { label: "P1 · Critical", time: "1h resp / 4h res", badge: "bg-red-50 text-red-700 border-red-200" },
  P2: { label: "P2 · High", time: "4h resp / 8h res", badge: "bg-orange-50 text-orange-700 border-orange-200" },
  P3: { label: "P3 · Medium", time: "8h resp / 24h res", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  P4: { label: "P4 · Request", time: "24h resp / 72h res", badge: "bg-slate-100 text-slate-700 border-slate-200" },
};

const STATUS_BADGES: Record<string, { label: string; badge: string }> = {
  open: { label: "Open", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  waiting_for_user: { label: "Waiting for User", badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  resolved: { label: "Resolved", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  closed: { label: "Closed", badge: "bg-slate-100 text-slate-500 border-slate-200" },
};

export default function MyTickets({ refreshKey }: { refreshKey: number }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    fetch("/api/tickets?employee_id=E101")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load tickets");
        setTickets(data.tickets || []);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const filteredTickets =
    filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/60 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">My Helpdesk Tickets</h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
              {tickets.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tickets submitted by Karthik S (E101) · Live Supabase sync
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {["all", "open", "in_progress", "resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                filter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st === "all" ? "All" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center p-8 text-xs text-slate-500">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mr-2"></span>
            Loading tickets from Supabase...
          </div>
        )}

        {error && (
          <div className="p-4 text-xs text-red-600 bg-red-50">
            Error: {error}
          </div>
        )}

        {!loading && !error && filteredTickets.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            No tickets found matching this view. Ask DeskBot to raise a ticket!
          </div>
        )}

        {!loading &&
          filteredTickets.map((t) => {
            const sla = SLA_INFO[t.priority] || SLA_INFO.P4;
            const status = STATUS_BADGES[t.status] || STATUS_BADGES.open;
            const team = TEAM_NAMES[t.team_id] || t.team_id;

            return (
              <div key={t.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        #{t.id}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {t.title}
                      </h3>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {t.description}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span>Assigned: <strong className="text-slate-700">{team}</strong></span>
                      <span>·</span>
                      <span>Created: {new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${sla.badge}`}
                      title={sla.time}
                    >
                      {sla.label}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${status.badge}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
