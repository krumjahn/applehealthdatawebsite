# Homepage intent measurement — Open File v2

Launched 2026-10-08. Uses the existing GA4 property with measurement ID `G-8SMQRLT4VS`. The homepage keeps the approved iPhone → Mac → external AI order and one universal purchase. No new analytics vendor or tracking account was added.

## Read the results

In Google Analytics, choose the property whose web stream is `G-8SMQRLT4VS`. Use **Reports → Engagement → Events** (or an Exploration with Event name and Total users). Filter names starting with `home_`, with dates beginning on the launch date. Realtime is useful for initial arrival checks; standard reports can take 24–48 hours.

The event names encode the main breakdown, so the initial report does not require custom dimensions:

| Event | Meaning |
| --- | --- |
| `home_view` | Instrumented homepage load |
| `home_intent_iphone` | Explicit iPhone workflow link selected |
| `home_intent_mac` | Explicit Mac workflow or Mac guide selected |
| `home_intent_ai` | Explicit external AI workflow link selected |
| `home_store_iphone`, `home_store_mac`, `home_store_ai` | App Store outbound after selecting only that workflow during this page load |
| `home_store_mixed` | App Store outbound after selecting multiple workflows |
| `home_store_unknown` | App Store outbound without an explicit workflow selection |
| `app_store_click` | Every actual App Store outbound click; retains the site's existing event name |
| `home_pricing_click` | Pricing-section CTA selected (not an App Store visit) |
| `home_view_iphone`, `home_view_mac`, `home_view_ai`, `home_view_pricing` | At least half of that section's heading entered the viewport |
| `home_link_click` | Every workflow link click, including repeats |
| `home_resource_click` | Docs, converter, developer, support or privacy link |
| `home_faq_open` | Visitor opens an answer; default-open answer is excluded |
| `home_demo_view` | Preview/JSON tab selected with pointer or keyboard |

`home_view`, each `home_intent_*`, each `home_view_*`, and each `home_store_*` fire at most once per page load. A reload starts a fresh page load. Use Total users for reach rather than presenting raw event counts as people. A person can express multiple interests, so interest percentages can exceed 100%. Store categories describe intent at click time; a returning click after additional exploration can enter another category. They are not mutually exclusive customer segments across visits.

Useful first questions:

1. Which explicit interests reach the most users relative to homepage visitors?
2. Among people who click through to the store, is their observed interest iPhone, Mac, AI, mixed, or unknown?
3. Which sections get seen but attract little further interaction?
4. Which practical questions and resources attract attention?

The design gives iPhone the first position and mobile hides the text navigation. Visibility and placement bias matter. Section views measure exposure, never a preference. Compare device categories and placements before promoting an archetype; this launch is not a randomized experiment.

## Optional detailed Exploration

Events also send `page_variant` (`open_file_v2`), `first_intent`, `last_intent`, `intent_group`, and, where relevant, `cta_location`, `intent`, `resource`, `question`, or `file_view`. These are fixed categorical values. To use them as Exploration dimensions, an Analytics administrator must register the corresponding **event-scoped custom dimensions** in Admin → Custom definitions. These registrations have not been performed by this deployment; the event-name report above works without them. Do not assume parameters are retroactively available in custom reports.

Intent is held only in page memory. It is not joined across app installations, devices, or website visits. We collect no health records, file contents, AI prompts, email addresses, or custom persistent visitor IDs in these events. The homepage honors browser Do Not Track and the GA disable flag. Existing GA4 pageview/session behavior otherwise continues.

## Clicks are not sales

These events measure visitor interest and outbound clicks. They do not reveal whether someone bought the universal app for iPhone or Mac, whether they purchased at all, or which app they use afterward. Confirm buyer motivation with onboarding or customer feedback and purchase reports separately.

App Store links use `/go/website.html?c=home_v2_<intent-group>`. That existing redirect preserves the campaign token and records `app_store_redirect`. It does not yet include a verified App Store Connect provider token, so this is not verified App Store purchase attribution. Never sum the homepage click and redirect event as two conversions.

## Verification and troubleshooting

- Run `node --test tests/homepage-analytics.test.cjs` for routing, deduplication, unknown/mixed classification, opt-out, and production GA queue tests.
- Open `/?analytics_debug=1`; click iPhone, Mac, Your AI, pricing, FAQs, and JSON. Inspect `window.healthDataAnalyticsDebug` in browser devtools. Localhost automatically uses this mode. No homepage events or GA script are sent in debug mode.
- An actual App Store click still opens the existing redirect, which has its own analytics. For an entirely dry test, prevent the store link's default navigation in browser devtools.
- A regular production load requests `gtag/js?id=G-8SMQRLT4VS`; event requests target Google's collection endpoint. Analytics blockers or opt-outs may prevent collection without affecting the page or download link.
- Check Realtime for event arrival, then the standard report after processing. A browser request verifies dispatch, not final reporting or purchase attribution.

Implementation: `index.html` declares explicit tracking attributes; `js/homepage-analytics.js` owns the event schema. Keep enum values and event names stable for comparison over time. Do not restore the old random download counter or old hero experiment.
