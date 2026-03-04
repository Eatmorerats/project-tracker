# Project Tracker v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild Sam's Project Tracker from a flat card grid into a hybrid Kanban command center with focus section, AI update capability, and full color-blind accessibility.

**Architecture:** Vanilla JS with modular object pattern (DataStore, Renderer, Filters, Modal, Actions, App). localStorage-backed. No framework, no build step. Hybrid layout: stats header → focus section → Kanban lanes → ongoing tools → AI update panel.

**Tech Stack:** Vanilla JavaScript, HTML5, CSS3 (custom properties, grid, flexbox, backdrop-filter). Google Fonts: JetBrains Mono (headers), IBM Plex Sans (body). No external JS libraries. Use emoji for status/category/priority icons (🔴🔨📋🔍✅🏢🏠⚠️), NOT Ionicons — keeps zero dependencies.

**Design doc:** `docs/plans/2026-02-23-project-tracker-v2-design.md`

**IMPORTANT:** The spec is the source of truth. Do NOT improvise on layout, features, or project data. If an architecture decision is needed that's not covered in the spec, flag it and stop.

---

## Task 1: Seed Data File

**Files:**
- Create: `data.js`

**Step 1: Write seed data with all 13 projects + 3 ongoing tools**

`data.js` contains:
- `SEED_PROJECTS` array: 13 project objects matching the data model (6 BSW + 7 Personal)
- `SEED_ONGOING` array: 3 ongoing tool objects
- All data copied exactly from the spec — no inventing data

Data model per project:
```javascript
{
  id: String,           // kebab-case
  name: String,
  category: "BSW" | "Personal",
  status: "Parked" | "Planning" | "Active" | "Review" | "Done",
  priority: "Critical" | "High" | "Medium" | "Low",
  phases: [{ name: String, status: "done" | "current" | "pending" }],
  currentPhase: Number, // 1-indexed
  nextSteps: String,
  notes: [{ date: "YYYY-MM-DD", text: String }],
  lastWorkedOn: String | null,  // "YYYY-MM-DD"
  createdAt: String     // "YYYY-MM-DD"
}
```

Data model per ongoing tool:
```javascript
{
  id: String,
  name: String,
  category: "Ongoing",
  description: String,
  lastWorkedOn: String | null
}
```

Project inventory (copy exactly from spec section 6):

**BSW:**
1. mc-email-agent — Mission Control Email Agent, Active, Critical
2. mc-dashboard — Mission Control Dashboard, Planning, High
3. samcalcs — SamCalcs, Active, High
4. life-plan — Life Plan Build Out, Active, Medium
5. client-onboarding — Client Onboarding Automation, Active, Medium
6. newsletter — Newsletter & Tax Season Comms, Done, Low

**Personal:**
1. samoptions — SAMOPTIONS, Parked, Medium
2. paycare — PayCare, Done, Low
3. desktop-testing-agent — Desktop Testing Agent, Active, Medium
4. whisperdesk — WhisperDesk, Parked, Low
5. rewind-day — Rewind Day, Parked, Low
6. tesla-key-pixel — Tesla Key × Pixel Watch, Parked, Low
7. project-tracker — Project Tracker Dashboard, Active, High

**Ongoing:**
1. tax-calculator-skill — Tax Calculator
2. samlearn — SamLearn
3. antigravity-skills — AntiGravity Skill Expansion

Each project must include a `createdAt` field. Use the earliest note date, or `lastWorkedOn`, or "2026-01-01" as fallback.

**Step 2: Verify data.js loads**

Open browser console, confirm `SEED_PROJECTS.length === 13` and `SEED_ONGOING.length === 3`.

**Step 3: Commit**
```bash
git add data.js
git commit -m "feat: add v2 seed data with 13 projects and 3 ongoing tools"
```

---

## Task 2: HTML Skeleton

**Files:**
- Rewrite: `index.html`
- Delete: `Sam's Projects.html` (duplicate)

**Step 1: Build the full HTML structure**

The HTML must contain these sections in order:
1. `<head>` — Google Fonts (JetBrains Mono + IBM Plex Sans), link to styles.css. NO Ionicons — use emoji for all icons.
2. `.container` wrapper
3. `.stats-header` — stat items for: Active, BSW, Personal, Stale, Last Updated
4. `.focus-section` — container for top 2-3 priority cards (will be populated by JS)
5. `.kanban-board` — 5 `.kanban-lane` divs, each with header (icon + label) and `.lane-cards` container
   - Lane order: Parked (🔴), Planning (📋), Active (🔨), Review (🔍), Done (✅)
   - Done lane has a `.done-toggle` button: "Show archived (0)"
6. `.ongoing-section` — container for ongoing tools (muted style)
7. `.ai-update-section` — textarea + Apply button for Claude JSON paste
8. `.hud-controls` — floating buttons: Add Project, Export, Import, Copy Summary
9. `.modal` (hidden) — project detail/edit modal (reuse structure from v1, enhanced)
10. `<script src="data.js">` then `<script src="app.js">`

**Step 2: Delete duplicate HTML**
Remove `Sam's Projects.html`.

**Step 3: Verify structure**
Open index.html — should see empty sections with headers. No JS functionality yet but layout skeleton visible.

**Step 4: Commit**
```bash
git add index.html
git rm "Sam's Projects.html" 2>/dev/null; true
git commit -m "feat: v2 HTML skeleton with Kanban lanes, focus section, AI update"
```

---

## Task 3: CSS Foundation — Layout & Theme

**Files:**
- Rewrite: `styles.css`

**Step 1: Write CSS custom properties (design tokens)**

```css
:root {
  /* Backgrounds */
  --bg-void: #0a0e1a;
  --bg-surface: #111827;
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-hover: rgba(255, 255, 255, 0.08);

  /* Accent colors */
  --accent-cyan: #22d3ee;
  --accent-green: #4ade80;
  --accent-amber: #fbbf24;
  --accent-red: #f87171;
  --accent-purple: #a78bfa;

  /* Text */
  --text-primary: #f1f5f9;
  --text-secondary: #64748b;
  --text-muted: #475569;

  /* Typography */
  --font-display: 'JetBrains Mono', monospace;
  --font-body: 'IBM Plex Sans', system-ui, sans-serif;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
}
```

**Step 2: Write layout styles**

- Body: dark bg with radial gradient accents, font-body
- `.container`: max-width 1600px, padding
- `.stats-header`: flex row, space-between, stat items with glow
- `.focus-section`: grid with 1-3 columns for focus cards (larger cards)
- `.kanban-board`: flex row, 5 lanes, each lane min-width ~220px, horizontal scroll if needed
- `.kanban-lane`: flex column, vertical card stacking, lane header with icon
- `.lane-cards`: flex column, gap between cards
- `.ongoing-section`: reduced opacity/muted border style, smaller cards
- `.ai-update-section`: glass panel, textarea + button
- `.hud-controls`: fixed bottom-right, fab buttons

**Step 3: Write card styles**

- `.project-card`: glass panel, border varies by priority (solid/dashed/default/dotted)
- `.card-category-badge`: icon + text, small pill
- `.card-status-badge`: icon + text
- `.card-priority`: symbol (▲▲▲/▲▲/▲/—)
- `.card-phase-bar`: segmented progress with numeric label
- `.card-meta`: time since last worked, phase name
- `.card-next-step`: one-liner with left border accent

**Step 4: Write modal styles** (evolved from v1)

**Step 5: Write filter bar styles**

- `.filter-bar`: horizontal row of dropdown selects + sort dropdown
- Filter dropdowns styled to match theme

**Step 6: Responsive adjustments**
- Desktop-first
- Tablet: kanban lanes stack or scroll
- No mobile priority

**Step 7: Verify**
Open index.html — layout should be visible with proper spacing, colors, glassmorphism. Cards won't render yet (no JS) but section structure should be themed.

**Step 8: Commit**
```bash
git add styles.css
git commit -m "feat: v2 CSS foundation — command center theme, Kanban layout, card styles"
```

---

## Task 4: Core App Logic — DataStore & Card Rendering

**Files:**
- Create: `app.js`

**Step 1: Write CONSTANTS and Utils modules**

```javascript
const CONSTANTS = {
  STORAGE_KEY: 'sam_projects_v2',
  STATUSES: ['Parked', 'Planning', 'Active', 'Review', 'Done'],
  PRIORITIES: ['Critical', 'High', 'Medium', 'Low'],
  CATEGORIES: ['BSW', 'Personal', 'Ongoing'],
  STALE_DAYS: 14,
  STATUS_ICONS: { Parked: '🔴', Planning: '📋', Active: '🔨', Review: '🔍', Done: '✅' },
  PRIORITY_SYMBOLS: { Critical: '▲▲▲', High: '▲▲', Medium: '▲', Low: '—' },
  CATEGORY_ICONS: { BSW: '🏢', Personal: '🏠', Ongoing: '🔧' }
};

const Utils = {
  generateId: () => 'p_' + Date.now() + Math.random().toString(36).substr(2, 9),

  daysSince(dateStr) {
    if (!dateStr) return Infinity;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },

  timeAgo(dateStr) {
    if (!dateStr) return 'Never';
    const days = this.daysSince(dateStr);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + ' days ago';
    if (days < 30) return Math.floor(days / 7) + ' weeks ago';
    return Math.floor(days / 30) + ' months ago';
  },

  isStale(dateStr) {
    return this.daysSince(dateStr) > CONSTANTS.STALE_DAYS;
  },

  phaseProgress(project) {
    const done = project.phases.filter(p => p.status === 'done').length;
    return { done, total: project.phases.length, percent: Math.round((done / project.phases.length) * 100) };
  }
};
```

**Step 2: Write DataStore module**

Preserve the pattern from v1 but adapted for v2 data model:
- `init()` — load from localStorage, fall back to seed data from `data.js`
- `save()` — persist to localStorage
- `getAllProjects()`, `getProject(id)`, `addProject()`, `updateProject()`, `deleteProject()`
- `getOngoingTools()` — return ongoing tools array
- `exportData()`, `importData()` — JSON backup/restore
- `generateSummary()` — text summary for clipboard
- `applyAIUpdate(json)` — parse and apply Claude JSON update to matching project

State shape:
```javascript
{
  meta: { version: "2.0", lastUpdated: "YYYY-MM-DD" },
  projects: [...],
  ongoing: [...]
}
```

**Step 3: Write Renderer module**

The Renderer is the largest module. It handles:

- `renderAll()` — orchestrates full page render
- `renderStats(projects)` — update stat counters in header
- `renderFocusSection(projects)` — pick top 2-3 Active by priority, render focus cards
- `renderKanban(projects, filters)` — distribute projects into 5 lane containers
- `renderOngoing(tools)` — render ongoing tools section
- `createCard(project)` — build a single project card DOM element with all at-a-glance info:
  - Name, category badge, status badge, priority symbol + border style
  - Phase progress bar + "3/5" label
  - Current phase name
  - Time since last worked
  - Next step one-liner
  - Stale indicator (⚠️ + "Stale") if applicable
  - Click handler to open detail modal
- `createFocusCard(project)` — larger card with more detail (notes preview, expanded next steps)
- `createOngoingCard(tool)` — minimal card for ongoing tools

**Step 4: Verify**
Open index.html — all 13 projects should appear in correct Kanban lanes. Focus section shows top 2-3. Ongoing tools visible. Stats populated.

**Step 5: Commit**
```bash
git add app.js
git commit -m "feat: v2 core app logic — DataStore, Renderer, Kanban distribution"
```

---

## Task 5: Focus Section Logic

**Files:**
- Modify: `app.js` (Renderer.renderFocusSection)

**Step 1: Implement focus selection algorithm**

Focus section auto-surfaces projects matching ALL of:
1. Status === "Active"
2. Priority === "Critical" or "High"

Sort by: Critical first, then High. Within same priority, sort by lastWorkedOn (most recent first). Take top 3 max.

If no Critical/High active projects exist, show nothing (hide the section).

**Step 2: Build focus card**

Focus cards are larger than Kanban cards and show:
- Everything on a regular card PLUS:
- Notes preview (latest 1-2 notes)
- Full next steps text
- Phase list with checkmarks (✓ done, → current, ○ pending)

**Step 3: Verify**
Expected focus projects: Mission Control Email Agent (Critical), SamCalcs (High), Project Tracker Dashboard (High).

**Step 4: Commit**
```bash
git add app.js
git commit -m "feat: focus section auto-surfaces top priority active projects"
```

---

## Task 6: Filter & Sort System

**Files:**
- Modify: `app.js` (new Filters module)
- Modify: `index.html` (filter bar markup if not already present)

**Step 1: Write Filters module**

```javascript
const Filters = {
  state: {
    category: 'all',    // 'all' | 'BSW' | 'Personal'
    status: 'all',      // 'all' | 'Parked' | 'Planning' | 'Active' | 'Review' | 'Done'
    priority: 'all',    // 'all' | 'Critical' | 'High' | 'Medium' | 'Low'
    sortBy: 'lastWorked', // 'lastWorked' | 'priority' | 'name' | 'progress'
    showDone: false      // toggle for archived projects
  },

  apply(projects) {
    let filtered = [...projects];

    if (this.state.category !== 'all') {
      filtered = filtered.filter(p => p.category === this.state.category);
    }
    if (this.state.status !== 'all') {
      filtered = filtered.filter(p => p.status === this.state.status);
    } else if (!this.state.showDone) {
      filtered = filtered.filter(p => p.status !== 'Done');
    }
    if (this.state.priority !== 'all') {
      filtered = filtered.filter(p => p.priority === this.state.priority);
    }

    return this.sort(filtered);
  },

  sort(projects) {
    // Sort implementation based on this.state.sortBy
    // 'lastWorked': by lastWorkedOn desc (null at bottom)
    // 'priority': Critical > High > Medium > Low
    // 'name': alphabetical
    // 'progress': by % complete desc
  }
};
```

**Step 2: Wire filter dropdowns to Filters.state**

Each filter dropdown `<select>` triggers `Filters.state[key] = value` then `App.refresh()`.

**Step 3: Implement Done archive toggle**

- Done projects hidden by default (`showDone: false`)
- "Show archived (X)" button in Done lane header
- Click toggles `showDone` and re-renders
- Button text updates: "Show archived (2)" / "Hide archived"

**Step 4: Verify**
- Filter by BSW → only BSW projects in lanes
- Filter by Critical priority → only Mission Control Email Agent
- Sort by name → alphabetical
- Done toggle → shows/hides Newsletter and PayCare

**Step 5: Commit**
```bash
git add app.js index.html
git commit -m "feat: combinable filter/sort system with Done archive toggle"
```

---

## Task 7: Stats Header

**Files:**
- Modify: `app.js` (Renderer.renderStats)

**Step 1: Implement stats calculation**

Stats to display:
- **Active**: count of status === "Active" (expected: 6 — Email Agent, SamCalcs, Life Plan, Client Onboarding, Desktop Testing Agent, Project Tracker)
- **BSW**: count of category === "BSW" (expected: 6 total, 5 non-Done)
- **Personal**: count of category === "Personal" (expected: 7 total, 5 non-Done)
- **Stale**: count where Utils.isStale(lastWorkedOn) AND status !== "Done" AND status !== "Parked" (expected: varies)
- **Last Updated**: most recent lastWorkedOn across all projects, formatted as date

**Step 2: Verify**
Stats bar shows correct counts. Stale count accurate based on current date.

**Step 3: Commit**
```bash
git add app.js
git commit -m "feat: stats header with active, BSW, personal, stale counts"
```

---

## Task 8: Detail Modal

**Files:**
- Modify: `app.js` (Modal module)
- Modify: `index.html` (modal markup)
- Modify: `styles.css` (modal styles)

**Step 1: Build view-mode modal**

When a card is clicked, open modal showing:
- Project name (large), category badge, status badge, priority
- Full phase list with visual indicators:
  - ✓ done phases (green checkmark icon)
  - → current phase (cyan arrow, highlighted)
  - ○ pending phases (empty circle, muted)
- Phase progress bar + percentage
- Full next steps text
- Notes log (all notes, newest first, with dates)
- "📋 Get AI Update Prompt" button (see Task 9)
- "Edit" button → switches to edit mode
- "Close" button / Esc key

**Step 2: Build edit-mode modal**

When "Edit" is clicked in view mode, same modal switches to form:
- Title input
- Category dropdown (BSW / Personal)
- Status dropdown (Parked / Planning / Active / Review / Done)
- Priority dropdown (Critical / High / Medium / Low)
- Next Steps textarea
- Phase management (add/remove/reorder phases, change status)
- Add Note input + button
- Notes history (read-only)
- Save / Delete / Cancel buttons

Reuse the phase input pattern from v1's Modal module but with `done/current/pending` instead of `done/in-progress/pending`.

**Step 3: Verify**
- Click any card → modal opens with correct data
- Click Edit → form appears with pre-populated fields
- Save changes → card updates in Kanban
- Delete → project removed

**Step 4: Commit**
```bash
git add app.js index.html styles.css
git commit -m "feat: detail modal with view/edit modes, phase management, notes log"
```

---

## Task 9: AI Update Feature

**Files:**
- Modify: `app.js` (AIUpdate module)
- Modify: `index.html` (AI update section already in skeleton)

**Step 1: Build prompt generator**

"📋 Get AI Update Prompt" button in modal generates this text and copies to clipboard:

```
Review my project "[PROJECT NAME]" and give me a status update.
Current recorded status: [STATUS], Phase [N] ([PHASE NAME]), last worked [DATE].
Search my past chats for recent activity on this project.
Respond ONLY in this JSON format:
{
  "projectId": "[ID]",
  "status": "[STATUS]",
  "currentPhase": [N],
  "nextSteps": "...",
  "newNote": "...",
  "lastWorkedOn": "YYYY-MM-DD"
}
```

**Step 2: Build JSON paste applier**

The AI Update section at the bottom of the page has:
- Textarea with placeholder: "Paste Claude's JSON response here..."
- "Apply Update" button
- On apply:
  1. Parse JSON from textarea
  2. Validate: must have `projectId` matching an existing project
  3. Update fields: status, currentPhase, nextSteps, lastWorkedOn
  4. If `newNote` is non-empty, add it to notes array with today's date
  5. Auto-detect phase statuses: phases before currentPhase = "done", at currentPhase = "current", after = "pending"
  6. Save to DataStore, refresh UI
  7. Show success message with project name
  8. Clear textarea

Error handling:
- Invalid JSON → show error "Invalid JSON. Please paste the exact response from Claude."
- Unknown projectId → show error "Project not found: [id]"

**Step 3: Verify**
- Click "Get AI Update Prompt" on Email Agent → clipboard has correct prompt
- Paste valid JSON update → project card updates
- Paste invalid JSON → error message

**Step 4: Commit**
```bash
git add app.js
git commit -m "feat: AI update — prompt generator and JSON paste applier"
```

---

## Task 10: Add Project & Ongoing Tools Section

**Files:**
- Modify: `app.js`

**Step 1: Build "Add Project" flow**

"+" FAB button opens modal in add mode:
- Empty form with default values
- Category defaults to "Personal"
- Status defaults to "Planning"
- Priority defaults to "Medium"
- Default 3 phases: "Planning" (done), "Building" (pending), "Testing" (pending)
- Save creates new project, adds to DataStore, refreshes Kanban

**Step 2: Build Ongoing Tools section**

Render ongoing tools in the `.ongoing-section`:
- Muted style (lower opacity, smaller text, no priority/status badges)
- Each tool shows: name, description, last worked on
- These do NOT appear in Kanban lanes
- These are NOT filterable (always visible unless section is collapsed)

**Step 3: Verify**
- Add new project → appears in correct Kanban lane
- Ongoing tools visible in muted section below Kanban

**Step 4: Commit**
```bash
git add app.js
git commit -m "feat: add project flow and ongoing tools section"
```

---

## Task 11: Export/Import & Summary

**Files:**
- Modify: `app.js` (Actions module)

**Step 1: Implement export**

Export button downloads JSON file:
- Filename: `sam_projects_backup_YYYY-MM-DD.json`
- Contains: `{ meta, projects, ongoing }`
- Pretty-printed with 2-space indent

**Step 2: Implement import**

Import button:
- Opens file picker for .json files
- Validates structure (must have `projects` array)
- Replaces current state with imported data
- Refreshes entire UI
- Shows success/error message

**Step 3: Implement copy summary**

Copy Summary button generates text:
```
Sam's Project Status Report (2026-02-23)

ACTIVE:
• Mission Control — Email Agent [Critical] — Phase 4: Learning Loop — Last: 3 days ago
  Next: Collect 20-30 logged drafts from Phase 3...
• SamCalcs [High] — Phase 4: House Purchase Calculator — Last: 4 weeks ago
  Next: Continue expanding with new calculator modules...
[etc.]

PLANNING:
• Mission Control — Dashboard [High] — Phase 1: Design/UX Research
[etc.]

STALE (14+ days):
• [any stale projects]
```

**Step 4: Verify**
- Export → JSON file downloads with correct data
- Import → restores from backup
- Copy Summary → clipboard has formatted report

**Step 5: Commit**
```bash
git add app.js
git commit -m "feat: export/import JSON backup and copy summary"
```

---

## Task 12: Theme Polish & Animations

**Files:**
- Modify: `styles.css`

**Step 1: Refine glassmorphism**

- Cards: backdrop-filter blur, subtle inner shadow
- Focus cards: slightly larger, brighter border glow
- Kanban lane headers: subtle gradient accent matching status icon
- Body: deep navy with radial gradient accents (cyan top-left, purple bottom-right)

**Step 2: Priority border encoding**

```css
.project-card[data-priority="Critical"] { border: 2px solid var(--accent-red); }
.project-card[data-priority="High"]     { border: 2px dashed var(--accent-cyan); }
.project-card[data-priority="Medium"]   { border: 1px solid var(--glass-border); }
.project-card[data-priority="Low"]      { border: 1px dotted var(--glass-border); }
```

**Step 3: Animations**

- Cards: fade-in + slide-up on render (subtle, 200ms)
- Modal: fade-in backdrop + scale-up content (150ms)
- Filter changes: smooth opacity transition
- No excessive motion — respect user preference with `prefers-reduced-motion`

**Step 4: Verify**
- Cards have correct border styles by priority
- Animations feel smooth, not distracting
- `prefers-reduced-motion` disables animations

**Step 5: Commit**
```bash
git add styles.css
git commit -m "feat: theme polish — glassmorphism, priority borders, subtle animations"
```

---

## Task 13: Accessibility Pass

**Files:**
- Modify: `app.js`, `styles.css`, `index.html`

**Step 1: Verify all indicators work without color**

Checklist:
- [ ] Status badges: icon + text label (🔴 Parked, 📋 Planning, etc.)
- [ ] Priority: shape symbol (▲▲▲/▲▲/▲/—) + border style (solid/dashed/normal/dotted)
- [ ] Category badges: icon + text (🏢 BSW / 🏠 Personal)
- [ ] Phase progress: numeric label "3/5" alongside bar
- [ ] Stale indicator: ⚠️ icon + "Stale" text (not just amber border)

**Step 2: Grayscale test**

Apply CSS filter: `filter: grayscale(100%)` to body. Verify:
- Every piece of information is still readable
- No information is conveyed by color alone
- Priority levels distinguishable by border style
- Status distinguishable by icon + text

**Step 3: Keyboard navigation**

- Tab through filter dropdowns, cards, buttons
- Enter/Space to activate buttons and open modals
- Esc to close modal
- Focus indicators visible on all interactive elements

**Step 4: ARIA attributes**

- Cards: `role="article"`, `aria-label` with project name
- Kanban lanes: `role="region"`, `aria-label` with lane name
- Modal: `role="dialog"`, `aria-modal="true"`, focus trap
- Stats: `aria-live="polite"` for dynamic updates

**Step 5: Verify**
- Grayscale test passes
- Tab navigation works through all interactive elements
- Screen reader announces cards and sections correctly

**Step 6: Commit**
```bash
git add app.js styles.css index.html
git commit -m "feat: accessibility pass — color-blind safe, keyboard nav, ARIA"
```

---

## Task 14: Final Cleanup

**Files:**
- All files

**Step 1: Remove old v1 files**
- Delete `script.js` (replaced by `app.js`)
- Delete `style.css` (replaced by `styles.css`) — if not already overwritten
- Delete `seed_data.json` (replaced by `data.js`)

**Step 2: Verify full app**

End-to-end verification:
1. Open index.html fresh (clear localStorage)
2. Seed data loads → 13 projects in correct Kanban lanes
3. Focus section shows Email Agent, Project Tracker, SamCalcs (Critical first, then High sorted by lastWorkedOn)
4. Stats accurate (6 Active, 6 BSW, 7 Personal)
5. Filter by BSW → only BSW projects
6. Filter by Critical → only Email Agent
7. Sort by name → alphabetical
8. Done toggle → shows Newsletter + PayCare
9. Click card → modal opens with full details
10. Edit project → changes persist
11. Add new project → appears in lane
12. Delete project → removed
13. AI Update → prompt copies, JSON paste works
14. Export → downloads backup
15. Import → restores backup
16. Ongoing tools visible in muted section
17. Grayscale test → all info readable
18. Keyboard navigation → all elements accessible

**Step 3: Final commit**
```bash
git add -A
git commit -m "feat: Project Tracker v2 complete — Kanban command center"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Seed data | data.js |
| 2 | HTML skeleton | index.html |
| 3 | CSS foundation | styles.css |
| 4 | Core app + card rendering | app.js |
| 5 | Focus section | app.js |
| 6 | Filter/sort system | app.js, index.html |
| 7 | Stats header | app.js |
| 8 | Detail modal | app.js, index.html, styles.css |
| 9 | AI Update feature | app.js |
| 10 | Add project + ongoing tools | app.js |
| 11 | Export/import/summary | app.js |
| 12 | Theme polish + animations | styles.css |
| 13 | Accessibility pass | all files |
| 14 | Final cleanup + verification | all files |
