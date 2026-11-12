"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AgentChat from "@/components/AgentChat";
import MyTickets from "@/components/MyTickets";
import AdminBoard from "@/components/AdminBoard";
import KBViewer from "@/components/KBViewer";
import type { Ticket } from "@/lib/types";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"chat" | "tickets" | "admin" | "kb">("chat");
  const [refreshKey, setRefreshKey] = useState(0);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [p1Count, setP1Count] = useState(0);

  useEffect(() => {
    // Fetch user tickets and P1 metrics
    fetch("/api/tickets?employee_id=E101")
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) setMyTickets(data.tickets);
      })
      .catch(() => {});

    fetch("/api/tickets?priority=P1")
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) {
          const openP1 = data.tickets.filter((t: Ticket) =>
            ["open", "in_progress", "waiting_for_user"].includes(t.status)
          );
          setP1Count(openP1.length);
        }
      })
      .catch(() => {});
  }, [refreshKey]);

  function handleDataChanged() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pb-12">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ticketCount={myTickets.length}
        p1Count={p1Count}
      />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {activeTab === "chat" && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Chat interface */}
            <section className="lg:col-span-7">
              <AgentChat onDataChanged={handleDataChanged} />
            </section>

            {/* Right: Live user tickets panel */}
            <section className="lg:col-span-5">
              <MyTickets refreshKey={refreshKey} />
            </section>
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="max-w-4xl mx-auto">
            <MyTickets refreshKey={refreshKey} />
          </div>
        )}

        {activeTab === "admin" && (
          <div className="max-w-6xl mx-auto">
            <AdminBoard
              refreshKey={refreshKey}
              onTicketUpdated={handleDataChanged}
            />
          </div>
        )}

        {activeTab === "kb" && (
          <div className="max-w-4xl mx-auto">
            <KBViewer />
          </div>
        )}
      </main>
    </div>
  );
}
