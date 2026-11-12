import "server-only";
import { z } from "zod";
import { defineTool, type AgentTool } from "./defineTool";
import {
  DEFAULT_EMPLOYEE_ID,
  searchKBArticles,
  createTicketRecord,
  listTickets,
  getTicketById,
  updateTicketRecord,
  getOpenP1Tickets,
} from "../db";
import { priorityEnum, ticketStatusEnum, supportTeamEnum } from "../schemas";

/**
 * Tool 1: searchKnowledgeBase (Reads from Supabase)
 * Always called first when an employee asks for IT assistance.
 */
const searchKnowledgeBase = defineTool({
  name: "searchKnowledgeBase",
  description:
    "Use this when the employee describes any technical issue, glitch, or question to find step-by-step solutions from the IT Knowledge Base before creating a ticket.",
  schema: z.object({
    query: z.string().describe("Keywords summarizing the user's issue, e.g. 'VPN disconnecting', 'phishing link', 'printer stuck'"),
    category: z.string().optional().describe("Category if known: VPN, Network, Account, Hardware, Apps, Security, Access"),
  }),
  run: async ({ query, category }) => {
    const articles = await searchKBArticles(query, category);
    if (articles.length === 0) {
      return {
        found: false,
        message: "No specific knowledge base article matched the query. A support ticket should be created.",
        articles: [],
      };
    }
    return {
      found: true,
      count: articles.length,
      articles: articles.slice(0, 3).map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        solution_steps: a.solution_steps,
        assigned_team_id: a.team_id,
      })),
    };
  },
});

/**
 * Tool 2: createTicket (Writes to Supabase)
 * Creates a ticket in the tickets table with proper SLA priority and team routing.
 */
const createTicket = defineTool({
  name: "createTicket",
  description:
    "Use this when the user asks to raise a ticket, or when knowledge base steps do not solve the problem, or for urgent security issues (e.g. phishing links, malware) and hardware failures that need human IT intervention.",
  writes: true,
  schema: z.object({
    title: z.string().trim().min(3).max(200).describe("Short, clear title summarizing the problem"),
    description: z.string().trim().min(5).max(1000).describe("Full details of the employee's problem"),
    category: z.string().trim().describe("Category: VPN, Network, Account, Hardware, Apps, Security, Access"),
    priority: priorityEnum.describe(
      "Priority based on SLA rules: P1 (many users blocked or security incident), P2 (single user fully blocked from work), P3 (work slowed down but user can work), P4 (service request or question)"
    ),
    team_id: supportTeamEnum.describe(
      "Support team responsible: T1 (Network & VPN), T2 (Accounts & Access), T3 (Hardware), T4 (Software & Apps), T5 (Security)"
    ),
  }),
  run: async ({ title, description, category, priority, team_id }) => {
    const ticket = await createTicketRecord({
      employee_id: DEFAULT_EMPLOYEE_ID,
      title,
      description,
      category,
      priority,
      team_id,
    });

    const slaHoursMap: Record<string, { response: number; resolve: number }> = {
      P1: { response: 1, resolve: 4 },
      P2: { response: 4, resolve: 8 },
      P3: { response: 8, resolve: 24 },
      P4: { response: 24, resolve: 72 },
    };

    const sla = slaHoursMap[priority] || { response: 24, resolve: 72 };

    return {
      success: true,
      ticket_id: ticket.id,
      title: ticket.title,
      priority: ticket.priority,
      team_id: ticket.team_id,
      status: ticket.status,
      response_sla: `${sla.response} hour(s)`,
      resolution_sla: `${sla.resolve} hour(s)`,
      created_at: ticket.created_at,
    };
  },
});

/**
 * Tool 3: getMyTickets (Reads from Supabase)
 * Retrieves tickets submitted by logged-in employee (E101).
 */
const getMyTickets = defineTool({
  name: "getMyTickets",
  description:
    "Use this when the employee asks to see their tickets, check active requests, or view ticket history.",
  schema: z.object({
    status: z
      .enum(["open", "in_progress", "waiting_for_user", "resolved", "closed", "all"])
      .optional()
      .describe("Optional status filter. Defaults to all."),
  }),
  run: async ({ status }) => {
    const tickets = await listTickets({
      employee_id: DEFAULT_EMPLOYEE_ID,
      status: status && status !== "all" ? status : undefined,
    });

    return {
      count: tickets.length,
      employee_id: DEFAULT_EMPLOYEE_ID,
      tickets: tickets.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        priority: t.priority,
        team_id: t.team_id,
        status: t.status,
        created_at: t.created_at,
      })),
    };
  },
});

/**
 * Tool 4: getTicketStatus (Reads from Supabase)
 * Queries ticket status by ID or by matching title keywords.
 */
const getTicketStatus = defineTool({
  name: "getTicketStatus",
  description:
    "Use this when the user asks for the status or update on a specific ticket (e.g. 'status of my laptop ticket' or ticket #194).",
  schema: z.object({
    ticket_id: z.number().int().positive().optional().describe("Specific numeric ticket ID if known"),
    keyword: z.string().optional().describe("Keyword from the ticket title or problem description, e.g. 'laptop', 'battery', 'VPN'"),
  }),
  run: async ({ ticket_id, keyword }) => {
    if (ticket_id) {
      const ticket = await getTicketById(ticket_id);
      if (!ticket) throw new Error(`Ticket #${ticket_id} was not found.`);
      return { found: true, ticket };
    }

    const tickets = await listTickets({ employee_id: DEFAULT_EMPLOYEE_ID });
    if (!keyword) {
      return { found: true, latest_ticket: tickets[0] || null };
    }

    const q = keyword.toLowerCase();
    const matched = tickets.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );

    if (matched.length === 0) {
      return {
        found: false,
        message: `No ticket found for employee matching keyword "${keyword}".`,
      };
    }

    return {
      found: true,
      count: matched.length,
      ticket: matched[0],
      all_matching: matched,
    };
  },
});

/**
 * Tool 5: updateTicket (Writes to Supabase)
 * Updates the status or notes of an existing ticket.
 */
const updateTicket = defineTool({
  name: "updateTicket",
  description:
    "Use this when a user or IT technician asks to update a ticket's status (e.g. mark resolved, close, or in_progress) or add an update note.",
  writes: true,
  schema: z.object({
    id: z.number().int().positive().describe("The ticket ID to update"),
    status: ticketStatusEnum.describe("New status: open, in_progress, waiting_for_user, resolved, or closed"),
    notes: z.string().optional().describe("Optional note explaining the status change"),
  }),
  run: async ({ id, status, notes }) => {
    const updated = await updateTicketRecord(id, {
      status,
      description: notes ? `Updated: ${notes}` : undefined,
    });
    return {
      success: true,
      ticket: {
        id: updated.id,
        title: updated.title,
        status: updated.status,
        updated_at: updated.updated_at,
      },
    };
  },
});

/**
 * Tool 6: summarizeOpenP1Tickets (Reads from Supabase - Stretch Goal)
 * Pulls all active P1 incidents and compiles an incident brief.
 */
const summarizeOpenP1Tickets = defineTool({
  name: "summarizeOpenP1Tickets",
  description:
    "Use this when IT staff or an administrator asks to summarize all open P1 critical incidents currently affecting the company.",
  schema: z.object({}),
  run: async () => {
    const p1Tickets = await getOpenP1Tickets();
    return {
      count: p1Tickets.length,
      incidents: p1Tickets.map((t) => ({
        id: t.id,
        employee_id: t.employee_id,
        title: t.title,
        category: t.category,
        team_id: t.team_id,
        status: t.status,
        created_at: t.created_at,
      })),
      summary:
        p1Tickets.length === 0
          ? "There are currently no open P1 critical incidents."
          : `There are ${p1Tickets.length} open P1 critical incident(s) requiring immediate resolution.`,
    };
  },
});

/** All declared tools passed to Gemini */
export const tools: AgentTool[] = [
  searchKnowledgeBase,
  createTicket,
  getMyTickets,
  getTicketStatus,
  updateTicket,
  summarizeOpenP1Tickets,
];
