import "server-only";
import { getSupabase } from "./supabase";
import type { Employee, KBArticle, SLARule, SupportTeam, Ticket, TicketStatus, SLAPriority } from "./types";

export const DEFAULT_EMPLOYEE_ID = "E101";

/**
 * Fetch employee details (default logged-in demo user: E101 Karthik S)
 */
export async function getEmployee(id: string = DEFAULT_EMPLOYEE_ID): Promise<Employee | null> {
  const { data, error } = await getSupabase()
    .from("employees")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch employee ${id}: ${error.message}`);
  return data;
}

/**
 * Search the IT Knowledge Base articles by keyword or category.
 */
export async function searchKBArticles(query?: string, category?: string): Promise<KBArticle[]> {
  let dbQuery = getSupabase()
    .from("kb_articles")
    .select("*")
    .order("id", { ascending: true })
    .limit(10);

  if (category && category.trim()) {
    dbQuery = dbQuery.ilike("category", `%${category.trim()}%`);
  }

  if (query && query.trim()) {
    const q = query.trim();
    // Match in title, keywords, or solution steps
    dbQuery = dbQuery.or(`title.ilike.%${q}%,keywords.ilike.%${q}%,solution_steps.ilike.%${q}%`);
  }

  const { data, error } = await dbQuery;
  if (error) throw new Error(`Knowledge base search failed: ${error.message}`);
  return data || [];
}

/**
 * List tickets with optional employee or status filter.
 */
export async function listTickets(options?: {
  employee_id?: string;
  status?: string;
  priority?: string;
  limit?: number;
}): Promise<Ticket[]> {
  let query = getSupabase()
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 50);

  if (options?.employee_id) {
    query = query.eq("employee_id", options.employee_id);
  }
  if (options?.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }
  if (options?.priority && options.priority !== "all") {
    query = query.eq("priority", options.priority);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load tickets: ${error.message}`);
  return data || [];
}

/**
 * Get single ticket details by ID.
 */
export async function getTicketById(id: number): Promise<Ticket | null> {
  const { data, error } = await getSupabase()
    .from("tickets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch ticket #${id}: ${error.message}`);
  return data;
}

/**
 * Create a new IT helpdesk ticket (Writes to Supabase)
 */
export async function createTicketRecord(params: {
  employee_id?: string;
  title: string;
  description: string;
  category: string;
  priority: SLAPriority;
  team_id: string;
}): Promise<Ticket> {
  const employee_id = params.employee_id || DEFAULT_EMPLOYEE_ID;

  const { data, error } = await getSupabase()
    .from("tickets")
    .insert({
      employee_id,
      title: params.title.trim(),
      description: params.description.trim(),
      category: params.category.trim(),
      priority: params.priority,
      team_id: params.team_id,
      status: "open",
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create ticket: ${error.message}`);
  return data;
}

/**
 * Update an existing ticket status or details (Writes to Supabase)
 */
export async function updateTicketRecord(
  id: number,
  updates: { status?: TicketStatus; description?: string }
): Promise<Ticket> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.status) payload.status = updates.status;
  if (updates.description) payload.description = updates.description;

  const { data, error } = await getSupabase()
    .from("tickets")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(`Failed to update ticket #${id}: ${error.message}`);
  if (!data) throw new Error(`Ticket #${id} not found`);
  return data;
}

/**
 * Get all support teams
 */
export async function getSupportTeams(): Promise<SupportTeam[]> {
  const { data, error } = await getSupabase().from("support_teams").select("*");
  if (error) throw new Error(`Failed to fetch support teams: ${error.message}`);
  return data || [];
}

/**
 * Get all SLA rules
 */
export async function getSLARules(): Promise<SLARule[]> {
  const { data, error } = await getSupabase().from("sla_rules").select("*");
  if (error) throw new Error(`Failed to fetch SLA rules: ${error.message}`);
  return data || [];
}

/**
 * Stretch goal: Get open P1 incidents for executive summary
 */
export async function getOpenP1Tickets(): Promise<Ticket[]> {
  const { data, error } = await getSupabase()
    .from("tickets")
    .select("*")
    .eq("priority", "P1")
    .in("status", ["open", "in_progress", "waiting_for_user"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch open P1 tickets: ${error.message}`);
  return data || [];
}
