const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = readFileSync(path.join(__dirname, '../js/homepage-analytics.js'), 'utf8');
const redirectHtml = readFileSync(path.join(__dirname, '../go/website.html'), 'utf8');

function runRedirect(search) {
  const inline = redirectHtml.match(/<script>([\s\S]*?app_store_redirect[\s\S]*?)<\/script>/)[1];
  const timers = [];
  const replaced = [];
  const window = {
    location: {
      search,
      replace(url) { replaced.push(url); }
    }
  };
  window.window = window;
  window.URLSearchParams = URLSearchParams;
  window.Date = Date;
  window.setTimeout = (fn, ms) => {
    timers.push({ fn, ms });
    return timers.length;
  };
  vm.runInNewContext(inline, window, { filename: 'go/website.html' });
  const events = window.dataLayer.map(args => Array.from(args));
  return { timers, replaced, events };
}
function setup({ hostname = 'localhost', search = '', dnt = '0', optOut = false } = {}) {
  const listeners = {}, scripts = [], observed = [];
  const store = { dataset: { track: 'store', placement: 'offer' }, href: '/go/website.html?c=home_v2_unknown' };
  const faq = { open: true, dataset: { faq: 'ai_connection' }, addEventListener(type, fn) { this[type] = fn; } };
  const heading = { dataset: { sectionView: 'mac' } };
  let observe;
  const document = {
    head: { appendChild: script => scripts.push(script) },
    createElement: () => ({}),
    addEventListener: (name, fn) => listeners[name] = fn,
    querySelectorAll: selector => ({ '[data-track="store"]': [store], '[data-faq]': [faq], '[role="tab"]': [], '[data-section-view]': [heading] }[selector] || [])
  };
  const window = {
    'ga-disable-G-8SMQRLT4VS': optOut,
    IntersectionObserver: class {
      constructor(fn) { observe = fn; }
      observe(node) { observed.push(node); }
      unobserve() {}
    }
  };
  vm.runInNewContext(source, { window, document, navigator: { doNotTrack: dnt }, location: { hostname, search, pathname: '/' }, URLSearchParams, IntersectionObserver: window.IntersectionObserver });
  const click = (track, intent, type = 'click', button = 0) => listeners[type]({ type, button, target: { closest: () => track === 'store' ? store : { dataset: { track, intent, placement: 'hero_paths' } } } });
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
  assert.equal(conversion[2].transport_type, 'beacon');
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
  assert.match(state.store.href, /home_v2_mixed$/);
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
    assert.match(state.store.href, /home_v2_mac$/);
  }
});
test('app store redirect waits for the GA callback and forwards ct', () => {
  assert.match(redirectHtml, /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-8SMQRLT4VS"><\/script>/);
  const state = runRedirect('?c=ah_to_dropbox_hero');
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
