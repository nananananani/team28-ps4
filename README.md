# DeskBot: IT Helpdesk Ticket Agent

Team 28 | PS4 | SRM Agentic AI Hackathon

## The problem
Employees at Zentrix Software face long delays for common IT issues like VPN drops, account lockouts, and software requests. The IT support team is inundated with repetitive inquiries and tickets routed to wrong teams without proper SLA prioritization.

## What our app does
- **Instant Knowledge Base Lookup**: DeskBot autonomously interrogates the IT Knowledge Base to guide employees through self-service troubleshooting steps before escalating.
- **Intelligent SLA & Team Routing**: If unresolved or critical, DeskBot auto-generates a Supabase ticket, mapping to the appropriate SLA priority (P1–P4) and support team (T1–T5).
- **Automated P1 Security Escalation**: Urgent threats (e.g. clicked phishing links, malware) trigger immediate P1 security tickets with 1-hour SLA response.
- **Real-Time Ticket Management**: Employees can check live ticket statuses, and IT administrators can triage, filter, and update ticket statuses in real time.
- **Executive P1 Incident Briefing**: On-demand agentic summaries of all active high-priority company incidents for IT management.

## Live demo
- Vercel link: https://team28-ps4.vercel.app (or your team deployment link)
- Passcode: srm2026
- Try this prompt: "My VPN keeps disconnecting since morning."

## Agent tools
| Tool | What it does | Reads or writes |
| --- | --- | --- |
| searchKnowledgeBase | Searches 25+ IT solutions in the knowledge base by keywords and category | Reads |
| createTicket | Creates an IT ticket with validated SLA priority (P1-P4) and team (T1-T5) in Supabase | Writes |
| getMyTickets | Retrieves active and historical tickets for logged-in employee E101 | Reads |
| getTicketStatus | Looks up specific ticket details and status by ID or keyword | Reads |
| updateTicket | Updates ticket status (e.g. in_progress, resolved) and notes in Supabase | Writes |
| summarizeOpenP1Tickets | Aggregates and summarizes all active P1 critical enterprise incidents | Reads |

## Database tables
- `employees`: Stores company staff profiles, department, office location, and assigned laptop model (logged-in user: E101 Karthik S).
- `support_teams`: Directory of 5 specialized IT teams (T1 Network & VPN, T2 Accounts & Access, T3 Hardware, T4 Software & Apps, T5 Security).
- `sla_rules`: Enforces SLA response and resolution deadlines across priorities (P1: 1h/4h, P2: 4h/8h, P3: 8h/24h, P4: 24h/72h).
- `kb_articles`: IT troubleshooting articles with problem titles, categories, search keywords, and step-by-step solutions.
- `tickets`: Central ticket store tracking employee, title, description, category, SLA priority, assigned team, status, and timestamps.

## Tech stack
Next.js, React, TypeScript, Tailwind CSS, Supabase, Gemini API (function calling), Zod, Vercel

## Team
| Name | Role | GitHub | Email |
| --- | --- | --- | --- |
| Janani Hema | Team Lead & Deployment | [nananananani](https://github.com/nananananani) | ayuuki478@gmail.com |
| Janani Shree | Frontend UI & API | [jananiii-777](https://github.com/jananiii-777) | janani214ever@gmail.com |
| Jayashrii | Database Engineer | [jayashriiSH](https://github.com/jayashriiSH) | pcmj.jayashriishankar@gmail.com |
| Manya | AI / Agent Specialist | [manyasharma1008](https://github.com/manyasharma1008) | manyasharma1008@users.noreply.github.com |

## Run it locally
1. npm install
2. Copy .env.example to .env.local and fill in the keys:
   - `GEMINI_API_KEY`: Google AI Studio API key
   - `GEMINI_MODEL`: gemini-2.5-flash (or gemini-3.8-flash)
   - `SUPABASE_URL`: Supabase project URL
   - `SUPABASE_SECRET_KEY`: Supabase service_role secret key
   - `APP_PASSCODE`: Team passcode (e.g. srm2026)
3. Run the database seed in Supabase SQL editor:
   - `seed/00_starter_example.sql`
   - `seed/ps4_it_helpdesk.sql`
4. npm run dev
5. Open http://localhost:3000 and enter your passcode.
