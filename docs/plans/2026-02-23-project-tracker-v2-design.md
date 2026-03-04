# Sam's Project Tracker v2 — Design Document

**Date:** 2026-02-23
**Status:** Approved
**Author:** Sameer (spec) + Claude (design consolidation)

---

## Context

Rebuilding Sam's Project Tracker from v1 (vanilla JS, cyberpunk glassmorphism, flat card grid, localStorage) into v2. The owner is Sameer — Operations Manager at Beach Street Wealth who runs 15+ personal and business projects simultaneously. He is color blind, so all visual indicators MUST use icons/labels/patterns alongside color — never color alone.

## Design Decisions (from brainstorming)

1. **Card details interaction**: Modal overlay (not inline expand, not slide-out panel). Keeps Kanban lanes clean and compact. Consistent with v1's edit modal pattern.
2. **Body font**: IBM Plex Sans (not Inter — too generic)
3. **Header font**: JetBrains Mono (tech/monospace feel for command center aesthetic)
4. **Phase status values**: `done` / `current` / `pending` (changed from v1's `in-progress`)

---

## 1. What to Keep from v1

- localStorage backend — no server, no database. Keep export/import JSON for backup.
- Modular object pattern (DataStore, Renderer, Modal, Actions, App) — clean separation.
- Phase progress bars — enhanced with % complete calculation and numeric labels.
- Staleness detection (14-day threshold) — enhanced with ⚠️ icon + "Stale" text alongside color.
- Notes log with timestamps — captures decision history.
- Zero dependencies — no build step, no framework, opens instantly.
- Cyberpunk glassmorphism theme — evolved into "Command Center" aesthetic.

## 2. What to Remove / Replace

- Flat card grid → Hybrid Kanban swim lanes grouped by status
- Duplicate HTML file → Keep only index.html
- Simple filter bar (mixed status/type) → Combinable multi-filter system
- Old seed data → Real project inventory (13 projects + 3 ongoing tools)
- Priority hidden in modal → Shown on card face with symbols + border styles
- No category distinction → BSW / Personal / Ongoing badges with icons

## 3. Architecture — Hybrid Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Stats bar (active count, BSW count, Personal   │
│  count, stale count, last updated timestamp)            │
├─────────────────────────────────────────────────────────┤
│  FOCUS SECTION: Top 2-3 highest-priority active         │
│  projects with more detail (next steps, phase, notes)   │
├─────────────────────────────────────────────────────────┤
│  KANBAN LANES (horizontal):                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Parked│ │Plan- │ │Active│ │Review│ │ Done │        │
│  │      │ │ning  │ │      │ │      │ │(arch)│        │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │
├─────────────────────────────────────────────────────────┤
│  ONGOING TOOLS: Separate section, muted style           │
├─────────────────────────────────────────────────────────┤
│  AI UPDATE: Textarea + Apply button for Claude JSON     │
└─────────────────────────────────────────────────────────┘
```

## 4. Card Design

### Card Face (at-a-glance)

- **Name** (bold)
- **Category badge**: 🏢 BSW or 🏠 Personal — icon + text label, not color alone
- **Status badge with icon**: 🔴 Parked, 📋 Planning, 🔨 Active, 🔍 Review, ✅ Done
- **Priority indicator**: ▲▲▲ Critical, ▲▲ High, ▲ Medium, — Low — shape symbols + border style
- **Phase progress bar** with "Phase 3/5" text label
- **Time since last worked**: "3 days ago", "2 weeks ago"
- **Current phase name**: e.g. "Phase 4 — Learning Loop"
- **Next step**: One-line summary

### Card Modal (click to open)

- Full phase list with checkmarks
- Complete notes log with timestamps
- Detailed next steps
- "📋 Get AI Update Prompt" button
- Edit / Delete project controls

### Priority Border Encoding (color-blind safe)

| Priority | Symbol | Border Style | Color Accent |
|----------|--------|-------------|--------------|
| Critical | ▲▲▲ | solid 2px | Red-ish |
| High | ▲▲ | dashed | Cyan |
| Medium | ▲ | normal 1px | Default |
| Low | — | dotted | Muted |

## 5. Filter & Sort System

Combinable AND logic:
- **Category**: All | BSW | Personal | Ongoing
- **Status**: All | Parked | Planning | Active | Review | Done
- **Priority**: All | Critical | High | Medium | Low
- **Sort by**: Last worked (default) | Priority | Name | % Complete

"Done" projects hidden by default behind toggle: "Show archived (X)"

## 6. Color-Blind Safe Design

Every visual indicator must work without color:
- Status indicators: icon + text label (not just colored dots)
- Priority: shape symbols (▲▲▲, ▲▲, ▲, —) + border style variations
- Category badges: icon + text ("🏢 BSW" / "🏠 Personal")
- Phase progress: numeric label ("3/5") alongside filled bar
- Staleness: ⚠️ icon + "Stale" text alongside border highlight
- Border styles encode priority (solid/dashed/normal/dotted)
- Test: strip all color to grayscale → every piece of information still readable

## 7. Project Inventory

### BSW Projects (6)
1. Mission Control — Email Agent (Active, Critical)
2. Mission Control — Dashboard (Planning, High)
3. SamCalcs (Active, High)
4. Life Plan Build Out (Active, Medium)
5. Client Onboarding Automation (Active, Medium)
6. Newsletter & Tax Season Comms (Done, Low)

### Personal Projects (7)
1. SAMOPTIONS (Parked, Medium)
2. PayCare (Done, Low)
3. Desktop Testing Agent (Active, Medium)
4. WhisperDesk (Parked, Low)
5. Rewind Day (Parked, Low)
6. Tesla Key × Pixel Watch (Parked, Low)
7. Project Tracker Dashboard (Active, High)

### Ongoing Tools (3)
1. Tax Calculator (ongoing skill)
2. SamLearn (ongoing tool)
3. AntiGravity Skill Expansion (ongoing process)

## 8. AI Update Feature

1. Each project card has "📋 Get AI Update Prompt" button
2. Generates pre-filled prompt for Claude chat with current project state
3. Claude responds in JSON format with updated fields
4. User pastes JSON into "📥 Paste AI Update" textarea
5. Tracker parses JSON and updates matching project card
6. Future v3: direct MCP API call (not for v2)

## 9. Data Model

```javascript
const project = {
  id: String,           // kebab-case unique identifier
  name: String,         // display name
  category: String,     // "BSW" | "Personal"
  status: String,       // "Parked" | "Planning" | "Active" | "Review" | "Done"
  priority: String,     // "Critical" | "High" | "Medium" | "Low"
  phases: [{
    name: String,       // e.g. "Phase 1: Core Engine"
    status: String      // "done" | "current" | "pending"
  }],
  currentPhase: Number, // 1-indexed
  nextSteps: String,    // one-liner
  notes: [{
    date: String,       // "YYYY-MM-DD"
    text: String
  }],
  lastWorkedOn: String | null,  // "YYYY-MM-DD" or null
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

## 10. Design Direction

**Theme**: Cyberpunk Command Center (evolved from v1)
- Glassmorphism + dark background + neon accents
- Typography: JetBrains Mono (headers), IBM Plex Sans (body)
- Color palette: Deep navy/charcoal bg, Cyan/teal primary, Amber warnings, Green done
- Cards: Frosted glass with border glow by priority + border style encoding
- Kanban: Subtle column headers with icon + label, vertical card stacking
- Animations: Subtle entrance, smooth filter transitions, no excessive motion
- Desktop-first (tablet usable, mobile not priority)

## 11. File Structure

```
Project Tracker/
├── index.html      // Single entry point
├── styles.css      // All styles
├── app.js          // Main application logic
├── data.js         // Seed data (full inventory)
└── docs/plans/     // Design documents
```

## 12. Build Order

1. Data model + seed data (all 13 projects + 3 ongoing tools)
2. Kanban layout with 5 swim lanes (Parked → Done)
3. Card component with all at-a-glance info
4. Focus section (auto-surfaces top 2-3 Critical/High Active)
5. Ongoing Tools section (separate, muted)
6. Filter/sort system (combinable)
7. Stats header
8. Modal for card details (full phases, notes, next steps)
9. AI Update feature (prompt generator + JSON paste applier)
10. Done archive toggle
11. Edit/add/delete project functionality
12. Export/import JSON
13. Cyberpunk command center theme
14. Accessibility pass (all indicators work without color)

## 13. What NOT to Build

- No drag-and-drop
- No multi-user / auth
- No notifications / push
- No external API integrations
- No server / database — localStorage only
- No framework — vanilla JS only
