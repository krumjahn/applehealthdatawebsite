const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = readFileSync(path.join(__dirname, '../js/homepage-analytics.js'), 'utf8');
const redirectHtml = readFileSync(path.join(__dirname, '../go/website.html'), 'utf8');

function runRedirect(search, { dnt = '0', optOut = false } = {}) {
  const inline = redirectHtml.match(/<script>([\s\S]*?app_store_redirect[\s\S]*?)<\/script>/)[1];
  const timers = [];
  const replaced = [];
  const scripts = [];
  const window = {
    location: {
      search,
      replace(url) { replaced.push(url); }
    },
    navigator: { doNotTrack: dnt },
    document: {
      head: { appendChild(script) { scripts.push(script); } },
      createElement() { return {}; }
    }
  };
  window.window = window;
  if (optOut) window['ga-disable-G-8SMQRLT4VS'] = true;
  window.URLSearchParams = URLSearchParams;
  window.Date = Date;
  window.setTimeout = (fn, ms) => {
    timers.push({ fn, ms });
    return timers.length;
  };
  vm.runInNewContext(inline, window, { filename: 'go/website.html' });
  const events = window.dataLayer ? window.dataLayer.map(args => Array.from(args)) : [];
  return { timers, replaced, events, scripts, window };
}
const CONTROL_LABEL = 'Get Health Data — $4.99 ';
const CHALLENGER_LABEL = 'Get it on the App Store — $4.99 ';
const HERO_DESTINATION = '/go/website.html?c=ahd_home_hero';

function memoryStorage(initial = {}) {
  const data = Object.assign({}, initial);
  return {
    data,
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    }
  };
}

function heroFixture(text = CONTROL_LABEL) {
  const label = { nodeType: 3, textContent: text };
  const gap = { nodeType: 3, textContent: '\n' };
  const arrow = { nodeType: 1, nodeName: 'B', textContent: '↗' };
  const link = {
    href: HERO_DESTINATION,
    dataset: { track: 'store', placement: 'hero' },
    childNodes: [label, gap, arrow],
    getAttribute(name) {
      if (name === 'href') return HERO_DESTINATION;
      if (name === 'class') return 'buy';
      if (name === 'data-experiment') return 'AHD-CTA-01';
      if (name === 'data-placement') return 'hero';
      if (name === 'data-track') return 'store';
      return null;
    }
  };
  return { link, label, gap, arrow };
}

function setup({ hostname = 'localhost', search = '', dnt = '0', optOut = false, stores, storage, random, hero } = {}) {
  const listeners = {}, scripts = [], observed = [];
  const store = { dataset: { track: 'store', placement: 'offer' }, href: '/go/website.html?c=ahd_home_offer', childNodes: [{ nodeType: 3, textContent: 'Get it on the App Store ' }] };
  const storeList = stores || [store];
  const faq = { open: true, dataset: { faq: 'ai_connection' }, addEventListener(type, fn) { this[type] = fn; } };
  const heading = { dataset: { sectionView: 'mac' } };
  let observe;
  const document = {
    head: { appendChild: script => scripts.push(script) },
    createElement: () => ({}),
    addEventListener: (name, fn) => listeners[name] = fn,
    querySelectorAll: selector => {
      if (hero && selector.includes('data-placement="hero"') && selector.includes('data-track="store"') && selector.includes('AHD-CTA-01')) return [hero.link];
      return ({ '[data-track="store"]': storeList, '[data-faq]': [faq], '[role="tab"]': [], '[data-section-view]': [heading] }[selector] || []);
    }
  };
  const window = {
    'ga-disable-G-8SMQRLT4VS': optOut,
    IntersectionObserver: class {
      constructor(fn) { observe = fn; }
      observe(node) { observed.push(node); }
      unobserve() {}
    }
  };
  if (storage) window.localStorage = storage;
  const context = { window, document, navigator: { doNotTrack: dnt }, location: { hostname, search, pathname: '/' }, URLSearchParams, IntersectionObserver: window.IntersectionObserver };
  if (random !== undefined) context.Math = { random: () => random };
  vm.runInNewContext(source, context, { filename: 'js/homepage-analytics.js' });
  const click = (track, intent, type = 'click', button = 0, link) => listeners[type]({ type, button, target: { closest: () => track === 'store' ? (link || store) : { dataset: { track, intent, placement: 'hero_paths' } } } });
  return { window, scripts, store, faq, click, events: window.healthDataAnalyticsDebug, exposure: () => observe([{ target: heading, isIntersecting: true, intersectionRatio: 1 }]) };
}
test('local and explicit live debug never load GA', () => {
  for (const options of [{}, { hostname: 'applehealthdata.com', search: '?analytics_debug=1' }]) {
    const state = setup(options);
    assert.equal(state.scripts.length, 0);
    assert.equal(state.events[0].name, 'home_view');
  }
});
test('production loads the existing GA property and sends events', () => {
  const state = setup({ hostname: 'applehealthdata.com' });
  state.click('intent', 'mac'); state.click('store');
  assert.equal(state.scripts.length, 1);
  assert.match(state.scripts[0].src, /G-8SMQRLT4VS$/);
  const calls = state.window.dataLayer.map(args => Array.from(args));
  assert.equal(calls.filter(args => args[0] === 'config').length, 1);
  const conversion = calls.find(args => args[1] === 'app_store_click');
  assert.equal(conversion[2].intent_group, 'mac');
  assert.equal(conversion[2].cta_location, 'offer');
  assert.equal(conversion[2].page_path, '/');
  assert.equal(conversion[2].transport_type, 'beacon');
  assert.match(conversion[2].link_url, /c=ahd_home_offer$/);
});
test('repeated interest clicks do not inflate per-page intent counts', () => {
  const state = setup(); state.click('intent', 'iphone'); state.click('intent', 'iphone');
  assert.equal(state.events.filter(e => e.name === 'home_intent_iphone').length, 1);
  assert.equal(state.events.filter(e => e.name === 'home_link_click').length, 2);
});
test('mixed intent preserves the first and last choices on outbound clicks', () => {
  const state = setup(); state.click('intent', 'iphone'); state.click('intent', 'mac'); state.click('intent', 'ai'); state.click('store');
  const data = state.events.find(e => e.name === 'app_store_click').parameters;
  assert.equal(data.intent_group, 'mixed'); assert.equal(data.first_intent, 'iphone'); assert.equal(data.last_intent, 'ai');
  assert.equal(data.cta_location, 'offer');
  assert.equal(data.page_path, '/');
  assert.equal(state.store.href, '/go/website.html?c=ahd_home_offer');
  assert.equal(state.events.filter(e => e.name === 'home_store_mixed').length, 1);
});
test('scroll exposure and pricing clicks do not invent an intent', () => {
  const state = setup(); state.exposure(); state.exposure(); state.click('pricing'); state.click('store');
  assert.equal(state.events.filter(e => e.name === 'home_view_mac').length, 1);
  assert.ok(state.events.some(e => e.name === 'home_store_unknown'));
  assert.ok(!state.events.some(e => e.name.startsWith('home_intent_')));
});
test('middle clicks work; right clicks do not count', () => {
  const state = setup(); state.click('intent', 'mac', 'auxclick', 2);
  assert.equal(state.events.length, 1);
  state.click('intent', 'mac', 'auxclick', 1);
  assert.ok(state.events.some(e => e.name === 'home_intent_mac'));
});
test('default-open FAQ is not visitor engagement', () => {
  const state = setup(); state.faq.toggle();
  assert.equal(state.events.length, 1);
  state.faq.open = false; state.faq.toggle(); state.faq.open = true; state.faq.toggle();
  assert.equal(state.events.filter(e => e.name === 'home_faq_open').length, 1);
});
test('DNT and existing GA opt-out disable analytics without breaking links', () => {
  for (const options of [{ dnt: '1' }, { optOut: true }]) {
    const state = setup(options); state.click('intent', 'mac'); state.click('store');
    assert.equal(state.scripts.length, 0); assert.equal(state.events.length, 0);
    assert.equal(state.store.href, '/go/website.html?c=ahd_home_offer');
  }
});
test('homepage store CTAs keep distinct tags and each click reports location', () => {
  const html = readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const found = [];
  for (const match of html.matchAll(/<a\b([^>]*)>/g)) {
    const attrs = match[1];
    if (!/\bdata-track="store"/.test(attrs)) continue;
    const value = name => {
      const hit = attrs.match(new RegExp('\\b' + name + '="([^"]*)"'));
      assert.ok(hit, name);
      return hit[1];
    };
    found.push({ placement: value('data-placement'), href: value('href') });
  }
  assert.deepEqual(found.map(link => link.placement), ['nav', 'hero', 'offer', 'closing']);
  assert.deepEqual(found.map(link => link.href), [
    '/go/website.html?c=ahd_home_nav',
    '/go/website.html?c=ahd_home_hero',
    '/go/website.html?c=ahd_home_offer',
    '/go/website.html?c=ahd_home_closing'
  ]);
  assert.equal(html.includes('home_v2_'), false);
  assert.equal(html.includes('data-track="pricing"'), false);
  const links = found.map(link => ({ dataset: { track: 'store', placement: link.placement }, href: link.href }));
  const state = setup({ stores: links });
  state.click('intent', 'mac');
  for (const link of links) state.click('store', undefined, 'click', 0, link);
  assert.deepEqual(links.map(link => link.href), found.map(link => link.href));
  const clicks = state.events.filter(event => event.name === 'app_store_click');
  assert.deepEqual(Array.from(clicks, event => event.parameters.cta_location), ['nav', 'hero', 'offer', 'closing']);
  for (const event of clicks) {
    assert.equal(event.parameters.page_path, '/');
    assert.match(event.parameters.link_url, /\/go\/website\.html\?c=ahd_home_/);
  }
});
test('app store redirect waits for the GA callback and forwards ct', () => {
  assert.doesNotMatch(redirectHtml, /<script\b[^>]*\bsrc=["']https:\/\/www\.googletagmanager\.com\/gtag\/js/);
  const state = runRedirect('?c=ah_to_dropbox_hero');
  assert.equal(state.scripts.length, 1);
  assert.match(state.scripts[0].src, /gtag\/js\?id=G-8SMQRLT4VS$/);
  assert.equal(state.replaced.length, 0);
  const hit = state.events.find(args => args[0] === 'event' && args[1] === 'app_store_redirect');
  assert.equal(hit[2].event_label, 'ah_to_dropbox_hero');
  assert.equal(hit[2].source, 'ah_to_dropbox_hero');
  assert.equal(hit[2].transport_type, 'beacon');
  assert.equal(hit[2].event_timeout, 400);
  assert.equal(typeof hit[2].event_callback, 'function');
  assert.equal(state.timers.length, 1);
  assert.ok(state.timers[0].ms >= 300 && state.timers[0].ms <= 500);
  hit[2].event_callback();
  assert.deepEqual(state.replaced, [
    'https://apps.apple.com/us/app/health-data-ai-analyzer/id6749297170?ct=ah_to_dropbox_hero&mt=8'
  ]);
  state.timers[0].fn();
  hit[2].event_callback('G-8SMQRLT4VS');
  assert.equal(state.replaced.length, 1);
});
test('app store redirect skips GA on DNT or the GA disable flag and still forwards ct', () => {
  for (const options of [{ dnt: '1' }, { optOut: true }]) {
    const state = runRedirect('?c=ahd_home_hero', options);
    assert.equal(state.scripts.length, 0);
    assert.equal(state.events.length, 0);
    assert.equal(state.timers.length, 0);
    assert.equal(state.window.dataLayer, undefined);
    assert.equal(state.window.gtag, undefined);
    assert.deepEqual(state.replaced, [
      'https://apps.apple.com/us/app/health-data-ai-analyzer/id6749297170?ct=ahd_home_hero&mt=8'
    ]);
  }
  const fallback = runRedirect('', { dnt: '1' });
  assert.deepEqual(fallback.replaced, [
    'https://apps.apple.com/us/app/health-data-ai-analyzer/id6749297170?ct=website&mt=8'
  ]);
  assert.equal(fallback.scripts.length, 0);
});
test('app store redirect falls back when GA never calls back', () => {
  const state = runRedirect('');
  assert.equal(state.replaced.length, 0);
  const hit = state.events.find(args => args[1] === 'app_store_redirect');
  assert.equal(hit[2].event_label, 'website');
  state.timers[0].fn();
  assert.deepEqual(state.replaced, [
    'https://apps.apple.com/us/app/health-data-ai-analyzer/id6749297170?ct=website&mt=8'
  ]);
  state.timers[0].fn();
  assert.equal(state.replaced.length, 1);
});
test('AHD-CTA-01 keeps a sticky arm and reports it beside page_variant', () => {
  const storage = memoryStorage({ 'ab_AHD-CTA-01': 'challenger' });
  const hero = heroFixture();
  const offerText = 'Get it on the App Store ';
  const state = setup({ storage, random: 0, hero });
  assert.equal(hero.label.textContent, CHALLENGER_LABEL);
  assert.equal(hero.arrow.textContent, '↗');
  assert.equal(hero.gap.textContent, '\n');
  assert.equal(hero.link.href, HERO_DESTINATION);
  assert.equal(hero.link.getAttribute('href'), HERO_DESTINATION);
  assert.equal(hero.link.dataset.experimentVariant, 'challenger');
  assert.equal(hero.link.dataset.placement, 'hero');
  assert.equal(storage.data['ab_AHD-CTA-01'], 'challenger');
  assert.deepEqual(Object.keys(storage.data), ['ab_AHD-CTA-01']);
  assert.equal(state.store.childNodes[0].textContent, offerText);
  const view = state.events[0];
  assert.equal(view.name, 'home_view');
  assert.equal(view.parameters.page_variant, 'open_file_v2');
  assert.equal(view.parameters.experiment_id, 'AHD-CTA-01');
  assert.equal(view.parameters.experiment_assignment, 'challenger');
  assert.equal(view.parameters.experiment_exposure, 'challenger');
  state.click('intent', 'mac');
  state.click('store', undefined, 'click', 0, hero.link);
  const click = state.events.find(event => event.name === 'app_store_click');
  assert.equal(click.parameters.page_variant, 'open_file_v2');
  assert.equal(click.parameters.experiment_id, 'AHD-CTA-01');
  assert.equal(click.parameters.experiment_assignment, 'challenger');
  assert.equal(click.parameters.experiment_exposure, 'challenger');
  assert.equal(click.parameters.cta_location, 'hero');
  assert.equal(click.parameters.page_path, '/');
  assert.equal(click.parameters.link_url, HERO_DESTINATION);
  assert.equal(click.parameters.transport_type, 'beacon');
  const intent = state.events.find(event => event.name === 'home_intent_mac');
  assert.equal(intent.parameters.page_variant, 'open_file_v2');
  assert.equal(intent.parameters.experiment_id, undefined);
  assert.equal(intent.parameters.experiment_assignment, undefined);
  assert.equal(intent.parameters.experiment_exposure, undefined);
  const stored = state.events.find(event => event.name === 'home_store_mac');
  assert.equal(stored.parameters.experiment_id, undefined);
  assert.equal(stored.parameters.page_variant, 'open_file_v2');
});
test('AHD-CTA-01 control stays on the live label when the coin would be challenger', () => {
  const storage = memoryStorage({ 'ab_AHD-CTA-01': 'control' });
  const hero = heroFixture();
  const state = setup({ storage, random: 0.99, hero });
  assert.equal(hero.label.textContent, CONTROL_LABEL);
  assert.equal(hero.link.dataset.experimentVariant, 'control');
  assert.equal(storage.data['ab_AHD-CTA-01'], 'control');
  assert.equal(state.events[0].parameters.experiment_assignment, 'control');
  assert.equal(state.events[0].parameters.experiment_exposure, 'control');
  assert.equal(state.events[0].parameters.page_variant, 'open_file_v2');
  state.click('store');
  const click = state.events.find(event => event.name === 'app_store_click');
  assert.equal(click.parameters.cta_location, 'offer');
  assert.equal(click.parameters.experiment_assignment, 'control');
  assert.equal(click.parameters.experiment_exposure, 'control');
  assert.equal(click.parameters.page_variant, 'open_file_v2');
  assert.match(click.parameters.link_url, /c=ahd_home_offer$/);
});
test('AHD-CTA-01 assigns a new visitor 50/50 and sticks across loads', () => {
  const draws = [
    [0, 'control'],
    [0.499999, 'control'],
    [0.5, 'challenger'],
    [0.999999, 'challenger']
  ];
  for (const [random, arm] of draws) {
    const storage = memoryStorage();
    const hero = heroFixture();
    const state = setup({ storage, random, hero });
    assert.equal(storage.data['ab_AHD-CTA-01'], arm, String(random));
    assert.equal(hero.label.textContent, arm === 'control' ? CONTROL_LABEL : CHALLENGER_LABEL, String(random));
    assert.equal(state.events[0].parameters.experiment_assignment, arm);
    assert.equal(state.events[0].parameters.experiment_exposure, arm);
    assert.equal(hero.link.href, HERO_DESTINATION);
    assert.equal(hero.arrow.textContent, '↗');
    const again = heroFixture();
    setup({ storage, random: arm === 'control' ? 0.99 : 0, hero: again });
    assert.equal(again.label.textContent, arm === 'control' ? CONTROL_LABEL : CHALLENGER_LABEL);
    assert.equal(storage.data['ab_AHD-CTA-01'], arm);
  }
});
test('AHD-CTA-01 replaces an invalid stored arm and never records health details', () => {
  for (const invalid of ['free', 'A', 'challenger ', '', 'open_file_v2']) {
    const storage = memoryStorage({ 'ab_AHD-CTA-01': invalid });
    const hero = heroFixture();
    const state = setup({ storage, random: 0.5, hero });
    assert.equal(storage.data['ab_AHD-CTA-01'], 'challenger', invalid);
    assert.equal(hero.label.textContent, CHALLENGER_LABEL);
    assert.doesNotMatch(hero.label.textContent, /free/i);
    const view = state.events[0];
    assert.deepEqual(
      Object.keys(view.parameters).filter(key => key.startsWith('experiment_')).sort(),
      ['experiment_assignment', 'experiment_exposure', 'experiment_id']
    );
    for (const value of Object.values(view.parameters)) assert.equal(typeof value, 'string');
    assert.equal(view.parameters.page_variant, 'open_file_v2');
    assert.notEqual(view.parameters.page_variant, view.parameters.experiment_assignment);
  }
});
test('AHD-CTA-01 still assigns when storage is blocked and reports no exposure without the hero', () => {
  const blocked = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); }
  };
  const hero = heroFixture();
  const shown = setup({ storage: blocked, random: 0, hero });
  assert.equal(hero.label.textContent, CONTROL_LABEL);
  assert.equal(shown.events[0].parameters.experiment_assignment, 'control');
  assert.equal(shown.events[0].parameters.experiment_exposure, 'control');
  const missing = setup({ storage: memoryStorage(), random: 0.8 });
  assert.equal(missing.events[0].parameters.experiment_assignment, 'challenger');
  assert.equal(missing.events[0].parameters.experiment_exposure, 'none');
  assert.equal(missing.events[0].parameters.page_variant, 'open_file_v2');
  assert.equal(missing.window.localStorage.data['ab_AHD-CTA-01'], 'challenger');
});
test('AHD-CTA-01 still shows the assigned label when analytics are off', () => {
  for (const options of [{ dnt: '1' }, { optOut: true }]) {
    const hero = heroFixture();
    const storage = memoryStorage({ 'ab_AHD-CTA-01': 'challenger' });
    const state = setup(Object.assign({ storage, hero, random: 0, hostname: 'applehealthdata.com' }, options));
    assert.equal(hero.label.textContent, CHALLENGER_LABEL);
    assert.equal(hero.link.href, HERO_DESTINATION);
    assert.equal(state.events, undefined);
    assert.equal(state.scripts.length, 0);
    assert.equal(state.window.dataLayer, undefined);
  }
});
test('production home_view and app_store_click keep page_variant and add the experiment', () => {
  const storage = memoryStorage({ 'ab_AHD-CTA-01': 'control' });
  const hero = heroFixture();
  const state = setup({ hostname: 'applehealthdata.com', storage, hero });
  state.click('intent', 'iphone');
  state.click('store', undefined, 'click', 0, hero.link);
  const calls = state.window.dataLayer.map(args => Array.from(args));
  const view = calls.find(args => args[1] === 'home_view');
  const click = calls.find(args => args[1] === 'app_store_click');
  for (const hit of [view, click]) {
    assert.equal(hit[2].page_variant, 'open_file_v2');
    assert.equal(hit[2].experiment_id, 'AHD-CTA-01');
    assert.equal(hit[2].experiment_assignment, 'control');
    assert.equal(hit[2].experiment_exposure, 'control');
  }
  assert.equal(click[2].cta_location, 'hero');
  assert.equal(click[2].link_url, HERO_DESTINATION);
  const intent = calls.find(args => args[1] === 'home_intent_iphone');
  assert.equal(intent[2].page_variant, 'open_file_v2');
  assert.equal(intent[2].experiment_id, undefined);
  assert.equal(intent[2].experiment_assignment, undefined);
});
test('homepage hero source stays the control arm and leaves the other CTAs alone', () => {
  const html = readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const hero = html.match(/<a class="buy" data-experiment="AHD-CTA-01"[^>]*>[\s\S]*?<\/a>/);
  assert.ok(hero);
  assert.equal(hero[0].includes(CONTROL_LABEL.trim()), true);
  assert.equal(hero[0].includes(CHALLENGER_LABEL.trim()), false);
  assert.equal(hero[0].includes('href="' + HERO_DESTINATION + '"'), true);
  assert.equal(hero[0].includes('<b aria-hidden="true">↗</b>'), true);
  assert.equal(html.split('data-experiment="AHD-CTA-01"').length, 2);
  assert.equal(html.includes('>Get the app ↗</a>'), true);
  assert.equal(html.includes('>Get it on the App Store <b aria-hidden="true">↗</b>'), true);
  assert.equal(html.includes('data-placement="closing" data-track="store" href="/go/website.html?c=ahd_home_closing" rel="noopener" target="_blank">Get Health Data — $4.99 <b aria-hidden="true">↗</b>'), true);
  assert.equal(html.includes('<h1>Make more of<br/>\n<span>your Apple<br/>Health data.</span>'), true);
  assert.equal(html.includes('Buy once. Use on iPhone and Mac.'), true);
  assert.equal(html.includes('<div class="price-number">$4.99<span>USD</span>'), true);
  assert.equal(source.includes(CONTROL_LABEL), true);
  assert.equal(source.includes(CHALLENGER_LABEL), true);
  assert.equal(source.includes("page_variant: 'open_file_v2'"), true);
});
test('invalid campaign tokens stay on the website default', () => {
  for (const search of ['?c=Nope', '?c=has-dash', '?c=' + 'a'.repeat(41), '?c=%20']) {
    const state = runRedirect(search);
    const hit = state.events.find(args => args[1] === 'app_store_redirect');
    assert.equal(hit[2].event_label, 'website', search);
    hit[2].event_callback();
    assert.match(state.replaced[0], /ct=website&mt=8$/, search);
  }
  const extra = runRedirect('?c=export_oura_data&ref=page');
  const hit = extra.events.find(args => args[1] === 'app_store_redirect');
  assert.equal(hit[2].event_label, 'export_oura_data');
  hit[2].event_callback();
  assert.match(extra.replaced[0], /ct=export_oura_data&mt=8$/);
});
