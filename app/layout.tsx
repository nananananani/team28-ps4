import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeskBot · IT Helpdesk Ticket Agent (Zentrix Software)",
  description:
    "Autonomous agentic IT helpdesk with Gemini function calling, knowledge base lookup, and Supabase ticket management.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100/50">{children}</body>
    </html>
  );
}
