# ==============================================================================
# Script: setup-git-contributions.ps1
# Purpose: Commits all sections with exact author attribution for the 4 members
#          matching their assigned roles, and prepares branches for GitHub.
# ==============================================================================

param(
  [switch]$PushToRemote = $false
)

Write-Host "Setting up Git contribution history for Team 28 (PS4: DeskBot)..." -ForegroundColor Cyan

# Member 1: Janani Hema (Team Lead & Orchestration)
$LEAD_NAME = "Janani Hema"
$LEAD_EMAIL = "ayuuki478@gmail.com"

# Member 2: Jayashrii (Database Engineer)
$DB_NAME = "Jayashrii"
$DB_EMAIL = "pcmj.jayashriishankar@gmail.com"

# Member 3: Manya (AI / Agent Specialist)
$AI_NAME = "Manya"
$AI_EMAIL = "manyasharma1008@users.noreply.github.com"

# Member 4: Janani Shree (Frontend & API Lead)
$UI_NAME = "Janani Shree"
$UI_EMAIL = "janani214ever@gmail.com"

# Ensure on main branch
git checkout -B main

# 1. Base Project Setup Commit by Team Lead
git add .gitignore .env.example package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs proxy.ts app/globals.css app/layout.tsx lib/env.ts lib/auth.ts lib/dates.ts lib/gemini.ts lib/supabase.ts
git commit --author="$LEAD_NAME <$LEAD_EMAIL>" -m "feat(core): initialize Next.js App Router, passcode gate, and environment configuration"

# 2. Database Layer Commit by Jayashrii
git add seed/ps4_it_helpdesk.sql seed/00_starter_example.sql lib/types.ts lib/db.ts
git commit --author="$DB_NAME <$DB_EMAIL>" -m "feat(database): implement PS4 IT Helpdesk schema, seed data, and typed Supabase client queries"

# 3. AI Agent Core Commit by Manya
git add lib/agent/
git commit --author="$AI_NAME <$AI_EMAIL>" -m "feat(agent): implement DeskBot tools, Zod argument validation, and Gemini function calling loop"

# 4. Frontend & REST API Commit by Janani Shree
git add app/api/ components/ app/page.tsx
git commit --author="$UI_NAME <$UI_EMAIL>" -m "feat(frontend): build Helpdesk Chat, My Tickets dashboard, IT Admin triage board, and REST APIs"

# 5. Documentation & Presentation Commit by Team Lead
git add README.md SLIDES.md
git commit --author="$LEAD_NAME <$LEAD_EMAIL>" -m "docs: complete hackathon README, 5-slide deck outline, and Vercel deployment guide"

Write-Host "`nGit log summary:" -ForegroundColor Green
git log --oneline --format="%h - %an <%ae> : %s" -n 5

if ($PushToRemote) {
  Write-Host "`nPushing main branch to origin..." -ForegroundColor Yellow
  git push -u origin main --force
} else {
  Write-Host "`nDone! Run 'git push -u origin main' whenever you are ready." -ForegroundColor Green
}
