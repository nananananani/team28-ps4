"use client";

interface NavbarProps {
  activeTab: "chat" | "tickets" | "admin" | "kb";
  setActiveTab: (tab: "chat" | "tickets" | "admin" | "kb") => void;
  ticketCount: number;
  p1Count: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  ticketCount,
  p1Count,
}: NavbarProps) {
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm">
            DB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                DeskBot
              </span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                PS4 · IT Helpdesk
              </span>
            </div>
            <p className="text-xs text-slate-500">Zentrix Software IT Services</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "chat"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>💬</span>
            <span>Helpdesk Chat</span>
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "tickets"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🎫</span>
            <span>My Tickets</span>
            {ticketCount > 0 && (
              <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                {ticketCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "admin"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🛡️</span>
            <span>IT Admin Board</span>
            {p1Count > 0 && (
              <span className="ml-1 animate-pulse rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {p1Count} P1
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("kb")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "kb"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>📚</span>
            <span>Knowledge Base</span>
          </button>
        </nav>

        {/* User Identity & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-800">
              Karthik S (E101)
            </span>
            <span className="text-[11px] text-slate-500">Engineering · Chennai</span>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden border-t border-slate-200 overflow-x-auto px-2 py-1 gap-1">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${
            activeTab === "chat" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${
            activeTab === "tickets" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
        >
          My Tickets ({ticketCount})
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`flex-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${
            activeTab === "admin" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
        >
          Admin Board {p1Count > 0 ? `(${p1Count} P1)` : ""}
        </button>
        <button
          onClick={() => setActiveTab("kb")}
          className={`flex-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${
            activeTab === "kb" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
        >
          KB
        </button>
      </div>
    </header>
  );
}
