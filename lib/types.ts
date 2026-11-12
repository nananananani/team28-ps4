export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  location: string;
  laptop_model: string | null;
}

export interface SupportTeam {
  id: string;
  name: string;
  handles: string;
}

export type SLAPriority = "P1" | "P2" | "P3" | "P4";

export interface SLARule {
  priority: SLAPriority;
  meaning: string;
  response_hours: number;
  resolve_hours: number;
}

export interface KBArticle {
  id: number;
  title: string;
  category: string;
  keywords: string;
  solution_steps: string;
  team_id: string;
}

export type TicketStatus = "open" | "in_progress" | "waiting_for_user" | "resolved" | "closed";

export interface Ticket {
  id: number;
  employee_id: string;
  title: string;
  description: string;
  category: string;
  priority: SLAPriority;
  team_id: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

export interface TicketWithDetails extends Ticket {
  employee?: Employee;
  team?: SupportTeam;
  sla?: SLARule;
}
