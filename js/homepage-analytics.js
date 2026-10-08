/* Homepage intent measurement. No health data, free-text, or persistent intent IDs. */
(function () {
  'use strict';
  const measurementId = 'G-8SMQRLT4VS';
  const debug = ['localhost', '127.0.0.1', ''].includes(location.hostname) ||
    new URLSearchParams(location.search).get('analytics_debug') === '1';
  const disabled = navigator.doNotTrack === '1' || window['ga-disable-' + measurementId];
  const intents = new Set();
  const seen = new Set();
  let firstIntent = 'unknown';
  let lastIntent = 'unknown';
  const validIntents = ['iphone', 'mac', 'ai'];
  const events = [];

  if (debug) window.healthDataAnalyticsDebug = events;
  if (!debug && !disabled) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }

  function group() {
    return intents.size > 1 ? 'mixed' : lastIntent;
  }

  function track(name, parameters = {}, once = false) {
    if (disabled || (once && seen.has(name))) return;
    seen.add(name);
    const data = Object.assign({
      page_variant: 'open_file_v2',
      page_path: location.pathname,
      first_intent: firstIntent,
      last_intent: lastIntent,
      intent_group: group()
    }, parameters);
    if (debug) {
      events.push({ name, parameters: data });
    } else if (typeof window.gtag === 'function') {
      window.gtag('event', name, data);
    }
  }

  function selectIntent(intent, placement) {
    if (!validIntents.includes(intent)) return;
    intents.add(intent);
    if (firstIntent === 'unknown') firstIntent = intent;
    lastIntent = intent;
    track('home_intent_' + intent, { intent, cta_location: placement }, true);
    // Keep the native link usable for ordinary clicks, new tabs, and copied links.
    document.querySelectorAll('[data-track="store"]').forEach(link => {
      link.href = '/go/website.html?c=home_v2_' + group();
    });
  }

  function click(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    const link = event.target.closest('[data-track]');
    if (!link) return;
    const placement = link.dataset.placement;
    switch (link.dataset.track) {
      case 'intent':
        selectIntent(link.dataset.intent, placement);
        track('home_link_click', { intent: link.dataset.intent, cta_location: placement });
        break;
      case 'pricing':
        track('home_pricing_click', { cta_location: placement });
        break;
      case 'store':
        track('app_store_click', { cta_location: placement, link_url: link.href, transport_type: 'beacon' });
        track('home_store_' + group(), { cta_location: placement, transport_type: 'beacon' }, true);
        break;
      case 'resource':
        track('home_resource_click', { resource: link.dataset.resource, cta_location: placement });
        break;
    }
  }
  document.addEventListener('click', click);
  document.addEventListener('auxclick', click);

  document.querySelectorAll('[data-faq]').forEach(details => {
    // The first answer is open by default: do not count that as a visitor action.
    let wasOpen = details.open;
    details.addEventListener('toggle', () => {
      if (details.open && !wasOpen) track('home_faq_open', { question: details.dataset.faq });
      wasOpen = details.open;
    });
  });
  document.querySelectorAll('[role="tab"]').forEach(tab => {
    tab.addEventListener('click', () => track('home_demo_view', { file_view: tab.dataset.view }));
    tab.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        const active = document.querySelector('[role="tab"][aria-selected="true"]');
        if (active) track('home_demo_view', { file_view: active.dataset.view });
      }
    });
  });

  // Heading visibility is an exposure denominator, never an inferred preference.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          track('home_view_' + entry.target.dataset.sectionView, {}, true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-section-view]').forEach(heading => observer.observe(heading));
  }
  track('home_view', {}, true);
})();
