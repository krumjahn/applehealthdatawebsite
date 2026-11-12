(() => {
  'use strict';
  const root = document.getElementById('mac-demo');
  if (!root) return;
  const screen = root.querySelector('#mac-demo-screen');
  const nav = root.querySelector('.mac-capture-nav');
  const status = root.querySelector('.mac-capture-status');
  const names = { overview: 'Overview', steps: 'Steps', heart: 'Heart rate', sleep: 'Sleep' };
  let request = 0;
  nav.addEventListener('click', event => {
    const button = event.target.closest('[data-mac-screen]');
    if (!button || !nav.contains(button)) return;
    const key = button.dataset.macScreen;
    if (!Object.hasOwn(names, key)) return;
    const current = ++request;
    const next = new Image();
    status.textContent = `Loading ${names[key]} screenshot…`;
    next.onload = () => {
      if (current !== request) return;
      screen.src = next.src;
      root.querySelector('.mac-capture-full').href = next.src;
      screen.alt = `Actual Mac app ${names[key]} screen, captured with fictional sample data`;
      nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      status.textContent = `${names[key]} · Actual app screenshot`;
    };
    next.onerror = () => {
      if (current === request) status.textContent = 'That screenshot could not load. Please try again.';
    };
    next.src = `/images/mac-demo-${key}.png`;
  });
  nav.hidden = false;
  status.textContent = 'Overview · Actual app screenshot';
})();
