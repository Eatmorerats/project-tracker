// ============================================================
// Sam's Project Tracker v2 — Seed Data
// Source of truth: SAMS_PROJECT_TRACKER_V2_SPEC.md Section 7
// ============================================================

const SEED_PROJECTS = [
  // ── BSW (Beach Street Wealth) Projects ──
  {
    id: "mc-email-agent",
    name: "Mission Control — Email Agent",
    category: "BSW",
    status: "Active",
    priority: "Critical",
    phases: [
      { name: "Phase 1: Core Engine", status: "done" },
      { name: "Phase 2: Gmail Integration", status: "done" },
      { name: "Phase 3: Embeddings + Copper + Audit", status: "done" },
      { name: "Phase 4: Learning Loop", status: "current" },
      { name: "Phase 5: Migration to Server", status: "pending" }
    ],
    currentPhase: 4,
    nextSteps: "Collect 20-30 logged drafts from Phase 3, then build diff engine for learning loop",
    notes: [
      { date: "2026-02-17", text: "Phase 3 deployed and running. 182-doc embedding library, Copper CRM connected, 16s pipeline. Gmail threaded drafts with AI Response - review label." },
      { date: "2026-02-19", text: "v2.0 production plan and 820-line build spec created for Claude Code." },
      { date: "2026-02-23", text: "OpenClaw removed from architecture. Lucy moving to MCP agent with tools/skills as leaner orchestration approach." }
    ],
    lastWorkedOn: "2026-02-19",
    createdAt: "2026-02-17"
  },
  {
    id: "mc-dashboard",
    name: "Mission Control — Dashboard",
    category: "BSW",
    status: "Planning",
    priority: "High",
    phases: [
      { name: "Design/UX Research", status: "done" },
      { name: "Frontend Build", status: "pending" },
      { name: "Agent Card System", status: "pending" },
      { name: "Live Activity Feed", status: "pending" },
      { name: "Multi-Agent Expansion", status: "pending" }
    ],
    currentPhase: 1,
    nextSteps: "Gated behind Email Agent Phase 4. Build after learning loop is proven.",
    notes: [
      { date: "2026-02-17", text: "Design inspired by Steven Shoaf's OpenClaw layout. Expandable agent cards, live activity feed, task board." },
      { date: "2026-02-23", text: "Will start BSW-focused, expand to personal Mission Control over time. Elevated to Phase 1.5 in v2.0 plan." }
    ],
    lastWorkedOn: "2026-02-19",
    createdAt: "2026-02-17"
  },
  {
    id: "samcalcs",
    name: "SamCalcs",
    category: "BSW",
    status: "Active",
    priority: "High",
    phases: [
      { name: "Core Platform", status: "done" },
      { name: "AMT Calculator", status: "done" },
      { name: "Debt Conversion Calculator", status: "done" },
      { name: "House Purchase Calculator", status: "current" },
      { name: "Car Lease/Buy Calculator", status: "pending" },
      { name: "Additional Modules", status: "pending" }
    ],
    currentPhase: 4,
    nextSteps: "Continue expanding with new calculator modules. Tax calculator logic reused across future builds.",
    notes: [
      { date: "2026-01-24", text: "Platform live with debt conversion and AMT modules. Expanding with house purchase and car lease/buy." }
    ],
    lastWorkedOn: "2026-01-24",
    createdAt: "2026-01-24"
  },
  {
    id: "life-plan",
    name: "Life Plan Build Out",
    category: "BSW",
    status: "Active",
    priority: "Medium",
    phases: [
      { name: "Excel Model", status: "done" },
      { name: "Client Presentation System", status: "done" },
      { name: "Web Application Conversion", status: "current" },
      { name: "Automation & Templates", status: "pending" }
    ],
    currentPhase: 3,
    nextSteps: "Continue converting Excel-based life plan model into web application for client presentations.",
    notes: [
      { date: "2025-12-18", text: "Parmar family plan showing $7.4M net worth improvement used as validation case." }
    ],
    lastWorkedOn: "2025-12-18",
    createdAt: "2025-12-18"
  },
  {
    id: "client-onboarding",
    name: "Client Onboarding Automation",
    category: "BSW",
    status: "Active",
    priority: "Medium",
    phases: [
      { name: "Copper Pipeline Design", status: "done" },
      { name: "Box Sign Integration", status: "current" },
      { name: "CRA Authorization Workflow", status: "done" },
      { name: "Data Collection Questionnaire", status: "pending" },
      { name: "Calendly Integration", status: "pending" },
      { name: "Full Automation", status: "pending" }
    ],
    currentPhase: 2,
    nextSteps: "Box Sign for engagement docs and CRA authorization. Data collection questionnaire design.",
    notes: [
      { date: "2026-01-16", text: "Copper pipeline mapped: Leads -> Plan Data Sent -> Presented -> Accepted -> Onboarded. Box Relay and Sign being researched." }
    ],
    lastWorkedOn: "2026-01-16",
    createdAt: "2026-01-16"
  },
  {
    id: "newsletter",
    name: "Newsletter & Tax Season Comms",
    category: "BSW",
    status: "Done",
    priority: "Low",
    phases: [
      { name: "2025 Newsletter Optimization", status: "done" },
      { name: "Box Upload Guide (HTML)", status: "done" },
      { name: "CRA Authorization Guide (HTML)", status: "done" },
      { name: "Client Distribution", status: "done" }
    ],
    currentPhase: 4,
    nextSteps: "Complete for this tax season cycle.",
    notes: [
      { date: "2026-02-09", text: "Newsletter optimized from 2024 version. Box Upload and CRA guides embedded as self-contained HTML — no hosting needed." }
    ],
    lastWorkedOn: "2026-02-09",
    createdAt: "2026-02-09"
  },

  // ── Personal Projects ──
  {
    id: "samoptions",
    name: "SAMOPTIONS",
    category: "Personal",
    status: "Parked",
    priority: "Medium",
    phases: [
      { name: "Phase 1: Foundation", status: "done" },
      { name: "Phase 2: Backtesting", status: "done" },
      { name: "Phase 3: Paper Trading", status: "done" },
      { name: "Phase 4: ML Optimization", status: "done" },
      { name: "Phase E.5: 10-Agent Architecture", status: "done" },
      { name: "Phase F: 50-Trade MVP Test", status: "pending" },
      { name: "Phase G: Full Agent Build", status: "pending" }
    ],
    currentPhase: 6,
    nextSteps: "On hold — collecting real market data. 50-trade MVP test with Gate 0 + Agent 1 + Agent 8 required before build resumes.",
    notes: [
      { date: "2026-02-15", text: "Architecture complete: 10-agent validation chain, agent-native UI with 3 autonomy modes (Manual/Copilot/Autopilot). Vol Surface Analyst (Agent 2) flagged as biggest data gap." },
      { date: "2026-02-23", text: "Decision: hold and collect data. Going gold for now." }
    ],
    lastWorkedOn: "2026-02-15",
    createdAt: "2026-02-15"
  },
  {
    id: "paycare",
    name: "PayCare",
    category: "Personal",
    status: "Done",
    priority: "Low",
    phases: [
      { name: "Phase 1: Core Engine", status: "done" },
      { name: "Phase 2: Payroll Logic", status: "done" },
      { name: "Phase 3: CRA Compliance", status: "done" },
      { name: "Phase 4: Frontend-Backend Integration", status: "done" }
    ],
    currentPhase: 4,
    nextSteps: "Production-ready Canadian payroll system for nanny employers. Complete.",
    notes: [
      { date: "2026-01-14", text: "Phase 4 complete. Frontend-backend integration done. Production-ready." }
    ],
    lastWorkedOn: "2026-01-14",
    createdAt: "2026-01-14"
  },
  {
    id: "desktop-testing-agent",
    name: "Desktop Testing Agent",
    category: "Personal",
    status: "Active",
    priority: "Medium",
    phases: [
      { name: "Architecture Design", status: "done" },
      { name: "Chrome Automation Core", status: "current" },
      { name: "User Persona Simulation", status: "pending" },
      { name: "Multi-App Testing", status: "pending" }
    ],
    currentPhase: 2,
    nextSteps: "Build autonomous agent that simulates user personas across PayCare, SAMOPTIONS, SamCalcs, BSW tools via Chrome.",
    notes: [],
    lastWorkedOn: "2026-02-01",
    createdAt: "2026-02-01"
  },
  {
    id: "whisperdesk",
    name: "WhisperDesk",
    category: "Personal",
    status: "Parked",
    priority: "Low",
    phases: [
      { name: "Concept & Planning", status: "pending" }
    ],
    currentPhase: 1,
    nextSteps: "Not started. Parked until capacity opens up.",
    notes: [],
    lastWorkedOn: null,
    createdAt: "2026-01-01"
  },
  {
    id: "rewind-day",
    name: "Rewind Day",
    category: "Personal",
    status: "Parked",
    priority: "Low",
    phases: [
      { name: "Concept & Planning", status: "pending" }
    ],
    currentPhase: 1,
    nextSteps: "Not started. Parked until capacity opens up.",
    notes: [],
    lastWorkedOn: null,
    createdAt: "2026-01-01"
  },
  {
    id: "tesla-key-pixel",
    name: "Tesla Key x Pixel Watch",
    category: "Personal",
    status: "Parked",
    priority: "Low",
    phases: [
      { name: "Research & Feasibility", status: "pending" }
    ],
    currentPhase: 1,
    nextSteps: "Not started. Future personal build.",
    notes: [],
    lastWorkedOn: null,
    createdAt: "2026-01-01"
  },
  {
    id: "project-tracker",
    name: "Project Tracker Dashboard",
    category: "Personal",
    status: "Active",
    priority: "High",
    phases: [
      { name: "v1 MVP", status: "done" },
      { name: "v2 Rebuild (Kanban + Focus + AI)", status: "current" },
      { name: "Claude AI Update Integration", status: "pending" }
    ],
    currentPhase: 2,
    nextSteps: "Rebuild with hybrid Kanban layout, BSW/Personal tags, focus section, AI update capability.",
    notes: [
      { date: "2026-02-23", text: "v1 assessed: solid data model but flat grid, no flow, done projects cluttering view. Rebuilding as v2 with swim lanes and focus section." }
    ],
    lastWorkedOn: "2026-02-23",
    createdAt: "2026-02-23"
  }
];

const SEED_ONGOING = [
  {
    id: "tax-calculator-skill",
    name: "Tax Calculator",
    category: "Ongoing",
    description: "Ongoing learning. Tax regulator logic reused across future SamCalcs modules. Skill, not a project.",
    lastWorkedOn: "2026-01-24"
  },
  {
    id: "samlearn",
    name: "SamLearn",
    category: "Ongoing",
    description: "YouTube transcript -> fundamentals pipeline. Takes links, transcribes, extracts key points for Code to consume. Ongoing tool.",
    lastWorkedOn: "2026-02-13"
  },
  {
    id: "antigravity-skills",
    name: "AntiGravity Skill Expansion",
    category: "Ongoing",
    description: "Ongoing process of expanding AntiGravity's capabilities. Not a discrete project.",
    lastWorkedOn: "2026-02-01"
  }
];

// Status lane order for Kanban
const STATUS_ORDER = ["Parked", "Planning", "Active", "Review", "Done"];

// Status config: emoji + label (color-blind safe)
const STATUS_CONFIG = {
  Parked:   { icon: "\u{1F534}", label: "Parked" },
  Planning: { icon: "\u{1F4CB}", label: "Planning" },
  Active:   { icon: "\u{1F528}", label: "Active" },
  Review:   { icon: "\u{1F50D}", label: "Review" },
  Done:     { icon: "\u2705",   label: "Done" }
};

// Priority config: symbol + border style (color-blind safe)
const PRIORITY_CONFIG = {
  Critical: { symbol: "\u25B2\u25B2\u25B2", borderStyle: "solid",  borderWidth: "2px", accent: "var(--priority-critical)" },
  High:     { symbol: "\u25B2\u25B2",       borderStyle: "dashed", borderWidth: "2px", accent: "var(--priority-high)" },
  Medium:   { symbol: "\u25B2",             borderStyle: "solid",  borderWidth: "1px", accent: "var(--priority-medium)" },
  Low:      { symbol: "\u2014",             borderStyle: "dotted", borderWidth: "1px", accent: "var(--priority-low)" }
};

// Category config
const CATEGORY_CONFIG = {
  BSW:      { icon: "\u{1F3E2}", label: "BSW" },
  Personal: { icon: "\u{1F3E0}", label: "Personal" }
};

// Staleness threshold in days
const STALE_DAYS = 14;
