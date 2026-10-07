# Customer workflow homepage — October 7, 2026

The anonymous app sample suggests three jobs, not a proven demographic:
AI handoff, Mac analysis, and on-device understanding. Lead with usable Apple
Health files and show how to complete each job. Keep the free converter and CLI
available below the main decision rather than competing with the hero CTA.

Changes: focused hero, three workflow cards, Mac report screenshot, explicit
XML-only Mac import/all-history behavior, base versus Pro pricing, conditional
privacy copy, and matching SoftwareApplication schema. Removed hard-coded
customer/download totals, randomized hourly-download counter, unverified sale,
unsupported rating schema, and the old CTA experiment that overwrote pricing.
US pricing is $4.99 base, optional Pro $3.99/month or $24.99/year, checked Oct 7.

Validation: inline JS syntax, all JSON-LD, IDs, internal fragments and local
images pass. Desktop and mobile previews rendered through browser-harness.
Mobile inspection found the menu extending offscreen; the header is now bounded
to 100vw and the menu breakpoint accommodates tablet widths. A final browser
session was blocked by Chrome remote-debugging permission after the earlier
renders; do a final mobile/tablet smoke check before deploying this PR.

Review locally with `python3 -m http.server 8767 --bind 127.0.0.1` and open
http://127.0.0.1:8767/. Check hero, menu, workflow/pricing anchors and App Store
links at 390px, 768px, and desktop widths. This is a static GitHub Pages site;
merging main publishes it. No deployment was triggered by preparing this PR.

The existing App Store redirect's provider token is still missing. Website
outbound clicks can be counted, but do not label them App Store purchases or
join them to anonymous app sessions. The existing site's other article/product
pages were not mass-rewritten in this change.
