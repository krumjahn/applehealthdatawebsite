/* Homepage intent measurement. No health data, free-text, or persistent visitor IDs.
   AHD-CTA-01 stores only the hero purchase-label arm: control or challenger. */
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
  const HERO_EXPERIMENT_ID = 'AHD-CTA-01';
  const HERO_EXPERIMENT_KEY = 'ab_AHD-CTA-01';
  const HERO_DESTINATION = '/go/website.html?c=ahd_home_hero';
  // Trailing space matches the text node before the arrow in index.html.
  const HERO_LABELS = {
    control: 'Get Health Data — $4.99 ',
    challenger: 'Get it on the App Store — $4.99 '
  };

  function variantStore() {
    try {
      return window.localStorage || null;
    } catch (error) {
      return null;
    }
  }

  function readStoredVariant(store) {
    try {
      const value = store.getItem(HERO_EXPERIMENT_KEY);
      return value === 'control' || value === 'challenger' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function writeStoredVariant(store, variant) {
    try {
      store.setItem(HERO_EXPERIMENT_KEY, variant);
    } catch (error) {
      /* Private-mode storage can reject the write. The arm still applies this load. */
    }
  }

  function chooseHeroVariant() {
    return Math.random() < 0.5 ? 'control' : 'challenger';
  }

  function heroPurchaseLink() {
    const selector = 'a.buy[data-experiment="' + HERO_EXPERIMENT_ID + '"][data-placement="hero"][data-track="store"]';
    const links = document.querySelectorAll(selector);
    for (let i = 0; i < links.length; i += 1) {
      const link = links[i];
      const href = (link.getAttribute && link.getAttribute('href')) || link.href || '';
      if (href === HERO_DESTINATION || href.endsWith(HERO_DESTINATION)) return link;
    }
    return null;
  }

  function applyHeroLabel(link, variant) {
    const label = HERO_LABELS[variant];
    const nodes = link.childNodes || [];
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      // 3 is a text node. Leave the arrow element and any other markup alone.
      if (node && node.nodeType === 3 && String(node.textContent).trim()) {
        node.textContent = label;
        return node.textContent === label;
      }
    }
    return false;
  }

  function assignHeroExperiment() {
    const store = variantStore();
    let variant = store ? readStoredVariant(store) : null;
    if (!variant) {
      variant = chooseHeroVariant();
      if (store) writeStoredVariant(store, variant);
    }
    const link = heroPurchaseLink();
    const exposed = Boolean(link) && applyHeroLabel(link, variant);
    if (exposed && link.dataset) link.dataset.experimentVariant = variant;
    return { variant: variant, exposed: exposed };
  }

  const heroExperiment = assignHeroExperiment();

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

  function experimentParameters(name) {
    if (name !== 'home_view' && name !== 'app_store_click') return null;
    return {
      experiment_id: HERO_EXPERIMENT_ID,
      experiment_assignment: heroExperiment.variant,
      experiment_exposure: heroExperiment.exposed ? heroExperiment.variant : 'none'
    };
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
    const experiment = experimentParameters(name);
    if (experiment) Object.assign(data, experiment);
    data.page_variant = 'open_file_v2';
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
    // Leave each store href on its ahd_home_<placement> token. Intent stays on
    // the event so a copied, middle-clicked, or no-JS link still names the CTA.
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
        track('app_store_click', {
          cta_location: placement,
          page_path: '/',
          link_url: link.href,
          transport_type: 'beacon'
        });
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
