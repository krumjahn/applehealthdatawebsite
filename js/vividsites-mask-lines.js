/* VividSites Masked Line Reveal: https://vividsites.app/c/mask-lines */
(() => {
  document.documentElement.classList.add('vs-js');
  if (window.VsMaskLines) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cssNum = (el, n, fb) => { const v = parseFloat(getComputedStyle(el).getPropertyValue(n)); return isNaN(v) ? fb : v; };
  const items = new Map(); // el -> { html, lines: [{wrap, inner, x, v, goal, due}] }
  // x: 0 = parked below the mask, 1 = in place, 2 = gone through the top (then parked at 0 again)

  // 1. break the text into word spans that remember their inline ancestors
  function tokens(root) {
    const out = [];
    const walk = (node, chain) => {
      for (const ch of node.childNodes) {
        if (ch.nodeType === 1) {
          if (ch.tagName === 'BR') { out.push({ br: true }); continue; }
          walk(ch, [...chain, ch]);
        } else if (ch.nodeType === 3) {
          for (const part of ch.textContent.split(/(\s+)/)) if (part) out.push({ text: part, chain, space: /^\s+$/.test(part) });
        }
      }
    };
    walk(root, []);
    return out;
  }
  const wrapChain = (text, chain) => {
    let node = document.createTextNode(text);
    for (let i = chain.length - 1; i >= 0; i--) { const c = chain[i].cloneNode(false); c.appendChild(node); node = c; }
    return node;
  };

  // 2. lay the words out, read which line each lands on, then rebuild as masked lines
  function build(el) {
    const rec = items.get(el) || { html: el.innerHTML, label: el.textContent.replace(/\s+/g, ' ').trim(), lines: [], visible: true };
    const shown = rec.lines.filter((l) => l.goal === 1).length;
    el.innerHTML = rec.html;
    const toks = tokens(el);
    el.textContent = '';
    const spans = [];
    for (const t of toks) {
      if (t.br) { const b = document.createElement('br'); el.appendChild(b); spans.push({ br: b }); continue; }
      const s = document.createElement('span');
      s.appendChild(wrapChain(t.text, t.chain));
      el.appendChild(s);
      spans.push({ s, space: t.space });
    }
    const rows = []; let top = null;
    for (const sp of spans) {
      if (sp.br) { top = null; continue; }
      const y = sp.s.offsetTop;
      if (sp.space && rows.length) { rows[rows.length - 1].push(sp.s); continue; }
      if (top === null || Math.abs(y - top) > 2) { rows.push([]); top = y; }
      rows[rows.length - 1].push(sp.s);
    }
    el.textContent = '';
    el.setAttribute('aria-label', rec.label);
    rec.cfg = cfgOf(el);
    rec.lines = rows.map((row, i) => {
      const wrap = document.createElement('span'); wrap.className = 'vs-mask-lines-l'; wrap.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span'); inner.className = 'vs-mask-lines-i';
      // drop the trailing space so right-aligned / centred text measures true
      while (row.length && /^\s+$/.test(row[row.length - 1].textContent)) row.pop();
      row.forEach((s) => { while (s.firstChild) inner.appendChild(s.firstChild); });
      wrap.appendChild(inner); el.appendChild(wrap);
      const on = i < shown;
      const line = { wrap, inner, x: on ? 1 : 0, v: 0, goal: on ? 1 : 0, due: 0 };
      paint(line, rec.cfg);
      return line;
    });
    items.set(el, rec);
    el.dataset.vsSplit = '1';
    observe(el);
  }
  const cfgOf = (el) => ({
    k: cssNum(el, '--vs-mask-lines-tension', 120), c: cssNum(el, '--vs-mask-lines-friction', 24),
    stagger: cssNum(el, '--vs-mask-lines-stagger', 90), tilt: cssNum(el, '--vs-mask-lines-tilt', 4),
    trigger: cssNum(el, '--vs-mask-lines-trigger', 12) / 100, dir: el.dataset.vsMaskLinesDir === 'down' ? -1 : 1,
  });

  function paint(l, cfg) {
    const q = 1 - l.x;                                   // 1 → parked, 0 → in place, −1 → gone
    l.inner.style.transform = Math.abs(q) < .0005 ? 'none'
      : `translate3d(0,${(q * 112 * cfg.dir).toFixed(3)}%,0) rotate(${(q * cfg.tilt * cfg.dir).toFixed(3)}deg)`;
    l.wrap.dataset.vsIn = l.goal === 1 && Math.abs(q) < .0005 ? 'settled' : '';
  }

  // 3. one shared rAF, awake only while scrolling or settling; each line decides for itself whether it is past the trigger line
  let raf = 0, last = 0;
  function frame(now) {
    const dt = Math.min(64, now - (last || now)) / 1000; last = now;
    const vh = innerHeight; let busy = false;
    items.forEach((rec, el) => {
      if (!rec.visible) return;
      const { k, c, stagger } = rec.cfg;
      const mode = el.dataset.vsMaskLines;
      const trig = vh * (1 - rec.cfg.trigger);
      let queue = 0;
      for (const l of rec.lines) {
        if (mode !== 'manual') {
          const r = l.wrap.getBoundingClientRect();
          const want = r.top < trig ? 1 : (mode === 'repeat' && r.top > vh ? 0 : l.goal);
          if (want !== l.goal) { l.goal = want; l.due = now + (want ? queue++ * stagger : 0); }
        }
        if (now < l.due) { busy = true; continue; }
        if (l.x === l.goal && l.v === 0) continue;
        // exits run on a stiffer spring and count as done once the line is fully behind the mask
        const out = l.goal === 2, kk = out ? k * 1.8 : k, cc = out ? c * 1.3 : c;
        for (let h = 0; h < dt; h += 1 / 120) {
          const st = Math.min(1 / 120, dt - h);
          l.v += (-kk * (l.x - l.goal) - cc * l.v) * st; l.x += l.v * st;
        }
        if ((out && l.x > 1.96) || (Math.abs(l.v) < .001 && Math.abs(l.x - l.goal) < .0005)) {
          l.x = l.goal; l.v = 0;
          if (l.goal === 2) { l.x = l.goal = 0; }          // through the top: park below again, unseen
        } else busy = true;
        paint(l, rec.cfg);
      }
      if (!busy && rec.done) { const d = rec.done; rec.done = null; d(); }
    });
    // sleep when nothing is moving; the next scroll wakes it
    raf = busy ? requestAnimationFrame(frame) : 0;
    if (!raf) items.forEach((rec) => { if (rec.done) { const d = rec.done; rec.done = null; d(); } });
  }
  const kick = () => { if (!raf && !reduced) { last = 0; raf = requestAnimationFrame(frame); } };
  addEventListener('scroll', kick, { passive: true });

  // only elements near the viewport are measured each frame
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { const r = items.get(e.target); if (r) r.visible = e.isIntersecting; });
    kick();
  }, { rootMargin: '10% 0px 10% 0px' });
  function observe(el) { io.unobserve(el); io.observe(el); }

  // manual drive: goal 1 enters, goal 2 leaves through the top; stagger by line order
  const drive = (el, goal) => ready.then(() => new Promise((resolve) => {
    if (!items.has(el)) build(el);
    const rec = items.get(el); rec.cfg = cfgOf(el);
    if (reduced) return resolve();
    const now = performance.now();
    rec.lines.forEach((l, i) => {
      if (goal === 1 && l.x > 1.0005) { l.x = 0; l.v = 0; }   // interrupted mid-exit: re-enter from below
      l.goal = goal; l.due = now + i * rec.cfg.stagger * (goal === 2 ? .6 : 1);
    });
    if (rec.done) rec.done();
    rec.done = resolve; kick();
  }));

  const ready = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]);
  window.VsMaskLines = {
    refresh: (el) => { items.delete(el); return ready.then(() => build(el)); },
    play: (el) => drive(el, 1),
    exit: (el) => drive(el, 2),
  };

  const init = () => ready.then(() => {
    const els = [...document.querySelectorAll('[data-vs-mask-lines]')];
    if (reduced) { els.forEach((el) => (el.dataset.vsSplit = '1')); return; }
    els.forEach((el) => { if (!items.has(el)) build(el); });
    // re-measure on width change only (mobile URL-bar resizes change height, not lines)
    let w = innerWidth, t = 0;
    addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => { if (innerWidth !== w) { w = innerWidth; items.forEach((_, el) => build(el)); kick(); } }, 150);
    });
    kick();
  });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();