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
  const phone = $('.phone-frame'), screenBack = $('.iphone-demo-screen-back');
  const replay = $('.iphone-demo-replay'), fileType = $('.iphone-demo-file-type');
  const names = {xml:'XML',csv:'CSV',json:'JSON'};
  let state = {stage:'home',format:'xml'}, request = 0;
  function asset(s) { return s.stage === 'home' ? 'home' : `${s.stage === 'complete' ? 'review' : s.stage}-${s.format}`; }
  function render() {
    const {stage,format} = state;
    root.dataset.stage = stage;
    formats.hidden = stage !== 'format'; result.hidden = stage !== 'complete';
    phone.hidden = stage === 'complete'; screenBack.hidden = stage === 'home' || stage === 'complete';
    fileType.textContent = names[format];
    hotspot.hidden = stage === 'complete'; screenFormats.hidden = stage !== 'format';
    const rect = stage === 'home' ? [30.6,9.6,4,92] : stage === 'format' ? [69.2,6,4,29] : stage === 'dates' ? [46.8,6,4,39] : [format === 'xml' ? 54 : format === 'json' ? 40 : 38.2,7,4,92];
    Object.assign(hotspot.style,{top:rect[0]+'%',height:rect[1]+'%',left:rect[2]+'%',width:rect[3]+'%'});
    hotspot.setAttribute('aria-label',stage === 'home' ? 'Try Export a file in the sample walkthrough' : stage === 'review' ? 'Create a fictional sample file, not a real health export' : 'Continue the sample walkthrough'); back.hidden = stage === 'home'; reset.hidden = stage === 'home';
    next.hidden = stage === 'complete';
    [...formats.querySelectorAll('button'),...screenFormats.querySelectorAll('button')].forEach(b => b.setAttribute('aria-pressed',String(b.dataset.format === format)));
    const labels = {
      home:['1 / Start on iPhone','Activate Export a file on the phone to begin this sample walkthrough.','Try export'],
      format:['2 / Choose a format','Choose XML, CSV or JSON. Selecting a format continues to its next real app screen.','Continue'],
      dates:['3 / Choose dates','The real app offers date controls. This short demo keeps the default range shown on the screen.','Review export'],
      review:[`${format === 'xml' ? 3 : 4} / Review your export`,format === 'xml' ? 'XML includes all available history. In the app, you export first, then choose where to save or share.' : 'Review the format and date range. In the app, you export first, then choose where to save or share.','Create sample file'],
      complete:['Your sample is ready!','You completed the export walkthrough. Download a fictional sample, or try another format.','']
    };
    [step.textContent,description.textContent,next.textContent] = labels[stage];
    download.href = `/samples/iphone-export-demo/sample-health-data.${format}`;
    download.textContent = `Download sample ${names[format]}`;
    hotspot.dataset.demoAction = next.dataset.demoAction = stage === 'home' ? 'start' : stage === 'review' ? 'complete' : 'next';
    root.dataset.loading = 'false'; root.dataset.error = 'false';
    [next,back,screenBack,hotspot,...formats.querySelectorAll('button'),...screenFormats.querySelectorAll('button')].forEach(b => b.disabled = false);
  }
  function go(target) {
    const token = ++request;
    const phoneHadFocus = phone.contains?.(document.activeElement);
    if (target.stage === 'complete') { state = target; render(); download.focus?.(); return; }
    const image = new Image();
    root.dataset.loading = 'true'; step.textContent = 'Loading actual app screenshot…';
    [next,back,screenBack,hotspot,...formats.querySelectorAll('button'),...screenFormats.querySelectorAll('button')].forEach(b => b.disabled = true);
    image.onload = () => {
      if (token !== request) return;
      source.srcset = image.src; screen.src = `/images/iphone-demo/${asset(target)}.png`;
      screen.alt = `Actual iPhone app ${target.stage === 'complete' ? 'review' : target.stage} screen${target.stage === 'home' ? '' : ` with ${names[target.format]} selected`}`;
      state = target; render();
      if (phoneHadFocus) hotspot.focus?.({preventScroll:true});
      if (target.stage === 'complete') download.focus?.();
    };
    image.onerror = () => {
      if (token !== request) return;
      render(); root.dataset.error = 'true'; step.textContent = 'Screenshot could not load. Please try again.';
    };
    image.src = `/images/iphone-demo/${asset(target)}.webp`;
  }
  function advance() {
    const {stage,format} = state;
    go({format,stage:stage === 'home' ? 'format' : stage === 'format' ? (format === 'xml' ? 'review' : 'dates') : stage === 'dates' ? 'review' : 'complete'});
  }
  next.addEventListener('click',advance); hotspot.addEventListener('click',advance);
  const goBack = () => {const {stage,format}=state;go({format,stage:stage === 'complete' ? 'review' : stage === 'review' ? (format === 'xml' ? 'format' : 'dates') : stage === 'dates' ? 'format' : 'home'});};
  back.addEventListener('click',goBack); screenBack.addEventListener('click',goBack);
  replay.addEventListener('click',() => go({stage:'format',format:'xml'}));
  reset.addEventListener('click',() => go({stage:'home',format:'xml'}));
  const chooseFormat = event => {const b=event.target.closest('[data-format]');if (b && formats.contains(b) && Object.hasOwn(names,b.dataset.format)) go({stage:b.dataset.format === 'xml' ? 'review' : 'dates',format:b.dataset.format});};
  formats.addEventListener('click',chooseFormat);
  screenFormats.addEventListener('click',event => { const b=event.target.closest('[data-format]');if(b && screenFormats.contains(b) && Object.hasOwn(names,b.dataset.format))go({stage:b.dataset.format === 'xml' ? 'review' : 'dates',format:b.dataset.format}); });
  for(const [el,action] of [[next,'start'],[hotspot,'start'],[back,'back'],[reset,'reset'],[screenBack,'back'],[replay,'reset'],[download,'download']]) {el.dataset.track='iphone-demo';el.dataset.demoAction=action;}
  [...formats.querySelectorAll('button'),...screenFormats.querySelectorAll('button')].forEach(b => { b.dataset.track='iphone-demo'; b.dataset.demoAction='next'; });
  controls.hidden=false;render();
})();
