# Oura + WHOOP Export Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create two SEO-optimised pages — `/export-oura-data/` and `/export-whoop-data/` — that cover native device export, Apple Health sync, and how to analyse the unified data with the app.

**Architecture:** Two standalone `index.html` files following the lightweight card-based pattern used in `export-apple-health-sleep-data/index.html`. Each page has: hero → video → native export steps → Apple Health sync section → comparison table → AI prompts → CTA. Both pages added to `sitemap.xml` and linked from the homepage/nav where relevant.

**Tech Stack:** HTML, Tailwind CDN, Plus Jakarta Sans, existing `ExportToCSV.mp4` (reused), Matomo + Umami analytics snippets copied from sibling pages.

---

### Task 1: Create `/export-oura-data/index.html`

**Files:**
- Create: `export-oura-data/index.html`

**Step 1: Create the directory and file**

```bash
mkdir -p "/Users/keithrumjahn/Desktop/Projects/AppleHealthData Website/export-oura-data"
```

**Step 2: Write the full page**

Use the card pattern from `export-apple-health-sleep-data/index.html` as the base. Full page content:

```html
<!doctype html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>How to Export Oura Ring Data to CSV (+ Apple Health Sync Guide)</title>
  <meta name="description" content="Step-by-step guide to export Oura Ring data as CSV, sync it to Apple Health, and analyse sleep, HRV, and readiness scores with AI on Mac." />
  <link rel="canonical" href="https://applehealthdata.com/export-oura-data/" />
  <meta name="keywords" content="export oura data, oura ring csv export, oura to apple health, oura ring data analysis, oura hrv export" />
  <meta name="apple-itunes-app" content="app-id=6749297170">
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://umami.rumjahn.synology.me/script.js" data-website-id="5d7b4fa8-90b2-4191-8daf-8ea487a8d961"></script>
  <script>
    var _paq = window._paq = window._paq || [];
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
      var u="//shrewd-lyrebird.pikapod.net/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', '9']);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Export Oura Ring Data to CSV",
    "description": "Export your Oura Ring sleep, HRV, and readiness data to CSV and sync it to Apple Health for unified analysis.",
    "step": [
      {"@type":"HowToStep","name":"Open the Oura app","text":"Navigate to the Oura app on iOS or Android and open your profile."},
      {"@type":"HowToStep","name":"Export data as CSV","text":"Go to Settings → Data Export → Download CSV to get a zip of your data."},
      {"@type":"HowToStep","name":"Enable Apple Health sync","text":"In Oura app Settings → Apps → Apple Health, enable sync for sleep, HRV, and readiness."},
      {"@type":"HowToStep","name":"Analyse with AI","text":"Export the unified Apple Health data with Health Data Export app and analyse with Claude, ChatGPT, or local LLMs."}
    ]
  }
  </script>
  <style>
    body{font-family:Plus Jakarta Sans,system-ui,-apple-system,sans-serif;background:#020617;color:#f8fafc}
    .mesh{position:fixed;inset:0;z-index:-1;background:radial-gradient(at 0% 0%,rgba(225,29,72,.16),transparent 50%),radial-gradient(at 100% 0%,rgba(56,189,248,.16),transparent 50%),radial-gradient(at 100% 100%,rgba(168,85,247,.16),transparent 50%);filter:blur(60px)}
    .card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:1rem}
    code{background:rgba(255,255,255,.08);padding:.1rem .35rem;border-radius:.35rem}
    table{width:100%;border-collapse:collapse}
    th,td{padding:.75rem 1rem;border-bottom:1px solid rgba(255,255,255,.08);text-align:left}
    th{color:#f9fafb;font-weight:600}
  </style>
</head>
<body>
  <div class="mesh"></div>
  <main class="max-w-4xl mx-auto px-4 py-10">
    <a href="/" class="text-slate-300 hover:text-white text-sm">← Back to home</a>

    <!-- Hero -->
    <section class="card p-8 mt-3 text-center">
      <p class="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-3">Oura Ring Data Export</p>
      <h1 class="text-4xl font-extrabold text-white mb-4">How to Export Oura Ring Data to CSV</h1>
      <p class="text-slate-300 text-lg max-w-2xl mx-auto">Get your Oura sleep, HRV, and readiness scores out of the app and into analysis-ready CSV — then unify everything with Apple Health for the complete picture.</p>
    </section>

    <!-- Video -->
    <div class="my-10 rounded-2xl overflow-hidden border border-white/10 shadow-xl shadow-black/40">
      <video autoplay muted loop playsinline class="w-full block">
        <source src="../images/ExportToCSV.mp4" type="video/mp4">
      </video>
      <p class="text-center text-sm text-slate-500 py-3 bg-slate-900/60">Export Oura data → sync to Apple Health → analyse everything together.</p>
    </div>

    <!-- Native export -->
    <section class="card p-6 mt-5">
      <h2 class="text-2xl font-bold text-white mb-4">Method 1: Export Directly from the Oura App</h2>
      <p class="text-slate-300 mb-4">The Oura app lets you download a full CSV export of all your data — sleep stages, HRV (rMSSD), readiness, activity, and more.</p>
      <ol class="list-decimal pl-6 space-y-3 text-slate-200">
        <li>Open the <strong>Oura app</strong> on your iPhone.</li>
        <li>Tap your <strong>profile icon</strong> (top left).</li>
        <li>Go to <strong>Settings → Data Export</strong>.</li>
        <li>Tap <strong>Download CSV</strong> — Oura emails you a download link within minutes.</li>
        <li>Unzip the file — you'll find separate CSVs for sleep, readiness, activity, and heart rate.</li>
      </ol>
      <div class="mt-5 p-4 rounded-xl bg-slate-900/60 border border-white/5 text-slate-400 text-sm">
        <strong class="text-slate-200">What you get:</strong> Clean CSVs with date-stamped rows for every metric Oura tracks — ideal for spreadsheet analysis or uploading to AI tools.
      </div>
    </section>

    <!-- Apple Health sync -->
    <section class="card p-6 mt-5">
      <h2 class="text-2xl font-bold text-white mb-4">Method 2: Sync Oura to Apple Health (Recommended)</h2>
      <p class="text-slate-300 mb-4">Oura syncs natively with Apple Health, pushing sleep stages, HRV, resting heart rate, and activity data into the unified HealthKit database. This lets you combine Oura data with Apple Watch, iPhone sensors, and other app data in one place.</p>
      <ol class="list-decimal pl-6 space-y-3 text-slate-200">
        <li>Open the <strong>Oura app</strong> and go to <strong>Settings → Apps → Apple Health</strong>.</li>
        <li>Enable sync for: <strong>Sleep Analysis, Heart Rate Variability, Resting Heart Rate, Active Energy, Steps</strong>.</li>
        <li>Open <strong>Apple Health → Sources → Oura</strong> to confirm data is flowing in.</li>
        <li>Use our <strong>Health Data Export app</strong> to pull all of it into a single clean CSV for AI analysis.</li>
      </ol>
    </section>

    <!-- Comparison table -->
    <section class="card p-6 mt-5">
      <h2 class="text-2xl font-bold text-white mb-4">Oura vs Apple Health: What Data Overlaps?</h2>
      <p class="text-slate-300 mb-4">Both platforms track similar metrics but with different methodologies. Understanding the overlap helps you get more from your analysis.</p>
      <div class="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Oura</th>
              <th>Apple Health</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody class="text-slate-300">
            <tr><td><strong>HRV</strong></td><td>rMSSD (overnight avg)</td><td>SDNN (spot checks)</td><td>~12% deviation is normal</td></tr>
            <tr><td><strong>Sleep stages</strong></td><td>REM, deep, light, awake</td><td>REM, core, deep, awake</td><td>Methodology differs</td></tr>
            <tr><td><strong>Resting HR</strong></td><td>Overnight avg</td><td>Daily lowest reading</td><td>Usually within 2–3 bpm</td></tr>
            <tr><td><strong>Readiness score</strong></td><td>✅ Oura-only</td><td>❌ Not available</td><td>Proprietary algorithm</td></tr>
            <tr><td><strong>Steps</strong></td><td>Estimated from ring</td><td>iPhone/Watch sensors</td><td>Apple Watch is more accurate</td></tr>
            <tr><td><strong>SpO2</strong></td><td>Overnight avg</td><td>Spot check (Apple Watch)</td><td>Both useful, different windows</td></tr>
          </tbody>
        </table>
      </div>
      <p class="text-slate-400 text-sm mt-4">See also: <a href="/analyze/oura-vs-apple-health-hrv/" class="text-rose-400 hover:underline">Deep dive: Oura HRV vs Apple Health HRV</a></p>
    </section>

    <!-- AI prompts -->
    <section class="card p-6 mt-5">
      <h2 class="text-2xl font-bold text-white mb-4">AI-Ready Prompts for Your Oura + Apple Health Data</h2>
      <div class="space-y-3">
        <div class="p-4 rounded-xl bg-slate-900/70 border border-white/5 text-slate-300 font-mono text-sm">"I have 6 months of Oura sleep data exported as CSV. Identify nights where readiness dropped below 70 and correlate with prior-day activity and alcohol flags."</div>
        <div class="p-4 rounded-xl bg-slate-900/70 border border-white/5 text-slate-300 font-mono text-sm">"Compare my Oura HRV trend with my Apple Health resting heart rate over the same period. Are they inversely correlated?"</div>
        <div class="p-4 rounded-xl bg-slate-900/70 border border-white/5 text-slate-300 font-mono text-sm">"Using this Oura + Apple Health export, give me a weekly recovery score and flag the 3 worst recovery weeks with likely causes."</div>
      </div>
    </section>

    <!-- CTA -->
    <section class="card p-8 mt-5 text-center bg-gradient-to-br from-rose-900/40 to-slate-900">
      <h2 class="text-2xl font-bold text-white mb-3">Analyse Oura + Apple Health Together</h2>
      <p class="text-slate-300 mb-6 max-w-xl mx-auto">Export your unified health data in one tap. 100% private, runs on your Mac — no cloud required.</p>
      <a href="https://apps.apple.com/us/app/health-data-export-ai-analyzer/id6749297170" class="inline-block bg-rose-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-rose-700 transition-all">Download on the App Store</a>
      <p class="mt-3 text-xs text-slate-500">100% Local & Private · Mac & iOS</p>
    </section>

    <!-- Next steps -->
    <section class="card p-6 mt-5">
      <h2 class="text-xl font-bold mb-3">Related guides</h2>
      <div class="flex flex-wrap gap-3 text-sm">
        <a href="/export-apple-health-data/" class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200">Full Apple Health export guide</a>
        <a href="/export-whoop-data/" class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200">Export WHOOP data</a>
        <a href="/analyze/oura-vs-apple-health-hrv/" class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200">Oura vs Apple Health HRV</a>
        <a href="/convert-tool/" class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200">XML → CSV converter</a>
      </div>
    </section>
  </main>
</body>
</html>
```

**Step 3: Verify file exists**
```bash
ls "/Users/keithrumjahn/Desktop/Projects/AppleHealthData Website/export-oura-data/index.html"
```

**Step 4: Commit**
```bash
git add export-oura-data/index.html
git commit -m "feat: add Oura Ring data export guide page"
```

---

### Task 2: Create `/export-whoop-data/index.html`

**Files:**
- Create: `export-whoop-data/index.html`

**Step 1: Create the directory**
```bash
mkdir -p "/Users/keithrumjahn/Desktop/Projects/AppleHealthData Website/export-whoop-data"
```

**Step 2: Write the full page**

Same card pattern, WHOOP-specific content:

```html
<!doctype html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>How to Export WHOOP Data to CSV (+ Apple Health Sync Guide)</title>
  <meta name="description" content="Step-by-step guide to export WHOOP strain, recovery, and sleep data as CSV, sync to Apple Health, and analyse with AI on Mac." />
  <link rel="canonical" href="https://applehealthdata.com/export-whoop-data/" />
  <meta name="keywords" content="export whoop data, whoop csv export, whoop apple health sync, whoop data analysis, whoop strain recovery export" />
  <meta name="apple-itunes-app" content="app-id=6749297170">
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://umami.rumjahn.synology.me/script.js" data-website-id="5d7b4fa8-90b2-4191-8daf-8ea487a8d961"></script>
  <script>
    var _paq = window._paq = window._paq || [];
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
      var u="//shrewd-lyrebird.pikapod.net/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', '9']);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Export WHOOP Data to CSV",
    "description": "Export your WHOOP strain, recovery, and sleep data to CSV and sync to Apple Health for unified AI analysis.",
    "step": [
      {"@type":"HowToStep","name":"Open WHOOP app","text":"Go to the WHOOP app and navigate to your profile settings."},
      {"@type":"HowToStep","name":"Request data export","text":"Go to Account → Privacy → Download My Data to receive a CSV export via email."},
      {"@type":"HowToStep","name":"Enable Apple Health sync","text":"In WHOOP app go to Settings → Device → Apple Health and enable the metrics you want synced."},
      {"@type":"HowToStep","name":"Analyse with AI","text":"Use Health Data Export app to pull the unified Apple Health data into CSV for AI analysis on Mac."}
    ]
  }
  </script>
  <style>
    body{font-family:Plus Jakarta Sans,system-ui,-apple-system,sans-serif;background:#020617;color:#f8fafc}
    .mesh{position:fixed;inset:0;z-index:-1;background:radial-gradient(at 0% 0%,rgba(225,29,72,.16),transparent 50%),radial-gradient(at 100% 0%,rgba(56,189,248,.16),transparent 50%),radial-gradient(at 100% 100%,rgba(168,85,247,.16),transparent 50%);filter:blur(60px)}
    .card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:1rem}
    code{background:rgba(255,255,255,.08);padding:.1rem .35rem;border-radius:.35rem}
    table{width:100%;border-collapse:collapse}
    th,td{padding:.75rem 1rem;border-bottom:1px solid rgba(255,255,255,.08);text-align:left}
    th{color:#f9fafb;font-weight:600}
  </style>
</head>
<body>
  <div class="mesh"></div>
  <main class="max-w-4xl mx-auto px-4 py-10">
    <a href="/" class="text-slate-300 hover:text-white text-sm">← Back to home</a>

    <!-- Hero -->
    <section class="card p-8 mt-3 text-center">
      <p class="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-3">WHOOP Data Export</p>
      <h1 class="text-4xl font-extrabold text-white mb-4">How to Export WHOOP Data to CSV</h1>
      <p class="text-slate-300 text-lg max-w-2xl mx-auto">Get your WHOOP strain, recovery, and sleep data out of the app and into analysis-ready CSV — then unify with Apple Health for the full picture.</p>
    </section>

    <!-- Video -->
    <div class="my-10 rounded-2xl overflow-hidden border border-white/10 shadow-xl shadow-black/40">
      <video autoplay muted loop playsinline class="w-full block">
        <source src="../images/ExportToCSV.mp4" type="video/mp4">
      </video>
      <p class="text-center text-sm text-slate-500 py-3 bg-slate-900/60">Export WHOOP data → sync to Apple Health → analyse everything together.</p>
    </div>

    <!-- Native export -->
    <section class="card p-6 mt-5">
      <h2 class="text-2xl font-bold text-white mb-4">Method 1: Export Directly from WHOOP</h2>
      <p class="text-slate-300 mb-4">WHOOP lets you download a full export of your data through their privacy portal — you'll receive CSVs covering strain, recovery, sleep, and heart rate.</p>
      <ol class="list-decimal pl-6 space-y-3 text-slate-200">
        <li>Open the <strong>WHOOP app</strong> on your iPhone.</li>
        <li>Tap your <strong>profile icon</strong> → <strong>Account</strong>.</li>
        <li>Scroll to <strong>Privacy</strong> → tap <strong>Download My Data</strong>.</li>
        <li>WHOOP emails you a download link — typically within 24 hours.</li>
        <li>Unzip to find CSVs for: cycles (strain), recoveries, sleeps, and heart rate.</li>
      </ol>
      <div class="mt-5 p-4 rounded-xl bg-slate-900/60 border border-white/5 text-slate-400 text-sm">
        <strong class="text-slate-200">What you get:</strong> Date-stamped rows for every WHOOP day cycle — strain score, recovery %, HRV (rMSSD), RHR, sleep performance, and more.
      </div>
    </section>

    <!-- Apple Health sync -->
    <section class="card p-6 mt-5">
      <h2 class="text-2xl font-bold text-white mb-4">Method 2: Sync WHOOP to Apple Health (Recommended)</h2>
      <p class="text-slate-300 mb-4">WHOOP syncs key metrics to Apple Health, letting you combine your strain and recovery data with Apple Watch activity, iPhone step counts, and other health data in one unified export.</p>
      <ol class="list-decimal pl-6 space-y-3 text-slate-200">
        <li>Open the <strong>WHOOP app</strong> → <strong>Settings</strong> → <strong>Device</strong> → <strong>Apple Health</strong>.</li>
        <li>Enable sync for: <strong>Heart Rate, Heart Rate Variability, Resting Heart Rate, Sleep Analysis, Active Energy, Workouts</strong>.</li>
        <li>Confirm in <strong>Apple Health → Sources → WHOOP</strong> that data is flowing in.</li>
        <li>Use our <strong>Health Data Export app</strong> to export everything as a single clean CSV for AI analysis.</li>
      </ol>
      <div class="mt-5 p-4 rounded-xl bg-amber-900/20 border border-amber-500/30 text-amber-200 text-sm">
        <strong>Note:</strong> WHOOP's proprietary Strain and Recovery scores do <em>not</em> sync to Apple Health — only raw biometric data (HR, HRV, sleep) does. Use the native WHOOP CSV export to retain those scores.
      </div>
    </section>

    <!-- Comparison table -->
    <section class="card p-6 mt-5">
      <h2 class="text-2xl font-bold text-white mb-4">WHOOP vs Apple Health: What Data Overlaps?</h2>
      <div class="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>WHOOP</th>
              <th>Apple Health</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody class="text-slate-300">
            <tr><td><strong>HRV</strong></td><td>rMSSD (overnight avg)</td><td>SDNN (spot checks)</td><td>Different measurement windows</td></tr>
            <tr><td><strong>Sleep stages</strong></td><td>REM, slow-wave, light, awake</td><td>REM, core, deep, awake</td><td>WHOOP uses wrist HR, Apple uses accel+HR</td></tr>
            <tr><td><strong>Strain score</strong></td><td>✅ WHOOP-only (0–21)</td><td>❌ Not available</td><td>Proprietary exertion algorithm</td></tr>
            <tr><td><strong>Recovery %</strong></td><td>✅ WHOOP-only</td><td>❌ Not available</td><td>Based on HRV, RHR, sleep, respiratory rate</td></tr>
            <tr><td><strong>Resting HR</strong></td><td>Overnight avg</td><td>Daily lowest reading</td><td>Usually within 2–4 bpm</td></tr>
            <tr><td><strong>Respiratory rate</strong></td><td>✅ Every night</td><td>Requires Apple Watch Ultra / Series 9+</td><td>WHOOP has better coverage</td></tr>
            <tr><td><strong>Workouts</strong></td><td>Syncs to Apple Health</td><td>Apple Watch auto-detects</td><td>Both capture, Apple Watch more granular GPS</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- AI prompts -->
    <section class="card p-6 mt-5">
      <h2 class="text-2xl font-bold text-white mb-4">AI-Ready Prompts for Your WHOOP + Apple Health Data</h2>
      <div class="space-y-3">
        <div class="p-4 rounded-xl bg-slate-900/70 border border-white/5 text-slate-300 font-mono text-sm">"I have 6 months of WHOOP recovery CSVs. Find the top 5 factors (sleep, strain, HRV) that predict a recovery score below 50% the next day."</div>
        <div class="p-4 rounded-xl bg-slate-900/70 border border-white/5 text-slate-300 font-mono text-sm">"Compare my WHOOP HRV trend with my Apple Health resting heart rate over the same 90 days. Identify any divergence periods and suggest causes."</div>
        <div class="p-4 rounded-xl bg-slate-900/70 border border-white/5 text-slate-300 font-mono text-sm">"Using this WHOOP + Apple Health export, build a weekly load management report: strain vs recovery balance, sleep debt, and one training recommendation."</div>
      </div>
    </section>

    <!-- CTA -->
    <section class="card p-8 mt-5 text-center bg-gradient-to-br from-rose-900/40 to-slate-900">
      <h2 class="text-2xl font-bold text-white mb-3">Analyse WHOOP + Apple Health Together</h2>
      <p class="text-slate-300 mb-6 max-w-xl mx-auto">Export your unified health data in one tap. 100% private, runs on your Mac — no cloud required.</p>
      <a href="https://apps.apple.com/us/app/health-data-export-ai-analyzer/id6749297170" class="inline-block bg-rose-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-rose-700 transition-all">Download on the App Store</a>
      <p class="mt-3 text-xs text-slate-500">100% Local & Private · Mac & iOS</p>
    </section>

    <!-- Next steps -->
    <section class="card p-6 mt-5">
      <h2 class="text-xl font-bold mb-3">Related guides</h2>
      <div class="flex flex-wrap gap-3 text-sm">
        <a href="/export-apple-health-data/" class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200">Full Apple Health export guide</a>
        <a href="/export-oura-data/" class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200">Export Oura Ring data</a>
        <a href="/export-apple-health-hrv-data/" class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200">Export HRV data</a>
        <a href="/convert-tool/" class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200">XML → CSV converter</a>
      </div>
    </section>
  </main>
</body>
</html>
```

**Step 3: Verify file exists**
```bash
ls "/Users/keithrumjahn/Desktop/Projects/AppleHealthData Website/export-whoop-data/index.html"
```

**Step 4: Commit**
```bash
git add export-whoop-data/index.html
git commit -m "feat: add WHOOP data export guide page"
```

---

### Task 3: Add both pages to sitemap.xml

**Files:**
- Modify: `sitemap.xml`

**Step 1: Find the last `<url>` block in sitemap.xml**

Open `sitemap.xml` and locate the closing `</urlset>` tag.

**Step 2: Insert two new URL entries before `</urlset>`**

```xml
  <url>
    <loc>https://applehealthdata.com/export-oura-data/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://applehealthdata.com/export-whoop-data/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

**Step 3: Commit**
```bash
git add sitemap.xml
git commit -m "chore: add oura and whoop export pages to sitemap"
```

---

### Task 4: Cross-link from the wearable quiz page

**Files:**
- Modify: `quiz/wearable/index.html`

**Step 1: Read the file to find the CTA / next steps section**

Open `quiz/wearable/index.html` and find where the quiz results link to related pages.

**Step 2: Add links to both new pages in the results/next steps area**

Add links to `/export-oura-data/` and `/export-whoop-data/` wherever Oura/WHOOP appear in the results or recommendations.

**Step 3: Commit**
```bash
git add quiz/wearable/index.html
git commit -m "feat: link oura/whoop export pages from wearable quiz results"
```

---

### Task 5: Push all commits

```bash
git push
```

---

## Success Criteria

- `/export-oura-data/` loads at applehealthdata.com/export-oura-data/
- `/export-whoop-data/` loads at applehealthdata.com/export-whoop-data/
- Both pages appear in sitemap.xml
- Both pages have: HowTo JSON-LD schema, canonical URL, Matomo + Umami tracking, video embed, comparison table, AI prompts, CTA
- Wearable quiz links to both new pages
