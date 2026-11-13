(() => {
  'use strict';
  const root = document.getElementById('iphone-export-demo');
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const screen = $('#iphone-demo-screen'), source = $('#iphone-demo-source');
  const screenFormats = $('.iphone-demo-screen-formats');
  const controls = $('.iphone-demo-controls'), formats = $('.iphone-demo-formats');
  const next = $('.iphone-demo-next'), back = $('.iphone-demo-back'), reset = $('.iphone-demo-reset');
  const hotspot = $('.iphone-demo-hotspot'), step = $('.iphone-demo-step'), description = $('.iphone-demo-description');
  const result = $('.iphone-demo-result'), download = $('.iphone-demo-download');
  const names = {xml:'XML',csv:'CSV',json:'JSON'};
  let state = {stage:'home',format:'xml'}, request = 0;
  function asset(s) { return s.stage === 'home' ? 'home' : `${s.stage === 'complete' ? 'review' : s.stage}-${s.format}`; }
  function render() {
    const {stage,format} = state;
    formats.hidden = stage !== 'format'; result.hidden = stage !== 'complete';
    hotspot.hidden = stage === 'complete'; screenFormats.hidden = stage !== 'format';
    const rect = stage === 'home' ? [30.6,9.6,4,92] : stage === 'format' ? [69.2,6,4,29] : stage === 'dates' ? [46.8,6,4,39] : [format === 'xml' ? 54 : format === 'json' ? 40 : 38.2,7,4,92];
    Object.assign(hotspot.style,{top:rect[0]+'%',height:rect[1]+'%',left:rect[2]+'%',width:rect[3]+'%'});
    hotspot.setAttribute('aria-label',stage === 'home' ? 'Try Export a file in the sample walkthrough' : stage === 'review' ? 'Create a fictional sample file, not a real health export' : 'Continue the sample walkthrough'); back.hidden = stage === 'home'; reset.hidden = stage === 'home';
    next.hidden = stage === 'complete';
    [...formats.querySelectorAll('button'),...screenFormats.querySelectorAll('button')].forEach(b => b.setAttribute('aria-pressed',String(b.dataset.format === format)));
    const labels = {
      home:['1 / Start on iPhone','Tap Export a file on the phone, or try the walkthrough below.','Try export'],
      format:['2 / Choose a format','Choose the sample format below. The phone shows that selection in the actual app.','Continue'],
      dates:['3 / Choose dates','The real app offers date controls. This short demo keeps the default range shown on the screen.','Review export'],
      review:[`${format === 'xml' ? 3 : 4} / Review your export`,format === 'xml' ? 'XML includes all available history. In the app, you export first, then choose where to save or share.' : 'Review the format and date range. In the app, you export first, then choose where to save or share.','Create sample file'],
      complete:['Demo complete','No Apple Health records were read. The screenshot above is the real review screen; the sample download below belongs to this website.','']
    };
    [step.textContent,description.textContent,next.textContent] = labels[stage];
    download.href = `/samples/iphone-export-demo/sample-health-data.${format}`;
    download.textContent = `Download sample ${names[format]}`;
    hotspot.dataset.demoAction = next.dataset.demoAction = stage === 'home' ? 'start' : stage === 'review' ? 'complete' : 'next';
    root.dataset.loading = 'false';
    [next,back,hotspot,...formats.querySelectorAll('button'),...screenFormats.querySelectorAll('button')].forEach(b => b.disabled = false);
  }
  function go(target) {
    const token = ++request, image = new Image();
    root.dataset.loading = 'true'; step.textContent = 'Loading actual app screenshot…';
    [next,back,hotspot,...formats.querySelectorAll('button'),...screenFormats.querySelectorAll('button')].forEach(b => b.disabled = true);
    image.onload = () => {
      if (token !== request) return;
      source.srcset = image.src; screen.src = `/images/iphone-demo/${asset(target)}.png`;
      screen.alt = `Actual iPhone app ${target.stage === 'complete' ? 'review' : target.stage} screen${target.stage === 'home' ? '' : ` with ${names[target.format]} selected`}`;
      state = target; render();
      if (target.stage === 'complete') download.focus?.();
    };
    image.onerror = () => {
      if (token !== request) return;
      render(); step.textContent = 'Screenshot could not load. Please try again.';
    };
    image.src = `/images/iphone-demo/${asset(target)}.webp`;
  }
  function advance() {
    const {stage,format} = state;
    go({format,stage:stage === 'home' ? 'format' : stage === 'format' ? (format === 'xml' ? 'review' : 'dates') : stage === 'dates' ? 'review' : 'complete'});
  }
  next.addEventListener('click',advance); hotspot.addEventListener('click',advance);
  back.addEventListener('click',() => {const {stage,format}=state;go({format,stage:stage === 'complete' ? 'review' : stage === 'review' ? (format === 'xml' ? 'format' : 'dates') : stage === 'dates' ? 'format' : 'home'});});
  reset.addEventListener('click',() => go({stage:'home',format:'xml'}));
  const chooseFormat = event => {const b=event.target.closest('[data-format]');if (b && formats.contains(b) && Object.hasOwn(names,b.dataset.format)) go({stage:'format',format:b.dataset.format});};
  formats.addEventListener('click',chooseFormat);
  screenFormats.addEventListener('click',event => { const b=event.target.closest('[data-format]');if(b && screenFormats.contains(b) && Object.hasOwn(names,b.dataset.format))go({stage:'format',format:b.dataset.format}); });
  for(const [el,action] of [[next,'start'],[hotspot,'start'],[back,'back'],[reset,'reset'],[download,'download']]) {el.dataset.track='iphone-demo';el.dataset.demoAction=action;}
  controls.hidden=false;render();
})();
