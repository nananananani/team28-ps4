import { z } from "zod";

/**
 * Shared Zod schemas for PS4 IT Helpdesk Ticket Agent (DeskBot).
 */

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
  .describe("Date in YYYY-MM-DD format");

export const chatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string().min(1).max(4000),
});

export const agentRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(30),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const priorityEnum = z.enum(["P1", "P2", "P3", "P4"]);
export const ticketStatusEnum = z.enum(["open", "in_progress", "waiting_for_user", "resolved", "closed"]);
export const supportTeamEnum = z.enum(["T1", "T2", "T3", "T4", "T5"]);

export const createTicketSchema = z.object({
  employee_id: z.string().default("E101").describe("Employee ID, default is E101"),
  title: z.string().trim().min(3).max(200).describe("Clear summary title of the issue"),
  description: z.string().trim().min(5).max(1000).describe("Detailed description of the issue or error"),
  category: z.string().trim().min(2).max(50).describe("Category, e.g. VPN, Network, Account, Hardware, Apps, Security, Access"),
  priority: priorityEnum.describe("SLA priority: P1 (widespread/security), P2 (single user blocked), P3 (work slowed), P4 (request)"),
  team_id: supportTeamEnum.describe("Assigned support team: T1 (Network & VPN), T2 (Accounts & Access), T3 (Hardware), T4 (Software & Apps), T5 (Security)"),
});

export const updateTicketSchema = z.object({
  id: z.number().int().positive().describe("Numeric ID of the ticket to update"),
  status: ticketStatusEnum.describe("New ticket status: open, in_progress, waiting_for_user, resolved, closed"),
  description: z.string().trim().optional().describe("Optional updated notes or resolution info"),
});

export const searchKBSchema = z.object({
  query: z.string().trim().optional().describe("Search term or issue description to match knowledge base articles"),
  category: z.string().trim().optional().describe("Optional category filter such as VPN, Network, Account, Hardware, Security, Apps"),
});
