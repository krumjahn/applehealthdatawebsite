# OpenCLaw Apple Health SEO Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Own SEO for "OpenCLaw Apple Health" by creating a landing page and setup guide, then cross-linking from the homepage and sitemap.

**Architecture:** Two new static HTML pages matching the existing site design system (Plus Jakarta Sans, JetBrains Mono, slate-950 bg, glass cards, rose/sky/purple mesh gradient). Landing page targets awareness/concept keywords, blog guide targets how-to keywords. Homepage gets OpenCLaw mentions woven in. Sitemap updated.

**Tech Stack:** Static HTML, Tailwind CDN, Lucide icons, Matomo analytics (site ID 9)

---

### Task 1: Create OpenCLaw Landing Page

**Files:**
- Create: `openclaw-apple-health/index.html`

**Target keywords:**
- "OpenCLaw Apple Health"
- "OpenCLaw daily brief"
- "talk to Apple Health data"
- "AI Apple Health summary"
- "OpenCLaw health brief"
- "ask AI about my health"

**Page structure:**
1. Nav (matches site pattern)
2. Hero with badge "OpenCLaw Integration", h1 targeting primary keyword, subtitle explaining the value prop
3. Section: "What is OpenCLaw + Apple Health?" — explains the concept
4. Section: "How It Works" — visual 4-step flow (install app, import data, install ClawHub skill, ask for brief)
5. Section: "What You Get" — shows the daily brief output (status, what changed, suggestions, missing data)
6. Section: "Example Prompts" — prompt boxes with real example prompts
7. Section: "Privacy by Design" — local-first, read-only API, no cloud uploads
8. Section: "API Endpoints" — technical detail for power users showing the two endpoints
9. CTA block — download app + link to setup guide
10. Footer

**Step 1:** Create the `openclaw-apple-health/` directory and write `index.html` with complete content matching site design system.

**Step 2:** Verify file exists and HTML is well-formed.

**Step 3:** Commit.
```bash
git add openclaw-apple-health/index.html
git commit -m "feat: add OpenCLaw Apple Health SEO landing page"
```

---

### Task 2: Create OpenCLaw Setup Guide Blog Post

**Files:**
- Create: `blog/openclaw-apple-health-guide.html`

**Target keywords:**
- "how to use OpenCLaw with Apple Health"
- "OpenCLaw ClawHub health skill setup"
- "OpenCLaw daily health brief guide"
- "Apple Health AI daily check-in"

**Page structure:**
1. Nav (matches site pattern)
2. Hero with badge "Setup Guide", h1 targeting how-to keyword
3. Prerequisites callout (Mac, Health Data Export AI Analyzer app, OpenClaw account)
4. Step 1: Install the Mac App — link to App Store
5. Step 2: Import Apple Health Data — explain the export from iPhone, import into Mac app
6. Step 3: Install the ClawHub Skill — link to clawhub.ai/krumjahn/apple-health-export-analyzer
7. Step 4: Verify the Connection — show curl commands for /openclaw/status
8. Step 5: Ask for Your Daily Brief — show example prompts and expected output shape
9. Troubleshooting section (app not running, no dataset loaded, model can't fetch locally)
10. CTA block — links to landing page + app download
11. Footer

**Step 1:** Write `blog/openclaw-apple-health-guide.html` with complete content.

**Step 2:** Verify file exists.

**Step 3:** Commit.
```bash
git add blog/openclaw-apple-health-guide.html
git commit -m "feat: add OpenCLaw Apple Health setup guide"
```

---

### Task 3: Update Sitemap

**Files:**
- Modify: `sitemap.xml`

**Step 1:** Add two new `<url>` entries before the closing `</urlset>`:
```xml
<url>
  <loc>https://applehealthdata.com/openclaw-apple-health/</loc>
  <lastmod>2026-03-26</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://applehealthdata.com/blog/openclaw-apple-health-guide.html</loc>
  <lastmod>2026-03-26</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

**Step 2:** Commit.
```bash
git add sitemap.xml
git commit -m "feat: add OpenCLaw pages to sitemap"
```

---

### Task 4: Add OpenCLaw References to Homepage

**Files:**
- Modify: `index.html`

**Changes:**
1. Add "OpenCLaw" to the meta keywords tag
2. Add a nav link for OpenCLaw (e.g., "OpenCLaw" linking to `/openclaw-apple-health/`)
3. Add an OpenCLaw feature card/section in the main content area — positioned as a key integration, linking to the landing page

**Step 1:** Add keyword and nav link.

**Step 2:** Add feature section or bento card for OpenCLaw.

**Step 3:** Commit.
```bash
git add index.html
git commit -m "feat: add OpenCLaw references to homepage"
```
