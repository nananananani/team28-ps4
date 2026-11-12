"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentResult, AgentStep } from "@/lib/agent/types";

type Message = { role: "user" | "model"; text: string; steps?: AgentStep[] };

const DEMO_PROMPTS = [
  "My VPN keeps disconnecting since morning.",
  "I clicked a strange link in an email.",
  "What is the status of my laptop ticket?",
  "Need Docker Desktop installed for work.",
  "Summarize all open P1 critical incidents.",
];

export default function AgentChat({ onDataChanged }: { onDataChanged?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next: Message[] = [...messages, { role: "user", text: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-20).map(({ role, text }) => ({ role, text })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Agent request failed");

      const result = data as AgentResult;
      setMessages([...next, { role: "model", text: result.reply, steps: result.steps }]);

      // Notify parent to refresh ticket lists if any write occurred
      if (result.steps.some((s) => s.writes && s.ok)) {
        onDataChanged?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[75vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-5 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">DeskBot AI Assistant</h2>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Powered by Gemini function calling · Queries KB & auto-routes tickets
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Clear chat
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600 shadow-xs mb-3">
              🤖
            </div>
            <h3 className="text-sm font-semibold text-slate-800">How can I assist your IT needs today?</h3>
            <p className="mt-1 max-w-md text-xs text-slate-500">
              I can troubleshoot VPN & network issues, find self-service guides, check your ticket status, or raise urgent support tickets.
            </p>

            <div className="mt-6 w-full max-w-lg space-y-2">
              <p className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Hackathon Demo Prompts:
              </p>
              <div className="grid gap-2">
                {DEMO_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-2.5 text-left text-xs text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-900 group"
                  >
                    <span>{p}</span>
                    <span className="text-slate-300 group-hover:text-blue-500 transition-colors">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-tr-xs bg-blue-600 px-4 py-2.5 text-sm text-white shadow-xs"
                  : "max-w-[90%] space-y-2"
              }
            >
              {/* Tool Execution Drawer */}
              {m.steps && m.steps.length > 0 && <ToolSteps steps={m.steps} />}

              {m.role === "model" ? (
                <div className="rounded-2xl rounded-tl-xs border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-xs whitespace-pre-wrap leading-relaxed">
                  {m.text}
                </div>
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></span>
            <span>DeskBot is evaluating knowledge base & deciding tools...</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your issue in plain English (e.g. My VPN disconnected, laptop won't charge...)"
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}

/** Shows each tool call so judges and users see true autonomous execution */
function ToolSteps({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="space-y-1.5 mb-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
        <span>⚡ Agent Actions:</span>
      </div>
      {steps.map((s, i) => (
        <details
          key={i}
          open={s.writes}
          className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs shadow-xs"
        >
          <summary className="flex cursor-pointer items-center justify-between font-mono select-none">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  s.ok ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <span className="font-semibold text-slate-800">{s.tool}</span>
              {s.writes && (
                <span className="rounded-md bg-amber-100 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                  writes to database
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              {s.ok ? "Done" : "Failed"}
            </span>
          </summary>

          <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2 font-mono text-[11px]">
            <div>
              <span className="text-slate-400">Arguments: </span>
              <pre className="overflow-x-auto rounded bg-slate-50 p-1.5 text-slate-700">
                {JSON.stringify(s.args, null, 2)}
              </pre>
            </div>
            <div>
              <span className="text-slate-400">{s.ok ? "Result: " : "Error: "}</span>
              <pre className="overflow-x-auto rounded bg-slate-50 p-1.5 text-slate-700 max-h-36">
                {JSON.stringify(s.ok ? s.result : s.error, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
