(() => {
  'use strict';
  const root = document.getElementById('mac-demo-app');
  if (!root) return;
  // Deliberately fictional fixtures. No uploads, HealthKit, API or storage access.
  const data = {
    steps: {name:'Steps', unit:'steps', average:'8,240', values:[7200,9100,6400,10400,8200,7600,8780], description:'Daily steps', note:'Explore how your recorded activity changes from day to day.'},
    heart: {name:'Heart rate', unit:'bpm', average:'72', values:[71,74,70,73,72,69,75], description:'Daily average heart rate', note:'Compare daily averages. This demo is not a medical assessment.'},
    sleep: {name:'Sleep', unit:'hours', average:'7.4', values:[7.2,7.8,6.5,8.1,7.4,7.0,7.8], description:'Recorded sleep per night', note:'Look at your recorded sleep over time. Sample values are fictional.'}
  };
  const days = [1,2,3,4,5,6,7];
  let selected = 'overview';
  root.innerHTML = `<div class="md-shell"><nav class="md-nav" aria-label="Explore the sample Mac app"><div class="md-brand"><span aria-hidden="true">h</span>Health Data</div>${[['overview','Overview'],...Object.entries(data).map(([k,v])=>[k,v.name])].map(([key,name])=>`<button type="button" data-view="${key}" aria-pressed="${key==='overview'}" aria-controls="md-content">${name}</button>`).join('')}</nav><section class="md-main" id="md-content" aria-label="Sample health charts"></section></div>`;
  const main = root.querySelector('.md-main');
  function render(view) {
    selected = view;
    root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
    const metric = data[view] || data.steps;
    const max = Math.max(...metric.values) * 1.15;
    main.innerHTML = `<div class="md-eyebrow">Your history, at a glance</div><div class="md-header"><h3>${view==='overview'?'Overview':metric.name}</h3><span class="md-sample">Sample data</span></div><p class="md-range">1–7 November 2026 · 7 days</p>${view==='overview'?`<div class="md-cards">${Object.entries(data).map(([k,d])=>`<button type="button" class="md-card" data-metric="${k}" aria-label="Explore ${d.name} sample chart"><small>${d.name}</small><strong>${d.average}</strong><em>${d.unit} / daily average ↗</em></button>`).join('')}</div>`:`<div class="md-lead">${metric.average} <small>${metric.unit} daily average</small></div>`}<div class="md-chart"><div class="md-chart-title"><strong>${metric.description}</strong><span>November 2026</span></div><div class="md-bars" role="group" aria-label="Choose a day to inspect its sample value">${metric.values.map((v,i)=>`<button type="button" class="md-bar" data-day="${i}" style="height:${v/max*100}%" aria-label="${days[i]} November 2026: ${v.toLocaleString('en-US')} ${metric.unit}"></button>`).join('')}</div><div class="md-dates" aria-hidden="true">${days.map(d=>`<span>${d} Nov</span>`).join('')}</div><div class="md-detail" aria-live="polite">Select a bar to see that day’s sample value.</div></div><p class="md-note">${view==='overview'?'Try a metric above, or choose a chart in the navigation.':metric.note}</p>${view==='overview'?'':'<button type="button" class="md-back" data-metric="overview">← Back to overview</button>'}`;
  }
  root.addEventListener('click', e=>{
    const nav=e.target.closest('[data-view]');
    const card=e.target.closest('[data-metric]');
    const bar=e.target.closest('[data-day]');
    if(nav) render(nav.dataset.view);
    if(card) {render(card.dataset.metric); root.querySelector(`[data-view="${selected}"]`).focus();}
    if(bar) {const m=data[selected]||data.steps;main.querySelector('.md-detail').textContent=`${Number(bar.dataset.day)+1} November 2026 · ${m.values[Number(bar.dataset.day)].toLocaleString('en-US')} ${m.unit} (sample)`;}
  });
  render('overview');
  root.hidden=false;
  document.getElementById('mac-demo-fallback').hidden=true;
  document.getElementById('mac-demo-caption').hidden=false;
  document.querySelector('#mac-demo .window-bar span:nth-child(2)').textContent='HEALTH DATA / INTERACTIVE DEMO';
})();
