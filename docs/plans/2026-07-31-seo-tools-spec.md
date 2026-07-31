# Free SEO Tool Pages — Shared Build Spec

Build one self-contained static tool page: a single `index.html` in the assigned directory at the repo root of `/Users/keithrumjahn/Desktop/Projects/AppleHealthData Website`. No build step, no external JS beyond the CDN libs below. All logic runs 100% client-side — this is the site's core privacy promise and must be stated prominently on every page ("Your data never leaves your browser").

## Head / boilerplate (copy this pattern)

```html
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{Tool Name} — Free Online Tool | Apple Health Data</title>
    <meta name="description" content="{~155 chars, includes target keyword, mentions free + private/in-browser}">
    <meta name="keywords" content="{5-10 comma-separated keyword variants}">
    <meta name="apple-itunes-app" content="app-id=6749297170">
    <link rel="canonical" href="https://applehealthdata.com/{slug}/">
    <meta property="og:title" content="...">
    <meta property="og:description" content="...">
    <meta property="og:url" content="https://applehealthdata.com/{slug}/">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="...">
    <meta name="twitter:description" content="...">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script defer src="https://umami.rumjahn.synology.me/script.js" data-website-id="5d7b4fa8-90b2-4191-8daf-8ea487a8d961"></script>
    <!-- Matomo -->
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
</head>
```

## Design system (match the rest of the site exactly)

- Font: `Plus Jakarta Sans` via Google Fonts (preconnect + preload pattern), `JetBrains Mono` for code.
- Body: `background-color:#020617; color:#f8fafc;`
- Fixed mesh-gradient background div:
  `.mesh-gradient { position: fixed; inset: 0; z-index: -1; background: radial-gradient(at 0% 0%, rgba(225,29,72,.15), transparent 50%), radial-gradient(at 100% 0%, rgba(56,189,248,.15), transparent 50%), radial-gradient(at 100% 100%, rgba(168,85,247,.15), transparent 50%); filter: blur(60px); }`
- Glass cards: `background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:1rem`
- Fixed top nav (copy from below), accent color rose-600, primary buttons `bg-rose-600 hover:bg-rose-700 rounded-full font-bold`, secondary `bg-white/10 hover:bg-white/20`.
- Nav (fixed, backdrop-blur):
```html
<nav class="fixed w-full z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-20">
    <a href="/" class="flex items-center gap-3">
      <div class="w-10 h-10 bg-gradient-to-tr from-rose-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20"><i data-lucide="activity" class="w-6 h-6 text-white"></i></div>
      <div><span class="font-bold text-lg tracking-tight text-white block leading-none">Health Data</span><span class="text-xs text-slate-400 tracking-wider uppercase font-semibold">Export &amp; Analyze</span></div>
    </a>
    <a href="/tools/" class="text-slate-300 hover:text-white text-sm font-semibold">All Free Tools</a>
  </div></div>
</nav>
```
- `<main class="pt-32 pb-20">`, content in `max-w-4xl mx-auto px-4`.
- End of body: `<script>lucide.createIcons();</script>`

## Page structure (top to bottom)

1. **H1** with target keyword + one-sentence subhead ("Free, private, runs entirely in your browser — nothing is uploaded").
2. **The tool itself** — interactive, above the fold, in a glass card. This is the star; make it genuinely useful and polished.
3. **How to use** — 3-5 numbered steps.
4. **SEO content section** (~400-700 words): what the tool does, why the problem exists, how results are calculated (formulas explained), interpretation guidance. Write for a real reader, not keyword stuffing. Use h2/h3 like the site does (`text-3xl font-bold text-white`, body `text-lg text-slate-400`).
5. **FAQ** — 4-6 questions, visible on page AND as `FAQPage` JSON-LD.
6. **Cross-links** — "More free tools" row of pill links: `/tools/` hub, `/convert-tool/` (XML→CSV converter), `/apple-health-export-validator/`, plus 2-3 sibling tools from the list below.
7. **CTA block** — "Want deeper analysis?" → `<a href="/go/website.html?c={campaign}">Download iOS App</a>` (rose button) + `<a href="https://github.com/krumjahn/applehealth">Get Mac Analyzer</a>` (slate button).

## Structured data (JSON-LD in head or top of body)

- `SoftwareApplication`: name, applicationCategory "HealthApplication", operatingSystem "Any (web browser)", offers price "0" USD, url.
- `FAQPage` mirroring the on-page FAQ.

## File-upload tools: parsing export.xml

Apple Health `export.xml` files are commonly 100MB-1GB+. **Do NOT use DOMParser on the whole file** — it will crash the tab. Use streaming chunk parsing:

- Read via `file.slice(offset, offset+CHUNK)` (e.g. 8MB chunks) + `TextDecoder`, keep a carry-over buffer for tags split across chunk boundaries.
- Records are single self-closing lines like:
  `<Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" sourceVersion=".." device=".." unit="count" creationDate="2024-01-01 08:00:00 +0800" startDate="..." endDate="..." value="123"/>`
- Match with regex per record; extract attributes with a second regex. Show a progress bar (records parsed / bytes processed) since parsing can take 10-60s.
- Common types: `HKQuantityTypeIdentifierStepCount`, `HKQuantityTypeIdentifierHeartRate`, `HKQuantityTypeIdentifierRestingHeartRate`, `HKQuantityTypeIdentifierHeartRateVariabilitySDNN`, `HKQuantityTypeIdentifierActiveEnergyBurned`, `HKQuantityTypeIdentifierDistanceWalkingRunning`, `HKCategoryTypeIdentifierSleepAnalysis` (value = `HKCategoryValueSleepAnalysisAsleepCore/Deep/REM/Unspecified`, `InBed`, `Awake`).
- Workouts: `<Workout workoutActivityType="HKWorkoutActivityTypeRunning" duration=".." durationUnit="min" ... startDate=".." endDate="..">` (may be multi-line with child elements until `</Workout>`).
- Accept both drag-drop and file input. Also accept the `.zip` gracefully: if the file name ends in .zip, tell the user to unzip and select `export.xml` (do not add a zip library).
- Downloads: build result with `Blob` + `URL.createObjectURL` + programmatic `<a download>` click.

## Tone & quality bar

- No fake/simulated results — compute real outputs from real inputs.
- Mobile responsive. Test logic mentally against edge cases (empty file, no matching records, absurd inputs).
- US-English, friendly-expert tone matching the existing site.

## Sibling tools (for cross-link sections)

/heart-rate-zone-calculator/, /recovery-score-calculator/, /sleep-debt-calculator/, /fitness-age-calculator/, /apple-health-export-splitter/, /apple-health-to-gpx/, /apple-health-duplicate-steps-checker/, /apple-health-anonymizer/, /apple-health-wrapped/, /apple-health-sleep-report/
