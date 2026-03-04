# Sam's Project Tracker v2 — Full Build Spec

> **This is the source of truth.** Do NOT improvise on layout, features, or project data. If you need an architecture decision not covered here, flag it and stop — the user will bring it back to their planning chat.

---

## Context

Rebuilding Sam's Project Tracker from v1 (vanilla JS, cyberpunk glassmorphism, flat card grid, localStorage) into v2. The owner is Sameer — Operations Manager at Beach Street Wealth who runs 15+ personal and business projects simultaneously. He is **color blind**, so all visual indicators MUST use icons/labels/patterns alongside color — never color alone.

## Key Design Decisions (pre-approved)

1. **Card details**: Modal overlay (not inline expand, not slide-out panel)
2. **Body font**: IBM Plex Sans (not Inter)
3. **Header font**: JetBrains Mono (monospace for command center feel)
4. **Phase statuses**: `done` / `current` / `pending` (not v1's `in-progress`)
5. **Icons**: Emoji only (🔴🔨📋🔍✅🏢🏠⚠️). NO Ionicons, NO icon libraries. Zero dependencies.
6. **Framework**: None. Vanilla JS only. No build step.

---

## 1. What to Keep from v1

- localStorage backend — no server, no database. Keep export/import JSON for backup.
- Modular object pattern (DataStore, Renderer, Modal, Actions, App) — clean separation, keep it.
- Phase progress bars — enhanced with % complete calculation and numeric labels.
- Staleness detection (14-day threshold) — keep, but add ⚠️ icon + "Stale" text alongside color.
- Notes log with timestamps — keep. This captures decision history.
- Zero dependencies — no build step, no framework, opens instantly.
- Cyberpunk glassmorphism theme — keep the aesthetic DNA, evolve into "Command Center."

## 2. What to Remove / Replace

- Flat card grid → Replace with hybrid Kanban swim lanes grouped by status
- Duplicate HTML file (`Sam's Projects.html` and `index.html`) → Keep only `index.html`
- Simple filter bar that mixes status and type → Replace with combinable multi-filter system
- Old seed data (7 projects, 4 done) → Replace with the real project inventory below
- Priority hidden in edit modal → Show priority on card face with symbols + border styles
- No category distinction → Add BSW / Personal / Ongoing badges with icons

---

## 3. Architecture — Hybrid Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Stats bar (active count, BSW count, Personal   │
│  count, stale count, last updated timestamp)            │
├─────────────────────────────────────────────────────────┤
│  FOCUS SECTION: Top 2-3 highest-priority active         │
│  projects with more detail (next steps, phase, notes)   │
├─────────────────────────────────────────────────────────┤
│  KANBAN LANES (horizontal scroll or wrap):              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Parked│ │Plan- │ │Active│ │Review│ │ Done │        │
│  │      │ │ning  │ │      │ │      │ │(arch)│        │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │
├─────────────────────────────────────────────────────────┤
│  ONGOING TOOLS/SKILLS: Separate section, muted style,   │
│  always-visible but doesn't compete with active work    │
├─────────────────────────────────────────────────────────┤
│  AI UPDATE SECTION: Textarea + button to paste Claude   │
│  JSON status updates that auto-populate project cards   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Card Design

### Card Face (at-a-glance)

Each project card shows:
- **Project name** (bold)
- **Category badge**: 🏢 BSW or 🏠 Personal — icon + text, not color alone
- **Status badge with icon**: 🔴 Parked, 📋 Planning, 🔨 Active, 🔍 Review, ✅ Done
- **Priority indicator**: ▲▲▲ Critical, ▲▲ High, ▲ Medium, — Low — shape symbols + border style
- **Phase progress bar** with "Phase 3/5" text label
- **Time since last worked**: "3 days ago", "2 weeks ago" — on card face
- **Current phase name**: e.g. "Phase 4 — Learning Loop"
- **Next step**: One-line summary of what's next
- **Stale indicator**: ⚠️ + "Stale" text if inactive 14+ days (not just border color)

### Card Modal (click to open)

- Full phase list with checkmarks (✓ done, → current, ○ pending)
- Notes log with timestamps (newest first)
- Detailed next steps
- "📋 Get AI Update Prompt" button
- Edit / Delete project controls

### Priority Border Encoding (color-blind safe)

| Priority | Symbol | Border Style | Color Accent |
|----------|--------|-------------|--------------|
| Critical | ▲▲▲ | solid 2px | Red-ish |
| High | ▲▲ | dashed 2px | Cyan |
| Medium | ▲ | solid 1px | Default |
| Low | — | dotted 1px | Muted |

---

## 5. Filter & Sort System

Filters are combinable (AND logic):
- **Category**: All | BSW | Personal | Ongoing
- **Status**: All | Parked | Planning | Active | Review | Done
- **Priority**: All | Critical | High | Medium | Low
- **Sort by**: Last worked (default) | Priority | Name | % Complete

"Done" projects hidden by default behind a toggle: "Show archived (X)"

---

## 6. Color-Blind Safe Design

**CRITICAL** — Sameer is color blind. Every visual indicator must work without color:
- All status indicators use icon + text label, not just colored dots
- Priority uses shape symbols (▲▲▲, ▲▲, ▲, —) alongside any color accent
- Category badges use icon + text ("🏢 BSW" / "🏠 Personal")
- Phase progress bars show numeric label ("3/5") not just filled bar
- Staleness uses ⚠️ icon + "Stale" text alongside the border highlight
- If using color accents, pair with: border style variations (solid/dashed/dotted), or opacity differences
- **Test**: if you strip all color to grayscale, every piece of information should still be readable

---

## 7. Full Project Inventory

### BSW (Beach Street Wealth) Projects

```json
{
  "id": "mc-email-agent",
  "name": "Mission Control — Email Agent",
  "category": "BSW",
  "status": "Active",
  "priority": "Critical",
  "phases": [
    {"name": "Phase 1: Core Engine", "status": "done"},
    {"name": "Phase 2: Gmail Integration", "status": "done"},
    {"name": "Phase 3: Embeddings + Copper + Audit", "status": "done"},
    {"name": "Phase 4: Learning Loop", "status": "current"},
    {"name": "Phase 5: Migration to Server", "status": "pending"}
  ],
  "currentPhase": 4,
  "nextSteps": "Collect 20-30 logged drafts from Phase 3, then build diff engine for learning loop",
  "notes": [
    {"date": "2026-02-17", "text": "Phase 3 deployed and running. 182-doc embedding library, Copper CRM connected, 16s pipeline. Gmail threaded drafts with AI Response - review label."},
    {"date": "2026-02-19", "text": "v2.0 production plan and 820-line build spec created for Claude Code."},
    {"date": "2026-02-23", "text": "OpenClaw removed from architecture. Lucy moving to MCP agent with tools/skills as leaner orchestration approach."}
  ],
  "lastWorkedOn": "2026-02-19",
  "createdAt": "2026-02-17"
}
```

```json
{
  "id": "mc-dashboard",
  "name": "Mission Control — Dashboard",
  "category": "BSW",
  "status": "Planning",
  "priority": "High",
  "phases": [
    {"name": "Design/UX Research", "status": "done"},
    {"name": "Frontend Build", "status": "pending"},
    {"name": "Agent Card System", "status": "pending"},
    {"name": "Live Activity Feed", "status": "pending"},
    {"name": "Multi-Agent Expansion", "status": "pending"}
  ],
  "currentPhase": 1,
  "nextSteps": "Gated behind Email Agent Phase 4. Build after learning loop is proven.",
  "notes": [
    {"date": "2026-02-17", "text": "Design inspired by Steven Shoaf's OpenClaw layout. Expandable agent cards, live activity feed, task board."},
    {"date": "2026-02-23", "text": "Will start BSW-focused, expand to personal Mission Control over time. Elevated to Phase 1.5 in v2.0 plan."}
  ],
  "lastWorkedOn": "2026-02-19",
  "createdAt": "2026-02-17"
}
```

```json
{
  "id": "samcalcs",
  "name": "SamCalcs",
  "category": "BSW",
  "status": "Active",
  "priority": "High",
  "phases": [
    {"name": "Core Platform", "status": "done"},
    {"name": "AMT Calculator", "status": "done"},
    {"name": "Debt Conversion Calculator", "status": "done"},
    {"name": "House Purchase Calculator", "status": "current"},
    {"name": "Car Lease/Buy Calculator", "status": "pending"},
    {"name": "Additional Modules", "status": "pending"}
  ],
  "currentPhase": 4,
  "nextSteps": "Continue expanding with new calculator modules. Tax calculator logic reused across future builds.",
  "notes": [
    {"date": "2026-01-24", "text": "Platform live with debt conversion and AMT modules. Expanding with house purchase and car lease/buy."}
  ],
  "lastWorkedOn": "2026-01-24",
  "createdAt": "2026-01-24"
}
```

```json
{
  "id": "life-plan",
  "name": "Life Plan Build Out",
  "category": "BSW",
  "status": "Active",
  "priority": "Medium",
  "phases": [
    {"name": "Excel Model", "status": "done"},
    {"name": "Client Presentation System", "status": "done"},
    {"name": "Web Application Conversion", "status": "current"},
    {"name": "Automation & Templates", "status": "pending"}
  ],
  "currentPhase": 3,
  "nextSteps": "Continue converting Excel-based life plan model into web application for client presentations.",
  "notes": [
    {"date": "2025-12-18", "text": "Parmar family plan showing $7.4M net worth improvement used as validation case."}
  ],
  "lastWorkedOn": "2025-12-18",
  "createdAt": "2025-12-18"
}
```

```json
{
  "id": "client-onboarding",
  "name": "Client Onboarding Automation",
  "category": "BSW",
  "status": "Active",
  "priority": "Medium",
  "phases": [
    {"name": "Copper Pipeline Design", "status": "done"},
    {"name": "Box Sign Integration", "status": "current"},
    {"name": "CRA Authorization Workflow", "status": "done"},
    {"name": "Data Collection Questionnaire", "status": "pending"},
    {"name": "Calendly Integration", "status": "pending"},
    {"name": "Full Automation", "status": "pending"}
  ],
  "currentPhase": 2,
  "nextSteps": "Box Sign for engagement docs and CRA authorization. Data collection questionnaire design.",
  "notes": [
    {"date": "2026-01-16", "text": "Copper pipeline mapped: Leads -> Plan Data Sent -> Presented -> Accepted -> Onboarded. Box Relay and Sign being researched."}
  ],
  "lastWorkedOn": "2026-01-16",
  "createdAt": "2026-01-16"
}
```

```json
{
  "id": "newsletter",
  "name": "Newsletter & Tax Season Comms",
  "category": "BSW",
  "status": "Done",
  "priority": "Low",
  "phases": [
    {"name": "2025 Newsletter Optimization", "status": "done"},
    {"name": "Box Upload Guide (HTML)", "status": "done"},
    {"name": "CRA Authorization Guide (HTML)", "status": "done"},
    {"name": "Client Distribution", "status": "done"}
  ],
  "currentPhase": 4,
  "nextSteps": "Complete for this tax season cycle.",
  "notes": [
    {"date": "2026-02-09", "text": "Newsletter optimized from 2024 version. Box Upload and CRA guides embedded as self-contained HTML — no hosting needed."}
  ],
  "lastWorkedOn": "2026-02-09",
  "createdAt": "2026-02-09"
}
```

### Personal Projects

```json
{
  "id": "samoptions",
  "name": "SAMOPTIONS",
  "category": "Personal",
  "status": "Parked",
  "priority": "Medium",
  "phases": [
    {"name": "Phase 1: Foundation", "status": "done"},
    {"name": "Phase 2: Backtesting", "status": "done"},
    {"name": "Phase 3: Paper Trading", "status": "done"},
    {"name": "Phase 4: ML Optimization", "status": "done"},
    {"name": "Phase E.5: 10-Agent Architecture", "status": "done"},
    {"name": "Phase F: 50-Trade MVP Test", "status": "pending"},
    {"name": "Phase G: Full Agent Build", "status": "pending"}
  ],
  "currentPhase": 6,
  "nextSteps": "On hold — collecting real market data. 50-trade MVP test with Gate 0 + Agent 1 + Agent 8 required before build resumes.",
  "notes": [
    {"date": "2026-02-15", "text": "Architecture complete: 10-agent validation chain, agent-native UI with 3 autonomy modes (Manual/Copilot/Autopilot). Vol Surface Analyst (Agent 2) flagged as biggest data gap."},
    {"date": "2026-02-23", "text": "Decision: hold and collect data. Going gold for now."}
  ],
  "lastWorkedOn": "2026-02-15",
  "createdAt": "2026-02-15"
}
```

```json
{
  "id": "paycare",
  "name": "PayCare",
  "category": "Personal",
  "status": "Done",
  "priority": "Low",
  "phases": [
    {"name": "Phase 1: Core Engine", "status": "done"},
    {"name": "Phase 2: Payroll Logic", "status": "done"},
    {"name": "Phase 3: CRA Compliance", "status": "done"},
    {"name": "Phase 4: Frontend-Backend Integration", "status": "done"}
  ],
  "currentPhase": 4,
  "nextSteps": "Production-ready Canadian payroll system for nanny employers. Complete.",
  "notes": [
    {"date": "2026-01-14", "text": "Phase 4 complete. Frontend-backend integration done. Production-ready."}
  ],
  "lastWorkedOn": "2026-01-14",
  "createdAt": "2026-01-14"
}
```

```json
{
  "id": "desktop-testing-agent",
  "name": "Desktop Testing Agent",
  "category": "Personal",
  "status": "Active",
  "priority": "Medium",
  "phases": [
    {"name": "Architecture Design", "status": "done"},
    {"name": "Chrome Automation Core", "status": "current"},
    {"name": "User Persona Simulation", "status": "pending"},
    {"name": "Multi-App Testing", "status": "pending"}
  ],
  "currentPhase": 2,
  "nextSteps": "Build autonomous agent that simulates user personas across PayCare, SAMOPTIONS, SamCalcs, BSW tools via Chrome.",
  "notes": [],
  "lastWorkedOn": "2026-02-01",
  "createdAt": "2026-02-01"
}
```

```json
{
  "id": "whisperdesk",
  "name": "WhisperDesk",
  "category": "Personal",
  "status": "Parked",
  "priority": "Low",
  "phases": [
    {"name": "Concept & Planning", "status": "pending"}
  ],
  "currentPhase": 1,
  "nextSteps": "Not started. Parked until capacity opens up.",
  "notes": [],
  "lastWorkedOn": null,
  "createdAt": "2026-01-01"
}
```

```json
{
  "id": "rewind-day",
  "name": "Rewind Day",
  "category": "Personal",
  "status": "Parked",
  "priority": "Low",
  "phases": [
    {"name": "Concept & Planning", "status": "pending"}
  ],
  "currentPhase": 1,
  "nextSteps": "Not started. Parked until capacity opens up.",
  "notes": [],
  "lastWorkedOn": null,
  "createdAt": "2026-01-01"
}
```

```json
{
  "id": "tesla-key-pixel",
  "name": "Tesla Key x Pixel Watch",
  "category": "Personal",
  "status": "Parked",
  "priority": "Low",
  "phases": [
    {"name": "Research & Feasibility", "status": "pending"}
  ],
  "currentPhase": 1,
  "nextSteps": "Not started. Future personal build.",
  "notes": [],
  "lastWorkedOn": null,
  "createdAt": "2026-01-01"
}
```

```json
{
  "id": "project-tracker",
  "name": "Project Tracker Dashboard",
  "category": "Personal",
  "status": "Active",
  "priority": "High",
  "phases": [
    {"name": "v1 MVP", "status": "done"},
    {"name": "v2 Rebuild (Kanban + Focus + AI)", "status": "current"},
    {"name": "Claude AI Update Integration", "status": "pending"}
  ],
  "currentPhase": 2,
  "nextSteps": "Rebuild with hybrid Kanban layout, BSW/Personal tags, focus section, AI update capability.",
  "notes": [
    {"date": "2026-02-23", "text": "v1 assessed: solid data model but flat grid, no flow, done projects cluttering view. Rebuilding as v2 with swim lanes and focus section."}
  ],
  "lastWorkedOn": "2026-02-23",
  "createdAt": "2026-02-23"
}
```

### Ongoing Tools / Skills (separate section, not in Kanban lanes)

```json
[
  {
    "id": "tax-calculator-skill",
    "name": "Tax Calculator",
    "category": "Ongoing",
    "description": "Ongoing learning. Tax regulator logic reused across future SamCalcs modules. Skill, not a project.",
    "lastWorkedOn": "2026-01-24"
  },
  {
    "id": "samlearn",
    "name": "SamLearn",
    "category": "Ongoing",
    "description": "YouTube transcript -> fundamentals pipeline. Takes links, transcribes, extracts key points for Code to consume. Ongoing tool.",
    "lastWorkedOn": "2026-02-13"
  },
  {
    "id": "antigravity-skills",
    "name": "AntiGravity Skill Expansion",
    "category": "Ongoing",
    "description": "Ongoing process of expanding AntiGravity's capabilities. Not a discrete project.",
    "lastWorkedOn": "2026-02-01"
  }
]
```

---

## 8. AI Update Feature

### How it works:

Each project card has a "📋 Get AI Update Prompt" button. When clicked, it generates a pre-filled prompt the user can paste into Claude chat. Example output:

```
Review my project "Mission Control — Email Agent" and give me a status update.
Current recorded status: Active, Phase 4 (Learning Loop), last worked 2026-02-19.
Search my past chats for recent activity on this project.
Respond ONLY in this JSON format:
{
  "projectId": "mc-email-agent",
  "status": "Active",
  "currentPhase": 4,
  "nextSteps": "...",
  "newNote": "...",
  "lastWorkedOn": "YYYY-MM-DD"
}
```

The tracker has a "📥 Paste AI Update" textarea + "Apply" button. User pastes the JSON response from Claude, tracker parses it and updates the relevant project card. This keeps the tracker self-updating through Claude without needing API keys or hosting.

**Future enhancement (not for v2, document only):**
When Lucy moves to MCP, the tracker could call Claude's API directly via a button — no copy-paste needed. Park this for v3.

---

## 9. Design Direction

**Theme**: Cyberpunk Command Center (evolved from v1)
- Keep the glassmorphism, dark background, neon accents
- Evolve to feel more like a mission control / command center
- Typography: JetBrains Mono for headers, IBM Plex Sans for body (both from Google Fonts)
- Color palette: Deep navy/charcoal background. Cyan/teal primary accent. Amber for warnings/stale. Green for done. Use opacity and border-style variations for color-blind safety.
- Cards: Frosted glass effect with subtle border glow based on priority level. Border STYLE changes with priority (solid = critical, dashed = high, normal = medium, dotted = low) — works without color.
- Kanban columns: Subtle column headers with emoji icon + label. Vertical card stacking within each lane.
- Animations: Subtle entrance animations for cards. Smooth transitions when filtering. No excessive motion. Respect `prefers-reduced-motion`.

**Responsive:**
- Desktop-first (personal tool used on laptop/monitor)
- Should be usable on tablet if needed
- Mobile is not a priority

---

## 10. Data Model

```javascript
const project = {
  id: String,           // kebab-case unique identifier
  name: String,         // display name
  category: String,     // "BSW" | "Personal"
  status: String,       // "Parked" | "Planning" | "Active" | "Review" | "Done"
  priority: String,     // "Critical" | "High" | "Medium" | "Low"
  phases: [
    {
      name: String,     // e.g. "Phase 1: Core Engine"
      status: String    // "done" | "current" | "pending"
    }
  ],
  currentPhase: Number, // 1-indexed, which phase is current
  nextSteps: String,    // one-liner of what's next
  notes: [
    {
      date: String,     // "YYYY-MM-DD"
      text: String      // decision/update note
    }
  ],
  lastWorkedOn: String | null,  // "YYYY-MM-DD" or null if never started
  createdAt: String     // "YYYY-MM-DD"
};

const ongoingTool = {
  id: String,
  name: String,
  category: "Ongoing",
  description: String,
  lastWorkedOn: String | null
};
```

---

## 11. File Structure

```
Project Tracker/
├── index.html          // Single entry point (remove duplicate Sam's Projects.html)
├── styles.css          // All styles
├── app.js              // Main application logic
└── data.js             // Seed data (the project inventory above)
```

Keep it as few files as possible. Vanilla JS, no framework, no build step.

---

## 12. Build Order

1. Set up data model + seed data with all projects above (`data.js`)
2. Build the HTML skeleton with Kanban layout, focus section, all containers (`index.html`)
3. Build the CSS foundation — command center theme, Kanban layout, card styles (`styles.css`)
4. Build the core app logic — DataStore, Renderer, card component with all at-a-glance info (`app.js`)
5. Build the Focus section that auto-surfaces top 2-3 Critical/High priority Active projects
6. Build the Ongoing Tools section (separate, muted)
7. Build the filter/sort system (combinable filters)
8. Build the stats header (active count, BSW count, personal count, stale count)
9. Build the expand modal for card details (full phases, notes, next steps)
10. Build the AI Update feature (prompt generator + JSON paste applier)
11. Build Done archive toggle (hide/show completed projects)
12. Add edit/add/delete project functionality (keep from v1)
13. Add export/import JSON (keep from v1)
14. Apply the cyberpunk command center theme polish + animations
15. Accessibility pass — verify all indicators work without color, keyboard navigation, ARIA

### Verification Counts

- **Active projects**: 6 (Email Agent, SamCalcs, Life Plan, Client Onboarding, Desktop Testing Agent, Project Tracker)
- **BSW total**: 6 (5 non-Done)
- **Personal total**: 7 (5 non-Done)
- **Done projects**: 2 (Newsletter, PayCare)
- **Parked projects**: 4 (SAMOPTIONS, WhisperDesk, Rewind Day, Tesla Key)
- **Planning projects**: 1 (MC Dashboard)
- **Focus section**: Email Agent (Critical), Project Tracker (High, most recent), SamCalcs (High)

---

## 13. What NOT to Build

- No drag-and-drop (complexity for little gain on personal tracker)
- No multi-user / auth
- No notifications / push
- No external API integrations (yet)
- No server / database — localStorage only
- No framework — vanilla JS only
- No Ionicons or external icon libraries — emoji only
