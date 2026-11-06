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
| `home_pricing_click` | Reserved for a pricing control that does not open the App Store. Homepage purchase buttons are `app_store_click` instead |
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

The design gives iPhone the first position and mobile hides the text navigation. Visibility and placement bias matter. Section views measure exposure, never a preference. Compare device categories and placements before promoting an archetype. The intent events are not themselves a randomized experiment. Hero purchase copy is tested separately as AHD-CTA-01.

## Optional detailed Exploration

Events also send `page_variant` (`open_file_v2`), `first_intent`, `last_intent`, `intent_group`, and, where relevant, `cta_location`, `intent`, `resource`, `question`, or `file_view`. `home_view` and `app_store_click` also send `experiment_id`, `experiment_assignment`, and `experiment_exposure` for AHD-CTA-01. `page_variant` stays the page version. It is not the experiment arm. These are fixed categorical values. To use them as Exploration dimensions, an Analytics administrator must register the corresponding **event-scoped custom dimensions** in Admin → Custom definitions. These registrations have not been performed by this deployment; the event-name report above works without them. Do not assume parameters are retroactively available in custom reports.

Intent is held only in page memory. It is not joined across app installations, devices, or website visits. We collect no health records, file contents, AI prompts, email addresses, or custom persistent visitor IDs in these events. The homepage honors browser Do Not Track and the GA disable flag. Existing GA4 pageview/session behavior otherwise continues.

## Clicks are not sales

These events measure visitor interest and outbound clicks. They do not reveal whether someone bought the universal app for iPhone or Mac, whether they purchased at all, or which app they use afterward. Confirm buyer motivation with onboarding or customer feedback and purchase reports separately.

Homepage App Store links use `/go/website.html?c=ahd_home_<location>` and are not rewritten when someone selects iPhone, Mac, or AI. The redirect keeps that token and records `app_store_redirect` with the same value as `ct=`. Do Not Track (`navigator.doNotTrack === '1'`) and the GA disable flag skip that hit: `/go/website.html` does not load gtag and replaces to the App Store immediately, still with `ct=`.

| CTA | Tag | `cta_location` |
| --- | --- | --- |
| Nav “Get the app” (the only header control on small screens) | `ahd_home_nav` | `nav` |
| Hero purchase. Control “Get Health Data — $4.99”. Challenger “Get it on the App Store — $4.99”. | `ahd_home_hero` | `hero` |
| Mid-page offer “Get it on the App Store” | `ahd_home_offer` | `offer` |
| Closing band “Get Health Data — $4.99” | `ahd_home_closing` | `closing` |

The footer has no download control. There is no second mobile button; device category splits the nav tag.

Homepage click rate is GA4 `app_store_click` events whose page path is `/`, divided by page views of `/`. Filter `app_store_click` to page `/` (the event also sends `page_path` `/` and `cta_location`). Do not add `app_store_redirect` from `/go/website.html`; that is the same click counted again. `cta_location` is an event parameter and needs an event-scoped custom dimension before Explorations can split on it. The campaign token is available without that registration as the redirect’s `event_label` / App Store `ct=`.

It does not yet include a verified App Store Connect provider token, so this is not verified App Store purchase attribution.

## Hero purchase label experiment AHD-CTA-01

Visitor-level 50/50 test of the homepage hero purchase button label only. Both arms stay in the page.

| Arm | Visible label |
| --- | --- |
| `control` | Get Health Data — $4.99 ↗ |
| `challenger` | Get it on the App Store — $4.99 ↗ |

Assignment runs in `js/homepage-analytics.js` before `home_view`. A stored `localStorage` value of exactly `control` or `challenger` under `ab_AHD-CTA-01` is reused. Otherwise `Math.random() < 0.5` assigns control and any other draw assigns challenger, then the arm is written back. The stored value is only that arm. It is not a visitor id. If storage is unavailable, the arm still applies for that page load and is not sticky. Do Not Track and the GA disable flag suppress analytics; they do not pin the visitor to control.

The hero link keeps `href="/go/website.html?c=ahd_home_hero"`, the `$4.99` price, the `↗` element, the `.buy` styles, and its placement. Nav, mid-page offer, closing button, headline, screenshots, and disclosures are outside the test. Static HTML remains the control label, so a browser without JavaScript shows control and does not emit `home_view`.

`home_view` (once per load, after the label is set) and every `app_store_click` include:

| Parameter | Values |
| --- | --- |
| `experiment_id` | `AHD-CTA-01` |
| `experiment_assignment` | `control` or `challenger` |
| `experiment_exposure` | the arm whose hero label was shown, or `none` if that label was not applied |

Other homepage events do not get these parameters. `page_variant` remains `open_file_v2` on every event. Use `home_view` as the exposure denominator and split `app_store_click` on `experiment_assignment` plus `cta_location`. The new parameters are the experiment id and the arm name. They do not include health records, file contents, prompts, the button label, a price, or an account or visitor id.

This test does not restore the removed random download counter or any earlier hero experiment.

## Verification and troubleshooting

- Run `node --test tests/homepage-analytics.test.cjs` for routing, deduplication, unknown/mixed classification, opt-out, production GA queue, and AHD-CTA-01 assignment tests.
- Open `/?analytics_debug=1`; click iPhone, Mac, Your AI, each App Store button, FAQs, and JSON. Inspect `window.healthDataAnalyticsDebug` in browser devtools. Localhost automatically uses this mode. No homepage events or GA script are sent in debug mode.
- An actual App Store click still opens the existing redirect, which has its own analytics. For an entirely dry test, prevent the store link's default navigation in browser devtools.
- A regular production load requests `gtag/js?id=G-8SMQRLT4VS`; event requests target Google's collection endpoint. Analytics blockers or opt-outs may prevent collection without affecting the page or download link.
- Check Realtime for event arrival, then the standard report after processing. A browser request verifies dispatch, not final reporting or purchase attribution.

Implementation: `index.html` declares explicit tracking attributes and keeps the control hero label; `js/homepage-analytics.js` owns assignment, the challenger label, and the event schema. Keep enum values and event names stable for comparison over time. Do not restore the old random download counter or old hero experiment.
