# Public Health Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a public personal health dashboard at `applehealthdata.com/dashboard/` powered by a static JSON snapshot exported from the Health Data Mac app, with a matching open-source template repo for others to fork.

**Architecture:** The Mac app exports a `health-data.json` snapshot file. The user commits it to the website repo. The dashboard HTML reads the JSON at load time and renders all metrics. A separate GitHub repo (`krumjahn/health-dashboard`) contains just the template (HTML + sample JSON) so anyone can fork and host their own.

**Tech Stack:** Static HTML, Tailwind CSS (CDN), Chart.js (CDN for sparklines), vanilla JS — no build step, no server, no framework.

---

## Phase 1: Define the JSON Schema

This is the most important step — the schema drives both the Mac app export and the dashboard display.

### Task 1: Design and document `health-data.json` schema

**Files:**
- Create: `docs/plans/health-data-schema.json` (sample file)

**Step 1: Write the sample JSON file**

Create `docs/plans/health-data-schema.json` with this exact structure:

```json
{
  "meta": {
    "exportedAt": "2026-04-11T09:00:00Z",
    "exportedBy": "Health Data Export & AI Analyzer",
    "version": "1.0",
    "owner": "Keith Rumjahn",
    "location": "Hong Kong"
  },
  "summary": {
    "dataStartDate": "2022-01-01",
    "dataEndDate": "2026-04-11",
    "totalDays": 1196,
    "activeDays": 1089
  },
  "today": {
    "date": "2026-04-11",
    "steps": 8432,
    "activeEnergy": 420,
    "exerciseMinutes": 35,
    "standHours": 10,
    "restingHeartRate": 58,
    "hrv": 52,
    "sleepHours": 7.2,
    "sleepQuality": "good",
    "weight": 72.4,
    "bodyFat": 14.2,
    "workouts": [
      { "type": "Running", "duration": 35, "calories": 380, "distance": 5.2 }
    ]
  },
  "last30Days": {
    "avgSteps": 9210,
    "avgSleepHours": 7.4,
    "avgRestingHR": 57,
    "avgHRV": 54,
    "totalWorkouts": 18,
    "totalActiveMinutes": 720,
    "avgWeight": 72.8,
    "stepsHistory": [
      { "date": "2026-03-12", "value": 10432 },
      { "date": "2026-03-13", "value": 7821 }
    ],
    "sleepHistory": [
      { "date": "2026-03-12", "value": 7.5 },
      { "date": "2026-03-13", "value": 6.8 }
    ],
    "hrvHistory": [
      { "date": "2026-03-12", "value": 56 },
      { "date": "2026-03-13", "value": 49 }
    ],
    "weightHistory": [
      { "date": "2026-03-12", "value": 73.1 },
      { "date": "2026-03-13", "value": 72.9 }
    ]
  },
  "allTime": {
    "totalSteps": 12450000,
    "totalWorkouts": 487,
    "totalActiveMinutes": 29400,
    "longestStreak": 142,
    "currentStreak": 23,
    "peakStepsDay": { "date": "2024-08-15", "value": 28432 },
    "lowestRestingHR": { "date": "2024-09-01", "value": 44 },
    "highestHRV": { "date": "2024-09-03", "value": 98 }
  },
  "workoutBreakdown": [
    { "type": "Running", "count": 210, "totalMinutes": 12600, "totalCalories": 126000 },
    { "type": "Cycling", "count": 87, "totalMinutes": 5220, "totalCalories": 43500 },
    { "type": "Strength Training", "count": 134, "totalMinutes": 8040, "totalCalories": 53600 },
    { "type": "Swimming", "count": 28, "totalMinutes": 1680, "totalCalories": 16800 },
    { "type": "Yoga", "count": 28, "totalMinutes": 1680, "totalCalories": 5600 }
  ],
  "nutrition": {
    "avgDailyCalories": 2100,
    "avgProtein": 145,
    "avgCarbs": 220,
    "avgFat": 72,
    "avgWater": 2.4
  },
  "vitals": {
    "avgBloodOxygen": 98.2,
    "avgRespiratoryRate": 14.8,
    "avgBodyTemp": 36.6
  }
}
```

**Step 2: Commit the schema**

```bash
git add docs/plans/health-data-schema.json
git commit -m "docs: add health dashboard JSON schema"
```

---

## Phase 2: Build the Dashboard Page

### Task 2: Replace existing `dashboard/index.html` with full dashboard

**Files:**
- Modify: `dashboard/index.html` (full rewrite)

**Step 1: Build the page**

The dashboard must have these sections in order:

1. **Header** — owner name, location, "Last updated: [exportedAt date]", "Data since [dataStartDate]"
2. **Today card strip** — steps / active energy / exercise mins / stand hours / sleep / resting HR / HRV / weight — 8 metric tiles in a responsive grid
3. **Streaks row** — current streak + longest streak + total workouts all-time + total active days
4. **30-day sparklines** — 4 charts (steps, sleep, HRV, weight) using Chart.js line charts, minimal style
5. **Workout breakdown** — horizontal bar chart or table of workout types with count + total hours
6. **All-time records** — peak steps day, lowest resting HR, highest HRV
7. **Nutrition & Vitals** — simple stat tiles (only if data present)
8. **CTA footer** — "Build your own dashboard" → links to GitHub template repo + App Store

Key implementation details:

```html
<!-- Load data -->
<script>
async function loadData() {
  const res = await fetch('/dashboard/health-data.json');
  const data = await res.json();
  renderDashboard(data);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  });
}

function renderDashboard(data) {
  // Set meta
  document.getElementById('last-updated').textContent = formatDate(data.meta.exportedAt);
  document.getElementById('owner-name').textContent = data.meta.owner;
  // ... render all sections
}

document.addEventListener('DOMContentLoaded', loadData);
</script>
```

Design style: dark background (`#020617`), same as applehealthdata.com. Rose/amber accents. Plus Jakarta Sans font. Metric tiles use glass-card style from the docs pages. Sparklines use Chart.js with `tension: 0.4`, no axes labels, just the line + area fill.

**Step 2: Create the sample data file**

Copy `docs/plans/health-data-schema.json` to `dashboard/health-data.json` — this is the placeholder until the real export is dropped in.

```bash
cp docs/plans/health-data-schema.json dashboard/health-data.json
```

**Step 3: Verify it works**

Open `dashboard/index.html` in the preview. All 8 today tiles should show values. Sparklines should render. No console errors.

**Step 4: Commit**

```bash
git add dashboard/index.html dashboard/health-data.json
git commit -m "feat: build public health dashboard with JSON data layer"
```

---

## Phase 3: Link Dashboard from Homepage

### Task 3: Add dashboard to homepage nav + a bento card

**Files:**
- Modify: `index.html` (nav link + bento card)

**Step 1: Add nav link**

Find the nav bar in `index.html`. Add "Dashboard" link alongside Docs, OpenClaw, etc.:

```html
<a href="/dashboard/" class="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
  Dashboard
</a>
```

**Step 2: Add bento card** (in the features/bento grid section)

```html
<a href="/dashboard/" class="bento-card group ...">
  <div class="flex items-center gap-3 mb-3">
    <div class="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center">
      <i data-lucide="bar-chart-2" class="w-5 h-5 text-white"></i>
    </div>
    <span class="font-bold text-white">Live Health Dashboard</span>
  </div>
  <p class="text-sm text-slate-400">My personal health data, publicly shared. Fork the template to build your own.</p>
</a>
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: link public health dashboard from homepage"
```

---

## Phase 4: Create the Open Source Template Repo

### Task 4: Set up `krumjahn/health-dashboard` GitHub repo

**Files:**
- Create: a new directory locally, then push to GitHub

**Step 1: Create repo structure locally**

```bash
mkdir -p /tmp/health-dashboard
cd /tmp/health-dashboard
git init
```

**Step 2: Copy dashboard files**

```bash
cp "/Users/keithrumjahn/Desktop/Projects/AppleHealthData Website/dashboard/index.html" /tmp/health-dashboard/index.html
cp "/Users/keithrumjahn/Desktop/Projects/AppleHealthData Website/dashboard/health-data.json" /tmp/health-dashboard/health-data.json
```

**Step 3: Write README.md**

The README should explain:
- What this is (fork-and-host personal health dashboard)
- How to update data (export from Health Data app → replace `health-data.json` → commit)
- How to host (GitHub Pages — just enable in repo settings, point to main branch)
- JSON schema reference (link to `health-data-schema.json`)
- Screenshot of the dashboard
- Link back to applehealthdata.com

**Step 4: Create GitHub repo and push**

```bash
cd /tmp/health-dashboard
gh repo create krumjahn/health-dashboard --public --description "Personal Apple Health dashboard template — fork it, drop in your data, host on GitHub Pages"
git add .
git commit -m "feat: initial health dashboard template"
git push -u origin main
```

**Step 5: Enable GitHub Pages**

```bash
gh api repos/krumjahn/health-dashboard/pages -X POST -f source='{"branch":"main","path":"/"}'
```

---

## Phase 5: Add "Export for Dashboard" to Mac App

### Task 5: Document the Mac app export format (handoff spec)

**Files:**
- Create: `docs/plans/mac-app-dashboard-export-spec.md`

This is a spec document for adding a "Export Dashboard JSON" button to the Mac app. It is **not implemented in this plan** — it's handed off to the Mac app development session.

The spec must document:
- Menu location: File → Export → Dashboard JSON
- Output file: `health-data.json` 
- All fields from the schema in Task 1
- Which HealthKit query types map to each field
- The `last30Days.stepsHistory` array format (array of `{date, value}` objects, one per day)
- How to compute `allTime.currentStreak` (consecutive days with steps > 500)

**Step 1: Write the spec**

```bash
git add docs/plans/mac-app-dashboard-export-spec.md
git commit -m "docs: add Mac app dashboard export spec for handoff"
```

---

## Commit Summary

| Commit | What |
|--------|------|
| `docs: add health dashboard JSON schema` | Schema reference file |
| `feat: build public health dashboard with JSON data layer` | Dashboard HTML + sample data |
| `feat: link public health dashboard from homepage` | Nav + bento card |
| `feat: initial health dashboard template` | GitHub template repo |
| `docs: add Mac app dashboard export spec for handoff` | Mac app implementation spec |

## What's NOT in this plan

- Actual Mac app code changes (separate session, uses the spec from Task 5)
- Charts library customization beyond basic sparklines
- Dark/light mode toggle
- Auth or private mode
- Remotion video for the dashboard (future)
