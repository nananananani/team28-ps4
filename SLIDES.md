# DeskBot: 5-Slide Presentation Outline
### SRM Agentic AI Hackathon · Problem Statement 4 (PS4)
**Team 28: DeskBot**

---

## Slide 1: Title & Team
- **Project Name**: DeskBot — Enterprise IT Helpdesk AI Agent
- **Problem Statement**: PS4: IT Helpdesk Ticket Agent (IT Services)
- **Organization Simulated**: Zentrix Software
- **Team Members & Roles**:
  - **Janani Hema** (Team Lead & Deployment)
  - **Janani Shree** (Frontend UI & API Engineer)
  - **Jayashrii** (Database Engineer)
  - **Manya** (AI / Agent Specialist)

---

## Slide 2: The Business Problem & Opportunity
- **The Bottleneck**:
  - IT support teams are flooded with hundreds of repetitive tickets every week (password resets, VPN disconnects, software installation requests).
  - High mean-time-to-resolution (MTTR) as tickets are assigned to wrong queues by users.
  - Critical security threats (phishing clicks, malware alerts) risk getting lost in low-priority ticket backlogs.
- **The Impact**:
  - Employee productivity stalls while waiting hours for basic troubleshooting.
  - Enterprise security risk escalation.

---

## Slide 3: Solution & Live Demo Flow
- **DeskBot Approach**:
  - Employees interact naturally in plain English via a responsive web portal.
  - **Self-Service First**: Automatically queries internal Knowledge Base (25+ curated IT procedures) before opening any ticket.
  - **Autonomous Escalation**: If self-service fails or issue is critical, auto-creates Supabase tickets with calibrated SLA priorities (`P1`–`P4`) and specialized support teams (`T1`–`T5`).
- **Live Demo Test Cases**:
  1. *"My VPN keeps disconnecting since morning."* → Agent executes `searchKnowledgeBase`, provides 5-step fix.
  2. *"I clicked a strange link in an email."* → Agent identifies security threat, creates immediate `P1` ticket to Team `T5` (Security) with 1h SLA.
  3. *"What is the status of my laptop ticket?"* → Agent executes `getTicketStatus`, fetches live status.

---

## Slide 4: Agentic Architecture & Function Calling
- **Agentic Workflow**:
  - Client sends message history to Next.js API route (`/api/agent`).
  - Google Gemini API (`@google/genai`) inspects tool declarations.
  - Gemini autonomously selects the appropriate tool and arguments.
  - Arguments strictly validated server-side by **Zod schemas** before execution.
  - Real-time Supabase PostgreSQL read/write operations.
  - Result returned to Gemini; iterative loop until final natural language resolution.
- **Tools Implemented**:
  - `searchKnowledgeBase` (Reads)
  - `createTicket` (Writes to Supabase)
  - `getMyTickets` (Reads)
  - `getTicketStatus` (Reads)
  - `updateTicket` (Writes to Supabase)
  - `summarizeOpenP1Tickets` (Reads)

---

## Slide 5: Results, Impact & Deliverables
- **Key Achievements**:
  - **80% Deflection Target**: Over 60–80% of common IT issues deflected through proactive knowledge base discovery without human technician intervention.
  - **Guaranteed SLA Compliance**: Automated priority mapping prevents high-severity tickets from lingering in wrong departments.
  - **Fullstack Stack Adherence**: Built entirely on Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase, and Google Gemini API.
- **Deliverables**:
  - **GitHub Repository**: https://github.com/nananananani/team28-ps4
  - **Live Vercel Application**: Deployable on Vercel with passcode protection
  - **Passcode**: `srm2026`
