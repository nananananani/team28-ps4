"use client";

import { useEffect, useState } from "react";
import type { KBArticle } from "@/lib/types";

const CATEGORIES = ["All", "VPN", "Network", "Account", "Access", "Hardware", "Apps", "Security"];

export default function KBViewer() {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchKB();
  }, [category]);

  async function fetchKB(queryOverride?: string) {
    setLoading(true);
    try {
      const q = queryOverride !== undefined ? queryOverride : search;
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (category !== "All") params.set("category", category);

      const res = await fetch(`/api/kb?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load KB");
      setArticles(data.articles || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading KB articles");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchKB(search);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Search Header */}
      <div className="border-b border-slate-200 bg-slate-50/60 p-5 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">IT Knowledge Base</h2>
          <p className="text-xs text-slate-500">
            Self-service resolution steps and verified IT troubleshooting procedures
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides (e.g. VPN, Outlook, laptop slow, phishing...)"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 shadow-xs"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className="divide-y divide-slate-100 max-h-[65vh] overflow-y-auto p-2">
        {loading && (
          <div className="p-8 text-center text-xs text-slate-400">
            Searching knowledge base...
          </div>
        )}
        {error && (
          <div className="p-4 text-xs text-red-600 bg-red-50 rounded-xl">
            {error}
          </div>
        )}
        {!loading && articles.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No knowledge base articles matched your search.
          </div>
        )}

        {!loading &&
          articles.map((art) => (
            <details
              key={art.id}
              className="group p-3 hover:bg-slate-50/70 transition-colors rounded-xl"
            >
              <summary className="flex cursor-pointer items-center justify-between font-medium text-slate-900 select-none">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-50 border border-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                    {art.category}
                  </span>
                  <span className="text-xs font-semibold">{art.title}</span>
                </div>
                <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs">
                  ▼
                </span>
              </summary>
              <div className="mt-3 pl-3 border-l-2 border-blue-500 text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                  Troubleshooting Steps:
                </p>
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-600 leading-relaxed">
                  {art.solution_steps}
                </pre>
              </div>
            </details>
          ))}
      </div>
    </div>
  );
}
